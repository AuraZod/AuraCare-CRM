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
  XCircle,
  PlayCircle,
  Calendar,
  ArrowRight,
  IndianRupee,
  Activity,
  Bell,
  Pill,
  Syringe
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
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
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
      const res = await apiClient.get<any>('/dashboard/admin');
      
      if (res && res.success && res.data) {
        const { stats: dashboardStats, appointments: dashboardAppointments } = res.data;
        setStats({
          totalUsers: dashboardStats.totalUsers || 0,
          totalPatients: dashboardStats.totalPatients || 0,
          todayAppointments: dashboardStats.todayAppointments || 0,
          todayRevenue: dashboardStats.todayRevenue || 0,
          usersThisMonth: dashboardStats.usersThisMonth || 0,
          appointmentsDiff: dashboardStats.appointmentsDiff || 0,
          revenueGrowth: dashboardStats.revenueGrowth || 0,
          patientsThisMonth: dashboardStats.patientsThisMonth || 0
        });
        setAppointments(dashboardAppointments || []);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats({
        totalUsers: 12,
        totalPatients: 145,
        todayAppointments: 8,
        todayRevenue: 4000,
        usersThisMonth: 2,
        appointmentsDiff: 3,
        revenueGrowth: 18.5,
        patientsThisMonth: 45
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const adminActions = [
    { label: 'Hospital Setup', desc: 'Hospital configuration', icon: Building, href: '/hospital-setup', iconBgColorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400' },
    { label: 'User Management', desc: 'Manage system users', icon: UserCog, href: '/user-management', iconBgColorClass: 'bg-teal-500/10 border-teal-500/20 text-teal-500 dark:text-teal-400' },
    { label: 'Services & Pricing', desc: 'Configure services list', icon: DollarSign, href: '/services-pricing', iconBgColorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400' },
    { label: 'Billing & Finance', desc: 'Hospital billing reports', icon: TrendingUp, href: '/billing-finance', iconBgColorClass: 'bg-orange-500/10 border-orange-500/20 text-orange-500 dark:text-orange-400' },
    { label: 'Integrations', desc: 'Integrate external APIs', icon: Zap, href: '/integrations', iconBgColorClass: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 dark:text-yellow-400' },
    { label: 'Data Management', desc: 'System data operations', icon: Database, href: '/data-management', iconBgColorClass: 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400' },
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {user?.name || 'Admin'}! 👋</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Admin Dashboard - System management</p>
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
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{appointments.length || 0}</p>
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
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{stats.todayRevenue || '0'}</p>
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
          <CardHeader className="pb-3">
            <CardTitle>Administration</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">System configuration and management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Today's Appointments</CardTitle><CardDescription>{appointments.length} appointments</CardDescription></div>
            <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>View All</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
            ) : appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">#{apt.tokenNumber || 1}</span>
                      </div>
                      <div>
                        <button onClick={() => { setSelectedAppointment(apt); setShowAppointmentDetails(true); }} className="font-medium hover:text-primary cursor-pointer text-left">
                          {apt.patientId?.firstName} {apt.patientId?.lastName}
                        </button>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />{apt.timeSlot}<span>•</span><span>{apt.doctorId?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(apt.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedAppointment(apt); setShowAppointmentDetails(true); }}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAppointmentAction(apt._id, 'start')}><PlayCircle className="h-4 w-4 mr-2" />Start Consultation</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/appointments?edit=${apt._id}`)}><Edit className="h-4 w-4 mr-2" />Reschedule</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleAppointmentAction(apt._id, 'cancel')}><XCircle className="h-4 w-4 mr-2" />Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground"><Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No appointments today</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Appointment Details</DialogTitle></DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Patient</Label><p className="font-medium">{selectedAppointment.patientId?.firstName} {selectedAppointment.patientId?.lastName}</p></div>
                <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium">{selectedAppointment.patientId?.phone || 'N/A'}</p></div>
                <div><Label className="text-muted-foreground">Doctor</Label><p className="font-medium">Dr. {selectedAppointment.doctorId?.name}</p></div>
                <div><Label className="text-muted-foreground">Time</Label><p className="font-medium">{selectedAppointment.timeSlot}</p></div>
                <div><Label className="text-muted-foreground">Status</Label><div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddUserModal open={showAddUser} onOpenChange={setShowAddUser} onSuccess={fetchDashboardData} />
    </DashboardLayout>
  );
}

function AddUserModal({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '', phone: '', specialization: '' });

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
        <DialogHeader><DialogTitle>Add New User</DialogTitle><DialogDescription>Create a new user account</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Full Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
          <div><Label>Password</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></div>
          <div><Label>Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="diagnostic">Diagnostic Staff</SelectItem>
                <SelectItem value="pharmacy">Pharmacy Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
          {formData.role === 'doctor' && <div><Label>Specialization</Label><Input value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} /></div>}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
