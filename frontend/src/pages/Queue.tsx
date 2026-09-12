import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  Users, 
  Phone, 
  User, 
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface QueueItem {
  _id: string;
  tokenNumber: string;
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
  appointmentTime: string;
  status: string;
  priority: string;
  waitingTime: number;
  estimatedTime?: string;
}

export function Queue() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<QueueItem | null>(null);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/appointments/queue');
      if (response.success) {
        setQueueItems(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
      toast.error('Failed to load queue data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await apiClient.updateAppointmentStatus(appointmentId, newStatus);
      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchQueue();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleCallPatient = (patient: QueueItem) => {
    toast.success(`Calling ${patient.patientId.firstName} ${patient.patientId.lastName}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'called': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQueue = queueItems.filter(item => {
    const matchesSearch = 
      item.patientId.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientId.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.patientId.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesDoctor = doctorFilter === 'all' || item.doctorId._id === doctorFilter;
    
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const queueStats = {
    total: queueItems.length,
    waiting: queueItems.filter(item => item.status === 'waiting').length,
    inProgress: queueItems.filter(item => item.status === 'in-progress').length,
    avgWaitTime: queueItems.reduce((acc, item) => acc + item.waitingTime, 0) / queueItems.length || 0
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patient Queue</h1>
            <p className="text-muted-foreground">Manage patient flow and waiting times</p>
          </div>
          <Button onClick={fetchQueue} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total in Queue</p>
                  <p className="text-2xl font-bold">{queueStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Waiting</p>
                  <p className="text-2xl font-bold">{queueStats.waiting}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{queueStats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                  <p className="text-2xl font-bold">{Math.round(queueStats.avgWaitTime)}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, token, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="called">Called</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="doctor1">Dr. Smith</SelectItem>
                  <SelectItem value="doctor2">Dr. Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Queue</CardTitle>
            <CardDescription>
              Patients waiting to be seen ({filteredQueue.length} patients)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredQueue.length > 0 ? (
              <div className="space-y-3">
                {filteredQueue.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{item.tokenNumber}</div>
                        <div className="text-xs text-muted-foreground">Token</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={() => setSelectedPatient(item)}
                            className="font-medium hover:text-primary cursor-pointer"
                          >
                            {item.patientId.firstName} {item.patientId.lastName}
                          </button>
                          <span className="text-sm text-muted-foreground">
                            ({item.patientId.age || 'N/A'}y)
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Dr. {item.doctorId.name} • {item.doctorId.specialization}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Scheduled: {item.appointmentTime} • Waiting: {item.waitingTime}m
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge className={getStatusColor(item.status)} size="sm">
                          {item.status}
                        </Badge>
                        <div className="mt-1">
                          <Badge className={getPriorityColor(item.priority)} size="sm">
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCallPatient(item)}
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
                            <DropdownMenuItem onClick={() => handleStatusUpdate(item._id, 'called')}>
                              Mark as Called
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(item._id, 'in-progress')}>
                              Mark as In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(item._id, 'completed')}>
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(item._id, 'no-show')}>
                              Mark as No Show
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No patients in queue</p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedPatient && (
          <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Patient Details</DialogTitle>
                <DialogDescription>
                  Information for {selectedPatient.patientId.firstName} {selectedPatient.patientId.lastName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Token Number</p>
                    <p className="text-lg font-bold text-primary">{selectedPatient.tokenNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p>{selectedPatient.patientId.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Doctor</p>
                    <p>Dr. {selectedPatient.doctorId.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Appointment Time</p>
                    <p>{selectedPatient.appointmentTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge className={getStatusColor(selectedPatient.status)}>
                      {selectedPatient.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Priority</p>
                    <Badge className={getPriorityColor(selectedPatient.priority)}>
                      {selectedPatient.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => handleCallPatient(selectedPatient)}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Patient
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleStatusUpdate(selectedPatient._id, 'in-progress')}
                    className="flex-1"
                  >
                    Start Consultation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}