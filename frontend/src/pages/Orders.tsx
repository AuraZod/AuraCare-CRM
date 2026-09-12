import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  TestTube, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Clock,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface TestItem {
  testName: string;
  testCode: string;
  category: string;
  price: number;
  normalRange?: string;
  unit?: string;
  instructions?: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
}

interface Appointment {
  _id: string;
  patientId: Patient;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
}

const commonTests = [
  { testName: 'Complete Blood Count (CBC)', testCode: 'CBC001', category: 'blood', price: 300, normalRange: 'Various', unit: 'Various' },
  { testName: 'Blood Sugar (Fasting)', testCode: 'BS001', category: 'blood', price: 150, normalRange: '70-100 mg/dL', unit: 'mg/dL' },
  { testName: 'Blood Sugar (Random)', testCode: 'BS002', category: 'blood', price: 120, normalRange: '<200 mg/dL', unit: 'mg/dL' },
  { testName: 'HbA1c', testCode: 'HBA1C', category: 'blood', price: 400, normalRange: '<5.7%', unit: '%' },
  { testName: 'Lipid Profile', testCode: 'LP001', category: 'blood', price: 500, normalRange: 'Various', unit: 'mg/dL' },
  { testName: 'Liver Function Test (LFT)', testCode: 'LFT001', category: 'blood', price: 600, normalRange: 'Various', unit: 'Various' },
  { testName: 'Kidney Function Test (KFT)', testCode: 'KFT001', category: 'blood', price: 550, normalRange: 'Various', unit: 'Various' },
  { testName: 'Thyroid Profile (T3, T4, TSH)', testCode: 'THY001', category: 'blood', price: 800, normalRange: 'Various', unit: 'Various' },
  { testName: 'Urine Routine & Microscopy', testCode: 'UR001', category: 'urine', price: 200, normalRange: 'Various', unit: 'Various' },
  { testName: 'ECG', testCode: 'ECG001', category: 'cardiac', price: 300, normalRange: 'Normal rhythm', unit: 'N/A' },
  { testName: 'Chest X-Ray', testCode: 'CXR001', category: 'imaging', price: 400, normalRange: 'Normal', unit: 'N/A' },
  { testName: 'Ultrasound Abdomen', testCode: 'USG001', category: 'imaging', price: 800, normalRange: 'Normal', unit: 'N/A' }
];

export function Orders() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('appointmentId');
  const patientId = searchParams.get('patientId');
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  
  const [orderData, setOrderData] = useState({
    tests: [] as TestItem[],
    priority: 'routine',
    clinicalHistory: '',
    provisionalDiagnosis: '',
    specialInstructions: ''
  });

  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (appointmentId && patientId) {
      fetchData();
    } else {
      setLoading(false);
    }
    fetchOrders();
  }, [appointmentId, patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentResponse, patientResponse] = await Promise.all([
        apiClient.getAppointmentById(appointmentId!),
        apiClient.getPatientById(patientId!)
      ]);
      
      if (appointmentResponse.success) {
        setAppointment(appointmentResponse.data);
      }
      if (patientResponse.success) {
        setPatient(patientResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await apiClient.getTestOrders({ patientId });
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleTestSelection = (test: TestItem, checked: boolean) => {
    if (checked) {
      setSelectedTests(prev => new Set([...prev, test.testCode]));
      setOrderData(prev => ({
        ...prev,
        tests: [...prev.tests, test]
      }));
    } else {
      setSelectedTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(test.testCode);
        return newSet;
      });
      setOrderData(prev => ({
        ...prev,
        tests: prev.tests.filter(t => t.testCode !== test.testCode)
      }));
    }
  };

  const handleRemoveTest = (testCode: string) => {
    setSelectedTests(prev => {
      const newSet = new Set(prev);
      newSet.delete(testCode);
      return newSet;
    });
    setOrderData(prev => ({
      ...prev,
      tests: prev.tests.filter(t => t.testCode !== testCode)
    }));
  };

  const handleCreateOrder = async () => {
    if (orderData.tests.length === 0) {
      toast.error('Please select at least one test');
      return;
    }

    try {
      setSaving(true);
      const orderPayload = {
        patientId: patientId!,
        appointmentId: appointmentId || undefined,
        tests: orderData.tests,
        priority: orderData.priority,
        clinicalHistory: orderData.clinicalHistory,
        provisionalDiagnosis: orderData.provisionalDiagnosis,
        specialInstructions: orderData.specialInstructions
      };

      const response = await apiClient.createTestOrder(orderPayload);
      if (response.success) {
        toast.success('Test order created successfully');
        setOrderData({
          tests: [],
          priority: 'routine',
          clinicalHistory: '',
          provisionalDiagnosis: '',
          specialInstructions: ''
        });
        setSelectedTests(new Set());
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create test order');
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getTotalAmount = () => {
    return orderData.tests.reduce((total, test) => total + test.price, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'sample_collected': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'reported': return 'bg-gray-100 text-gray-800';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Test Orders</h1>
            <p className="text-muted-foreground">Order laboratory tests and diagnostic procedures</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <Tabs defaultValue="new-order" className="space-y-4">
          <TabsList>
            <TabsTrigger value="new-order">New Order</TabsTrigger>
            <TabsTrigger value="order-history">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="new-order">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {patient && (
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {calculateAge(patient.dateOfBirth)} years old • {patient.gender}
                        </p>
                      </div>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{patient.phone}</span>
                        </div>
                        {patient.email && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{patient.email}</span>
                          </div>
                        )}
                      </div>
                      {appointment && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">Current Appointment</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <span>{appointment.appointmentTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Reason:</span>
                                <span>{appointment.reason}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className={patient ? "lg:col-span-2" : "lg:col-span-3"}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5" />
                      Create Test Order
                    </CardTitle>
                    <CardDescription>
                      Select tests and provide clinical information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Select Tests</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                        {commonTests.map((test) => (
                          <div key={test.testCode} className="flex items-start space-x-2">
                            <Checkbox
                              id={test.testCode}
                              checked={selectedTests.has(test.testCode)}
                              onCheckedChange={(checked) => handleTestSelection(test, checked as boolean)}
                            />
                            <div className="flex-1 min-w-0">
                              <Label htmlFor={test.testCode} className="text-sm font-medium cursor-pointer">
                                {test.testName}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {test.testCode} • ₹{test.price} • {test.category}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {orderData.tests.length > 0 && (
                      <div>
                        <Label className="text-base font-medium">Selected Tests</Label>
                        <div className="space-y-2 mt-2">
                          {orderData.tests.map((test) => (
                            <div key={test.testCode} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{test.testName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {test.testCode} • {test.category}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">₹{test.price}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveTest(test.testCode)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="font-medium">Total Amount:</span>
                            <span className="font-bold text-lg">₹{getTotalAmount()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={orderData.priority} onValueChange={(value) => setOrderData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="stat">STAT (Immediate)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clinicalHistory">Clinical History</Label>
                        <Textarea
                          id="clinicalHistory"
                          placeholder="Relevant clinical history"
                          value={orderData.clinicalHistory}
                          onChange={(e) => setOrderData(prev => ({ ...prev, clinicalHistory: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="provisionalDiagnosis">Provisional Diagnosis</Label>
                        <Textarea
                          id="provisionalDiagnosis"
                          placeholder="Provisional or working diagnosis"
                          value={orderData.provisionalDiagnosis}
                          onChange={(e) => setOrderData(prev => ({ ...prev, provisionalDiagnosis: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="specialInstructions">Special Instructions</Label>
                      <Textarea
                        id="specialInstructions"
                        placeholder="Any special instructions for the lab"
                        value={orderData.specialInstructions}
                        onChange={(e) => setOrderData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <Button 
                      onClick={handleCreateOrder} 
                      disabled={saving || orderData.tests.length === 0}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Create Test Order
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="order-history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Order History
                </CardTitle>
                <CardDescription>
                  Previous test orders and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">Order #{order.orderNumber}</h4>
                            <p className="text-sm text-muted-foreground">
                              {order.patientId?.firstName} {order.patientId?.lastName} • 
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">{order.priority}</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Tests Ordered:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {order.tests?.map((test: any, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {test.testName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {order.provisionalDiagnosis && (
                            <div>
                              <p className="text-sm font-medium">Diagnosis:</p>
                              <p className="text-sm text-muted-foreground">{order.provisionalDiagnosis}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Total Amount: ₹{order.totalAmount}</span>
                            {order.expectedCompletionDate && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Expected: {new Date(order.expectedCompletionDate).toLocaleDateString()}
                              </span>
                            )}
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}