import { 
  Calendar, 
  Users, 
  Clock,
  UserCheck,
  CreditCard,
  AlertCircle,
  Phone,
  UserPlus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface DashboardData {
  stats: {
    todayAppointments: number;
    queueCount: number;
    walkInsToday: number;
    pendingPayments: number;
    todayRevenue: number;
  };
  todayAppointments: any[];
  currentQueue: any[];
  doctorAvailability: any[];
}

export function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedQueueItem, setSelectedQueueItem] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDashboardData('receptionist');
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    navigate('/appointments');
  };

  const handleRegisterPatient = () => {
    navigate('/patients/register');
  };

  const handleGenerateToken = () => {
    navigate('/queue');
  };

  const handleProcessPayment = () => {
    navigate('/billing');
  };

  const handleViewPatientDetails = (patient: any) => {
    setSelectedPatient(patient);
  };

  const handleViewDoctorDetails = (doctor: any) => {
    setSelectedDoctor(doctor);
  };

  const handleViewQueueDetails = (queueItem: any) => {
    setSelectedQueueItem(queueItem);
  };

  const handleCallPatient = (phone: string, name: string) => {
    toast.success(`Calling ${name} at ${phone}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDoctorStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-red-100 text-red-800';
      case 'break': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Good Morning! 👋</h1>
        <p className="text-muted-foreground">Ready to help patients and manage appointments efficiently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Today's Appointments"
          value={dashboardData.stats.todayAppointments}
          icon={<Calendar className="h-6 w-6 text-primary" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Patients in Queue"
          value={dashboardData.stats.queueCount}
          icon={<Clock className="h-6 w-6 text-primary-foreground" />}
          variant="primary"
        />
        <StatsCard
          title="Walk-ins Today"
          value={dashboardData.stats.walkInsToday}
          icon={<UserPlus className="h-6 w-6 text-accent-foreground" />}
          variant="accent"
        />
        <StatsCard
          title="Pending Payments"
          value={dashboardData.stats.pendingPayments}
          icon={<AlertCircle className="h-6 w-6 text-warning" />}
        />
        <StatsCard
          title="Today's Revenue"
          value={`₹${dashboardData.stats.todayRevenue.toLocaleString()}`}
          icon={<CreditCard className="h-6 w-6 text-success" />}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Button 
          className="h-20 flex-col gap-2" 
          variant="outline"
          onClick={handleBookAppointment}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-sm">Book Appointment</span>
        </Button>
        <Button 
          className="h-20 flex-col gap-2" 
          variant="outline"
          onClick={handleRegisterPatient}
        >
          <UserPlus className="h-6 w-6" />
          <span className="text-sm">Register Patient</span>
        </Button>
        <Button 
          className="h-20 flex-col gap-2" 
          variant="outline"
          onClick={handleGenerateToken}
        >
          <Clock className="h-6 w-6" />
          <span className="text-sm">Generate Token</span>
        </Button>
        <Button 
          className="h-20 flex-col gap-2" 
          variant="outline"
          onClick={handleProcessPayment}
        >
          <CreditCard className="h-6 w-6" />
          <span className="text-sm">Process Payment</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Appointments
              </CardTitle>
              <CardDescription>
                Manage and track all appointments for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.todayAppointments.map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-center min-w-[60px]">
                        {appointment.appointmentTime}
                      </div>
                      <Separator orientation="vertical" className="h-8" />
                      <div>
                        <button
                          onClick={() => handleViewPatientDetails(appointment.patientId)}
                          className="font-medium hover:text-primary cursor-pointer"
                        >
                          {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                        </button>
                        <button
                          onClick={() => handleViewDoctorDetails(appointment.doctorId)}
                          className="text-sm text-muted-foreground hover:text-primary cursor-pointer block"
                        >
                          Dr. {appointment.doctorId?.name}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCallPatient(appointment.patientId?.phone, `${appointment.patientId?.firstName} ${appointment.patientId?.lastName}`)}
                        title={`Call ${appointment.patientId?.phone}`}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewPatientDetails(appointment.patientId)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Patient
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/appointments/${appointment._id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Appointment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/billing/new?appointmentId=${appointment._id}`)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Process Payment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {dashboardData.todayAppointments.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No appointments scheduled for today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Current Queue
              </CardTitle>
              <CardDescription>
                Patients waiting to be seen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.currentQueue.map((patient) => (
                  <div key={patient._id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{patient.tokenNumber || 'N/A'}</span>
                      <Badge className={getStatusColor(patient.priority || 'normal')}>
                        {patient.priority || 'normal'}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleViewQueueDetails(patient)}
                      className="font-medium text-sm hover:text-primary cursor-pointer block"
                    >
                      {patient.patientId?.firstName} {patient.patientId?.lastName}
                    </button>
                    <button
                      onClick={() => handleViewDoctorDetails(patient.doctorId)}
                      className="text-xs text-muted-foreground hover:text-primary cursor-pointer block"
                    >
                      Dr. {patient.doctorId?.name}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Time: {patient.appointmentTime}
                    </p>
                  </div>
                ))}
                {dashboardData.currentQueue.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No patients in queue
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Doctor Availability
          </CardTitle>
          <CardDescription>
            Current status of all doctors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.doctorAvailability.map((doctor, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => handleViewDoctorDetails(doctor)}
                    className="font-medium hover:text-primary cursor-pointer"
                  >
                    {doctor.name}
                  </button>
                  <Badge className={getDoctorStatusColor(doctor.status)}>
                    {doctor.status}
                  </Badge>
                </div>
                {doctor.currentPatient && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Current: {doctor.currentPatient}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Next: {doctor.nextAppointmentTime || 'No appointments'}
                </p>
              </div>
            ))}
            {dashboardData.doctorAvailability.length === 0 && (
              <p className="text-center text-muted-foreground py-4 col-span-3">
                No doctors available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                Information for {selectedPatient.firstName} {selectedPatient.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p>{selectedPatient.firstName} {selectedPatient.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p>{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Age</p>
                  <p>{selectedPatient.age || 'N/A'} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Gender</p>
                  <p className="capitalize">{selectedPatient.gender}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleCallPatient(selectedPatient.phone, `${selectedPatient.firstName} ${selectedPatient.lastName}`)}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Patient
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/patients/${selectedPatient._id}`)}
                  className="flex-1"
                >
                  View Full Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {selectedDoctor && (
        <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Doctor Details</DialogTitle>
              <DialogDescription>
                Information for Dr. {selectedDoctor.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p>Dr. {selectedDoctor.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Specialization</p>
                  <p>{selectedDoctor.specialization}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={getDoctorStatusColor(selectedDoctor.status)}>
                    {selectedDoctor.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Current Patient</p>
                  <p>{selectedDoctor.currentPatient || 'None'}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => navigate(`/appointments?doctorId=${selectedDoctor._id}`)}
                  className="flex-1"
                >
                  View Schedule
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/doctors/${selectedDoctor._id}`)}
                  className="flex-1"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {selectedQueueItem && (
        <Dialog open={!!selectedQueueItem} onOpenChange={() => setSelectedQueueItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Queue Details</DialogTitle>
              <DialogDescription>
                Token #{selectedQueueItem.tokenNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Patient</p>
                  <p>{selectedQueueItem.patientId?.firstName} {selectedQueueItem.patientId?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Doctor</p>
                  <p>Dr. {selectedQueueItem.doctorId?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Appointment Time</p>
                  <p>{selectedQueueItem.appointmentTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <Badge className={getStatusColor(selectedQueueItem.priority)}>
                    {selectedQueueItem.priority}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => navigate('/queue')}
                  className="flex-1"
                >
                  Manage Queue
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleCallPatient(selectedQueueItem.patientId?.phone, `${selectedQueueItem.patientId?.firstName} ${selectedQueueItem.patientId?.lastName}`)}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Patient
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}