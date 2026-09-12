import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { PatientSearch } from '@/components/PatientSearch';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import {
  Search,
  Plus,
  FileText,
  Download,
  Eye,
  MoreHorizontal,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BillingStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  partialInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  collectionRate: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface InvoiceWithPatient {
  _id: string;
  invoiceNumber: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    fullName?: string;
    age?: number;
  };
  subtotal: number;
  tax: number;
  discountAmount: number;
  total: number;
  totalPaid: number;
  remainingAmount: number;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  partial: { color: 'bg-accent/10 text-accent border-accent/30', icon: AlertCircle },
  paid: { color: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  cancelled: { color: 'bg-muted text-muted-foreground border-border', icon: CreditCard },
  refunded: { color: 'bg-muted text-muted-foreground border-border', icon: CreditCard },
};

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithPatient | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceWithPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const responseData = await apiClient.getInvoices(params) as any;
      if (responseData.success) {
        setInvoices(responseData.data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const responseData = await apiClient.getBillingStats() as any;
      if (responseData.success) {
        setStats(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching billing stats:', error);
    }
  };

  const handleCreateInvoice = async (formData: FormData) => {
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Please select a patient",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreateLoading(true);
      const invoiceData = {
        patientId: selectedPatient._id,
        consultationFee: parseFloat(formData.get('consultationFee') as string) || 0,
        services: [],
        discount: parseFloat(formData.get('discount') as string) || 0,
        notes: formData.get('notes') as string || ''
      };

      const responseData = await apiClient.createInvoice(invoiceData) as any;
      if (responseData.success) {
        toast({
          title: "Success",
          description: "Invoice created successfully",
        });
        setIsCreateOpen(false);
        setSelectedPatient(null);
        fetchInvoices();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRecordPayment = async (invoiceId: string, paymentData: any) => {
    try {
      const responseData = await apiClient.recordPayment(invoiceId, paymentData) as any;
      if (responseData.success) {
        toast({
          title: "Success",
          description: "Payment recorded successfully",
        });
        fetchInvoices();
        fetchStats();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = (invoice: InvoiceWithPatient) => {
    try {
      generateInvoicePDF(invoice);
      toast({
        title: "Success",
        description: "Invoice PDF downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const patientName = `${invoice.patientId.firstName} ${invoice.patientId.lastName || ''}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    return (
      invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
      patientName.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Billing & Invoices</h1>
            <p className="text-muted-foreground">Manage invoices and track payments</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setSelectedPatient(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground shadow-md">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Create New Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateInvoice(new FormData(e.currentTarget));
              }} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient</Label>
                    <PatientSearch 
                      onPatientSelect={(patient) => setSelectedPatient(patient)}
                      placeholder="Search and select patient..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Consultation Fee</Label>
                    <Input 
                      type="number" 
                      name="consultationFee"
                      placeholder="500" 
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Discount (%)</Label>
                  <Input 
                    type="number" 
                    name="discount"
                    placeholder="0" 
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input 
                    name="notes"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateOpen(false);
                      setSelectedPatient(null);
                    }}
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="gap-2 gradient-primary text-primary-foreground"
                    disabled={createLoading}
                  >
                    {createLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Generate Invoice
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Invoices</p>
                <p className="text-2xl font-bold mt-1">{stats?.paidInvoices || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold mt-1">₹{stats?.pendingAmount?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Invoice ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => {
                  const StatusIcon = statusConfig[invoice.status]?.icon || Clock;
                  return (
                    <TableRow key={invoice._id} className="group hover:bg-secondary/30">
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.patientId.firstName} {invoice.patientId.lastName || ''}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium">₹{invoice.total?.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-success font-medium">
                        ₹{invoice.totalPaid?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[invoice.status]?.color || statusConfig.pending.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedInvoice(invoice)}>
                              <Eye className="h-4 w-4 mr-2" /> View Invoice
                            </DropdownMenuItem>
                            {invoice.status !== 'paid' && (
                              <DropdownMenuItem onClick={() => {
                                const amount = prompt('Enter payment amount:');
                                if (amount) {
                                  handleRecordPayment(invoice._id, {
                                    amount: parseFloat(amount),
                                    paymentMethod: 'cash',
                                    notes: 'Payment recorded from dashboard'
                                  });
                                }
                              }}>
                                <CreditCard className="h-4 w-4 mr-2" /> Record Payment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                              <Download className="h-4 w-4 mr-2" /> Download PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading invoices...
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
                        <p>No invoices found</p>
                        <p className="text-sm">Create your first invoice to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Search className="h-8 w-8 mx-auto text-muted-foreground/50" />
                        <p>No invoices match your search</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-lg">
            {selectedInvoice && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="font-display text-xl">{selectedInvoice.invoiceNumber}</DialogTitle>
                    <Badge className={statusConfig[selectedInvoice.status]?.color || statusConfig.pending.color}>
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </Badge>
                  </div>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Patient</p>
                      <p className="font-semibold">
                        {selectedInvoice.patientId.firstName} {selectedInvoice.patientId.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-semibold">
                        {new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{selectedInvoice.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (18% GST)</span>
                      <span>₹{selectedInvoice.tax?.toLocaleString()}</span>
                    </div>
                    {selectedInvoice.discountAmount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Discount</span>
                        <span>-₹{selectedInvoice.discountAmount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>₹{selectedInvoice.total?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span>Paid</span>
                      <span>₹{selectedInvoice.totalPaid?.toLocaleString() || 0}</span>
                    </div>
                    {selectedInvoice.remainingAmount > 0 && (
                      <div className="flex justify-between text-warning font-medium">
                        <span>Balance Due</span>
                        <span>₹{selectedInvoice.remainingAmount?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t">
                    {selectedInvoice.status !== 'paid' && (
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => {
                          const amount = prompt('Enter payment amount:');
                          if (amount) {
                            handleRecordPayment(selectedInvoice._id, {
                              amount: parseFloat(amount),
                              paymentMethod: 'cash',
                              notes: 'Payment recorded from invoice view'
                            });
                          }
                        }}
                      >
                        <CreditCard className="h-4 w-4" />
                        Record Payment
                      </Button>
                    )}
                    <Button 
                      className="gap-2 gradient-primary text-primary-foreground"
                      onClick={() => handleDownloadPDF(selectedInvoice)}
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
