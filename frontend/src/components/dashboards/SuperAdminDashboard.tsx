import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  UserPlus, 
  CalendarPlus, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Clock,
  ClipboardList,
  Stethoscope,
  Users,
  Building,
  UserCog,
  DollarSign,
  TrendingUp,
  Zap,
  Database,
  MoreVertical,
  Phone,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  PlayCircle,
  Bell,
  Pill,
  Syringe,
  ArrowRight,
  IndianRupee,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Appointment {
  _id: string;
  patientId: { _id: string; firstName: string; lastName: string; phone: string; email?: string; age?: number; gender?: string };
  doctorId: { _id: string; name: string; specialization?: string };
  date: string;
  timeSlot: string;
  status: string;
  tokenNumber?: number;
  reason?: string;
  notes?: string;
}

interface FollowUp {
  _id: string;
  patientId: { _id: string; firstName: string; lastName: string; phone: string };
  scheduledDate: string;
  reason: string;
  status: string;
  type: string;
}

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showWritePrescription, setShowWritePrescription] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    todayAppointments: 0,
    todayRevenue: 0,
    usersThisMonth: 0,
    appointmentsDiff: 0,
    revenueGrowth: 0,
    patientsThisMonth: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, statsRes] = await Promise.all([
        apiClient.getTodayAppointments().catch(() => ({ success: true, data: [] })),
        apiClient.get('/dashboard/super_admin').catch(() => ({ success: true, data: { stats: {} } }))
      ]);
      
      if (appointmentsRes.success) {
        setAppointments(appointmentsRes.data || []);
      }
      if (statsRes.success && statsRes.data) {
        setStats(prev => ({ ...prev, ...statsRes.data.stats }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'New Appointment', icon: CalendarPlus, iconBgColorClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 dark:text-cyan-400', onClick: () => setShowNewAppointment(true) },
    { label: 'Add Patient', icon: UserPlus, iconBgColorClass: 'bg-teal-500/10 border-teal-500/20 text-teal-500 dark:text-teal-400', onClick: () => setShowAddPatient(true) },
    { label: 'Create Invoice', icon: CreditCard, iconBgColorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400', onClick: () => setShowCreateInvoice(true) },
    { label: 'Write Prescription', icon: FileText, iconBgColorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400', onClick: () => setShowWritePrescription(true) },
    { label: 'Send Message', icon: MessageSquare, iconBgColorClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 dark:text-cyan-400', onClick: () => setShowSendMessage(true) },
    { label: 'View Queue', icon: Clock, iconBgColorClass: 'bg-teal-500/10 border-teal-500/20 text-teal-500 dark:text-teal-400', onClick: () => navigate('/queue') },
    { label: 'Patient History', icon: ClipboardList, iconBgColorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400', onClick: () => navigate('/patients') },
    { label: 'Consultation', icon: Stethoscope, iconBgColorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400', onClick: () => navigate('/consultation') },
  ];

  const adminActions = [
    { label: 'User Management', desc: 'Manage system users', icon: UserCog, href: '/user-management', iconBgColorClass: 'bg-teal-500/10 border-teal-500/20 text-teal-500 dark:text-teal-400' },
    { label: 'Role & Permissions', desc: 'Configure access rights', icon: Shield, href: '/roles', iconBgColorClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 dark:text-cyan-400' },
    { label: 'System Settings', desc: 'General configuration', icon: Settings, href: '/master-settings', iconBgColorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400' },
    { label: 'Audit Logs', desc: 'Track system activities', icon: FileText, href: '/audit-logs', iconBgColorClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400' },
    { label: 'Backup & Restore', desc: 'Data backup management', icon: Database, href: '/data-management', iconBgColorClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 dark:text-cyan-400' },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      scheduled: { label: 'Scheduled', className: 'bg-secondary text-secondary-foreground' },
      confirmed: { label: 'Confirmed', className: 'bg-primary/10 text-primary' },
      in_queue: { label: 'In Queue', className: 'bg-warning/10 text-warning' },
      in_progress: { label: 'In Progress', className: 'bg-success/10 text-success' },
      completed: { label: 'Completed', className: 'bg-muted text-muted-foreground' },
      cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
    };
    const c = config[status] || config.scheduled;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const handleAppointmentAction = async (appointmentId: string, action: string) => {
    try {
      if (action === 'cancel') {
        await apiClient.updateAppointmentStatus(appointmentId, 'cancelled');
        toast.success('Appointment cancelled');
      } else if (action === 'start') {
        await apiClient.updateAppointmentStatus(appointmentId, 'in_progress');
        toast.success('Consultation started');
      } else if (action === 'complete') {
        await apiClient.updateAppointmentStatus(appointmentId, 'completed');
        toast.success('Appointment completed');
      }
      fetchDashboardData();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {user?.name || 'Super Admin'}! 👋</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Super Admin Dashboard - Full system control</p>
          </div>
          <Button onClick={() => setShowAddUser(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-all duration-300">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-800/40 hover:border-cyan-500/30 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.08)] transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400 rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalUsers || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                  <span>&uarr; {stats.usersThisMonth} this month</span>
                </div>
                <div className="w-24 h-8">
                  <svg className="w-full h-full stroke-cyan-500/80" fill="none" viewBox="0 0 100 30">
                    <path d="M 0 25 Q 20 5, 40 20 T 80 10 T 100 5" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-800/40 hover:border-blue-500/30 shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.08)] transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 rounded-xl">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Today's Appointments</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{appointments.length || stats.todayAppointments || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  stats.appointmentsDiff >= 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  <span>{stats.appointmentsDiff >= 0 ? '↑' : '↓'} {Math.abs(stats.appointmentsDiff)} from yesterday</span>
                </div>
                <div className="w-24 h-8">
                  <svg className="w-full h-full stroke-blue-500/80" fill="none" viewBox="0 0 100 30">
                    <path d="M 0 10 Q 20 25, 40 10 T 80 20 T 100 5" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-800/40 hover:border-emerald-500/30 shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.08)] transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-xl">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Today's Revenue</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{(stats.todayRevenue || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  stats.revenueGrowth >= 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  <span>{stats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth).toFixed(1)}% from yesterday</span>
                </div>
                <div className="w-24 h-8">
                  <svg className="w-full h-full stroke-emerald-500/80" fill="none" viewBox="0 0 100 30">
                    <path d="M 0 25 Q 30 5, 60 25 T 100 5" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-800/40 hover:border-purple-500/30 shadow-sm hover:shadow-[0_0_15px_rgba(139,92,246,0.08)] transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400 rounded-xl">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Total Patients</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalPatients || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                  <span>&uarr; {stats.patientsThisMonth} this month</span>
                </div>
                <div className="w-24 h-8">
                  <svg className="w-full h-full stroke-purple-500/80" fill="none" viewBox="0 0 100 30">
                    <path d="M 0 20 Q 20 10, 40 25 T 80 15 T 100 5" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-800/40">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 hover:bg-white/80 dark:hover:bg-slate-950/70 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.08)] transition-all duration-300 text-left group"
                  >
                    <div className={cn(
                      'p-2.5 rounded-lg border transition-colors duration-300',
                      action.iconBgColorClass
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-800/40">
          <CardHeader className="pb-3">
            <CardTitle>Administration</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">System configuration and management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {adminActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.href)}
                    className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/40 hover:bg-white/80 dark:hover:bg-slate-950/70 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.08)] transition-all duration-300 text-left group"
                  >
                    <div className={cn(
                      'p-2.5 rounded-lg border transition-colors duration-300 shrink-0',
                      action.iconBgColorClass
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors truncate">
                        {action.label}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        {action.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Today's Appointments</CardTitle>
                  <CardDescription>{appointments.length} appointments scheduled</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((apt) => (
                      <div key={apt._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">#{apt.tokenNumber || 1}</span>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setShowAppointmentDetails(true);
                              }}
                              className="font-medium hover:text-primary cursor-pointer text-left"
                            >
                              {apt.patientId?.firstName} {apt.patientId?.lastName}
                            </button>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {apt.timeSlot}
                              <span>•</span>
                              <span>Dr. {apt.doctorId?.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(apt.status)}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                              if (apt.patientId?.phone) {
                                window.open(`tel:${apt.patientId.phone}`);
                              }
                            }}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedAppointment(apt);
                                setShowAppointmentDetails(true);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAppointmentAction(apt._id, 'start')}>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Start Consultation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/appointments?edit=${apt._id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleAppointmentAction(apt._id, 'cancel')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No appointments scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Follow-ups</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/followups')}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Rahul Verma', type: 'follow_up', date: 'Jan 16', message: 'Post-surgery check-up' },
                  { name: 'Anjali Mehta', type: 'vaccination', date: 'Jan 16', message: 'Flu vaccination due' },
                  { name: 'Suresh Kumar', type: 'medication', date: 'Jan 17', message: 'Medication refill' },
                  { name: 'Meera Shah', type: 'annual_checkup', date: 'Jan 18', message: 'Annual health check-up' },
                ].map((item, idx) => {
                  const typeConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
                    follow_up: { icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10' },
                    vaccination: { icon: Syringe, color: 'text-success', bgColor: 'bg-success/10' },
                    medication: { icon: Pill, color: 'text-warning', bgColor: 'bg-warning/10' },
                    annual_checkup: { icon: Bell, color: 'text-accent', bgColor: 'bg-accent/10' },
                  };
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg">
                      <div className={cn('p-2 rounded-lg', config.bgColor)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{item.date}</p>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                          Send
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Patient Name</Label>
                  <p className="font-medium">{selectedAppointment.patientId?.firstName} {selectedAppointment.patientId?.lastName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedAppointment.patientId?.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedAppointment.patientId?.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Age/Gender</Label>
                  <p className="font-medium">{selectedAppointment.patientId?.age || 'N/A'} / {selectedAppointment.patientId?.gender || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Doctor</Label>
                  <p className="font-medium">Dr. {selectedAppointment.doctorId?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Specialization</Label>
                  <p className="font-medium">{selectedAppointment.doctorId?.specialization || 'General'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="font-medium">{selectedAppointment.timeSlot}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Token</Label>
                  <p className="font-medium">#{selectedAppointment.tokenNumber || 'N/A'}</p>
                </div>
              </div>
              {selectedAppointment.reason && (
                <div>
                  <Label className="text-muted-foreground">Reason</Label>
                  <p className="font-medium">{selectedAppointment.reason}</p>
                </div>
              )}
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="font-medium">{selectedAppointment.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => {
                  if (selectedAppointment.patientId?.phone) {
                    window.open(`tel:${selectedAppointment.patientId.phone}`);
                  }
                }}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button className="flex-1" onClick={() => {
                  handleAppointmentAction(selectedAppointment._id, 'start');
                  setShowAppointmentDetails(false);
                }}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Consultation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddUserModal open={showAddUser} onOpenChange={setShowAddUser} onSuccess={fetchDashboardData} />
      
      <NewAppointmentModal open={showNewAppointment} onOpenChange={setShowNewAppointment} onSuccess={fetchDashboardData} />
      
      <AddPatientModal open={showAddPatient} onOpenChange={setShowAddPatient} />
      
      <CreateInvoiceModal open={showCreateInvoice} onOpenChange={setShowCreateInvoice} />
      
      <WritePrescriptionModal open={showWritePrescription} onOpenChange={setShowWritePrescription} />
      
      <SendMessageModal open={showSendMessage} onOpenChange={setShowSendMessage} />
    </DashboardLayout>
  );
}


function AddUserModal({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    specialization: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.post('/users', formData);
      toast.success('User created successfully');
      onOpenChange(false);
      setFormData({ name: '', email: '', password: '', role: '', phone: '', specialization: '' });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new user account</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="diagnostic">Diagnostic Staff</SelectItem>
                <SelectItem value="pharmacy">Pharmacy Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          {formData.role === 'doctor' && (
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} />
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewAppointmentModal({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '',
    reason: ''
  });

  useEffect(() => {
    if (open) {
      apiClient.getPatients({ limit: 100 }).then(res => setPatients(res.data || [])).catch(() => {});
      apiClient.get('/users?role=doctor').then((res: any) => setDoctors(res.data || [])).catch(() => {});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.createAppointment(formData);
      toast.success('Appointment created successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Patient</Label>
            <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p._id} value={p._id}>{p.firstName} {p.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Doctor</Label>
            <Select value={formData.doctorId} onValueChange={(value) => setFormData({ ...formData, doctorId: value })}>
              <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d._id} value={d._id}>Dr. {d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          </div>
          <div>
            <Label>Time Slot</Label>
            <Select value={formData.timeSlot} onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}>
              <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
              <SelectContent>
                {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Reason</Label>
            <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for visit" />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddPatientModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>Register a new patient in the system</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground mb-4">You will be redirected to the patient registration form.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => { onOpenChange(false); navigate('/patients/register'); }}>
              Go to Registration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateInvoiceModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>Generate a new invoice for a patient</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground mb-4">You will be redirected to the billing page to create an invoice.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => { onOpenChange(false); navigate('/billing'); }}>
              Go to Billing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WritePrescriptionModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write Prescription</DialogTitle>
          <DialogDescription>Create a new prescription for a patient</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground mb-4">You will be redirected to the prescriptions page.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => { onOpenChange(false); navigate('/prescriptions/new'); }}>
              Go to Prescriptions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SendMessageModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ recipient: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent successfully');
      onOpenChange(false);
      setFormData({ recipient: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>Send a message to a patient or staff member</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Recipient</Label>
            <Input value={formData.recipient} onChange={(e) => setFormData({ ...formData, recipient: e.target.value })} placeholder="Phone number or email" required />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Type your message..." rows={4} required />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
