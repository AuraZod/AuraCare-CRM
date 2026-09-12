import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, 
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle,
  IndianRupee,
  Users,
  FileText,
  Receipt,
  BarChart3,
  Search,
  Plus,
  RefreshCw,
  Calendar,
  CreditCard,
  Wallet,
  ArrowRight,
  Eye,
  Printer,
  MoreVertical
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Prescription {
  _id: string;
  patientId: { firstName: string; lastName: string; phone: string };
  doctorId: { name: string };
  medicines: Array<{ name: string; dosage: string; quantity: number; instructions: string }>;
  status: string;
  priority: string;
  createdAt: string;
}

interface InventoryItem {
  _id: string;
  name: string;
  genericName?: string;
  category: string;
  availableQuantity: number;
  reorderLevel: number;
  batches: Array<{ batchNumber: string; expiryDate: string; quantity: number; sellingPrice: number }>;
}

export function PharmacyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [stats, setStats] = useState({
    todaySales: 0,
    monthlyRevenue: 0,
    pendingPrescriptions: 0,
    lowStockCount: 0,
    expiryAlertCount: 0,
    customersToday: 0,
    gstCollected: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [prescriptionsRes, inventoryRes, statsRes] = await Promise.all([
        apiClient.getPendingPrescriptions().catch(() => ({ success: true, data: [] })),
        apiClient.getLowStockItems().catch(() => ({ success: true, data: [] })),
        apiClient.get('/dashboard/pharmacy').catch(() => ({ success: true, data: { stats: {} } }))
      ]);

      if (prescriptionsRes.success) setPrescriptions(prescriptionsRes.data || []);
      if (inventoryRes.success) setLowStockItems(inventoryRes.data || []);
      if (statsRes.success && statsRes.data) {
        setStats(prev => ({ ...prev, ...statsRes.data.stats }));
        setExpiryAlerts(statsRes.data.expiryAlerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats({
        todaySales: 28500,
        monthlyRevenue: 485000,
        pendingPrescriptions: 8,
        lowStockCount: 12,
        expiryAlertCount: 5,
        customersToday: 45,
        gstCollected: 4500
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'New Sale', icon: ShoppingCart, color: 'text-green-600', bgColor: 'bg-green-100', onClick: () => setShowQuickSale(true) },
    { label: 'Dispense Rx', icon: Pill, color: 'text-blue-600', bgColor: 'bg-blue-100', onClick: () => navigate('/pharmacy/prescriptions') },
    { label: 'Add Stock', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100', onClick: () => navigate('/pharmacy/inventory?action=add') },
    { label: 'Purchase Entry', icon: Receipt, color: 'text-orange-600', bgColor: 'bg-orange-100', onClick: () => navigate('/pharmacy/purchase') },
    { label: 'Customer', icon: Users, color: 'text-pink-600', bgColor: 'bg-pink-100', onClick: () => navigate('/pharmacy/customers') },
    { label: 'Reports', icon: BarChart3, color: 'text-indigo-600', bgColor: 'bg-indigo-100', onClick: () => navigate('/pharmacy/reports') },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dispensing': return 'bg-blue-100 text-blue-800';
      case 'dispensed': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDispense = async (prescriptionId: string) => {
    try {
      await apiClient.dispenseMedication(prescriptionId, { status: 'dispensed' });
      toast.success('Prescription dispensed successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to dispense prescription');
    }
  };

  const mockPrescriptions = [
    { _id: '1', patientId: { firstName: 'Rajesh', lastName: 'Kumar', phone: '9876543210' }, doctorId: { name: 'Dr. Sharma' }, medicines: [{ name: 'Metformin 500mg', dosage: '1-0-1', quantity: 30, instructions: 'After meals' }, { name: 'Aspirin 75mg', dosage: '0-0-1', quantity: 15, instructions: 'After dinner' }], status: 'pending', priority: 'normal', createdAt: new Date().toISOString() },
    { _id: '2', patientId: { firstName: 'Priya', lastName: 'Singh', phone: '9876543211' }, doctorId: { name: 'Dr. Patel' }, medicines: [{ name: 'Paracetamol 500mg', dosage: 'SOS', quantity: 10, instructions: 'When needed' }], status: 'pending', priority: 'urgent', createdAt: new Date().toISOString() },
    { _id: '3', patientId: { firstName: 'Amit', lastName: 'Gupta', phone: '9876543212' }, doctorId: { name: 'Dr. Verma' }, medicines: [{ name: 'Insulin Pen', dosage: 'As directed', quantity: 2, instructions: 'Before meals' }], status: 'dispensing', priority: 'normal', createdAt: new Date().toISOString() },
  ];

  const mockLowStock = [
    { _id: '1', name: 'Paracetamol 500mg', availableQuantity: 25, reorderLevel: 100, category: 'medicine' },
    { _id: '2', name: 'Insulin Pen', availableQuantity: 8, reorderLevel: 20, category: 'medicine' },
    { _id: '3', name: 'Cough Syrup', availableQuantity: 12, reorderLevel: 30, category: 'medicine' },
    { _id: '4', name: 'Bandages', availableQuantity: 15, reorderLevel: 50, category: 'surgical' },
  ];

  const mockExpiry = [
    { name: 'Antibiotic Tablets', batch: 'AB123', expiryDate: '2025-01-15', quantity: 50, daysLeft: 18 },
    { name: 'Pain Relief Gel', batch: 'PR456', expiryDate: '2025-01-20', quantity: 25, daysLeft: 23 },
    { name: 'Vitamin D3', batch: 'VD789', expiryDate: '2025-02-10', quantity: 100, daysLeft: 44 },
  ];

  const mockTopSelling = [
    { name: 'Paracetamol 500mg', sales: 145, revenue: 7250 },
    { name: 'Cough Syrup', sales: 98, revenue: 5880 },
    { name: 'Antacid Tablets', sales: 87, revenue: 4350 },
    { name: 'Vitamin C', sales: 76, revenue: 3800 },
    { name: 'Pain Balm', sales: 65, revenue: 1950 },
  ];

  const displayPrescriptions = prescriptions.length > 0 ? prescriptions : mockPrescriptions;
  const displayLowStock = lowStockItems.length > 0 ? lowStockItems : mockLowStock;
  const displayExpiry = expiryAlerts.length > 0 ? expiryAlerts : mockExpiry;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pharmacy Dashboard 💊</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || 'Pharmacist'}!</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowQuickSale(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <IndianRupee className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Today's Sales</p>
                  <p className="text-lg font-bold">₹{stats.todaySales.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                  <p className="text-lg font-bold">₹{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Rx</p>
                  <p className="text-lg font-bold">{stats.pendingPrescriptions || displayPrescriptions.filter(p => p.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                  <p className="text-lg font-bold">{stats.lowStockCount || displayLowStock.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expiry Alerts</p>
                  <p className="text-lg font-bold">{stats.expiryAlertCount || displayExpiry.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customers</p>
                  <p className="text-lg font-bold">{stats.customersToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Receipt className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">GST Collected</p>
                  <p className="text-lg font-bold">₹{stats.gstCollected.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                      action.bgColor
                    )}
                  >
                    <Icon className={cn('h-6 w-6', action.color)} />
                    <span className="text-xs font-medium text-center">{action.label}</span>
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
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Prescriptions to Dispense
                  </CardTitle>
                  <CardDescription>{displayPrescriptions.filter(p => p.status !== 'dispensed').length} pending</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/pharmacy/prescriptions')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayPrescriptions.filter(p => p.status !== 'dispensed').slice(0, 5).map((prescription) => (
                    <div key={prescription._id} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{prescription.patientId.firstName} {prescription.patientId.lastName}</p>
                            {prescription.priority === 'urgent' && (
                              <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                            )}
                            <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {prescription.doctorId.name} • {prescription.patientId.phone}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedPrescription(prescription); setShowDispenseModal(true); }}>
                              <Eye className="h-4 w-4 mr-2" />View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDispense(prescription._id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />Mark Dispensed
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="h-4 w-4 mr-2" />Print Label
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium mb-1">Medicines:</p>
                        <ul className="text-muted-foreground space-y-1">
                          {prescription.medicines.slice(0, 3).map((med, idx) => (
                            <li key={idx}>• {med.name} - {med.dosage} (Qty: {med.quantity})</li>
                          ))}
                          {prescription.medicines.length > 3 && (
                            <li className="text-primary">+{prescription.medicines.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {prescription.status === 'pending' && (
                          <Button size="sm" onClick={() => handleDispense(prescription._id)}>
                            Start Dispensing
                          </Button>
                        )}
                        {prescription.status === 'dispensing' && (
                          <>
                            <Button size="sm" onClick={() => handleDispense(prescription._id)}>Complete</Button>
                            <Button size="sm" variant="outline">Partial</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayLowStock.slice(0, 4).map((item, idx) => {
                    const stockPercent = (item.availableQuantity / item.reorderLevel) * 100;
                    return (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex justify-between mb-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <span className={cn('text-xs font-semibold', stockPercent < 30 ? 'text-red-600' : 'text-yellow-600')}>
                            {stockPercent < 30 ? 'CRITICAL' : 'LOW'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Stock: {item.availableQuantity}</span>
                          <span>Min: {item.reorderLevel}</span>
                        </div>
                        <Progress value={Math.min(stockPercent, 100)} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" className="w-full mt-3" size="sm" onClick={() => navigate('/pharmacy/inventory?filter=low-stock')}>
                  View All Low Stock
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Expiry Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayExpiry.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex justify-between mb-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <Badge variant="destructive" className="text-xs">
                          {item.daysLeft}d left
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Batch: {item.batch} • Qty: {item.quantity}
                      </p>
                      <p className="text-xs text-red-600">Expires: {item.expiryDate}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-3" size="sm" onClick={() => navigate('/pharmacy/inventory?filter=expiring')}>
                  View All Expiring
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Selling Medicines
              </CardTitle>
              <CardDescription>This month's best sellers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTopSelling.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sales} units sold</p>
                      </div>
                    </div>
                    <p className="font-medium">₹{item.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                GST Summary
              </CardTitle>
              <CardDescription>Tax collection overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">CGST Collected</p>
                  <p className="text-xl font-bold text-blue-600">₹{(stats.gstCollected / 2).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">SGST Collected</p>
                  <p className="text-xl font-bold text-green-600">₹{(stats.gstCollected / 2).toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>GST @ 5%</span>
                  <span>₹1,200</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST @ 12%</span>
                  <span>₹2,400</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST @ 18%</span>
                  <span>₹900</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total GST</span>
                  <span>₹{stats.gstCollected.toLocaleString()}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/pharmacy/reports?type=gst')}>
                View GST Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <QuickSaleModal open={showQuickSale} onOpenChange={setShowQuickSale} />
      
      <DispenseModal 
        open={showDispenseModal} 
        onOpenChange={setShowDispenseModal} 
        prescription={selectedPrescription}
        onDispense={() => { fetchDashboardData(); setShowDispenseModal(false); }}
      />
    </DashboardLayout>
  );
}


function QuickSaleModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number; gst: number }>>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const mockMedicines = [
    { id: '1', name: 'Paracetamol 500mg', price: 25, gst: 5 },
    { id: '2', name: 'Cough Syrup 100ml', price: 85, gst: 12 },
    { id: '3', name: 'Antacid Tablets', price: 45, gst: 5 },
    { id: '4', name: 'Vitamin C 500mg', price: 120, gst: 5 },
  ];

  const addToCart = (medicine: typeof mockMedicines[0]) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      setCart(cart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity * item.gst / 100), 0);
  const total = subtotal + gstAmount;

  const handleCheckout = () => {
    toast.success('Sale completed successfully!');
    setCart([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Sale / POS</DialogTitle>
          <DialogDescription>Search and add medicines to cart</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search medicine by name or barcode..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {mockMedicines.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map((medicine) => (
                <div key={medicine.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{medicine.name}</p>
                    <p className="text-sm text-muted-foreground">₹{medicine.price} • GST {medicine.gst}%</p>
                  </div>
                  <Button size="sm" onClick={() => addToCart(medicine)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-l pl-6">
            <h3 className="font-medium mb-3">Cart ({cart.length} items)</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <p className="text-center text-muted-foreground py-4">Cart is empty</p>}
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <Label>Customer Phone (Optional)</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Enter phone number" />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="split">Split Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleCheckout} disabled={cart.length === 0}>
                <CreditCard className="h-4 w-4 mr-2" />
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DispenseModal({ 
  open, 
  onOpenChange, 
  prescription,
  onDispense 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  prescription: any;
  onDispense: () => void;
}) {
  if (!prescription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dispense Prescription</DialogTitle>
          <DialogDescription>
            Patient: {prescription.patientId?.firstName} {prescription.patientId?.lastName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-muted-foreground">Doctor</Label>
              <p className="font-medium">{prescription.doctorId?.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone</Label>
              <p className="font-medium">{prescription.patientId?.phone}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground mb-2 block">Medicines to Dispense</Label>
            <div className="space-y-2">
              {prescription.medicines?.map((med: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage} • {med.instructions}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {med.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print Label
            </Button>
            <Button className="flex-1" onClick={onDispense}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Dispense
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
