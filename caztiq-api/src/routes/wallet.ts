import { Router } from 'express'
import Stripe from 'stripe'
import { supabase } from '../lib/supabase'
import { authenticate } from '../middleware/authenticate'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Get current balance + recent transactions
router.get('/balance', authenticate, async (req, res) => {
  const user = (req as any).user;
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('wallet_balance_cents, company_name')
    .eq('id', user.id)
    .single()

  if (brandError && brandError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching wallet balance:', brandError.message)
    return res.status(500).json({ error: 'Failed to fetch balance' })
  }

  const { data: transactions, error: txError } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('brand_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (txError) console.error('Error fetching transactions:', txError.message)

  let balanceCents = brand?.wallet_balance_cents || 0

  // Self-healing: if balance is 0 but transactions exist, sync from the latest transaction
  if (balanceCents === 0 && transactions && transactions.length > 0) {
    const latestTx = transactions[0]
    if (latestTx.balance_after_cents > 0) {
      console.log(`Syncing balance for brand ${user.id} to ${latestTx.balance_after_cents}`)
      balanceCents = latestTx.balance_after_cents
      // Update in background
      supabase.from('brands')
        .update({ wallet_balance_cents: balanceCents })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.error('Failed to sync brand balance:', error.message)
        })
    }
  }

  res.json({ 
    balance_cents: balanceCents,
    transactions: transactions || []
  })
})

// Dashboard stats
router.get('/stats', authenticate, async (req, res) => {
  const user = (req as any).user
  const brandId = user.id
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [brand, creatorsCount, campaignsCount, monthlyPayouts] = await Promise.all([
    supabase.from('brands').select('wallet_balance_cents').eq('id', brandId).single(),
    supabase.from('creators').select('id', { count: 'exact', head: true }).eq('brand_id', brandId),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('brand_id', brandId).eq('status', 'active'),
    supabase.from('payouts').select('amount_cents').eq('brand_id', brandId).gte('created_at', startOfMonth).neq('status', 'cancelled')
  ])

  const totalThisMonth = monthlyPayouts.data?.reduce((sum, p) => sum + p.amount_cents, 0) || 0

  res.json({
    wallet_balance_cents: brand.data?.wallet_balance_cents || 0,
    total_creators: creatorsCount.count || 0,
    active_campaigns: campaignsCount.count || 0,
    payouts_this_month_cents: totalThisMonth
  })
})

// Create payment intent for top-up
router.post('/topup/intent', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const { amount_cents } = req.body
    if (!amount_cents || amount_cents < 1000) {
      return res.status(400).json({ error: 'Minimum top-up is $10.00' })
    }

    const { data: brandResponse, error: brandError } = await supabase
      .from('brands')
      .select('stripe_customer_id, email, company_name')
      .eq('id', user.id)
      .maybeSingle()

    let brand = brandResponse

    if (brandError) {
      console.error('Database error fetching brand:', brandError)
      return res.status(500).json({ error: 'Database fetch failed' })
    }

    if (!brand) {
      console.log(`Self-healing missing brand record for ${user.id}`);
      const { data: newBrand, error: insertError } = await supabase.from('brands').insert({
        id: user.id,
        email: user.email || 'unknown@example.com',
        company_name: 'Ghost Account',
        wallet_balance_cents: 0
      }).select().maybeSingle();

      if (insertError) {
        console.error('Self-healing insert failed:', insertError);
        return res.status(500).json({ error: 'Could not create brand profile' });
      }
      brand = newBrand;
    }

    let customerId = brand?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: brand?.email,
        name: brand?.company_name || 'Brand Account',
        metadata: { brand_id: user.id }
      })
      customerId = customer.id
      const { error: updateError } = await supabase.from('brands')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Failed to update brand with customerId:', updateError);
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: 'usd',
      customer: customerId,
      metadata: { brand_id: user.id, type: 'wallet_topup' },
      automatic_payment_methods: { enabled: true }
    })

    res.json({ client_secret: paymentIntent.client_secret })
  } catch (err: any) {
    console.error('Stripe TopUp Error:', err)
    res.status(500).json({ error: err.message || 'Internal Server Error' })
  }
})

// Stripe webhook — DO NOT add authenticate middleware here
// Mount this BEFORE express.json() in index.ts
export const stripeWebhook = async (req: any, res: any) => {
  console.log('--- Incoming Stripe Webhook ---');
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook signature failed: ${err.message}`)
  }

  console.log('Webhook Event Type:', event.type);
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    if (pi.metadata.type !== 'wallet_topup') return res.json({ received: true })

    const brandId = pi.metadata.brand_id
    const amountCents = pi.amount

    console.log(`Webhook: brand_id=${brandId} amount=${amountCents}`);

    if (!brandId) {
      console.error('Webhook ERROR: payment_intent has no brand_id in metadata!');
      return res.json({ received: true });
    }

    try {
        const { data: brand, error: fetchErr } = await supabase
          .from('brands').select('wallet_balance_cents').eq('id', brandId).maybeSingle()
        
        if (fetchErr) {
          console.error(`Webhook ERROR: brand ${brandId} fetch error:`, fetchErr.message);
          return res.json({ received: true });
        }

        if (!brand) {
          console.error(`Webhook ERROR: brand ${brandId} not found in DB!`);
          return res.json({ received: true });
        }

        // Use atomic RPC to add to wallet
        const { data: newBalance, error: rpcErr } = await supabase
          .rpc('add_to_wallet', { p_brand_id: brandId, p_amount_cents: amountCents })
        
        if (rpcErr) {
          console.error('Webhook ERROR: add_to_wallet failed:', rpcErr.message);
          return res.json({ received: true });
        }

        const { error: insertErr } = await supabase.from('wallet_transactions').insert({
          brand_id: brandId,
          type: 'topup',
          amount_cents: amountCents,
          balance_after_cents: newBalance,
          description: 'Wallet top-up via card',
          reference_id: pi.id
        })

        if (insertErr) console.error('Webhook: transaction insert failed:', insertErr.message);
        
        console.log(`✅ SUCCESS: Topped up brand ${brandId} | $${amountCents/100} | new balance: $${newBalance!/100}`);
    } catch (e) {
        console.error('Webhook database error:', e);
    }
  }

  res.json({ received: true })
}

export default router
