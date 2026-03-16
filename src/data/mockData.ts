// Mock data for GreenBee

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  email: string;
  location: string;
  locationFlag: string;
  campaigns: number;
  totalEarned: number;
  status: 'Active' | 'Paused' | 'Pending';
  role: 'UGC Creator' | 'Influencer' | 'Creator';
  currency: string;
  preferredPayment: string;
}

export type PaymentRuleType =
  | 'Fixed Rate'
  | 'Performance based'
  | 'Fixed & Performance based';

export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'Draft';
  startDate: string;
  endDate: string;
  creators: { name: string; avatar: string }[];
  totalCreators: number;
  totalViews: number;
  totalConversions: number;
  totalSpend: number;
  budget: number;
  paymentRule: PaymentRuleType;
}

export interface Payout {
  id: string;
  creator: { name: string; avatar: string; handle: string };
  campaign: string;
  metric: string;
  rate: string;
  amount: number;
  paymentMethod: 'PayPal' | 'Stripe' | 'Payoneer' | 'Revolut' | 'Wise' | 'Airtm';
  status: 'Pending' | 'Processing' | 'Paid';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  status: 'Active' | 'Invited';
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending';
}

export interface CreatorInvoice {
  id: string;
  creator: string;
  campaign: string;
  date: string;
  amount: number;
  currency: string;
  status: 'Paid' | 'Pending' | 'Processing';
}

export interface RecentPayout {
  creator: { name: string; email: string; initial: string };
  campaign: string;
  amount: number;
  creatorReceives: number;
  currency: string;
  date: string;
  status: 'Sent' | 'Processing' | 'Claimed' | 'Creating';
}

export const walletBalance = 17143.35;

export const creators: Creator[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    handle: '@sarah.j_lifestyle',
    avatar: '',
    email: 'sarah@creator.io',
    location: 'United States',
    locationFlag: '🇺🇸',
    campaigns: 3,
    totalEarned: 4850,
    status: 'Active',
    role: 'UGC Creator',
    currency: 'USD',
    preferredPayment: 'PayPal',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    handle: '@marcusj',
    avatar: '',
    email: 'marcus@email.com',
    location: 'United States',
    locationFlag: '🇺🇸',
    campaigns: 2,
    totalEarned: 3200,
    status: 'Active',
    role: 'Influencer',
    currency: 'USD',
    preferredPayment: 'Stripe',
  },
  {
    id: '3',
    name: 'Hana Tanaka',
    handle: '@hana_creates',
    avatar: '',
    email: 'hana@creator.jp',
    location: 'Japan',
    locationFlag: '🇯🇵',
    campaigns: 4,
    totalEarned: 6100,
    status: 'Active',
    role: 'UGC Creator',
    currency: 'JPY',
    preferredPayment: 'Payoneer',
  },
  {
    id: '4',
    name: 'Ana Rodrigues',
    handle: '@anarod',
    avatar: '',
    email: 'ana@email.br',
    location: 'Brazil',
    locationFlag: '🇧🇷',
    campaigns: 2,
    totalEarned: 2800,
    status: 'Active',
    role: 'Creator',
    currency: 'BRL',
    preferredPayment: 'PayPal',
  },
  {
    id: '5',
    name: 'Oliver Hayes',
    handle: '@oliverh',
    avatar: '',
    email: 'oliver@creator.co.uk',
    location: 'United Kingdom',
    locationFlag: '🇬🇧',
    campaigns: 3,
    totalEarned: 5400,
    status: 'Active',
    role: 'Creator',
    currency: 'GBP',
    preferredPayment: 'Revolut',
  },
  {
    id: '6',
    name: 'Priya Sharma',
    handle: '@priyacreates',
    avatar: '',
    email: 'priya@email.in',
    location: 'United States',
    locationFlag: '🇺🇸',
    campaigns: 1,
    totalEarned: 1200,
    status: 'Pending',
    role: 'UGC Creator',
    currency: 'USD',
    preferredPayment: 'Stripe',
  },
  {
    id: '7',
    name: 'Carlos Mendez',
    handle: '@carlosmx',
    avatar: '',
    email: 'carlos@email.mx',
    location: 'Mexico',
    locationFlag: '🇲🇽',
    campaigns: 2,
    totalEarned: 3600,
    status: 'Active',
    role: 'Influencer',
    currency: 'MXN',
    preferredPayment: 'PayPal',
  },
  {
    id: '8',
    name: 'Claire Thompson',
    handle: '@claire.designs',
    avatar: '',
    email: 'claire@creator.com',
    location: 'United States',
    locationFlag: '🇺🇸',
    campaigns: 3,
    totalEarned: 3500,
    status: 'Active',
    role: 'UGC Creator',
    currency: 'USD',
    preferredPayment: 'PayPal',
  },
  {
    id: '9',
    name: 'Lucas Silva',
    handle: '@lucassilva',
    avatar: '',
    email: 'lucas@email.br',
    location: 'Brazil',
    locationFlag: '🇧🇷',
    campaigns: 1,
    totalEarned: 900,
    status: 'Paused',
    role: 'Creator',
    currency: 'BRL',
    preferredPayment: 'Wise',
  },
  {
    id: '10',
    name: 'Yu Wei',
    handle: '@yuwei_eats',
    avatar: '',
    email: 'yuwei@creator.cn',
    location: 'Singapore',
    locationFlag: '🇸🇬',
    campaigns: 2,
    totalEarned: 2100,
    status: 'Active',
    role: 'Influencer',
    currency: 'SGD',
    preferredPayment: 'Stripe',
  },
  {
    id: '11',
    name: 'Chen Codes',
    handle: '@chen.codes',
    avatar: '',
    email: 'chen@email.cn',
    location: 'China',
    locationFlag: '🇨🇳',
    campaigns: 1,
    totalEarned: 1800,
    status: 'Pending',
    role: 'Influencer',
    currency: 'CNY',
    preferredPayment: 'Airtm',
  },
  {
    id: '12',
    name: 'Sofia Garcia',
    handle: '@sofiag',
    avatar: '',
    email: 'sofia@email.mx',
    location: 'Mexico',
    locationFlag: '🇲🇽',
    campaigns: 2,
    totalEarned: 2400,
    status: 'Active',
    role: 'UGC Creator',
    currency: 'MXN',
    preferredPayment: 'PayPal',
  },
  {
    id: '13',
    name: 'David Russo',
    handle: '@drusso_tech',
    avatar: '',
    email: 'david@creator.it',
    location: 'Italy',
    locationFlag: '🇮🇹',
    campaigns: 1,
    totalEarned: 800,
    status: 'Paused',
    role: 'Creator',
    currency: 'EUR',
    preferredPayment: 'Revolut',
  },
  {
    id: '14',
    name: 'Isabella Costa',
    handle: '@bellacosta',
    avatar: '',
    email: 'bella@email.br',
    location: 'Brazil',
    locationFlag: '🇧🇷',
    campaigns: 3,
    totalEarned: 5100,
    status: 'Active',
    role: 'UGC Creator',
    currency: 'BRL',
    preferredPayment: 'Payoneer',
  },
  {
    id: '15',
    name: 'Mark Kim',
    handle: '@mark_designs',
    avatar: '',
    email: 'mark@creator.de',
    location: 'Germany',
    locationFlag: '🇩🇪',
    campaigns: 2,
    totalEarned: 2900,
    status: 'Active',
    role: 'UGC Creator',
    currency: 'EUR',
    preferredPayment: 'Wise',
  },
  {
    id: '16',
    name: 'Maria Gonzalez',
    handle: '@mariag',
    avatar: '',
    email: 'maria@email.es',
    location: 'Spain',
    locationFlag: '🇪🇸',
    campaigns: 2,
    totalEarned: 3100,
    status: 'Active',
    role: 'Creator',
    currency: 'EUR',
    preferredPayment: 'Revolut',
  },
];

export const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer TikTok Push',
    status: 'Active',
    startDate: 'Mar 1, 2026',
    endDate: 'Mar 31, 2026',
    creators: [
      { name: 'Sarah Jenkins', avatar: '' },
      { name: 'Marcus Johnson', avatar: '' },
      { name: 'Hana Tanaka', avatar: '' },
      { name: 'Ana Rodrigues', avatar: '' },
    ],
    totalCreators: 7,
    totalViews: 284000,
    totalConversions: 4120,
    totalSpend: 8400,
    budget: 12000,
    paymentRule: 'Performance based',
  },
  {
    id: '2',
    name: 'Product Review Series',
    status: 'Active',
    startDate: 'Feb 15, 2026',
    endDate: 'Apr 15, 2026',
    creators: [
      { name: 'Oliver Hayes', avatar: '' },
      { name: 'Claire Thompson', avatar: '' },
      { name: 'Yu Wei', avatar: '' },
    ],
    totalCreators: 5,
    totalViews: 156000,
    totalConversions: 2340,
    totalSpend: 5200,
    budget: 8000,
    paymentRule: 'Fixed & Performance based',
  },
  {
    id: '3',
    name: 'Unboxing Campaign',
    status: 'Active',
    startDate: 'Mar 5, 2026',
    endDate: 'Apr 5, 2026',
    creators: [
      { name: 'Carlos Mendez', avatar: '' },
      { name: 'Sofia Garcia', avatar: '' },
    ],
    totalCreators: 4,
    totalViews: 98000,
    totalConversions: 1560,
    totalSpend: 3800,
    budget: 6000,
    paymentRule: 'Fixed Rate',
  },
  {
    id: '4',
    name: 'Holiday Gift Guide',
    status: 'Completed',
    startDate: 'Dec 1, 2025',
    endDate: 'Dec 31, 2025',
    creators: [
      { name: 'Sarah Jenkins', avatar: '' },
      { name: 'Oliver Hayes', avatar: '' },
      { name: 'Isabella Costa', avatar: '' },
    ],
    totalCreators: 8,
    totalViews: 520000,
    totalConversions: 7800,
    totalSpend: 15000,
    budget: 15000,
    paymentRule: 'Performance based',
  },
  {
    id: '5',
    name: 'Brand Awareness — TikTok',
    status: 'Completed',
    startDate: 'Jan 10, 2026',
    endDate: 'Feb 10, 2026',
    creators: [
      { name: 'Hana Tanaka', avatar: '' },
      { name: 'Lucas Silva', avatar: '' },
    ],
    totalCreators: 6,
    totalViews: 340000,
    totalConversions: 5100,
    totalSpend: 10000,
    budget: 10000,
    paymentRule: 'Fixed & Performance based',
  },
  {
    id: '6',
    name: 'New Product Teaser',
    status: 'Draft',
    startDate: 'Apr 1, 2026',
    endDate: 'Apr 30, 2026',
    creators: [{ name: 'Priya Sharma', avatar: '' }],
    totalCreators: 3,
    totalViews: 0,
    totalConversions: 0,
    totalSpend: 0,
    budget: 5000,
    paymentRule: 'Fixed Rate',
  },
];

export const payouts: Payout[] = [
  {
    id: '1',
    creator: { name: 'Sarah Jenkins', avatar: '', handle: '@sarah.j_lifestyle' },
    campaign: 'Summer TikTok Push',
    metric: '42,300 views',
    rate: '$0.03/view',
    amount: 1269,
    paymentMethod: 'PayPal',
    status: 'Pending',
  },
  {
    id: '2',
    creator: { name: 'Marcus Johnson', avatar: '', handle: '@marcusj' },
    campaign: 'Summer TikTok Push',
    metric: '38,100 views',
    rate: '$0.03/view',
    amount: 1143,
    paymentMethod: 'Stripe',
    status: 'Pending',
  },
  {
    id: '3',
    creator: { name: 'Oliver Hayes', avatar: '', handle: '@oliverh' },
    campaign: 'Product Review Series',
    metric: '28,400 views',
    rate: '$0.04/view',
    amount: 1136,
    paymentMethod: 'Revolut',
    status: 'Pending',
  },
  {
    id: '4',
    creator: { name: 'Ana Rodrigues', avatar: '', handle: '@anarod' },
    campaign: 'Unboxing Campaign',
    metric: '19,300 views',
    rate: '$0.04/view',
    amount: 772,
    paymentMethod: 'PayPal',
    status: 'Pending',
  },
  {
    id: '5',
    creator: { name: 'Hana Tanaka', avatar: '', handle: '@hana_creates' },
    campaign: 'Summer TikTok Push',
    metric: '56,200 views',
    rate: '$0.03/view',
    amount: 1686,
    paymentMethod: 'Payoneer',
    status: 'Processing',
  },
  {
    id: '6',
    creator: { name: 'Claire Thompson', avatar: '', handle: '@claire.designs' },
    campaign: 'Product Review Series',
    metric: '34,600 views',
    rate: '$0.04/view',
    amount: 1384,
    paymentMethod: 'PayPal',
    status: 'Processing',
  },
  {
    id: '7',
    creator: { name: 'Carlos Mendez', avatar: '', handle: '@carlosmx' },
    campaign: 'Unboxing Campaign',
    metric: '22,100 views',
    rate: '$0.04/view',
    amount: 884,
    paymentMethod: 'Stripe',
    status: 'Paid',
  },
  {
    id: '8',
    creator: { name: 'Sofia Garcia', avatar: '', handle: '@sofiag' },
    campaign: 'Unboxing Campaign',
    metric: '18,900 views',
    rate: '$0.04/view',
    amount: 756,
    paymentMethod: 'Wise',
    status: 'Paid',
  },
  {
    id: '9',
    creator: { name: 'Isabella Costa', avatar: '', handle: '@bellacosta' },
    campaign: 'Holiday Gift Guide',
    metric: '64,800 views',
    rate: '$0.03/view',
    amount: 1944,
    paymentMethod: 'Payoneer',
    status: 'Paid',
  },
  {
    id: '10',
    creator: { name: 'Chen Codes', avatar: '', handle: '@chen.codes' },
    campaign: 'Product Review Series',
    metric: '15,200 views',
    rate: '$0.04/view',
    amount: 608,
    paymentMethod: 'Airtm',
    status: 'Paid',
  },
];

export const recentPayouts: RecentPayout[] = [
  {
    creator: { name: 'Sarah Jenkins', email: 'sarah@creator.io', initial: 'S' },
    campaign: 'Summer TikTok Push',
    amount: 1269,
    creatorReceives: 1205.55,
    currency: 'USD',
    date: 'Mar 12, 2026',
    status: 'Sent',
  },
  {
    creator: { name: 'Yu Wei', email: 'yuwei@creator.cn', initial: 'Y' },
    campaign: 'Product Review Series',
    amount: 850,
    creatorReceives: 807.5,
    currency: 'USD',
    date: 'Mar 11, 2026',
    status: 'Processing',
  },
  {
    creator: { name: 'David Russo', email: 'david@creator.it', initial: 'D' },
    campaign: '(Direct Payout)',
    amount: 620,
    creatorReceives: 589.0,
    currency: 'USD',
    date: 'Mar 10, 2026',
    status: 'Claimed',
  },
  {
    creator: { name: 'Maria Gonzalez', email: 'maria@email.es', initial: 'M' },
    campaign: 'Unboxing Campaign',
    amount: 1450,
    creatorReceives: 1377.5,
    currency: 'GBP',
    date: 'Mar 9, 2026',
    status: 'Sent',
  },
  {
    creator: { name: 'Oliver Hayes', email: 'oliver@creator.co.uk', initial: 'O' },
    campaign: 'Product Review Series',
    amount: 980,
    creatorReceives: 931.0,
    currency: 'GBP',
    date: 'Mar 8, 2026',
    status: 'Creating',
  },
  {
    creator: { name: 'Claire Thompson', email: 'claire@creator.com', initial: 'C' },
    campaign: 'Summer TikTok Push',
    amount: 1384,
    creatorReceives: 1314.8,
    currency: 'CAD',
    date: 'Mar 7, 2026',
    status: 'Sent',
  },
];

export const payoutChartData = [
  { month: 'Oct', amount: 8200 },
  { month: 'Nov', amount: 11500 },
  { month: 'Dec', amount: 14300 },
  { month: 'Jan', amount: 18100 },
  { month: 'Feb', amount: 21600 },
  { month: 'Mar', amount: 24800 },
];

export const currencyDistribution = [
  { name: 'USD', value: 62, fill: 'hsl(72, 76%, 57%)' },
  { name: 'GBP', value: 18, fill: 'hsl(72, 76%, 42%)' },
  { name: 'CAD', value: 12, fill: 'hsl(72, 76%, 72%)' },
  { name: 'EUR', value: 8, fill: 'hsl(72, 50%, 85%)' },
];

export const creatorInvoices: CreatorInvoice[] = [
  {
    id: 'CINV-001',
    creator: 'Sarah Jenkins',
    campaign: 'Summer TikTok Push',
    date: 'Mar 10, 2026',
    amount: 1269,
    currency: 'USD',
    status: 'Pending',
  },
  {
    id: 'CINV-002',
    creator: 'Hana Tanaka',
    campaign: 'Summer TikTok Push',
    date: 'Mar 8, 2026',
    amount: 1686,
    currency: 'USD',
    status: 'Processing',
  },
  {
    id: 'CINV-003',
    creator: 'Carlos Mendez',
    campaign: 'Unboxing Campaign',
    date: 'Mar 5, 2026',
    amount: 884,
    currency: 'USD',
    status: 'Paid',
  },
  {
    id: 'CINV-004',
    creator: 'Isabella Costa',
    campaign: 'Holiday Gift Guide',
    date: 'Feb 28, 2026',
    amount: 1944,
    currency: 'USD',
    status: 'Paid',
  },
  {
    id: 'CINV-005',
    creator: 'Oliver Hayes',
    campaign: 'Product Review Series',
    date: 'Mar 9, 2026',
    amount: 1136,
    currency: 'GBP',
    status: 'Pending',
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Rivera',
    email: 'alex@company.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Jordan Kim',
    email: 'jordan@company.com',
    role: 'Manager',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Taylor Lee',
    email: 'taylor@company.com',
    role: 'Viewer',
    status: 'Invited',
  },
];

export const invoices: Invoice[] = [
  { id: 'INV-001', date: 'Mar 1, 2026', amount: 299, status: 'Paid' },
  { id: 'INV-002', date: 'Feb 1, 2026', amount: 299, status: 'Paid' },
  { id: 'INV-003', date: 'Jan 1, 2026', amount: 299, status: 'Paid' },
];

export const performanceData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 2, i + 1);
  const base = 8000 + i * 300 + Math.random() * 2000;
  return {
    date: `Mar ${i + 1}`,
    views: Math.round(base),
    conversions: Math.round(base * (0.012 + Math.random() * 0.008)),
  };
});

export const topCreators = [
  {
    name: 'Hana Tanaka',
    handle: '@hana_creates',
    campaign: 'Summer TikTok Push',
    views: 56200,
    conversions: 842,
    conversionRate: '1.50%',
    earned: 1686,
  },
  {
    name: 'Sarah Jenkins',
    handle: '@sarah.j_lifestyle',
    campaign: 'Summer TikTok Push',
    views: 42300,
    conversions: 634,
    conversionRate: '1.50%',
    earned: 1269,
  },
  {
    name: 'Marcus Johnson',
    handle: '@marcusj',
    campaign: 'Summer TikTok Push',
    views: 38100,
    conversions: 571,
    conversionRate: '1.50%',
    earned: 1143,
  },
  {
    name: 'Claire Thompson',
    handle: '@claire.designs',
    campaign: 'Product Review Series',
    views: 34600,
    conversions: 519,
    conversionRate: '1.50%',
    earned: 1384,
  },
  {
    name: 'Oliver Hayes',
    handle: '@oliverh',
    campaign: 'Product Review Series',
    views: 28400,
    conversions: 426,
    conversionRate: '1.50%',
    earned: 1136,
  },
];

export const globalCreatorPayments = [
  {
    name: 'Oliver Hayes',
    handle: '@oliverh',
    role: 'Creator',
    flag: '🇬🇧',
    amount: '£420',
    paymentMethod: 'Revolut',
    x: 48,
    y: 28,
  },
  {
    name: 'Claire Thompson',
    handle: '@claire.designs',
    role: 'UGC Creator',
    flag: '🇺🇸',
    amount: '$3,500',
    paymentMethod: 'PayPal',
    x: 22,
    y: 35,
  },
  {
    name: 'Hana Tanaka',
    handle: '@hana_creates',
    role: 'UGC Creator',
    flag: '🇯🇵',
    amount: '¥580,000',
    paymentMethod: 'Payoneer',
    x: 82,
    y: 35,
  },
  {
    name: 'Chen Codes',
    handle: '@chen.codes',
    role: 'Influencer',
    flag: '🇨🇳',
    amount: '¥28,000',
    paymentMethod: 'Airtm',
    x: 75,
    y: 42,
  },
  {
    name: 'David Russo',
    handle: '@drusso_tech',
    role: 'Creator',
    flag: '🇮🇹',
    amount: '€480',
    paymentMethod: 'Revolut',
    x: 52,
    y: 32,
  },
];

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('');
