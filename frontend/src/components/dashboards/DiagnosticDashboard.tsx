import { 
  TestTube, 
  Clock,
  FileText,
  Microscope,
  CheckCircle,
  AlertCircle,
  Upload,
  Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface DashboardData {
  stats: {
    testsPending: number;
    testsInProgress: number;
    reportsPendingUpload: number;
    completedToday: number;
  };
  testsPending: any[];
  testsInProgress: any[];
  reportsPendingUpload: any[];
  equipmentAlerts: any[];
}

export function DiagnosticDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/dashboard/diagnostic');
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch diagnostic dashboard data:', error);
      toast.error('Failed to load dashboard data. Using offline fallback.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessSample = () => {
    navigate('/test-orders');
  };

  const handleUploadReport = () => {
    navigate('/test-orders');
  };

  const handleEquipmentCheck = () => {
    navigate('/equipment');
  };

  const handleGenerateBill = () => {
    navigate('/billing');
  };

  const mockTodayStats = {
    testsPending: 8,
    testsInProgress: 3,
    reportsUploaded: 12,
    completedToday: 15
  };

  const mockTestOrders = [
    { 
      _id: '1', 
      patientId: { firstName: 'Rajesh', lastName: 'Kumar' }, 
      doctorId: { name: 'Dr. Sharma' },
      testName: 'Blood Sugar Test',
      createdAt: new Date().toISOString(),
      status: 'pending',
      priority: 'normal',
      sampleCollected: false
    },
    { 
      _id: '2', 
      patientId: { firstName: 'Priya', lastName: 'Singh' }, 
      doctorId: { name: 'Dr. Patel' },
      testName: 'ECG',
      createdAt: new Date().toISOString(),
      status: 'in_progress',
      priority: 'urgent',
      sampleCollected: true
    },
    { 
      _id: '3', 
      patientId: { firstName: 'Amit', lastName: 'Gupta' }, 
      doctorId: { name: 'Dr. Verma' },
      testName: 'X-Ray Chest',
      createdAt: new Date().toISOString(),
      status: 'pending',
      priority: 'normal',
      sampleCollected: false
    },
  ];

  const mockPendingReports = [
    { _id: '1', patientId: { firstName: 'Maya', lastName: 'Sharma' }, testName: 'Blood Test', status: 'ready-to-upload' },
    { _id: '2', patientId: { firstName: 'Vikram', lastName: 'Singh' }, testName: 'CT Scan', status: 'processing' },
    { _id: '3', patientId: { firstName: 'Deepa', lastName: 'Patel' }, testName: 'MRI Brain', status: 'ready-to-upload' },
  ];

  const equipmentStatus = [
    { name: 'X-Ray Machine', status: 'operational', usage: 85, nextMaintenance: '2 days' },
    { name: 'CT Scanner', status: 'maintenance', usage: 0, nextMaintenance: 'Today' },
    { name: 'MRI Machine', status: 'operational', usage: 60, nextMaintenance: '1 week' },
    { name: 'ECG Machine', status: 'operational', usage: 40, nextMaintenance: '3 days' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'ready-to-upload': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
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

  const todayStats = dashboardData?.stats ? {
    testsPending: dashboardData.stats.testsPending,
    testsInProgress: dashboardData.stats.testsInProgress,
    reportsUploaded: dashboardData.stats.reportsPendingUpload,
    completedToday: dashboardData.stats.completedToday
  } : mockTodayStats;

  const testOrders = dashboardData?.testsPending && dashboardData.testsPending.length > 0 
    ? dashboardData.testsPending.map(order => ({
        id: order._id,
        patient: `${order.patientId?.firstName || ''} ${order.patientId?.lastName || ''}`,
        doctor: order.doctorId?.name || 'Doctor',
        test: order.testName || (order.tests && order.tests[0]?.name) || 'Diagnostic Test',
        ordered: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
        status: order.status === 'ordered' ? 'pending' : order.status,
        priority: order.priority || 'normal',
        sampleCollected: order.status !== 'ordered'
      })) 
    : mockTestOrders.map(order => ({
        id: order._id,
        patient: `${order.patientId.firstName} ${order.patientId.lastName}`,
        doctor: order.doctorId.name,
        test: order.testName,
        ordered: 'Today',
        status: order.status,
        priority: order.priority,
        sampleCollected: order.sampleCollected
      }));

  const pendingReports = dashboardData?.reportsPendingUpload && dashboardData.reportsPendingUpload.length > 0
    ? dashboardData.reportsPendingUpload.map(report => ({
        id: report._id,
        patient: `${report.patientId?.firstName || ''} ${report.patientId?.lastName || ''}`,
        test: report.testName || (report.tests && report.tests[0]?.name) || 'Diagnostic Test',
        technician: 'Lab Tech',
        status: 'ready-to-upload'
      }))
    : mockPendingReports.map(report => ({
        id: report._id,
        patient: `${report.patientId.firstName} ${report.patientId.lastName}`,
        test: report.testName,
        technician: 'Lab Tech',
        status: report.status
      }));

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Diagnostic Center Dashboard 🧪</h1>
        <p className="text-muted-foreground">Manage tests, reports, and equipment efficiently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Tests Pending"
          value={todayStats.testsPending}
          icon={<Clock className="h-6 w-6 text-primary" />}
        />
        <StatsCard
          title="Tests in Progress"
          value={todayStats.testsInProgress}
          icon={<Activity className="h-6 w-6 text-primary-foreground" />}
          variant="primary"
        />
        <StatsCard
          title="Reports Pending Upload"
          value={todayStats.reportsUploaded}
          icon={<Upload className="h-6 w-6 text-accent-foreground" />}
          variant="accent"
        />
        <StatsCard
          title="Completed Today"
          value={todayStats.completedToday}
          icon={<CheckCircle className="h-6 w-6 text-success" />}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Button className="h-20 flex-col gap-2" variant="outline" onClick={handleProcessSample}>
          <TestTube className="h-6 w-6" />
          <span className="text-sm">Process Sample</span>
        </Button>
        <Button className="h-20 flex-col gap-2" variant="outline" onClick={handleUploadReport}>
          <Upload className="h-6 w-6" />
          <span className="text-sm">Upload Report</span>
        </Button>
        <Button className="h-20 flex-col gap-2" variant="outline" onClick={handleEquipmentCheck}>
          <Microscope className="h-6 w-6" />
          <span className="text-sm">Equipment Check</span>
        </Button>
        <Button className="h-20 flex-col gap-2" variant="outline" onClick={handleGenerateBill}>
          <FileText className="h-6 w-6" />
          <span className="text-sm">Generate Bill</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Orders
              </CardTitle>
              <CardDescription>
                Doctor-ordered tests and walk-in registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testOrders.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{order.patient}</p>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.test}</p>
                        <p className="text-xs text-muted-foreground">
                          Ordered by {order.doctor} • {order.ordered}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm">Sample Collected:</span>
                      {order.sampleCollected ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>

                    <div className="flex gap-2">
                      {!order.sampleCollected && (
                        <Button size="sm" variant="outline" onClick={() => navigate('/test-orders')}>
                          Collect Sample
                        </Button>
                      )}
                      {order.status === 'pending' && order.sampleCollected && (
                        <Button size="sm" onClick={() => navigate('/test-orders')}>
                          Start Test
                        </Button>
                      )}
                      {order.status === 'in-progress' && (
                        <Button size="sm" variant="secondary" onClick={() => navigate('/test-orders')}>
                          Update Status
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reports to Upload
              </CardTitle>
              <CardDescription>
                Completed tests awaiting report upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingReports.map((report) => (
                  <div key={report.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{report.patient}</p>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.test}</p>
                    <p className="text-xs text-muted-foreground">Tech: {report.technician}</p>
                    {report.status === 'ready-to-upload' && (
                      <Button size="sm" className="w-full mt-2" onClick={() => navigate('/test-orders')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Report
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5" />
            Equipment Status
          </CardTitle>
          <CardDescription>
            Monitor equipment usage and maintenance schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {equipmentStatus.map((equipment, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">{equipment.name}</h4>
                  <Badge className={getStatusColor(equipment.status)}>
                    {equipment.status}
                  </Badge>
                </div>
                
                {equipment.status === 'operational' && (
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Usage</span>
                      <span>{equipment.usage}%</span>
                    </div>
                    <Progress value={equipment.usage} className="h-2" />
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Next maintenance: {equipment.nextMaintenance}
                </p>
                
                {equipment.status === 'maintenance' && (
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => navigate('/equipment')}>
                    Schedule Repair
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}