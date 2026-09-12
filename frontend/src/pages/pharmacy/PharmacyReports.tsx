import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart3, TrendingUp, TrendingDown, IndianRupee, Package, 
  Calendar, Download, RefreshCw, FileText, AlertTriangle,
  Clock, Pill, Users, Receipt
} from 'lucide-react';
import { toast } from 'sonner';

export default function PharmacyReports() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'sales');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);

  const salesData = {
    today: 28500, yesterday: 25000, thisWeek: 185000, thisMonth: 485000,
    growth: 12.5, topProducts: [
      { name: 'Paracetamol 500mg', quantity: 450, revenue: 11250 },
      { name: 'Cough Syrup 100ml', quantity: 180, revenue: 15300 },
      { name: 'Antacid Tablets', quantity: 320, revenue: 14400 },
      { name: 'Vitamin C 500mg', quantity: 150, revenue: 18000 },
      { name: 'Pain Balm 50g', quantity: 95, revenue: 6175 },
    ]
  };

  const stockData = {
    totalItems: 245, lowStock: 18, outOfStock: 5, expiringIn30Days: 12,
    stockValue: 485000, items: [
      { name: 'Paracetamol 500mg', stock: 250, reorder: 100, value: 6250 },
      { name: 'Amoxicillin 500mg', stock: 45, reorder: 50, value: 2475 },
      { name: 'Cough Syrup 100ml', stock: 12, reorder: 30, value: 1020 },
      { name: 'Insulin Pen', stock: 8, reorder: 20, value: 5200 },
      { name: 'Surgical Bandage', stock: 15, reorder: 50, value: 1800 },
    ]
  };

  const expiryData = [
    { name: 'Antibiotic Tablets', batch: 'AB123', expiry: '2025-01-15', quantity: 50, daysLeft: 18, value: 2750 },
    { name: 'Pain Relief Gel', batch: 'PR456', expiry: '2025-01-20', quantity: 25, daysLeft: 23, value: 1625 },
    { name: 'Vitamin D3', batch: 'VD789', expiry: '2025-02-10', quantity: 100, daysLeft: 44, value: 5000 },
    { name: 'Cough Syrup', batch: 'CS012', expiry: '2025-02-28', quantity: 30, daysLeft: 62, value: 2550 },
    { name: 'Eye Drops', batch: 'ED345', expiry: '2025-03-15', quantity: 40, daysLeft: 77, value: 2400 },
  ];

  const gstData = {
    totalGst: 45000, cgst: 22500, sgst: 22500,
    breakdown: [
      { rate: 5, taxableValue: 250000, cgst: 6250, sgst: 6250, total: 12500 },
      { rate: 12, taxableValue: 150000, cgst: 9000, sgst: 9000, total: 18000 },
      { rate: 18, taxableValue: 80000, cgst: 7200, sgst: 7200, total: 14400 },
    ],
    monthlyTrend: [
      { month: 'Oct', gst: 38000 },
      { month: 'Nov', gst: 42000 },
      { month: 'Dec', gst: 45000 },
    ]
  };

  const profitData = {
    totalRevenue: 485000, totalCost: 340000, grossProfit: 145000, margin: 29.9,
    byCategory: [
      { category: 'Medicines', revenue: 350000, cost: 245000, profit: 105000, margin: 30 },
      { category: 'Surgical', revenue: 85000, cost: 60000, profit: 25000, margin: 29.4 },
      { category: 'Consumables', revenue: 50000, cost: 35000, profit: 15000, margin: 30 },
    ]
  };

  const customerData = [
    { name: 'Rajesh Kumar', purchases: 28, amount: 15600, lastVisit: '2024-12-25' },
    { name: 'Priya Sharma', purchases: 15, amount: 8900, lastVisit: '2024-12-27' },
    { name: 'Amit Patel', purchases: 42, amount: 28500, lastVisit: '2024-12-28' },
    { name: 'Sunita Devi', purchases: 35, amount: 22000, lastVisit: '2024-12-20' },
    { name: 'Mohan Lal', purchases: 22, amount: 12500, lastVisit: '2024-12-26' },
  ];

  const handleExport = (type: string) => {
    toast.success(`Exporting ${type} report...`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive pharmacy reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport(activeTab)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label>From Date</Label>
                <Input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
              </div>
              <div>
                <Label>To Date</Label>
                <Input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
              </div>
              <Button variant="outline">Apply Filter</Button>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setDateRange({ from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] })}>Today</Button>
                <Button variant="outline" size="sm">This Week</Button>
                <Button variant="outline" size="sm">This Month</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="sales">Sales Report</TabsTrigger>
            <TabsTrigger value="stock">Stock Report</TabsTrigger>
            <TabsTrigger value="expiry">Expiry Report</TabsTrigger>
            <TabsTrigger value="gst">GST Report</TabsTrigger>
            <TabsTrigger value="profit">Profit Report</TabsTrigger>
            <TabsTrigger value="customer">Customer Report</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg"><IndianRupee className="h-5 w-5 text-green-600" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Today</p>
                      <p className="text-2xl font-bold">₹{salesData.today.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg"><Calendar className="h-5 w-5 text-blue-600" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">This Week</p>
                      <p className="text-2xl font-bold">₹{salesData.thisWeek.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg"><BarChart3 className="h-5 w-5 text-purple-600" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold">₹{salesData.thisMonth.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Growth</p>
                      <p className="text-2xl font-bold text-green-600">+{salesData.growth}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.topProducts.map((product, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>₹{product.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Items</p><p className="text-2xl font-bold">{stockData.totalItems}</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Low Stock</p><p className="text-2xl font-bold text-yellow-600">{stockData.lowStock}</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Out of Stock</p><p className="text-2xl font-bold text-red-600">{stockData.outOfStock}</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Expiring Soon</p><p className="text-2xl font-bold text-orange-600">{stockData.expiringIn30Days}</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Stock Value</p><p className="text-2xl font-bold">₹{stockData.stockValue.toLocaleString()}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Stock Status</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockData.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{item.reorder}</TableCell>
                        <TableCell>
                          <Badge className={item.stock <= item.reorder ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {item.stock <= item.reorder ? 'Low' : 'OK'}
                          </Badge>
                        </TableCell>
                        <TableCell>₹{item.value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expiry" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Expiry Alerts
                </CardTitle>
                <CardDescription>Products expiring within 90 days</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Value at Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiryData.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-mono">{item.batch}</TableCell>
                        <TableCell>{item.expiry}</TableCell>
                        <TableCell>
                          <Badge className={item.daysLeft <= 30 ? 'bg-red-100 text-red-800' : item.daysLeft <= 60 ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}>
                            {item.daysLeft} days
                          </Badge>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-red-600">₹{item.value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gst" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Total GST Collected</p>
                  <p className="text-3xl font-bold text-blue-600">₹{gstData.totalGst.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">CGST</p>
                  <p className="text-3xl font-bold text-green-600">₹{gstData.cgst.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">SGST</p>
                  <p className="text-3xl font-bold text-purple-600">₹{gstData.sgst.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle>GST Breakdown by Rate</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GST Rate</TableHead>
                      <TableHead>Taxable Value</TableHead>
                      <TableHead>CGST</TableHead>
                      <TableHead>SGST</TableHead>
                      <TableHead>Total Tax</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gstData.breakdown.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.rate}%</TableCell>
                        <TableCell>₹{row.taxableValue.toLocaleString()}</TableCell>
                        <TableCell>₹{row.cgst.toLocaleString()}</TableCell>
                        <TableCell>₹{row.sgst.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">₹{row.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell>₹{gstData.breakdown.reduce((s, r) => s + r.taxableValue, 0).toLocaleString()}</TableCell>
                      <TableCell>₹{gstData.cgst.toLocaleString()}</TableCell>
                      <TableCell>₹{gstData.sgst.toLocaleString()}</TableCell>
                      <TableCell>₹{gstData.totalGst.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profit" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">₹{profitData.totalRevenue.toLocaleString()}</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Cost</p><p className="text-2xl font-bold">₹{profitData.totalCost.toLocaleString()}</p></CardContent></Card>
              <Card className="bg-green-50"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Gross Profit</p><p className="text-2xl font-bold text-green-600">₹{profitData.grossProfit.toLocaleString()}</p></CardContent></Card>
              <Card className="bg-blue-50"><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Profit Margin</p><p className="text-2xl font-bold text-blue-600">{profitData.margin}%</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Profit by Category</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profitData.byCategory.map((cat, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{cat.category}</TableCell>
                        <TableCell>₹{cat.revenue.toLocaleString()}</TableCell>
                        <TableCell>₹{cat.cost.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">₹{cat.profit.toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{cat.margin}%</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customer" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Top Customers</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total Purchases</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Last Visit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerData.map((customer, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.purchases}</TableCell>
                        <TableCell>₹{customer.amount.toLocaleString()}</TableCell>
                        <TableCell>{customer.lastVisit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
