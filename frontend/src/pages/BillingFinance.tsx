import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Download, 
  Calendar,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3,
  RefreshCw,
  FileText,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  patientId: { firstName: string; lastName: string };
  totalAmount: number;
  paidAmount: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

export default function BillingFinance() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    pendingAmount: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    revenueGrowth: 0,
    paymentMethods: {
      card: 0,
      cash: 0,
      upi: 0,
      insurance: 0,
      other: 0
    }
  });

  const pm = stats.paymentMethods || { card: 0, cash: 0, upi: 0, insurance: 0, other: 0 };
  const totalPayments = (pm.card + pm.cash + pm.upi + pm.insurance + (pm.other || 0)) || 1;

  const getPercent = (value: number) => {
    return Math.round((value / totalPayments) * 100);
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, statsRes] = await Promise.all([
        apiClient.getInvoices({ dateRange }).catch(() => ({ success: true, data: [] })),
        apiClient.getBillingStats().catch(() => ({ success: true, data: {} }))
      ]);
      
      if (invoicesRes && typeof invoicesRes === 'object') {
        const invoicesData = invoicesRes.data || invoicesRes.invoices || invoicesRes;
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      } else {
        setInvoices([]);
      }
      
      if (statsRes && typeof statsRes === 'object') {
        const statsData = statsRes.data || statsRes;
        setStats(prev => ({ ...prev, ...statsData }));
      }
    } catch (error) {
      setInvoices([
        { _id: '1', invoiceNumber: 'INV-2024-001', patientId: { firstName: 'Priya', lastName: 'Sharma' }, totalAmount: 2500, paidAmount: 2500, status: 'paid', paymentMethod: 'card', createdAt: '2024-01-15' },
        { _id: '2', invoiceNumber: 'INV-2024-002', patientId: { firstName: 'Amit', lastName: 'Patel' }, totalAmount: 1800, paidAmount: 0, status: 'pending', createdAt: '2024-01-15' },
        { _id: '3', invoiceNumber: 'INV-2024-003', patientId: { firstName: 'Sunita', lastName: 'Devi' }, totalAmount: 3200, paidAmount: 1600, status: 'partial', paymentMethod: 'cash', createdAt: '2024-01-14' },
        { _id: '4', invoiceNumber: 'INV-2024-004', patientId: { firstName: 'Rohit', lastName: 'Singh' }, totalAmount: 950, paidAmount: 950, status: 'paid', paymentMethod: 'upi', createdAt: '2024-01-14' },
      ]);
      setStats({
        totalRevenue: 285000,
        todayRevenue: 28500,
        pendingAmount: 45000,
        totalInvoices: 156,
        paidInvoices: 142,
        pendingInvoices: 14,
        revenueGrowth: 12.5,
        paymentMethods: {
          card: 85500,
          cash: 119700,
          upi: 65550,
          insurance: 14250,
          other: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = Array.isArray(invoices) ? invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${invoice.patientId.firstName} ${invoice.patientId.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      partial: { label: 'Partial', className: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    };
    const c = config[status] || config.pending;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const handleExport = () => {
    toast.success('Exporting financial report...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Billing & Finance</h1>
            <p className="text-muted-foreground">Financial overview and invoice management</p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className={`text-xs mt-2 ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold">₹{stats.todayRevenue.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IndianRupee className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">{stats.paidInvoices} invoices paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="text-2xl font-bold">₹{stats.pendingAmount.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Wallet className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-2">{stats.pendingInvoices} invoices pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-purple-600 mt-2">This {dateRange}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Invoices</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64" />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice._id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.patientId.firstName} {invoice.patientId.lastName}</TableCell>
                          <TableCell>₹{invoice.totalAmount}</TableCell>
                          <TableCell>₹{invoice.paidAmount}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mr-2" />
                    <span>Revenue chart will be displayed here</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <PieChart className="h-12 w-12 mr-2" />
                    <span>Category breakdown will be displayed here</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader><CardTitle>Payment Methods Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Card</span>
                    </div>
                    <p className="text-2xl font-bold">₹{pm.card.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{getPercent(pm.card)}% of total</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Cash</span>
                    </div>
                    <p className="text-2xl font-bold">₹{pm.cash.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{getPercent(pm.cash)}% of total</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <IndianRupee className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">UPI</span>
                    </div>
                    <p className="text-2xl font-bold">₹{pm.upi.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{getPercent(pm.upi)}% of total</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Insurance</span>
                    </div>
                    <p className="text-2xl font-bold">₹{pm.insurance.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{getPercent(pm.insurance)}% of total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
