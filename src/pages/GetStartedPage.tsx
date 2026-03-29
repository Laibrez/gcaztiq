import { CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const steps = [
  {
    title: 'Create your account',
    desc: 'Sign up and verify your email.',
    completed: true,
  },
  {
    title: 'Set up your company profile',
    desc: 'Add your company name, logo, and preferred currency.',
    completed: true,
  },
  {
    title: 'Add a payment method',
    desc: 'Connect a payment rail to fund your wallet.',
    completed: true,
  },
  {
    title: 'Top up your wallet',
    desc: 'Add funds so you can start paying creators.',
    completed: false,
    cta: 'Top Up',
    path: '/wallet',
  },
  {
    title: 'Invite your first creator',
    desc: "Add a creator with just their email. They'll set up their own payment method.",
    completed: false,
    cta: 'Invite Creator',
    path: '/creators',
  },
  {
    title: 'Send your first payout',
    desc: 'Pay a creator directly or upload a CSV for bulk payouts.',
    completed: false,
    cta: 'Go to Quick Pay',
    path: '/quick-pay',
  },
];

export default function GetStartedPage() {
  const navigate = useNavigate();
  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Get Started with Caztiq
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete these steps to start paying your creators.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completedCount} of {steps.length} steps completed
          </span>
          <span className="font-medium text-foreground">
            {Math.round((completedCount / steps.length) * 100)}%
          </span>
        </div>
        <Progress value={(completedCount / steps.length) * 100} className="h-2" />
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors',
              step.completed && 'opacity-60'
            )}
          >
            <div className="shrink-0">
              {step.completed ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-sent/15">
                  <CheckCircle2 className="h-5 w-5 text-status-sent" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border text-sm font-semibold text-muted-foreground">
                  {i + 1}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  step.completed
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground'
                )}
              >
                {step.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>
            </div>

            {step.completed ? (
              <span className="shrink-0 text-xs font-medium text-status-sent">Done</span>
            ) : step.cta ? (
              <Button
                size="sm"
                className="shrink-0 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate(step.path!)}
              >
                {step.cta}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
