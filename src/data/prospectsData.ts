export type TaxStatus = 'none' | 'invited' | 'submitted';

export interface Prospect {
  id: string;
  handle: string;
  name: string;
  email: string;
  niche: string[];
  city: string;
  country: string;
  flag: string;
  followers: number;
  engagement: number;
  format: string[];
  reachedOut: boolean;
  responded: boolean;
  taxStatus: TaxStatus;
  taxForm?: string;
}

export const prospectPool: Prospect[] = [
  {
    id: '1',
    handle: '@elenafits',
    name: 'Elena Rodriguez',
    email: 'elena@fitness.com',
    niche: ['fitness', 'health'],
    city: 'Miami',
    country: 'USA',
    flag: '🇺🇸',
    followers: 1200000,
    engagement: 4.5,
    format: ['video', 'photo'],
    reachedOut: true,
    responded: false,
    taxStatus: 'none',
  },
  {
    id: '2',
    handle: '@marcus.tech',
    name: 'Marcus Chen',
    email: 'hello@marcuschen.tech',
    niche: ['tech', 'gadgets'],
    city: 'Seattle',
    country: 'USA',
    flag: '🇺🇸',
    followers: 850000,
    engagement: 3.2,
    format: ['video'],
    reachedOut: true,
    responded: true,
    taxStatus: 'submitted',
    taxForm: 'W-9',
  },
  {
    id: '3',
    handle: '@sarahstyles',
    name: 'Sarah Jenkins',
    email: '',
    niche: ['fashion', 'lifestyle'],
    city: 'London',
    country: 'UK',
    flag: '🇬🇧',
    followers: 2100000,
    engagement: 5.1,
    format: ['photo', 'story'],
    reachedOut: false,
    responded: false,
    taxStatus: 'none',
  },
  {
    id: '4',
    handle: '@davideats',
    name: 'David Smith',
    email: '',
    niche: ['food', 'travel'],
    city: 'New York',
    country: 'USA',
    flag: '🇺🇸',
    followers: 400000,
    engagement: 6.0,
    format: ['video', 'photo'],
    reachedOut: false,
    responded: false,
    taxStatus: 'none',
  }
];
