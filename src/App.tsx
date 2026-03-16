import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import GetStartedPage from '@/pages/GetStartedPage';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import CreatorsPage from '@/pages/CreatorsPage';
import CampaignsPage from '@/pages/CampaignsPage';
import PayoutsPage from '@/pages/PayoutsPage';
import SettingsPage from '@/pages/SettingsPage';
import QuickPayPage from '@/pages/QuickPayPage';
import WalletPage from '@/pages/WalletPage';
import TeamPage from '@/pages/TeamPage';
import HelpPage from '@/pages/HelpPage';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner duration={4000} />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/get-started" element={<GetStartedPage />} />
            <Route path="/creators" element={<CreatorsPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/payouts" element={<PayoutsPage />} />
            <Route path="/quick-pay" element={<QuickPayPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
