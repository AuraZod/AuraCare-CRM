import { 
  Users, 
  Clock,
  FileText,
  Activity,
  Calendar,
  TestTube,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  Plus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { PatientSearch } from '@/components/PatientSearch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface DashboardData {
  stats: {
    todayPatients: number;
    queueCount: number;
    pendingReports: number;
    followUpsToday: number;
    avgConsultationTime: number;
  };
  todayPatients: any[];
  queueWaiting: any[];
  pendingReports: any[];
  followUpsToday: any[];
  analytics: {
    totalPatients: number;
    repeatPatientPercentage: number;
    avgConsultationTime: number;
  };
}

export function DoctorDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDashboardData('doctor');
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

  const handleStartConsultation = (appointmentId: string) => {
    navigate(`/consultation?appointmentId=${appointmentId}`);
  };

  const handleViewPatientHistory = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const handleWritePrescription = (appointmentId?: string, patientId?: string) => {
    if (appointmentId && patientId) {
      navigate(`/prescriptions?appointmentId=${appointmentId}&patientId=${patientId}`);
    } else {
      navigate('/prescriptions');
    }
  };

  const handleOrderTests = (appointmentId?: string, patientId?: string) => {
    if (appointmentId && patientId) {
      navigate(`/orders?appointmentId=${appointmentId}&patientId=${patientId}`);
    } else {
      navigate('/orders');
    }
  };

  const handleScheduleFollowup = () => {
    navigate('/schedule');
  };

  const handlePatientSelect = (patient: any) => {
    navigate(`/consultation?patientId=${patient._id}`);
    setShowPatientSearch(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
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
        <h1 className="text-2xl font-display font-bold">Good Morning, Doctor! 👨‍⚕️</h1>
        <p className="text-muted-foreground">Focus on what matters most - your patients' health and well-being.</p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Quick Patient Search
            </CardTitle>
            <CardDescription>
              Search for a patient to start consultation or view history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <PatientSearch 
                  onPatientSelect={handlePatientSelect}
                  placeholder="Search patients by name, phone, or email..."
                />
              </div>
              <Dialog open={showPatientSearch} onOpenChange={setShowPatientSearch}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Consultation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Patient for Consultation</DialogTitle>
                    <DialogDescription>
                      Search and select a patient to start a new consultation
                    </DialogDescription>
                  </DialogHeader>
                  <PatientSearch 
                    onPatientSelect={handlePatientSelect}
                    placeholder="Search patients..."
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Today's Patients"
          value={dashboardData.stats.todayPatients}
          icon={<Users className="h-6 w-6 text-primary" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Queue Waiting"
          value={dashboardData.stats.queueCount}
          icon={<Clock className="h-6 w-6 text-primary-foreground" />}
          variant="primary"
        />
        <StatsCard
          title="Pending Reports"
          value={dashboardData.stats.pendingReports}
          icon={<FileText className="h-6 w-6 text-accent-foreground" />}
          variant="accent"
        />
        <StatsCard
          title="Follow-ups Due"
          value={dashboardData.stats.followUpsToday}
          icon={<AlertCircle className="h-6 w-6 text-warning" />}
        />
        <StatsCard
          title="Avg. Consultation"
          value={`${dashboardData.stats.avgConsultationTime} min`}
          icon={<Activity className="h-6 w-6 text-success" />}
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Button 
          className="h-20 flex-col gap-2" 
          variant="outline"
          onClick={() => setShowPatientSearch(true)}
        >
          <Activity className="h-6 w-6" />
          <span className="text-sm">Start Consultation</span>
        </Button>
        <Button 
          className="h-20 flex-col gap-2" 
          variant="outline"
          onClick={() => handleWritePrescription()}
        >
          <FileText className="h-6 w-6" />
          <span className="text-sm">Write Prescription</span>
        </Button>
        <Button 
          className="h-20 flex-col gap-2" 
          variant="outline"
          onClick={() => handleOrderTests()}
        >
          <TestTube className="h-6 w-6" />
          <span className="text-sm">Order Tests</span>
        </Button>
        <Button 
          className="h-20 flex-col gap-2" 
          variant="outline"
          onClick={handleScheduleFollowup}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-sm">Schedule Follow-up</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Today's Patients
              </CardTitle>
              <CardDescription>
                Your scheduled patients for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.todayPatients.map((appointment) => (
                  <div key={appointment._id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-center min-w-[60px]">
                          {appointment.appointmentTime}
                        </div>
                        <Separator orientation="vertical" className="h-12" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              onClick={() => handleViewPatientHistory(appointment.patientId?._id)}
                              className="font-medium hover:text-primary cursor-pointer"
                            >
                              {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                            </button>
                            <span className="text-sm text-muted-foreground">
                              ({appointment.patientId?.age || 'N/A'}y)
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            Type: {appointment.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <Badge className={getPriorityColor(appointment.priority || 'normal')}>
                          {appointment.priority || 'normal'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === 'in-progress' ? (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleStartConsultation(appointment._id)}
                        >
                          Continue Consultation
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleStartConsultation(appointment._id)}
                        >
                          Start Consultation
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewPatientHistory(appointment.patientId?._id)}
                      >
                        View History
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleWritePrescription(appointment._id, appointment.patientId?._id)}
                      >
                        Prescribe
                      </Button>
                    </div>
                  </div>
                ))}
                {dashboardData.todayPatients.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No patients scheduled for today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Reports
              </CardTitle>
              <CardDescription>
                Test results awaiting review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.pendingReports.map((report) => (
                  <div key={report._id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => handleViewPatientHistory(report.patientId?._id)}
                        className="font-medium text-sm hover:text-primary cursor-pointer"
                      >
                        {report.patientId?.firstName} {report.patientId?.lastName}
                      </button>
                      <Badge className={getStatusColor('ready')}>
                        ready
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {report.tests?.length || 0} test(s)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Order: {report.orderNumber}
                    </p>
                    <Button size="sm" className="w-full mt-2">
                      Review Report
                    </Button>
                  </div>
                ))}
                {dashboardData.pendingReports.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No pending reports
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Follow-ups Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.followUpsToday.map((followUp) => (
                  <div key={followUp._id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <button
                        onClick={() => handleViewPatientHistory(followUp.patientId?._id)}
                        className="font-medium text-sm hover:text-primary cursor-pointer"
                      >
                        {followUp.patientId?.firstName} {followUp.patientId?.lastName}
                      </button>
                      <Badge className={getStatusColor('scheduled')}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        scheduled
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{followUp.diagnosis}</p>
                    <p className="text-xs text-muted-foreground">
                      Prescription: {followUp.prescriptionNumber}
                    </p>
                  </div>
                ))}
                {dashboardData.followUpsToday.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No follow-ups scheduled
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
            <TrendingUp className="h-5 w-5" />
            Your Performance Analytics
          </CardTitle>
          <CardDescription>
            Personal insights and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {dashboardData.analytics.totalPatients}
              </div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {dashboardData.analytics.repeatPatientPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">Repeat Patients</p>
              <Progress value={dashboardData.analytics.repeatPatientPercentage} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold mb-1">
                {dashboardData.analytics.avgConsultationTime} min
              </div>
              <p className="text-sm text-muted-foreground">Avg Consultation Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{dashboardData.analytics.followUpRate || 85}%</div>
              <p className="text-sm text-muted-foreground">Follow-up Success</p>
              <Progress value={dashboardData.analytics.followUpRate || 85} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}