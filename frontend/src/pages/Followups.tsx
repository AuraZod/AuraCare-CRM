import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Bell,
  Calendar,
  Pill,
  Syringe,
  CheckCircle2,
  Clock,
  Send,
  Phone,
  MessageSquare,
  MoreHorizontal,
  User,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FollowUpReminder } from '@/types/clinic';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';


const typeConfig = {
  follow_up: { icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10', label: 'Follow-up' },
  vaccination: { icon: Syringe, color: 'text-success', bgColor: 'bg-success/10', label: 'Vaccination' },
  medication: { icon: Pill, color: 'text-warning', bgColor: 'bg-warning/10', label: 'Medication' },
  annual_checkup: { icon: Bell, color: 'text-accent', bgColor: 'bg-accent/10', label: 'Annual Check' },
};

const statusConfig = {
  pending: { color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  sent: { color: 'bg-primary/10 text-primary border-primary/30', icon: Send },
  acknowledged: { color: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  completed: { color: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  cancelled: { color: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertCircle },
};


export default function Followups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reminderType, setReminderType] = useState('follow_up');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');

  const { toast } = useToast();

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getPrescriptions({ hasFollowUp: 'true' });
      if (res.success) {
        const list = res.data || [];
        const mapped = list.map((p: any) => ({
          id: p._id || p.id,
          patient_id: p.patientId?._id || p.patientId?.id || '',
          patient_name: p.patientId ? `${p.patientId.firstName} ${p.patientId.lastName}` : 'Unknown Patient',
          patient_phone: p.patientId?.phone || 'N/A',
          reminder_date: p.followUpDate ? p.followUpDate.split('T')[0] : new Date().toISOString().split('T')[0],
          reminder_type: p.medications?.length > 0 ? 'medication' : 'follow_up',
          message: p.followUpInstructions || `Follow-up checkup for ${p.diagnosis || 'treatment'}`,
          status: p.followUpStatus || 'pending',
          last_visit: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        }));
        setReminders(mapped);
      }
    } catch (err) {
      console.error("Failed to load follow-ups:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await apiClient.getPatients();
      if (res.success) {
        setPatients(res.data?.patients || res.data || []);
      }
    } catch (err) {
      console.error("Failed to load patients:", err);
    }
  };

  useEffect(() => {
    fetchFollowUps();
    fetchPatients();
  }, []);

  const handleUpdateStatus = async (reminderId: string, newStatus: string) => {
    try {
      const res = await apiClient.updatePrescription(reminderId, { followUpStatus: newStatus });
      if (res.success) {
        toast({
          title: 'Status Updated',
          description: `Reminder status updated to ${newStatus}.`,
        });
        fetchFollowUps();
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to update reminder status.',
        variant: 'destructive',
      });
    }
  };

  const handleScheduleReminder = async () => {
    if (!selectedPatientId || !reminderDate || !reminderMessage) {
      toast({
        title: 'Validation Error',
        description: 'Please select a patient, date, and enter a message.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newPrescription = {
        patientId: selectedPatientId,
        medications: reminderType === 'medication' ? [{ name: 'Refill Medication', dosage: 'As prescribed', frequency: 'Daily', duration: '1 month' }] : [],
        diagnosis: reminderType === 'medication' ? 'Medication Refill Needed' : 'Routine Follow-up',
        followUpDate: reminderDate,
        followUpInstructions: reminderMessage,
        followUpStatus: 'pending'
      };

      const res = await apiClient.createPrescription(newPrescription);
      if (res.success) {
        setIsCreateOpen(false);
        setSelectedPatientId('');
        setReminderDate('');
        setReminderMessage('');
        toast({
          title: 'Reminder Scheduled',
          description: 'Follow-up reminder has been scheduled in the database.',
        });
        fetchFollowUps();
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to schedule reminder.',
        variant: 'destructive',
      });
    }
  };

  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch = 
      reminder.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && reminder.status === activeTab;
  });

  const pendingCount = reminders.filter((r) => r.status === 'pending').length;
  const todayCount = reminders.filter((r) => {
    try {
      return new Date(r.reminder_date).toDateString() === new Date().toDateString();
    } catch (e) {
      return false;
    }
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Follow-up Reminders</h1>
            <p className="text-muted-foreground">Track and send patient follow-up reminders</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground shadow-md">
                <Plus className="h-4 w-4" />
                Schedule Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Schedule Follow-up Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p: any) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reminder Type</Label>
                  <Select onValueChange={setReminderType} value={reminderType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow-up Visit</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="medication">Medication Refill</SelectItem>
                      <SelectItem value="annual_checkup">Annual Check-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reminder Date</Label>
                  <Input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea 
                    placeholder="Enter reminder message..." 
                    rows={3} 
                    value={reminderMessage} 
                    onChange={(e) => setReminderMessage(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button className="gap-2 gradient-primary text-primary-foreground" onClick={handleScheduleReminder}>
                    <Bell className="h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayCount}</p>
              <p className="text-sm text-muted-foreground">Due Today</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-muted-foreground">Sent This Week</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">89%</p>
              <p className="text-sm text-muted-foreground">Response Rate</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients or messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending" className="gap-1">
                <Clock className="h-4 w-4" /> Pending
              </TabsTrigger>
              <TabsTrigger value="sent" className="gap-1">
                <Send className="h-4 w-4" /> Sent
              </TabsTrigger>
              <TabsTrigger value="acknowledged" className="gap-1">
                <CheckCircle2 className="h-4 w-4" /> Acknowledged
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-3">
          {filteredReminders.map((reminder) => {
            const config = typeConfig[reminder.reminder_type as keyof typeof typeConfig] || typeConfig.follow_up;
            const Icon = config.icon;
            const statusStyle = statusConfig[reminder.status as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = statusStyle.icon;

            return (
              <div
                key={reminder.id}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-3 rounded-xl', config.bgColor)}>
                    <Icon className={cn('h-6 w-6', config.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">{reminder.patient_name}</p>
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{reminder.message}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(reminder.reminder_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {reminder.patient_phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Last visit: {new Date(reminder.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={statusStyle.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(reminder.id, 'sent')}>
                              <MessageSquare className="h-4 w-4 mr-2" /> Send WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(reminder.id, 'acknowledged')}>
                              <Phone className="h-4 w-4 mr-2" /> Call Patient
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(reminder.id, 'completed')}>
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Done
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>

                {reminder.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button 
                      size="sm" 
                      className="gap-1.5 gradient-primary text-primary-foreground"
                      onClick={() => handleUpdateStatus(reminder.id, 'sent')}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send Reminder
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1.5"
                      onClick={() => handleUpdateStatus(reminder.id, 'sent')}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      WhatsApp
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="gap-1.5"
                      onClick={() => handleUpdateStatus(reminder.id, 'acknowledged')}
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredReminders.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No reminders found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
