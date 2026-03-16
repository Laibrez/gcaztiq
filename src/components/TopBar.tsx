import { Wallet } from 'lucide-react';

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-end border-b border-border bg-sidebar px-6">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
        <Wallet className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">$17,143.35</span>
      </div>
    </header>
  );
}
