import { cn } from '@/lib/utils';
import { Clock, User, MoreVertical, Phone, CheckCircle2, XCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Appointment, AppointmentStatus } from '@/types/clinic';

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clinic_id: 'c1',
    patient_id: 'p1',
    patient_name: 'Priya Sharma',
    doctor_id: 'd1',
    doctor_name: 'Dr. Rajesh Kumar',
    date: '2024-01-15',
    time_slot: '09:00 AM',
    duration_minutes: 30,
    status: 'in_progress',
    token_number: 1,
    created_at: '2024-01-14',
  },
  {
    id: '2',
    clinic_id: 'c1',
    patient_id: 'p2',
    patient_name: 'Amit Patel',
    doctor_id: 'd1',
    doctor_name: 'Dr. Rajesh Kumar',
    date: '2024-01-15',
    time_slot: '09:30 AM',
    duration_minutes: 30,
    status: 'in_queue',
    token_number: 2,
    created_at: '2024-01-14',
  },
  {
    id: '3',
    clinic_id: 'c1',
    patient_id: 'p3',
    patient_name: 'Sunita Devi',
    doctor_id: 'd1',
    doctor_name: 'Dr. Rajesh Kumar',
    date: '2024-01-15',
    time_slot: '10:00 AM',
    duration_minutes: 30,
    status: 'confirmed',
    token_number: 3,
    created_at: '2024-01-14',
  },
  {
    id: '4',
    clinic_id: 'c1',
    patient_id: 'p4',
    patient_name: 'Rohit Singh',
    doctor_id: 'd1',
    doctor_name: 'Dr. Rajesh Kumar',
    date: '2024-01-15',
    time_slot: '10:30 AM',
    duration_minutes: 30,
    status: 'scheduled',
    token_number: 4,
    created_at: '2024-01-14',
  },
  {
    id: '5',
    clinic_id: 'c1',
    patient_id: 'p5',
    patient_name: 'Neha Gupta',
    doctor_id: 'd1',
    doctor_name: 'Dr. Rajesh Kumar',
    date: '2024-01-15',
    time_slot: '11:00 AM',
    duration_minutes: 30,
    status: 'completed',
    token_number: 5,
    created_at: '2024-01-14',
  },
];

const statusConfig: Record<AppointmentStatus, { label: string; className: string; icon: React.ElementType }> = {
  scheduled: { label: 'Scheduled', className: 'bg-secondary text-secondary-foreground', icon: Clock },
  confirmed: { label: 'Confirmed', className: 'bg-primary/10 text-primary', icon: CheckCircle2 },
  in_queue: { label: 'In Queue', className: 'bg-warning/10 text-warning', icon: Clock },
  in_progress: { label: 'In Progress', className: 'bg-success/10 text-success', icon: PlayCircle },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive', icon: XCircle },
  no_show: { label: 'No Show', className: 'bg-destructive/10 text-destructive', icon: XCircle },
};

export function AppointmentsList() {
  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden animate-slide-up">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg">Today's Appointments</h2>
          <p className="text-sm text-muted-foreground">
            {mockAppointments.length} appointments scheduled
          </p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="divide-y divide-border">
        {mockAppointments.map((appointment, index) => {
          const status = statusConfig[appointment.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={appointment.id}
              className="p-4 hover:bg-secondary/30 transition-colors duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-display font-bold text-primary">
                    #{appointment.token_number}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{appointment.patient_name}</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full flex items-center gap-1', status.className)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {appointment.time_slot}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {appointment.duration_minutes} min
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Start Consultation</DropdownMenuItem>
                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
