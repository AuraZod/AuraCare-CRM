import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  TestTube, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  User,
  Calendar,
  MoreVertical,
  Play,
  Pause,
  Eye,
  Edit,
  Download,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface TestOrder {
  _id: string;
  orderNumber: string;
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
  tests: Array<{
    testName: string;
    testCode: string;
    category: string;
    status: string;
    results?: any;
  }>;
  status: string;
  priority: string;
  sampleCollected: boolean;
  sampleCollectionDate?: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  totalAmount: number;
  createdAt: string;
}

export function TestOrders() {
  const navigate = useNavigate();
  const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<TestOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showUploadReport, setShowUploadReport] = useState(false);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportNotes, setReportNotes] = useState('');

  useEffect(() => {
    fetchTestOrders();
  }, []);

  const fetchTestOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTestOrders();
      if (response.success) {
        setTestOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch test orders:', error);
      toast.error('Failed to load test orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await apiClient.put(`/test-orders/${orderId}/status`, { status: newStatus });
      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchTestOrders();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSampleCollection = async (orderId: string) => {
    try {
      const response = await apiClient.put(`/test-orders/${orderId}/sample`, { 
        sampleCollected: true,
        sampleCollectionDate: new Date().toISOString()
      });
      if (response.success) {
        toast.success('Sample collection recorded');
        fetchTestOrders();
      }
    } catch (error) {
      console.error('Failed to record sample collection:', error);
      toast.error('Failed to record sample collection');
    }
  };

  const handleUploadReport = async () => {
    if (!selectedOrder || !reportFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('report', reportFile);
      formData.append('notes', reportNotes);
      formData.append('orderId', selectedOrder._id);

      const response = await apiClient.uploadTestReport(selectedOrder._id, formData);
      
      if (response.success) {
        toast.success('Report uploaded successfully');
        setShowUploadReport(false);
        setReportFile(null);
        setReportNotes('');
        handleStatusUpdate(selectedOrder._id, 'reported');
        fetchTestOrders();
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload report:', error);
      toast.error('Failed to upload report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'sample_collected': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'reported': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = testOrders.filter(order => {
    const matchesSearch = 
      order.patientId.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patientId.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const orderStats = {
    total: testOrders.length,
    pending: testOrders.filter(order => order.status === 'ordered').length,
    inProgress: testOrders.filter(order => order.status === 'in_progress').length,
    completed: testOrders.filter(order => order.status === 'completed').length,
    readyToReport: testOrders.filter(order => order.status === 'completed' && !order.actualCompletionDate).length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Test Orders</h1>
            <p className="text-muted-foreground">Manage laboratory test orders and results</p>
          </div>
          <Button onClick={fetchTestOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orderStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{orderStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{orderStats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{orderStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Ready to Report</p>
                  <p className="text-2xl font-bold">{orderStats.readyToReport}</p>
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
                    placeholder="Search by patient name or order number..."
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
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="sample_collected">Sample Collected</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all-orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-orders">All Orders</TabsTrigger>
            <TabsTrigger value="pending-samples">Pending Samples</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="ready-reports">Ready for Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="all-orders">
            <Card>
              <CardHeader>
                <CardTitle>All Test Orders</CardTitle>
                <CardDescription>
                  Complete list of test orders ({filteredOrders.length} orders)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">#{order.orderNumber}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ')}
                              </Badge>
                              <Badge className={getPriorityColor(order.priority)}>
                                {order.priority}
                              </Badge>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderDetails(true);
                              }}
                              className="font-medium hover:text-primary cursor-pointer"
                            >
                              {order.patientId.firstName} {order.patientId.lastName}
                            </button>
                            <p className="text-sm text-muted-foreground">
                              Dr. {order.doctorId.name} • {order.tests.length} test(s)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Ordered: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            {order.sampleCollected ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto" />
                            )}
                            <p className="text-xs text-muted-foreground">
                              {order.sampleCollected ? 'Collected' : 'Pending'}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium">₹{order.totalAmount}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!order.sampleCollected && (
                              <Button
                                size="sm"
                                onClick={() => handleSampleCollection(order._id)}
                              >
                                Collect Sample
                              </Button>
                            )}
                            
                            {order.sampleCollected && order.status === 'sample_collected' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order._id, 'in_progress')}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start Test
                              </Button>
                            )}
                            
                            {order.status === 'completed' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowUploadReport(true);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Upload Report
                              </Button>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOrderDetails(true);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(order._id, 'completed')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                                {order.status === 'reported' && (
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Report
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No test orders found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-samples">
            <Card>
              <CardHeader>
                <CardTitle>Pending Sample Collection</CardTitle>
                <CardDescription>
                  Orders waiting for sample collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredOrders.filter(order => !order.sampleCollected).map((order) => (
                    <div key={order._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">#{order.orderNumber} - {order.patientId.firstName} {order.patientId.lastName}</p>
                          <p className="text-sm text-muted-foreground">{order.tests.length} test(s) ordered</p>
                        </div>
                        <Button onClick={() => handleSampleCollection(order._id)}>
                          Collect Sample
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in-progress">
            <Card>
              <CardHeader>
                <CardTitle>Tests in Progress</CardTitle>
                <CardDescription>
                  Currently running tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredOrders.filter(order => order.status === 'in_progress').map((order) => (
                    <div key={order._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">#{order.orderNumber} - {order.patientId.firstName} {order.patientId.lastName}</p>
                          <p className="text-sm text-muted-foreground">{order.tests.length} test(s) in progress</p>
                        </div>
                        <Button onClick={() => handleStatusUpdate(order._id, 'completed')}>
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ready-reports">
            <Card>
              <CardHeader>
                <CardTitle>Ready for Report Upload</CardTitle>
                <CardDescription>
                  Completed tests awaiting report upload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredOrders.filter(order => order.status === 'completed').map((order) => (
                    <div key={order._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">#{order.orderNumber} - {order.patientId.firstName} {order.patientId.lastName}</p>
                          <p className="text-sm text-muted-foreground">{order.tests.length} test(s) completed</p>
                        </div>
                        <Button onClick={() => {
                          setSelectedOrder(order);
                          setShowUploadReport(true);
                        }}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedOrder && (
          <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Test Order Details</DialogTitle>
                <DialogDescription>
                  Order #{selectedOrder.orderNumber}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Patient</p>
                    <p>{selectedOrder.patientId.firstName} {selectedOrder.patientId.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Doctor</p>
                    <p>Dr. {selectedOrder.doctorId.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Priority</p>
                    <Badge className={getPriorityColor(selectedOrder.priority)}>
                      {selectedOrder.priority}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Tests Ordered</p>
                  <div className="space-y-2">
                    {selectedOrder.tests.map((test, index) => (
                      <div key={index} className="p-2 border rounded">
                        <p className="font-medium">{test.testName}</p>
                        <p className="text-sm text-muted-foreground">{test.testCode} • {test.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Sample Collected</p>
                    <p>{selectedOrder.sampleCollected ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Amount</p>
                    <p className="font-bold">₹{selectedOrder.totalAmount}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={showUploadReport} onOpenChange={setShowUploadReport}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Test Report</DialogTitle>
              <DialogDescription>
                Upload the completed test report for order #{selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reportFile">Report File</Label>
                <Input
                  id="reportFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                />
              </div>
              
              <div>
                <Label htmlFor="reportNotes">Notes</Label>
                <Textarea
                  id="reportNotes"
                  placeholder="Any additional notes about the report"
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowUploadReport(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUploadReport} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}