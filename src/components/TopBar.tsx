import { Wallet, Loader2, Menu } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from '@/components/AppSidebar';

export function TopBar() {
  const { data: walletData, isLoading } = useWallet();
  const balanceCents = walletData?.balance_cents ?? 0;
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between md:justify-end border-b border-border bg-sidebar px-4 md:px-6 shrink-0">
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex items-center justify-center rounded-md p-2 -ml-2 text-muted-foreground hover:bg-muted transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col pt-4 bg-sidebar">
            <SidebarContent onInteract={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <Link to="/wallet" className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 transition-colors hover:bg-muted shrink-0">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <span className="text-sm font-semibold text-foreground">
            ${(balanceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </Link>
    </header>
  );
}
