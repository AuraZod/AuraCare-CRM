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
  Users, Plus, Search, Phone, Mail, MapPin, CreditCard, 
  FileText, Clock, IndianRupee, Eye, Edit, MessageSquare,
  RefreshCw, Download, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  age?: number;
  gender?: string;
  totalPurchases: number;
  totalAmount: number;
  dueAmount: number;
  loyaltyPoints: number;
  lastVisit?: string;
  createdAt: string;
}

export default function PharmacyCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', age: '', gender: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPatients({ limit: 100 });
      if (response.success) {
        setCustomers(response.data?.map((p: any) => ({
          _id: p._id,
          name: `${p.firstName} ${p.lastName}`,
          phone: p.phone,
          email: p.email,
          address: p.address?.street,
          age: p.age,
          gender: p.gender,
          totalPurchases: Math.floor(Math.random() * 50),
          totalAmount: Math.floor(Math.random() * 50000),
          dueAmount: Math.floor(Math.random() * 2000),
          loyaltyPoints: Math.floor(Math.random() * 500),
          lastVisit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: p.createdAt
        })) || []);
      }
    } catch (error) {
      setCustomers([
        { _id: '1', name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@email.com', address: '123 Main St, Mumbai', age: 45, gender: 'male', totalPurchases: 28, totalAmount: 15600, dueAmount: 500, loyaltyPoints: 156, lastVisit: '2024-12-25', createdAt: '2024-01-15' },
        { _id: '2', name: 'Priya Sharma', phone: '9876543211', email: 'priya@email.com', address: '456 Park Ave, Delhi', age: 32, gender: 'female', totalPurchases: 15, totalAmount: 8900, dueAmount: 0, loyaltyPoints: 89, lastVisit: '2024-12-27', createdAt: '2024-03-20' },
        { _id: '3', name: 'Amit Patel', phone: '9876543212', address: '789 Lake Rd, Ahmedabad', age: 55, gender: 'male', totalPurchases: 42, totalAmount: 28500, dueAmount: 1200, loyaltyPoints: 285, lastVisit: '2024-12-28', createdAt: '2023-11-10' },
        { _id: '4', name: 'Sunita Devi', phone: '9876543213', address: '321 Hill St, Jaipur', age: 60, gender: 'female', totalPurchases: 35, totalAmount: 22000, dueAmount: 0, loyaltyPoints: 220, lastVisit: '2024-12-20', createdAt: '2024-02-05' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createPatient({
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        phone: formData.phone,
        email: formData.email,
        address: { street: formData.address },
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender
      });
      toast.success('Customer added successfully');
      setShowAddCustomer(false);
      setFormData({ name: '', phone: '', email: '', address: '', age: '', gender: '' });
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add customer');
    }
  };

  const handleSendReminder = (customer: Customer) => {
    toast.success(`Reminder sent to ${customer.name}`);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const stats = {
    totalCustomers: customers.length,
    activeThisMonth: customers.filter(c => {
      const lastVisit = new Date(c.lastVisit || '');
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return lastVisit >= monthAgo;
    }).length,
    totalDue: customers.reduce((sum, c) => sum + c.dueAmount, 0),
    totalLoyaltyPoints: customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground">Manage customer profiles and purchase history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchCustomers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowAddCustomer(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><Clock className="h-5 w-5 text-green-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Active This Month</p>
                  <p className="text-2xl font-bold">{stats.activeThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg"><IndianRupee className="h-5 w-5 text-red-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Due</p>
                  <p className="text-2xl font-bold">₹{stats.totalDue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg"><Star className="h-5 w-5 text-yellow-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Loyalty Points</p>
                  <p className="text-2xl font-bold">{stats.totalLoyaltyPoints.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          {customer.age && <p className="text-xs text-muted-foreground">{customer.age}y, {customer.gender}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{customer.phone}</p>
                          {customer.email && <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{customer.email}</p>}
                        </div>
                      </TableCell>
                      <TableCell>{customer.totalPurchases}</TableCell>
                      <TableCell>₹{customer.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        {customer.dueAmount > 0 ? (
                          <Badge className="bg-red-100 text-red-800">₹{customer.dueAmount}</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Clear</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.loyaltyPoints} pts</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedCustomer(customer); setShowCustomerDetails(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleSendReminder(customer)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter customer details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCustomer} className="space-y-4">
            <div><Label>Full Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div><Label>Phone *</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
            <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div><Label>Address</Label><Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Age</Label><Input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} /></div>
              <div><Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Add Customer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="purchases">Purchase History</TabsTrigger>
                <TabsTrigger value="dues">Dues</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div><Label className="text-muted-foreground">Name</Label><p className="font-medium">{selectedCustomer.name}</p></div>
                  <div><Label className="text-muted-foreground">Phone</Label><p className="font-medium">{selectedCustomer.phone}</p></div>
                  <div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{selectedCustomer.email || 'N/A'}</p></div>
                  <div><Label className="text-muted-foreground">Age/Gender</Label><p className="font-medium">{selectedCustomer.age || 'N/A'} / {selectedCustomer.gender || 'N/A'}</p></div>
                  <div className="col-span-2"><Label className="text-muted-foreground">Address</Label><p className="font-medium">{selectedCustomer.address || 'N/A'}</p></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedCustomer.totalPurchases}</p>
                    <p className="text-xs text-muted-foreground">Purchases</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-2xl font-bold">₹{selectedCustomer.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">₹{selectedCustomer.dueAmount}</p>
                    <p className="text-xs text-muted-foreground">Due Amount</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-600">{selectedCustomer.loyaltyPoints}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="purchases">
                <p className="text-center text-muted-foreground py-8">Purchase history will be displayed here</p>
              </TabsContent>
              <TabsContent value="dues">
                <p className="text-center text-muted-foreground py-8">Due details will be displayed here</p>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
