import { Book, MessageCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

const cards = [
  {
    title: 'Documentation',
    desc: 'Browse guides and tutorials',
    icon: Book,
    action: 'View Docs',
  },
  {
    title: 'Contact Support',
    desc: 'Get help from our team',
    icon: MessageCircle,
    action: 'Send Message',
  },
  {
    title: 'Feature Request',
    desc: "Tell us what you'd like to see",
    icon: Lightbulb,
    action: 'Submit Request',
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Get Help</h1>
        <p className="text-sm text-muted-foreground">
          We're here to help you get the most out of Caztiq.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="flex flex-col items-center space-y-3 rounded-xl border border-border bg-card p-6 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <c.icon className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
            <Button variant="outline" size="sm">
              {c.action}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Email us directly at{' '}
        <span className="font-medium text-foreground">support@caztiq.com</span>
      </p>
    </div>
  );
}
