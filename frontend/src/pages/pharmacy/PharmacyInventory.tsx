import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  Edit, 
  Trash2,
  Barcode,
  Download,
  Upload,
  RefreshCw,
  IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface Medicine {
  _id: string;
  itemCode: string;
  name: string;
  genericName?: string;
  category: string;
  manufacturer?: string;
  unit: string;
  strength?: string;
  form?: string;
  availableQuantity: number;
  reorderLevel: number;
  batches: Array<{
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    manufacturingDate: string;
  }>;
  gstPercent?: number;
  hsnCode?: string;
  prescriptionRequired: boolean;
  isActive: boolean;
}

export default function PharmacyInventory() {
  const [searchParams] = useSearchParams();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState(searchParams.get('filter') || 'all');
  const [showAddMedicine, setShowAddMedicine] = useState(searchParams.get('action') === 'add');
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'medicine',
    manufacturer: '',
    unit: 'tablet',
    strength: '',
    form: 'tablet',
    reorderLevel: '10',
    gstPercent: '5',
    hsnCode: '',
    prescriptionRequired: false
  });
  const [batchData, setBatchData] = useState({
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    quantity: '',
    costPrice: '',
    sellingPrice: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getInventoryItems();
      if (response.success) {
        setMedicines(response.data || []);
      }
    } catch (error) {
      setMedicines([
        { _id: '1', itemCode: 'MED001', name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'medicine', manufacturer: 'Cipla', unit: 'tablet', strength: '500mg', form: 'tablet', availableQuantity: 250, reorderLevel: 100, batches: [{ batchNumber: 'B001', expiryDate: '2025-12-31', quantity: 250, costPrice: 15, sellingPrice: 25, manufacturingDate: '2024-01-01' }], gstPercent: 5, hsnCode: '30049099', prescriptionRequired: false, isActive: true },
        { _id: '2', itemCode: 'MED002', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'medicine', manufacturer: 'Sun Pharma', unit: 'capsule', strength: '500mg', form: 'capsule', availableQuantity: 45, reorderLevel: 50, batches: [{ batchNumber: 'B002', expiryDate: '2025-06-30', quantity: 45, costPrice: 35, sellingPrice: 55, manufacturingDate: '2024-02-01' }], gstPercent: 12, hsnCode: '30041000', prescriptionRequired: true, isActive: true },
        { _id: '3', itemCode: 'MED003', name: 'Cough Syrup 100ml', genericName: 'Dextromethorphan', category: 'medicine', manufacturer: 'Dabur', unit: 'bottle', strength: '100ml', form: 'syrup', availableQuantity: 12, reorderLevel: 30, batches: [{ batchNumber: 'B003', expiryDate: '2025-03-15', quantity: 12, costPrice: 55, sellingPrice: 85, manufacturingDate: '2024-03-01' }], gstPercent: 12, hsnCode: '30049099', prescriptionRequired: false, isActive: true },
        { _id: '4', itemCode: 'MED004', name: 'Insulin Pen', genericName: 'Insulin', category: 'medicine', manufacturer: 'Novo Nordisk', unit: 'piece', strength: '3ml', form: 'injection', availableQuantity: 8, reorderLevel: 20, batches: [{ batchNumber: 'B004', expiryDate: '2025-02-28', quantity: 8, costPrice: 450, sellingPrice: 650, manufacturingDate: '2024-02-01' }], gstPercent: 5, hsnCode: '30043100', prescriptionRequired: true, isActive: true },
        { _id: '5', itemCode: 'SUR001', name: 'Surgical Bandage', genericName: '', category: 'surgical', manufacturer: 'Johnson & Johnson', unit: 'box', strength: '', form: 'other', availableQuantity: 15, reorderLevel: 50, batches: [{ batchNumber: 'B005', expiryDate: '2026-12-31', quantity: 15, costPrice: 80, sellingPrice: 120, manufacturingDate: '2024-01-01' }], gstPercent: 5, hsnCode: '30059090', prescriptionRequired: false, isActive: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createInventoryItem({
        ...formData,
        reorderLevel: parseInt(formData.reorderLevel),
        gstPercent: parseFloat(formData.gstPercent)
      });
      toast.success('Medicine added successfully');
      setShowAddMedicine(false);
      fetchInventory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add medicine');
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;
    try {
      await apiClient.post(`/inventory/${selectedMedicine._id}/add-batch`, {
        ...batchData,
        quantity: parseInt(batchData.quantity),
        costPrice: parseFloat(batchData.costPrice),
        sellingPrice: parseFloat(batchData.sellingPrice)
      });
      toast.success('Stock added successfully');
      setShowAddStock(false);
      setBatchData({ batchNumber: '', manufacturingDate: '', expiryDate: '', quantity: '', costPrice: '', sellingPrice: '' });
      fetchInventory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add stock');
    }
  };

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || med.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'low-stock') {
      matchesStock = med.availableQuantity <= med.reorderLevel;
    } else if (stockFilter === 'expiring') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      matchesStock = med.batches.some(b => new Date(b.expiryDate) <= thirtyDaysFromNow);
    } else if (stockFilter === 'out-of-stock') {
      matchesStock = med.availableQuantity === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const stats = {
    totalItems: medicines.length,
    lowStock: medicines.filter(m => m.availableQuantity <= m.reorderLevel).length,
    outOfStock: medicines.filter(m => m.availableQuantity === 0).length,
    totalValue: medicines.reduce((sum, m) => {
      const price = m.batches[0]?.sellingPrice || 0;
      return sum + (m.availableQuantity * price);
    }, 0)
  };

  const getStockStatus = (available: number, reorder: number) => {
    if (available === 0) return { label: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    if (available <= reorder) return { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', className: 'bg-green-100 text-green-800' };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Manage medicines and stock levels</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchInventory}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowAddMedicine(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold">{stats.lowStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Package className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold">{stats.outOfStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock Value</p>
                  <p className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, generic name, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="medicine">Medicine</SelectItem>
                  <SelectItem value="surgical">Surgical</SelectItem>
                  <SelectItem value="consumable">Consumable</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory ({filteredMedicines.length} items)</CardTitle>
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
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>MRP</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine) => {
                    const status = getStockStatus(medicine.availableQuantity, medicine.reorderLevel);
                    const currentPrice = medicine.batches[0]?.sellingPrice || 0;
                    return (
                      <TableRow key={medicine._id}>
                        <TableCell className="font-mono text-sm">{medicine.itemCode}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{medicine.name}</p>
                            {medicine.genericName && (
                              <p className="text-xs text-muted-foreground">{medicine.genericName}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{medicine.category}</TableCell>
                        <TableCell>
                          <span className={medicine.availableQuantity <= medicine.reorderLevel ? 'text-red-600 font-medium' : ''}>
                            {medicine.availableQuantity}
                          </span>
                          <span className="text-muted-foreground text-xs"> / {medicine.reorderLevel}</span>
                        </TableCell>
                        <TableCell>₹{currentPrice}</TableCell>
                        <TableCell>{medicine.gstPercent || 5}%</TableCell>
                        <TableCell>
                          <Badge className={status.className}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => { setSelectedMedicine(medicine); setShowAddStock(true); }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Barcode className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddMedicine} onOpenChange={setShowAddMedicine}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
            <DialogDescription>Enter medicine details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMedicine} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Medicine Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Generic Name / Salt</Label>
                <Input value={formData.genericName} onChange={(e) => setFormData({ ...formData, genericName: e.target.value })} />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="surgical">Surgical</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Manufacturer</Label>
                <Input value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
              </div>
              <div>
                <Label>Unit *</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="capsule">Capsule</SelectItem>
                    <SelectItem value="bottle">Bottle</SelectItem>
                    <SelectItem value="vial">Vial</SelectItem>
                    <SelectItem value="tube">Tube</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Strength</Label>
                <Input value={formData.strength} onChange={(e) => setFormData({ ...formData, strength: e.target.value })} placeholder="e.g., 500mg" />
              </div>
              <div>
                <Label>Form</Label>
                <Select value={formData.form} onValueChange={(v) => setFormData({ ...formData, form: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="capsule">Capsule</SelectItem>
                    <SelectItem value="syrup">Syrup</SelectItem>
                    <SelectItem value="injection">Injection</SelectItem>
                    <SelectItem value="cream">Cream</SelectItem>
                    <SelectItem value="ointment">Ointment</SelectItem>
                    <SelectItem value="drops">Drops</SelectItem>
                    <SelectItem value="powder">Powder</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reorder Level *</Label>
                <Input type="number" value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })} required />
              </div>
              <div>
                <Label>GST %</Label>
                <Select value={formData.gstPercent} onValueChange={(v) => setFormData({ ...formData, gstPercent: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>HSN Code</Label>
                <Input value={formData.hsnCode} onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="prescriptionRequired"
                checked={formData.prescriptionRequired}
                onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
              />
              <Label htmlFor="prescriptionRequired">Prescription Required</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddMedicine(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Add Medicine</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>
              Adding stock for: {selectedMedicine?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStock} className="space-y-4">
            <div>
              <Label>Batch Number *</Label>
              <Input value={batchData.batchNumber} onChange={(e) => setBatchData({ ...batchData, batchNumber: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Manufacturing Date *</Label>
                <Input type="date" value={batchData.manufacturingDate} onChange={(e) => setBatchData({ ...batchData, manufacturingDate: e.target.value })} required />
              </div>
              <div>
                <Label>Expiry Date *</Label>
                <Input type="date" value={batchData.expiryDate} onChange={(e) => setBatchData({ ...batchData, expiryDate: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label>Quantity *</Label>
              <Input type="number" value={batchData.quantity} onChange={(e) => setBatchData({ ...batchData, quantity: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Purchase Price *</Label>
                <Input type="number" step="0.01" value={batchData.costPrice} onChange={(e) => setBatchData({ ...batchData, costPrice: e.target.value })} required />
              </div>
              <div>
                <Label>Selling Price (MRP) *</Label>
                <Input type="number" step="0.01" value={batchData.sellingPrice} onChange={(e) => setBatchData({ ...batchData, sellingPrice: e.target.value })} required />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddStock(false)}>Cancel</Button>
              <Button type="submit" className="flex-1">Add Stock</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
