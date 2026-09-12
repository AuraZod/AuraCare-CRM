import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search,
  Filter,
  Clock,
  User,
  Phone,
  MoreVertical,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Edit,
  Trash2,
  UserPlus,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays } from 'date-fns';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { PatientSearch } from '@/components/PatientSearch';

interface Appointment {
  _id: string;
  appointmentTime: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    age?: number;
  };
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
  };
  status: string;
  type: string;
  reason: string;
  priority: string;
  createdAt?: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  role: string;
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00'
];

const statusConfig = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800', icon: Clock },
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  in_queue: { label: 'In Queue', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
  "in-progress": { label: 'In Progress', className: 'bg-orange-100 text-orange-800', icon: PlayCircle },
  completed: { label: 'Completed', className: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800', icon: XCircle },
  no_show: { label: 'No Show', className: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function Appointments() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [hospitalSettings, setHospitalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: format(new Date(), 'yyyy-MM-dd'),
    appointmentTime: '',
    type: 'consultation',
    reason: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchDoctors();
    fetchHospitalSettings();
    fetchAppointments();
  }, [selectedDate, selectedDoctor]);

  const fetchHospitalSettings = async () => {
    try {
      const response = await apiClient.get<{success: boolean; data: any}>('/settings/hospital');
      if (response.success) {
        setHospitalSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch hospital settings:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.getDoctors();
      if (response.success) {
        setDoctors(response.data);
        if(!selectedDoctor) {
          setSelectedDoctor(response.data[0]._id);
          setAppointmentForm(prev => ({ ...prev, doctorId: response.data[0]._id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast.error('Failed to load doctors');
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {
        date: format(selectedDate, 'yyyy-MM-dd')
      };
      
      if (selectedDoctor !== 'all') {
        params.doctorId = selectedDoctor;
      }
      
      const response = await apiClient.getAppointments(params);
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(subDays(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const handleCreateAppointment = async () => {
    if (!appointmentForm.patientId || !appointmentForm.doctorId || !appointmentForm.appointmentTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await apiClient.createAppointment(appointmentForm);
      if (response.success) {
        toast.success('Appointment created successfully');
        setShowNewAppointment(false);
        setAppointmentForm({
          patientId: '',
          doctorId: '',
          appointmentDate: format(new Date(), 'yyyy-MM-dd'),
          appointmentTime: '',
          type: 'consultation',
          reason: '',
          priority: 'normal'
        });
        fetchAppointments();
      }
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await apiClient.updateAppointmentStatus(appointmentId, newStatus);
      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleCallPatient = (appointment: Appointment) => {
    toast.success(`Calling ${appointment.patientId.firstName} ${appointment.patientId.lastName} at ${appointment.patientId.phone}`);
  };

  const handleReallotSlot = async (appointmentId: string, time: string) => {
    try {
      const response = await apiClient.deleteAppointment(appointmentId);
      if (response.success) {
        toast.success(`Time slot ${time} is now available for booking`);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Failed to reallot slot:', error);
      toast.error('Failed to reallot slot');
    }
  };

  const handleViewPatientDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowPatientDetails(true);
  };

  const calculateNextAvailableTime = () => {
    if (!isUnlimitedSystem || !selectedDoctor) return '';
    
    const doctorAppointments = appointments
      .filter(apt => apt.doctorId._id === selectedDoctor)
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
    
    if (doctorAppointments.length === 0) {
      return timeSlots[0] || '09:00';
    }
    
    const lastAppointment = doctorAppointments[doctorAppointments.length - 1];
    const lastTime = lastAppointment.appointmentTime;
    
    const [hours, minutes] = lastTime.split(':').map(Number);
    const lastDateTime = new Date();
    lastDateTime.setHours(hours, minutes, 0, 0);
    
    lastDateTime.setMinutes(lastDateTime.getMinutes() + 10);
    
    const newHours = lastDateTime.getHours().toString().padStart(2, '0');
    const newMinutes = lastDateTime.getMinutes().toString().padStart(2, '0');
    const calculatedTime = `${newHours}:${newMinutes}`;
    
    if (lastDateTime.getHours() >= 18) {
      return '09:00';
    }
    
    return calculatedTime;
  };

  const handleBookSlot = (time?: string) => {
    let defaultTime = time || '';
    
    if (isUnlimitedSystem && !time) {
      defaultTime = calculateNextAvailableTime();
    }
    
    setAppointmentForm(prev => ({
      ...prev,
      appointmentTime: defaultTime,
      appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
      doctorId: selectedDoctor !== 'all' ? selectedDoctor : ''
    }));
    setShowNewAppointment(true);
  };

  const getAppointmentsForSlot = (time: string) => {
    return appointments.filter(apt => apt.appointmentTime === time);
  };

  const isUnlimitedSystem = hospitalSettings?.appointmentSystemType === 'unlimited';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.patientId.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientId.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientId.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">Appointments</h1>
            {hospitalSettings && (
              <Badge variant="outline" className="text-xs">
                {hospitalSettings.appointmentSystemType === 'unlimited' ? 'Unlimited System' : 'Time-Limited System'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {isUnlimitedSystem 
              ? 'Patient queue in chronological order' 
              : 'Manage your clinic schedule'
            }
            {hospitalSettings?.appointmentSystemType === 'unlimited' && 
              ' • No time slot restrictions'
            }
          </p>
        </div>
        <Button onClick={() => handleBookSlot()} className="gap-2">
          <Plus className="h-4 w-4" />
          {isUnlimitedSystem ? 'Add to Queue' : 'New Appointment'}
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Doctor:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {doctors.map((doctor) => (
                <Button
                  key={doctor._id}
                  variant={selectedDoctor === doctor._id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedDoctor(doctor._id);
                    setAppointmentForm(prev => ({ ...prev, doctorId: doctor._id }));
                  }}
                  className="h-8"
                >
                  {doctor.name}
                  {doctor.specialization && (
                    <span className="ml-1 text-xs opacity-70">
                      ({doctor.specialization})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDateChange('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDateChange('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="font-display font-semibold">{formatDate(selectedDate)}</h2>
                <p className="text-sm text-muted-foreground">
                  {appointments.length} appointments scheduled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search patient..." 
                  className="pl-10 w-60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Pick Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {isUnlimitedSystem ? (
        <Card>
          <CardHeader>
            <CardTitle>Patient Queue</CardTitle>
            <CardDescription>Chronological order of appointments</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled for today</p>
                  <Button 
                    onClick={() => handleBookSlot()} 
                    className="mt-4"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Appointment
                  </Button>
                </div>
              ) : (
                appointments
                  .sort((a, b) => {
                    const timeComparison = a.appointmentTime.localeCompare(b.appointmentTime);
                    if (timeComparison !== 0) return timeComparison;
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                  })
                  .map((appointment, index) => {
                    const status = statusConfig[appointment.status as keyof typeof statusConfig];
                    const StatusIcon = status?.icon;

                    return (
                      <div key={appointment._id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {index + 1}
                        </div>

                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-sm">
                          {appointment.patientId.firstName[0]}{appointment?.patientId?.lastName? appointment.patientId.lastName[0] : ""}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              onClick={() => handleViewPatientDetails(appointment)}
                              className="font-medium hover:text-primary cursor-pointer"
                            >
                              {appointment.patientId.firstName} {appointment.patientId.lastName || ""}
                            </button>
                            {status && StatusIcon && (
                              <Badge className={status.className}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {appointment.type} • {appointment.doctorId.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{appointment.reason}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Scheduled: {appointment.appointmentTime}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleCallPatient(appointment)}
                            title={`Call ${appointment.patientId.phone}`}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleViewPatientDetails(appointment)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no_show' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirm
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(appointment._id, 'in-progress')}>
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Start
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(appointment._id, 'completed')}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Complete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(appointment._id, 'no_show')}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Mark No Show
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(appointment.status === 'cancelled' || appointment.status === 'no_show') && (
                                <DropdownMenuItem 
                                  onClick={() => handleReallotSlot(appointment._id, appointment.appointmentTime)}
                                  className="text-green-600 focus:text-green-600"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Remove from Queue
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 divide-y divide-border">
              {timeSlots.map((time) => {
                const slotAppointments = getAppointmentsForSlot(time);
                const hasAppointments = slotAppointments.length > 0;

                return (
                  <div 
                    key={time} 
                    className={cn(
                      'flex items-start gap-4 p-4 transition-colors duration-200',
                      hasAppointments ? 'hover:bg-secondary/30' : 'hover:bg-secondary/20'
                    )}
                  >
                    <div className="w-24 shrink-0 pt-1">
                      <span className="font-medium text-sm">{time}</span>
                      {hasAppointments && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {slotAppointments.length} appointment{slotAppointments.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {hasAppointments ? (
                      <div className="flex-1 space-y-3">
                        {slotAppointments.map((appointment, index) => {
                          const status = statusConfig[appointment.status as keyof typeof statusConfig];
                          const StatusIcon = status?.icon;

                          return (
                            <div key={appointment._id} className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                {appointment.patientId.firstName[0]}{appointment?.patientId?.lastName? appointment.patientId.lastName[0] : ""}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewPatientDetails(appointment)}
                                    className="font-medium hover:text-primary cursor-pointer"
                                  >
                                    {appointment.patientId.firstName} {appointment.patientId.lastName || ""}
                                  </button>
                                  {status && StatusIcon && (
                                    <Badge className={status.className}>
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {status.label}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.type} • {appointment.doctorId.name}
                                </p>
                                <p className="text-xs text-muted-foreground">{appointment.reason}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleCallPatient(appointment)}
                                  title={`Call ${appointment.patientId.phone}`}
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleViewPatientDetails(appointment)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no_show' && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}>
                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                          Confirm
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate(appointment._id, 'in-progress')}>
                                          <PlayCircle className="h-4 w-4 mr-2" />
                                          Start
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate(appointment._id, 'completed')}>
                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                          Complete
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}>
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Cancel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate(appointment._id, 'no_show')}>
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Mark No Show
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {(appointment.status === 'cancelled' || appointment.status === 'no_show') && (
                                      <DropdownMenuItem 
                                        onClick={() => handleReallotSlot(appointment._id, appointment.appointmentTime)}
                                        className="text-green-600 focus:text-green-600"
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Reallot Slot
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          );
                        })}
                        {hospitalSettings?.maxAppointmentsPerSlot > 1 && slotAppointments.length < hospitalSettings.maxAppointmentsPerSlot && (
                          <div className="flex items-center pt-2 border-t border-dashed">
                            <Button 
                              variant="ghost" 
                              className="text-muted-foreground hover:text-foreground gap-2 h-8"
                              onClick={() => handleBookSlot(time)}
                            >
                              <Plus className="h-4 w-4" />
                              Add Another Appointment
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center">
                        <Button 
                          variant="ghost" 
                          className="text-muted-foreground hover:text-foreground gap-2"
                          onClick={() => handleBookSlot(time)}
                        >
                          <Plus className="h-4 w-4" />
                          Book Slot
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex items-center gap-6 justify-center">
        {Object.entries(statusConfig).slice(0, 5).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', value.className.split(' ')[0])} />
            <span className="text-sm text-muted-foreground">{value.label}</span>
          </div>
        ))}
      </div>

      <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isUnlimitedSystem ? 'Add Patient to Queue' : 'New Appointment'}
            </DialogTitle>
            <DialogDescription>
              {isUnlimitedSystem 
                ? 'Add a new patient to the appointment queue'
                : 'Schedule a new appointment for a patient'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient</Label>
              <PatientSearch 
                onPatientSelect={(patient) => setAppointmentForm(prev => ({ ...prev, patientId: patient._id }))}
                placeholder="Search and select patient..."
              />
            </div>

            <div>
              <Label htmlFor="doctor">Doctor</Label>
              <Select value={appointmentForm.doctorId} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, doctorId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor._id} value={doctor._id}>
                      {doctor.name} {doctor.specialization && `(${doctor.specialization})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentForm.appointmentDate}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="time">
                  {isUnlimitedSystem ? 'Preferred Time' : 'Time Slot'}
                </Label>
                {isUnlimitedSystem ? (
                  <div>
                    <Input
                      id="time"
                      type="time"
                      value={appointmentForm.appointmentTime}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                    />
                  </div>
                ) : (
                  <Select value={appointmentForm.appointmentTime} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, appointmentTime: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">Appointment Type</Label>
              <Select value={appointmentForm.type} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="check_up">Check-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Reason for appointment"
                value={appointmentForm.reason}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={appointmentForm.priority} onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewAppointment(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateAppointment} className="flex-1">
                {isUnlimitedSystem ? 'Add to Queue' : 'Create Appointment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedAppointment && (
        <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                Information for {selectedAppointment.patientId.firstName} {selectedAppointment.patientId.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Patient Name</p>
                  <p>{selectedAppointment.patientId.firstName} {selectedAppointment.patientId.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p>{selectedAppointment.patientId.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Age</p>
                  <p>{selectedAppointment.patientId.age || 'N/A'} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Doctor</p>
                  <p>{selectedAppointment.doctorId.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Appointment Time</p>
                  <p>{selectedAppointment.appointmentTime}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="capitalize">{selectedAppointment.type}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Reason</p>
                  <p>{selectedAppointment.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={statusConfig[selectedAppointment.status as keyof typeof statusConfig]?.className}>
                    {statusConfig[selectedAppointment.status as keyof typeof statusConfig]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedAppointment.priority}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleCallPatient(selectedAppointment)}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Patient
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/patients/${selectedAppointment.patientId._id}`)}
                  className="flex-1"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Full Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
