import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, Plus, Search, Truck, Building2, Phone, Mail,
  FileText, IndianRupee, Calendar, Eye, Edit, Trash2,
  RefreshCw, Download, Upload, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface Supplier {
  _id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  gstin?: string;
  outstandingAmount: number;
  totalPurchases: number;
  isActive: boolean;
}

interface PurchaseInvoice {
  _id: string;
  invoiceNumber: string;
  supplierId: Supplier;
  invoiceDate: string;
  dueDate: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    freeQuantity: number;
    mrp: number;
    purchasePrice: number;
    gstPercent: number;
  }>;
  subtotal: number;
  gstAmount: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
  createdAt: string;
}

export default function PharmacyPurchase() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '', contactPerson: '', phone: '', email: '', address: '', gstin: ''
  });
  const [invoiceForm, setInvoiceForm] = useState({
    supplierId: '', invoiceNumber: '', invoiceDate: '', dueDate: '', discount: '0'
  });
  const [invoiceItems, setInvoiceItems] = useState<Array<{
    medicineName: string; batchNumber: string; expiryDate: string;
    quantity: string; freeQuantity: string; mrp: string; purchasePrice: string; gstPercent: string;
  }>>([{ medicineName: '', batchNumber: '', expiryDate: '', quantity: '', freeQuantity: '0', mrp: '', purchasePrice: '', gstPercent: '5' }]);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setSuppliers([
        { _id: '1', name: 'Cipla Distributors', contactPerson: 'Rahul Mehta', phone: '9876543210', email: 'rahul@cipla.com', address: 'Mumbai, Maharashtra', gstin: '27AABCC1234D1ZV', outstandingAmount: 45000, totalPurchases: 250000, isActive: true },
        { _id: '2', name: 'Sun Pharma Wholesale', contactPerson: 'Amit Shah', phone: '9876543211', email: 'amit@sunpharma.com', address: 'Ahmedabad, Gujarat', gstin: '24AABCS5678E1ZW', outstandingAmount: 0, totalPurchases: 180000, isActive: true },
        { _id: '3', name: 'Ranbaxy Medical', contactPerson: 'Priya Gupta', phone: '9876543212', email: 'priya@ranbaxy.com', address: 'Delhi', gstin: '07AABCR9012F1ZX', outstandingAmount: 12500, totalPurchases: 95000, isActive: true },
      ]);
      setInvoices([
        { _id: '1', invoiceNumber: 'PI-2024-001', supplierId: { _id: '1', name: 'Cipla Distributors', contactPerson: 'Rahul Mehta', phone: '9876543210', address: 'Mumbai', outstandingAmount: 45000, totalPurchases: 250000, isActive: true }, invoiceDate: '2024-12-20', dueDate: '2025-01-20', items: [{ medicineId: '1', medicineName: 'Paracetamol 500mg', batchNumber: 'B001', expiryDate: '2026-12-31', quantity: 500, freeQuantity: 50, mrp: 25, purchasePrice: 15, gstPercent: 5 }], subtotal: 7500, gstAmount: 375, discount: 0, totalAmount: 7875, paidAmount: 0, status: 'pending', createdAt: '2024-12-20' },
        { _id: '2', invoiceNumber: 'PI-2024-002', supplierId: { _id: '2', name: 'Sun Pharma Wholesale', contactPerson: 'Amit Shah', phone: '9876543211', address: 'Ahmedabad', outstandingAmount: 0, totalPurchases: 180000, isActive: true }, invoiceDate: '2024-12-15', dueDate: '2025-01-15', items: [{ medicineId: '2', medicineName: 'Amoxicillin 500mg', batchNumber: 'B002', expiryDate: '2025-06-30', quantity: 200, freeQuantity: 20, mrp: 55, purchasePrice: 35, gstPercent: 12 }], subtotal: 7000, gstAmount: 840, discount: 200, totalAmount: 7640, paidAmount: 7640, status: 'paid', createdAt: '2024-12-15' },
        { _id: '3', invoiceNumber: 'PI-2024-003', supplierId: { _id: '1', name: 'Cipla Distributors', contactPerson: 'Rahul Mehta', phone: '9876543210', address: 'Mumbai', outstandingAmount: 45000, totalPurchases: 250000, isActive: true }, invoiceDate: '2024-12-10', dueDate: '2025-01-10', items: [{ medicineId: '3', medicineName: 'Cough Syrup', batchNumber: 'B003', expiryDate: '2025-03-15', quantity: 100, freeQuantity: 10, mrp: 85, purchasePrice: 55, gstPercent: 12 }], subtotal: 5500, gstAmount: 660, discount: 100, totalAmount: 6060, paidAmount: 3000, status: 'partial', createdAt: '2024-12-10' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('Supplier added successfully');
      setShowAddSupplier(false);
      setSupplierForm({ name: '', contactPerson: '', phone: '', email: '', address: '', gstin: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add supplier');
    }
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.success('Purchase invoice added successfully');
      setShowAddInvoice(false);
      setInvoiceForm({ supplierId: '', invoiceNumber: '', invoiceDate: '', dueDate: '', discount: '0' });
      setInvoiceItems([{ medicineName: '', batchNumber: '', expiryDate: '', quantity: '', freeQuantity: '0', mrp: '', purchasePrice: '', gstPercent: '5' }]);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add invoice');
    }
  };

  const handlePayment = async () => {
    if (!selectedInvoice) return;
    try {
      toast.success('Payment recorded successfully');
      setShowPayment(false);
      setPaymentAmount('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    }
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { medicineName: '', batchNumber: '', expiryDate: '', quantity: '', freeQuantity: '0', mrp: '', purchasePrice: '', gstPercent: '5' }]);
  };

  const updateInvoiceItem = (index: number, field: string, value: string) => {
    const updated = [...invoiceItems];
    updated[index] = { ...updated[index], [field]: value };
    setInvoiceItems(updated);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const calculateInvoiceTotal = () => {
    let subtotal = 0;
    let gstAmount = 0;
    invoiceItems.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.purchasePrice) || 0;
      const gst = parseFloat(item.gstPercent) || 0;
      const itemTotal = qty * price;
      subtotal += itemTotal;
      gstAmount += itemTotal * gst / 100;
    });
    const discount = parseFloat(invoiceForm.discount) || 0;
    return { subtotal, gstAmount, discount, total: subtotal + gstAmount - discount };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'partial': return <Badge className="bg-orange-100 text-orange-800">Partial</Badge>;
      case 'paid': return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const stats = {
    totalSuppliers: suppliers.length,
    totalOutstanding: suppliers.reduce((sum, s) => sum + s.outstandingAmount, 0),
    pendingInvoices: invoices.filter(i => i.status !== 'paid').length,
    thisMonthPurchases: invoices.reduce((sum, i) => sum + i.totalAmount, 0)
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchase & Suppliers</h1>
            <p className="text-muted-foreground">Manage suppliers and purchase invoices</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowAddSupplier(true)}>
              <Building2 className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
            <Button onClick={() => setShowAddInvoice(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Purchase
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Building2 className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Suppliers</p>
                  <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg"><IndianRupee className="h-5 w-5 text-red-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold">₹{stats.totalOutstanding.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="h-5 w-5 text-yellow-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invoices</p>
                  <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><Package className="h-5 w-5 text-green-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">₹{stats.thisMonthPurchases.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="invoices">Purchase Invoices</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice number or supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Purchase Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.supplierId.name}</TableCell>
                        <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>₹{invoice.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>₹{invoice.paidAmount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {invoice.status !== 'paid' && (
                              <Button size="sm" variant="outline" onClick={() => { setSelectedInvoice(invoice); setShowPayment(true); }}>
                                Pay
                              </Button>
                            )}
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>Total Purchases</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-xs text-muted-foreground">{supplier.address}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{supplier.contactPerson}</p>
                            <p className="text-muted-foreground">{supplier.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{supplier.gstin || 'N/A'}</TableCell>
                        <TableCell>₹{supplier.totalPurchases.toLocaleString()}</TableCell>
                        <TableCell>
                          {supplier.outstandingAmount > 0 ? (
                            <span className="text-red-600 font-medium">₹{supplier.outstandingAmount.toLocaleString()}</span>
                          ) : (
                            <span className="text-green-600">Clear</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {supplier.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>Enter supplier details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSupplier} className="space-y-4">
            <div><Label>Company Name *</Label><Input value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} required /></div>
            <div><Label>Contact Person *</Label><Input value={supplierForm.contactPerson} onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone *</Label><Input value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} required /></div>
              <div><Label>Email</Label><Input type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} /></div>
            </div>
            <div><Label>Address *</Label><Textarea value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} required /></div>
            <div><Label>GSTIN</Label><Input value={supplierForm.gstin} onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })} placeholder="e.g., 27AABCC1234D1ZV" /></div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddSupplier(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Add Supplier</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddInvoice} onOpenChange={setShowAddInvoice}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Purchase Invoice</DialogTitle>
            <DialogDescription>Enter purchase details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddInvoice} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <Label>Supplier *</Label>
                <Select value={invoiceForm.supplierId} onValueChange={(v) => setInvoiceForm({ ...invoiceForm, supplierId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Invoice # *</Label><Input value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} required /></div>
              <div><Label>Invoice Date *</Label><Input type="date" value={invoiceForm.invoiceDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })} required /></div>
              <div><Label>Due Date *</Label><Input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} required /></div>
              <div><Label>Discount (₹)</Label><Input type="number" value={invoiceForm.discount} onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })} /></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}><Plus className="h-4 w-4 mr-1" />Add Item</Button>
              </div>
              <div className="space-y-2">
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-9 gap-2 items-end p-2 border rounded">
                    <div className="col-span-2"><Label className="text-xs">Medicine</Label><Input value={item.medicineName} onChange={(e) => updateInvoiceItem(idx, 'medicineName', e.target.value)} placeholder="Name" /></div>
                    <div><Label className="text-xs">Batch</Label><Input value={item.batchNumber} onChange={(e) => updateInvoiceItem(idx, 'batchNumber', e.target.value)} /></div>
                    <div><Label className="text-xs">Expiry</Label><Input type="date" value={item.expiryDate} onChange={(e) => updateInvoiceItem(idx, 'expiryDate', e.target.value)} /></div>
                    <div><Label className="text-xs">Qty</Label><Input type="number" value={item.quantity} onChange={(e) => updateInvoiceItem(idx, 'quantity', e.target.value)} /></div>
                    <div><Label className="text-xs">Free</Label><Input type="number" value={item.freeQuantity} onChange={(e) => updateInvoiceItem(idx, 'freeQuantity', e.target.value)} /></div>
                    <div><Label className="text-xs">MRP</Label><Input type="number" value={item.mrp} onChange={(e) => updateInvoiceItem(idx, 'mrp', e.target.value)} /></div>
                    <div><Label className="text-xs">Price</Label><Input type="number" value={item.purchasePrice} onChange={(e) => updateInvoiceItem(idx, 'purchasePrice', e.target.value)} /></div>
                    <div className="flex gap-1">
                      <Select value={item.gstPercent} onValueChange={(v) => updateInvoiceItem(idx, 'gstPercent', v)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeInvoiceItem(idx)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{calculateInvoiceTotal().subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>GST</span><span>₹{calculateInvoiceTotal().gstAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Discount</span><span>-₹{calculateInvoiceTotal().discount.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>₹{calculateInvoiceTotal().total.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddInvoice(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Save Invoice</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Invoice: {selectedInvoice?.invoiceNumber} | Due: ₹{((selectedInvoice?.totalAmount || 0) - (selectedInvoice?.paidAmount || 0)).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Amount *</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={`Max: ₹${((selectedInvoice?.totalAmount || 0) - (selectedInvoice?.paidAmount || 0)).toLocaleString()}`}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowPayment(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handlePayment}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
