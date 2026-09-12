import { useState, useEffect, useRef } from 'react';
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
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Wallet, 
  IndianRupee, Printer, User, Phone, Barcode, RefreshCw, Receipt,
  FileText, ArrowLeft, Percent, Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface CartItem {
  id: string;
  name: string;
  batchNumber: string;
  quantity: number;
  mrp: number;
  discount: number;
  gstPercent: number;
  hsnCode?: string;
}

interface Customer {
  id?: string;
  name: string;
  phone: string;
  address?: string;
}

export default function PharmacyBilling() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'retail' | 'gst'>('retail');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const mockMedicines = [
    { id: '1', name: 'Paracetamol 500mg', batchNumber: 'B001', mrp: 25, gstPercent: 5, stock: 250, hsnCode: '30049099' },
    { id: '2', name: 'Amoxicillin 500mg', batchNumber: 'B002', mrp: 55, gstPercent: 12, stock: 45, hsnCode: '30041000' },
    { id: '3', name: 'Cough Syrup 100ml', batchNumber: 'B003', mrp: 85, gstPercent: 12, stock: 12, hsnCode: '30049099' },
    { id: '4', name: 'Antacid Tablets', batchNumber: 'B004', mrp: 45, gstPercent: 5, stock: 100, hsnCode: '30049099' },
    { id: '5', name: 'Vitamin C 500mg', batchNumber: 'B005', mrp: 120, gstPercent: 5, stock: 80, hsnCode: '30049099' },
    { id: '6', name: 'Pain Balm 50g', batchNumber: 'B006', mrp: 65, gstPercent: 18, stock: 35, hsnCode: '30049099' },
    { id: '7', name: 'Insulin Pen', batchNumber: 'B007', mrp: 650, gstPercent: 5, stock: 8, hsnCode: '30043100' },
    { id: '8', name: 'BP Monitor', batchNumber: 'B008', mrp: 1500, gstPercent: 18, stock: 5, hsnCode: '90189099' },
  ];

  const filteredMedicines = mockMedicines.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (medicine: typeof mockMedicines[0]) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      if (existing.quantity >= medicine.stock) {
        toast.error('Insufficient stock');
        return;
      }
      setCart(cart.map(item => 
        item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { 
        id: medicine.id, 
        name: medicine.name, 
        batchNumber: medicine.batchNumber,
        quantity: 1, 
        mrp: medicine.mrp, 
        discount: 0,
        gstPercent: medicine.gstPercent,
        hsnCode: medicine.hsnCode
      }]);
    }
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const updateItemDiscount = (id: string, discount: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, discount } : item));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  const itemDiscounts = cart.reduce((sum, item) => sum + (item.mrp * item.quantity * item.discount / 100), 0);
  const afterItemDiscount = subtotal - itemDiscounts;
  const billDiscount = afterItemDiscount * discount / 100;
  const taxableAmount = afterItemDiscount - billDiscount;
  
  const gstBreakdown = cart.reduce((acc, item) => {
    const itemTotal = item.mrp * item.quantity * (1 - item.discount / 100);
    const gst = itemTotal * item.gstPercent / 100;
    const rate = item.gstPercent;
    if (!acc[rate]) acc[rate] = { cgst: 0, sgst: 0, total: 0 };
    acc[rate].cgst += gst / 2;
    acc[rate].sgst += gst / 2;
    acc[rate].total += gst;
    return acc;
  }, {} as Record<number, { cgst: number; sgst: number; total: number }>);

  const totalGst = Object.values(gstBreakdown).reduce((sum, g) => sum + g.total, 0);
  const grandTotal = taxableAmount + totalGst;
  const changeAmount = parseFloat(paidAmount || '0') - grandTotal;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setShowPayment(true);
    setPaidAmount(grandTotal.toFixed(2));
  };

  const handlePayment = () => {
    if (parseFloat(paidAmount) < grandTotal && paymentMethod === 'cash') {
      toast.error('Insufficient payment amount');
      return;
    }
    toast.success('Payment successful! Printing invoice...');
    setShowPayment(false);
    setCart([]);
    setCustomer({ name: '', phone: '' });
    setDiscount(0);
    setPaidAmount('');
  };

  const handlePrint = () => {
    toast.success('Printing invoice...');
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex gap-4">
        <div className="flex-1 flex flex-col">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search medicine or scan barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-lg"
                    autoFocus
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Barcode className="h-5 w-5" />
                </Button>
              </div>
              
              {searchQuery && (
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                  {filteredMedicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => addToCart(medicine)}
                    >
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Batch: {medicine.batchNumber} • Stock: {medicine.stock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{medicine.mrp}</p>
                        <p className="text-xs text-muted-foreground">GST {medicine.gstPercent}%</p>
                      </div>
                    </div>
                  ))}
                  {filteredMedicines.length === 0 && (
                    <p className="p-4 text-center text-muted-foreground">No medicines found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length} items)
                </CardTitle>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Search and add medicines</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-20">MRP</TableHead>
                      <TableHead className="w-20">Disc %</TableHead>
                      <TableHead className="w-24 text-right">Amount</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Batch: {item.batchNumber}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.mrp}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-16 h-7 text-center"
                            value={item.discount}
                            onChange={(e) => updateItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                            min="0"
                            max="100"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{(item.mrp * item.quantity * (1 - item.discount / 100)).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-96 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Phone number"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                />
                <Button variant="outline" size="icon" onClick={() => setShowCustomerSearch(true)}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Customer name"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Tabs value={invoiceType} onValueChange={(v) => setInvoiceType(v as 'retail' | 'gst')}>
                <TabsList className="w-full">
                  <TabsTrigger value="retail" className="flex-1">Retail Bill</TabsTrigger>
                  <TabsTrigger value="gst" className="flex-1">GST Invoice</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {itemDiscounts > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Item Discounts</span>
                  <span>-₹{itemDiscounts.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  Bill Discount
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-16 h-7 text-center"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                  <span>%</span>
                </div>
              </div>
              {billDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span></span>
                  <span>-₹{billDiscount.toFixed(2)}</span>
                </div>
              )}
              
              {invoiceType === 'gst' && Object.entries(gstBreakdown).length > 0 && (
                <div className="border-t pt-2 mt-2 space-y-1">
                  {Object.entries(gstBreakdown).map(([rate, values]) => (
                    <div key={rate} className="text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>CGST @ {parseFloat(rate)/2}%</span>
                        <span>₹{values.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST @ {parseFloat(rate)/2}%</span>
                        <span>₹{values.sgst.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between text-sm border-t pt-2">
                <span>Total GST</span>
                <span>₹{totalGst.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-xl font-bold border-t pt-3 mt-2">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setCart([])}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCheckout} disabled={cart.length === 0}>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ₹{grandTotal.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>Total: ₹{grandTotal.toFixed(2)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            
            {paymentMethod === 'cash' && (
              <>
                <div>
                  <Label>Amount Received</Label>
                  <Input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="text-lg"
                  />
                </div>
                {changeAmount > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Change to Return</p>
                    <p className="text-2xl font-bold text-green-600">₹{changeAmount.toFixed(2)}</p>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowPayment(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handlePayment}>
                <Printer className="h-4 w-4 mr-2" />
                Complete & Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
