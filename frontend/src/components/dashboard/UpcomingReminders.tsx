import { Bell, Calendar, Pill, Syringe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FollowUpReminder } from '@/types/clinic';

const mockReminders: FollowUpReminder[] = [
  {
    id: '1',
    patient_id: 'p1',
    patient_name: 'Rahul Verma',
    reminder_date: '2024-01-16',
    reminder_type: 'follow_up',
    message: 'Post-surgery check-up after 1 week',
    status: 'pending',
  },
  {
    id: '2',
    patient_id: 'p2',
    patient_name: 'Anjali Mehta',
    reminder_date: '2024-01-16',
    reminder_type: 'vaccination',
    message: 'Flu vaccination due',
    status: 'pending',
  },
  {
    id: '3',
    patient_id: 'p3',
    patient_name: 'Suresh Kumar',
    reminder_date: '2024-01-17',
    reminder_type: 'medication',
    message: 'Medication refill reminder',
    status: 'pending',
  },
  {
    id: '4',
    patient_id: 'p4',
    patient_name: 'Meera Shah',
    reminder_date: '2024-01-18',
    reminder_type: 'annual_checkup',
    message: 'Annual health check-up',
    status: 'pending',
  },
];

const typeConfig = {
  follow_up: { icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10' },
  vaccination: { icon: Syringe, color: 'text-success', bgColor: 'bg-success/10' },
  medication: { icon: Pill, color: 'text-warning', bgColor: 'bg-warning/10' },
  annual_checkup: { icon: Bell, color: 'text-accent', bgColor: 'bg-accent/10' },
};

export function UpcomingReminders() {
  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg">Upcoming Follow-ups</h2>
          <p className="text-sm text-muted-foreground">Next 7 days</p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View All
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="divide-y divide-border">
        {mockReminders.map((reminder) => {
          const config = typeConfig[reminder.reminder_type];
          const Icon = config.icon;

          return (
            <div
              key={reminder.id}
              className="p-4 hover:bg-secondary/30 transition-colors duration-200 flex items-center gap-4"
            >
              <div className={cn('p-2.5 rounded-lg', config.bgColor)}>
                <Icon className={cn('h-5 w-5', config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{reminder.patient_name}</p>
                <p className="text-sm text-muted-foreground truncate">{reminder.message}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium">
                  {new Date(reminder.reminder_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  Send Reminder
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
