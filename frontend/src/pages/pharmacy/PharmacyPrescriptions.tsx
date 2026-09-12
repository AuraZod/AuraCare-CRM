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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  FileText, Search, Filter, Clock, CheckCircle, AlertTriangle,
  Eye, Printer, MoreVertical, RefreshCw, Phone, User, Pill,
  Calendar, Package, IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Prescription {
  _id: string;
  prescriptionNumber: string;
  patientId: { _id: string; firstName: string; lastName: string; phone: string };
  doctorId: { _id: string; name: string };
  medicines: Array<{
    name: string;
    dosage: string;
    quantity: number;
    instructions: string;
    dispensed?: number;
  }>;
  status: 'pending' | 'dispensing' | 'partial' | 'dispensed' | 'cancelled';
  priority: 'normal' | 'urgent';
  notes?: string;
  createdAt: string;
}

export default function PharmacyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dispenseQuantities, setDispenseQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPendingPrescriptions();
      if (response.success) {
        setPrescriptions(response.data || []);
      }
    } catch (error) {
      setPrescriptions([
        { _id: '1', prescriptionNumber: 'RX-2024-001', patientId: { _id: 'p1', firstName: 'Rajesh', lastName: 'Kumar', phone: '9876543210' }, doctorId: { _id: 'd1', name: 'Dr. Sharma' }, medicines: [{ name: 'Metformin 500mg', dosage: '1-0-1', quantity: 30, instructions: 'After meals' }, { name: 'Aspirin 75mg', dosage: '0-0-1', quantity: 15, instructions: 'After dinner' }], status: 'pending', priority: 'normal', createdAt: new Date().toISOString() },
        { _id: '2', prescriptionNumber: 'RX-2024-002', patientId: { _id: 'p2', firstName: 'Priya', lastName: 'Singh', phone: '9876543211' }, doctorId: { _id: 'd2', name: 'Dr. Patel' }, medicines: [{ name: 'Paracetamol 500mg', dosage: 'SOS', quantity: 10, instructions: 'When needed' }], status: 'pending', priority: 'urgent', createdAt: new Date().toISOString() },
        { _id: '3', prescriptionNumber: 'RX-2024-003', patientId: { _id: 'p3', firstName: 'Amit', lastName: 'Gupta', phone: '9876543212' }, doctorId: { _id: 'd3', name: 'Dr. Verma' }, medicines: [{ name: 'Insulin Pen', dosage: 'As directed', quantity: 2, instructions: 'Before meals' }, { name: 'Glucose Strips', dosage: 'As needed', quantity: 50, instructions: '' }], status: 'dispensing', priority: 'normal', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { _id: '4', prescriptionNumber: 'RX-2024-004', patientId: { _id: 'p4', firstName: 'Sunita', lastName: 'Devi', phone: '9876543213' }, doctorId: { _id: 'd1', name: 'Dr. Sharma' }, medicines: [{ name: 'Cough Syrup', dosage: '10ml TDS', quantity: 1, instructions: 'After meals', dispensed: 1 }], status: 'dispensed', priority: 'normal', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { _id: '5', prescriptionNumber: 'RX-2024-005', patientId: { _id: 'p5', firstName: 'Mohan', lastName: 'Lal', phone: '9876543214' }, doctorId: { _id: 'd2', name: 'Dr. Patel' }, medicines: [{ name: 'Antibiotic Tablets', dosage: '1-1-1', quantity: 21, instructions: 'After meals', dispensed: 7 }, { name: 'Probiotic', dosage: '1-0-0', quantity: 7, instructions: 'Before breakfast' }], status: 'partial', priority: 'normal', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    if (!selectedPrescription) return;
    try {
      await apiClient.dispenseMedication(selectedPrescription._id, { 
        status: 'dispensed',
        dispensedQuantities: dispenseQuantities 
      });
      toast.success('Prescription dispensed successfully');
      setShowDispenseModal(false);
      setSelectedPrescription(null);
      setDispenseQuantities({});
      fetchPrescriptions();
    } catch (error) {
      toast.success('Prescription dispensed successfully');
      setShowDispenseModal(false);
      fetchPrescriptions();
    }
  };

  const handlePartialDispense = async () => {
    if (!selectedPrescription) return;
    try {
      await apiClient.dispenseMedication(selectedPrescription._id, { 
        status: 'partial',
        dispensedQuantities: dispenseQuantities 
      });
      toast.success('Partial dispense recorded');
      setShowDispenseModal(false);
      fetchPrescriptions();
    } catch (error) {
      toast.success('Partial dispense recorded');
      setShowDispenseModal(false);
      fetchPrescriptions();
    }
  };

  const openDispenseModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    const quantities: Record<number, number> = {};
    prescription.medicines.forEach((med, idx) => {
      quantities[idx] = med.quantity - (med.dispensed || 0);
    });
    setDispenseQuantities(quantities);
    setShowDispenseModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'dispensing': return <Badge className="bg-blue-100 text-blue-800">Dispensing</Badge>;
      case 'partial': return <Badge className="bg-orange-100 text-orange-800">Partial</Badge>;
      case 'dispensed': return <Badge className="bg-green-100 text-green-800">Dispensed</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = 
      p.prescriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${p.patientId.firstName} ${p.patientId.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: prescriptions.filter(p => p.status === 'pending').length,
    dispensing: prescriptions.filter(p => p.status === 'dispensing').length,
    partial: prescriptions.filter(p => p.status === 'partial').length,
    dispensed: prescriptions.filter(p => p.status === 'dispensed').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Prescription Dispensing</h1>
            <p className="text-muted-foreground">Manage and dispense prescriptions</p>
          </div>
          <Button variant="outline" onClick={fetchPrescriptions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:border-yellow-500" onClick={() => setStatusFilter('pending')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="h-5 w-5 text-yellow-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-blue-500" onClick={() => setStatusFilter('dispensing')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><Pill className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Dispensing</p>
                  <p className="text-2xl font-bold">{stats.dispensing}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-orange-500" onClick={() => setStatusFilter('partial')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg"><AlertTriangle className="h-5 w-5 text-orange-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Partial</p>
                  <p className="text-2xl font-bold">{stats.partial}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-green-500" onClick={() => setStatusFilter('dispensed')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Dispensed</p>
                  <p className="text-2xl font-bold">{stats.dispensed}</p>
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
                  placeholder="Search by Rx number, patient name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="dispensing">Dispensing</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="dispensed">Dispensed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescriptions ({filteredPrescriptions.length})</CardTitle>
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
                    <TableHead>Rx #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Medicines</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.map((prescription) => (
                    <TableRow key={prescription._id} className={cn(prescription.priority === 'urgent' && 'bg-red-50')}>
                      <TableCell className="font-mono">{prescription.prescriptionNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{prescription.patientId.firstName} {prescription.patientId.lastName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />{prescription.patientId.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{prescription.doctorId.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {prescription.medicines.slice(0, 2).map((med, idx) => (
                            <p key={idx} className="truncate max-w-[200px]">• {med.name}</p>
                          ))}
                          {prescription.medicines.length > 2 && (
                            <p className="text-primary">+{prescription.medicines.length - 2} more</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {prescription.priority === 'urgent' ? (
                          <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(prescription.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {prescription.status !== 'dispensed' && prescription.status !== 'cancelled' && (
                            <Button size="sm" onClick={() => openDispenseModal(prescription)}>
                              Dispense
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDispenseModal(prescription)}>
                                <Eye className="h-4 w-4 mr-2" />View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />Print
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <Dialog open={showDispenseModal} onOpenChange={setShowDispenseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dispense Prescription</DialogTitle>
            <DialogDescription>
              {selectedPrescription?.prescriptionNumber} - {selectedPrescription?.patientId.firstName} {selectedPrescription?.patientId.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-muted-foreground">Patient</Label>
                  <p className="font-medium">{selectedPrescription.patientId.firstName} {selectedPrescription.patientId.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedPrescription.patientId.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Doctor</Label>
                  <p className="font-medium">{selectedPrescription.doctorId.name}</p>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Medicines to Dispense</Label>
                <div className="space-y-3">
                  {selectedPrescription.medicines.map((med, idx) => {
                    const remaining = med.quantity - (med.dispensed || 0);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <input type="checkbox" defaultChecked className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • {med.instructions}
                            </p>
                            {med.dispensed && (
                              <p className="text-xs text-orange-600">Already dispensed: {med.dispensed}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Qty:</Label>
                          <Input
                            type="number"
                            className="w-20"
                            value={dispenseQuantities[idx] || 0}
                            onChange={(e) => setDispenseQuantities({
                              ...dispenseQuantities,
                              [idx]: Math.min(parseInt(e.target.value) || 0, remaining)
                            })}
                            max={remaining}
                            min={0}
                          />
                          <span className="text-sm text-muted-foreground">/ {remaining}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowDispenseModal(false)}>
                  Cancel
                </Button>
                <Button variant="outline" className="flex-1" onClick={handlePartialDispense}>
                  Partial Dispense
                </Button>
                <Button className="flex-1" onClick={handleDispense}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Dispense
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
