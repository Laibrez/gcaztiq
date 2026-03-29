import { supabase } from './lib/supabase';

async function testRLS() {
    console.log('--- Supabase RLS Diagnostic ---');
    const testId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
    
    console.log('Attempting to check if dummy brand exists...');
    const { data: existing } = await supabase.from('brands').select('id').eq('id', testId).maybeSingle();
    console.log('Fetch result:', existing);

    console.log('Attempting to insert dummy brand with Service Role...');
    const { data: inserted, error: insertError } = await supabase.from('brands').insert({
        id: testId,
        email: 'test@example.com',
        company_name: 'Diagnostic Test',
        wallet_balance_cents: 0
    }).select().single();

    if (insertError) {
        console.error('CRITICAL: Service Role insertion FAILED:', insertError.message);
        console.error('Error Code:', (insertError as any).code);
    } else {
        console.log('SUCCESS: Service Role bypassed RLS and inserted:', inserted);
        
        console.log('Cleaning up...');
        await supabase.from('brands').delete().eq('id', testId);
        console.log('Cleanup complete.');
    }
}

testRLS().catch(console.error);
