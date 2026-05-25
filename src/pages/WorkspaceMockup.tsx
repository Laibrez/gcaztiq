import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, Users, DollarSign, CheckSquare, FileText, 
  UploadCloud, ChevronRight, Plus, Mail, MessageSquare, 
  CheckCircle2, TrendingUp, Sparkles, Filter, FileCheck, 
  Download, Clock, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

// ---- MOCK DATA ----

const MOCK_INFLUENCERS = [
  { id: 1, name: 'Elena Rodriguez', handle: '@elenafits', niche: 'Fitness', followers: '1.2M', rate: '$500/post', image: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Marcus Chen', handle: '@marcus.tech', niche: 'Tech', followers: '850K', rate: '$800/post', image: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Sarah Jenkins', handle: '@sarahstyles', niche: 'Fashion', followers: '2.1M', rate: '$1,200/post', image: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, name: 'David Smith', handle: '@davideats', niche: 'Food', followers: '400K', rate: '$300/post', image: 'https://i.pravatar.cc/150?u=4' },
];

const MOCK_CRM_DATA = [
  { id: 1, name: 'Elena Rodriguez', handle: '@elenafits', email: 'elena@fitness.com', sent: true, response: 'Interested, sent rates', rate: '$500' },
  { id: 2, name: 'Marcus Chen', handle: '@marcus.tech', email: 'hello@marcuschen.tech', sent: true, response: 'Waiting for reply', rate: '$800' },
  { id: 3, name: 'Sarah Jenkins', handle: '@sarahstyles', email: 'collab@sarahstyles.com', sent: false, response: '', rate: '$1,200' },
];

const MOCK_DOCS = [
  { id: 1, name: 'Master Services Agreement.pdf', influencer: 'Elena Rodriguez', campaign: 'Summer Push', date: 'Oct 24, 2023' },
  { id: 2, name: 'Content Guidelines.pdf', influencer: 'All', campaign: 'Q4 Holiday', date: 'Nov 1, 2023' },
];

// ---- MAIN COMPONENT ----

export default function WorkspaceMockup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');

  const TABS = [
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'workspace', label: 'Workspace CRM', icon: Users },
    { id: 'payment', label: 'Payment Summary', icon: DollarSign },
    { id: 'job_done', label: 'Job Done / Follow Up', icon: CheckSquare },
    { id: 'tax', label: 'Tax Process', icon: FileText },
    { id: 'docs', label: 'Documentation', icon: UploadCloud },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#0a0f12] text-white font-sans selection:bg-teal-500/30 flex">
      {/* SIDEBAR NAVBAR */}
      <nav className="w-64 shrink-0 h-full flex flex-col border-r border-white/10 bg-[#0a0f12] p-4 relative z-50">
        <div className="flex items-center gap-3 mb-8 px-2 mt-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500">
            <span className="font-bold text-white text-lg leading-none">R</span>
          </div>
          <span className="font-semibold text-xl tracking-tight text-white">Rollio</span>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all w-full text-left"
          >
            <Home className="h-4 w-4" /> Return to App
          </button>
          
          <div className="h-px bg-white/10 my-4 mx-2"></div>
          
          <div className="px-3 text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Workspace</div>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 w-full text-left relative",
                  isActive 
                    ? "bg-orange-500/10 text-orange-400" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-orange-500 rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />}
                <Icon className={cn("h-4 w-4", isActive ? "text-orange-400" : "")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-auto border-t border-white/10 pt-4 flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-teal-500 to-orange-500 p-[2px]">
            <div className="h-full w-full rounded-full bg-[#0a0f12] overflow-hidden">
               <img src="https://i.pravatar.cc/150?u=admin" alt="User" />
            </div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-white">Admin User</div>
            <div className="text-xs text-white/50">Brand Account</div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl w-full mx-auto p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* DISCOVER TAB */}
        {activeTab === 'discover' && (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-8">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200">Perfect Influencer</span>
              </h1>
              <p className="text-lg text-white/60">
                Describe the creator you're looking for, and our AI will find the best matches from our global network.
              </p>
              
              <div className="relative mt-8 group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative flex items-center bg-[#131b20] border border-white/10 rounded-2xl p-2 shadow-2xl">
                  <div className="pl-4">
                    <Sparkles className="h-6 w-6 text-teal-400" />
                  </div>
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., 'Fitness creators in Miami with highly engaged female audiences under $1,000'" 
                    className="border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-white/30 h-14"
                  />
                  <Button className="bg-teal-500 hover:bg-teal-400 text-white rounded-xl h-12 px-8 font-semibold">
                    Discover
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Top Matches for You</h3>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                  <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_INFLUENCERS.map((influencer) => (
                  <div key={influencer.id} className="group relative bg-[#131b20] border border-white/10 rounded-2xl overflow-hidden hover:border-teal-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)]">
                    <div className="h-48 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131b20] to-transparent z-10"></div>
                      <img src={influencer.image} alt={influencer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium border border-white/10">
                        {influencer.rate}
                      </div>
                    </div>
                    <div className="p-5 relative z-20 -mt-8">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-white">{influencer.name}</h4>
                          <p className="text-sm text-teal-400 font-medium">{influencer.handle}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md">{influencer.niche}</span>
                        <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md">{influencer.followers}</span>
                      </div>
                      <Button className="w-full bg-white/5 hover:bg-teal-500 hover:text-white text-white border border-white/10 transition-colors">
                        Add to Workspace
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE CRM TAB */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Creator CRM</h2>
                <p className="text-white/60">Manage your outreach, negotiations, and handles.</p>
              </div>
              <Button className="bg-teal-500 hover:bg-teal-400 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Creator
              </Button>
            </div>

            <div className="bg-[#131b20] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-white/50 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-medium">Creator</th>
                    <th className="px-6 py-4 font-medium">Contact Info</th>
                    <th className="px-6 py-4 font-medium text-center">Msg Sent</th>
                    <th className="px-6 py-4 font-medium">Response Summary</th>
                    <th className="px-6 py-4 font-medium">Negotiated Rate</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_CRM_DATA.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://i.pravatar.cc/150?u=${row.id}`} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                          <div>
                            <div className="font-semibold text-white">{row.name}</div>
                            <div className="text-teal-400">{row.handle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-white/70">
                          <Mail className="h-4 w-4" /> {row.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Checkbox checked={row.sent} className="border-white/20 data-[state=checked]:bg-teal-500" />
                      </td>
                      <td className="px-6 py-4">
                        {row.response ? (
                          <div className="flex items-center gap-2 text-white/80">
                            <MessageSquare className="h-4 w-4 text-orange-400" /> {row.response}
                          </div>
                        ) : (
                          <span className="text-white/30 italic">No response yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">{row.rate}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-white/10">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYMENT SUMMARY TAB */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Payment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#131b20] border border-white/10 rounded-2xl p-6">
                <div className="text-white/50 text-sm mb-2">Total Outstanding</div>
                <div className="text-4xl font-bold text-white">$12,450</div>
                <div className="text-orange-400 text-sm mt-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Due within 7 days
                </div>
              </div>
              <div className="bg-[#131b20] border border-white/10 rounded-2xl p-6">
                <div className="text-white/50 text-sm mb-2">Paid this Month</div>
                <div className="text-4xl font-bold text-teal-400">$8,200</div>
                <div className="text-teal-500/70 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> +15% from last month
                </div>
              </div>
              <div className="bg-[#131b20] border border-white/10 rounded-2xl p-6">
                <div className="text-white/50 text-sm mb-2">Active Creators</div>
                <div className="text-4xl font-bold text-white">14</div>
                <div className="text-white/40 text-sm mt-2">Across 3 campaigns</div>
              </div>
            </div>
            
            <div className="bg-[#131b20] border border-white/10 rounded-2xl p-8 text-center text-white/50 mt-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Detailed payment breakdown will appear here.</p>
            </div>
          </div>
        )}

        {/* JOB DONE / FOLLOW UP TAB */}
        {activeTab === 'job_done' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Job Done & Follow Up</h2>
              <Select defaultValue="all">
                <option value="all">All Campaigns</option>
                <option value="summer">Summer Push</option>
              </Select>
            </div>

            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-[#131b20] border border-white/10 rounded-2xl p-5 flex items-center justify-between group hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-teal-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Review Elena's Draft Video</h4>
                      <p className="text-sm text-white/50">Campaign: Summer Push • Due Tomorrow</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white/70 hover:text-white">View Draft</Button>
                    <Button className="bg-white/10 hover:bg-white/20 text-white">Approve</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAX PROCESS TAB */}
        {activeTab === 'tax' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tax Center</h2>
              <Button variant="outline" className="border-white/10 text-white">
                <ExternalLink className="h-4 w-4 mr-2" /> Export Forms
              </Button>
            </div>
            <div className="bg-gradient-to-br from-[#131b20] to-[#0a0f12] border border-white/10 rounded-2xl p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 p-32 bg-teal-500/5 blur-[120px] rounded-full pointer-events-none"></div>
              
              <FileText className="h-16 w-16 mx-auto mb-6 text-teal-500/50" />
              <h3 className="text-2xl font-bold mb-2">Tax Process Migrated</h3>
              <p className="text-white/60 max-w-md mx-auto mb-8">
                Your entire tax workflow, W-9 collection, and 1099 generation tools now live directly inside your Workspace.
              </p>
              <Button className="bg-teal-500 hover:bg-teal-400 text-white">
                Manage 1099s
              </Button>
            </div>
          </div>
        )}

        {/* DOCUMENTATION TAB */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Documentation</h2>
                <p className="text-white/60">Upload contracts, agreement terms, and follow-up comments.</p>
              </div>
              <Button className="bg-teal-500 hover:bg-teal-400 text-white">
                <UploadCloud className="h-4 w-4 mr-2" /> Upload Document
              </Button>
            </div>

            <div className="bg-[#131b20] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-white/50 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-medium">Document Name</th>
                    <th className="px-6 py-4 font-medium">Influencer</th>
                    <th className="px-6 py-4 font-medium">Campaign</th>
                    <th className="px-6 py-4 font-medium">Date Added</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_DOCS.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileCheck className="h-5 w-5 text-teal-400" />
                          <span className="font-medium text-white">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70">{doc.influencer}</td>
                      <td className="px-6 py-4 text-white/70">
                        <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/10">{doc.campaign}</span>
                      </td>
                      <td className="px-6 py-4 text-white/70">{doc.date}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-white/10 text-white/70">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        </div>
      </main>
    </div>
  );
}

// Simple Select Mock for Job Done Tab
function Select({ children, defaultValue }: { children: React.ReactNode, defaultValue?: string }) {
  return (
    <select className="bg-[#131b20] border border-white/10 text-white text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 outline-none" defaultValue={defaultValue}>
      {children}
    </select>
  );
}
