import { 
  CalendarPlus, 
  UserPlus, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  ClipboardList,
  Stethoscope,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  { label: 'New Appointment', icon: CalendarPlus, color: 'text-primary', bgColor: 'bg-primary/10 hover:bg-primary/20' },
  { label: 'Add Patient', icon: UserPlus, color: 'text-success', bgColor: 'bg-success/10 hover:bg-success/20' },
  { label: 'Create Invoice', icon: CreditCard, color: 'text-accent', bgColor: 'bg-accent/10 hover:bg-accent/20' },
  { label: 'Write Prescription', icon: FileText, color: 'text-warning', bgColor: 'bg-warning/10 hover:bg-warning/20' },
  { label: 'Send Message', icon: MessageSquare, color: 'text-primary', bgColor: 'bg-primary/10 hover:bg-primary/20' },
  { label: 'View Queue', icon: Clock, color: 'text-success', bgColor: 'bg-success/10 hover:bg-success/20' },
  { label: 'Patient History', icon: ClipboardList, color: 'text-accent', bgColor: 'bg-accent/10 hover:bg-accent/20' },
  { label: 'Consultation', icon: Stethoscope, color: 'text-warning', bgColor: 'bg-warning/10 hover:bg-warning/20' },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl shadow-md p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
      <h2 className="font-display font-semibold text-lg mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                action.bgColor
              )}
            >
              <Icon className={cn('h-6 w-6', action.color)} />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
