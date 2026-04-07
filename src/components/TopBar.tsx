import { Wallet, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Link } from 'react-router-dom';

export function TopBar() {
  const { data: walletData, isLoading } = useWallet();
  const balanceCents = walletData?.balance_cents ?? 0;

  return (
    <header className="flex h-14 items-center justify-end border-b border-border bg-sidebar px-6">
      <Link to="/wallet" className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 transition-colors hover:bg-muted">
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
