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
import { Plus, Search, Edit, Trash2, IndianRupee, TestTube, Stethoscope, Pill, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  duration?: number;
  description?: string;
  isActive: boolean;
}

export default function ServicesPricing() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddService, setShowAddService] = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '', category: '', price: '', duration: '', description: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Service[] }>('/services');
      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      setServices([
        { _id: '1', name: 'General Consultation', category: 'consultation', price: 500, duration: 30, isActive: true },
        { _id: '2', name: 'Specialist Consultation', category: 'consultation', price: 1000, duration: 45, isActive: true },
        { _id: '3', name: 'Complete Blood Count', category: 'lab_test', price: 350, isActive: true },
        { _id: '4', name: 'Lipid Profile', category: 'lab_test', price: 800, isActive: true },
        { _id: '5', name: 'X-Ray Chest', category: 'imaging', price: 600, isActive: true },
        { _id: '6', name: 'ECG', category: 'diagnostic', price: 400, isActive: true },
        { _id: '7', name: 'Ultrasound Abdomen', category: 'imaging', price: 1200, isActive: true },
        { _id: '8', name: 'Thyroid Profile', category: 'lab_test', price: 900, isActive: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/services', {
        ...formData,
        price: parseFloat(formData.price),
        duration: formData.duration ? parseInt(formData.duration) : undefined
      });
      toast.success('Service added successfully');
      setShowAddService(false);
      setFormData({ name: '', category: '', price: '', duration: '', description: '' });
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add service');
    }
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    try {
      await apiClient.put(`/services/${selectedService._id}`, {
        ...formData,
        price: parseFloat(formData.price),
        duration: formData.duration ? parseInt(formData.duration) : undefined
      });
      toast.success('Service updated successfully');
      setShowEditService(false);
      setSelectedService(null);
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiClient.delete(`/services/${serviceId}`);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete service');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      consultation: { label: 'Consultation', className: 'bg-blue-100 text-blue-800', icon: Stethoscope },
      lab_test: { label: 'Lab Test', className: 'bg-purple-100 text-purple-800', icon: TestTube },
      imaging: { label: 'Imaging', className: 'bg-green-100 text-green-800', icon: TestTube },
      diagnostic: { label: 'Diagnostic', className: 'bg-orange-100 text-orange-800', icon: TestTube },
      pharmacy: { label: 'Pharmacy', className: 'bg-red-100 text-red-800', icon: Pill },
    };
    const c = config[category] || { label: category, className: 'bg-gray-100', icon: TestTube };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const stats = {
    totalServices: services.length,
    consultations: services.filter(s => s.category === 'consultation').length,
    labTests: services.filter(s => s.category === 'lab_test').length,
    avgPrice: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Services & Pricing</h1>
            <p className="text-muted-foreground">Manage hospital services and their pricing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchServices}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddService(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Stethoscope className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Total Services</p><p className="text-2xl font-bold">{stats.totalServices}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Stethoscope className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Consultations</p><p className="text-2xl font-bold">{stats.consultations}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><TestTube className="h-5 w-5 text-purple-600" /></div><div><p className="text-sm text-muted-foreground">Lab Tests</p><p className="text-2xl font-bold">{stats.labTests}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><IndianRupee className="h-5 w-5 text-orange-600" /></div><div><p className="text-sm text-muted-foreground">Avg. Price</p><p className="text-2xl font-bold">₹{stats.avgPrice}</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Filter by category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="lab_test">Lab Test</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Services ({filteredServices.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{getCategoryBadge(service.category)}</TableCell>
                      <TableCell className="font-medium">₹{service.price}</TableCell>
                      <TableCell>{service.duration ? `${service.duration} min` : '-'}</TableCell>
                      <TableCell>
                        <Badge className={service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setSelectedService(service);
                            setFormData({
                              name: service.name,
                              category: service.category,
                              price: service.price.toString(),
                              duration: service.duration?.toString() || '',
                              description: service.description || ''
                            });
                            setShowEditService(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteService(service._id)}>
                            <Trash2 className="h-4 w-4" />
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

      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Service</DialogTitle><DialogDescription>Create a new service with pricing</DialogDescription></DialogHeader>
          <form onSubmit={handleAddService} className="space-y-4">
            <div><Label>Service Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div><Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="lab_test">Lab Test</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Price (₹)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></div>
            <div><Label>Duration (minutes)</Label><Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddService(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Add Service</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditService} onOpenChange={setShowEditService}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Service</DialogTitle><DialogDescription>Update service details</DialogDescription></DialogHeader>
          <form onSubmit={handleEditService} className="space-y-4">
            <div><Label>Service Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div><Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="lab_test">Lab Test</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Price (₹)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></div>
            <div><Label>Duration (minutes)</Label><Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditService(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Update Service</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
