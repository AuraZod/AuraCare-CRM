import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  AlertCircle,
  Activity,
  CreditCard,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: string;
  address?: {
    street: string;
    city: string;
    state: string;
  };
  allergies?: string[];
  lastVisit?: string;
  totalVisits?: number;
  pendingAmount?: number;
}

export default function Patients() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchQuery, genderFilter, ageFilter]);

  useEffect(() => {
    if (id) {
      fetchPatientById(id);
    }
  }, [id]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        gender: genderFilter !== 'all' ? genderFilter : undefined,
        ageRange: ageFilter !== 'all' ? ageFilter : undefined
      };
      
      const response = await apiClient.getPatients(params);
      if (response.success) {
        setPatients(response.data.patients || response.data);
        setTotalPages(response.data.totalPages || Math.ceil(response.data.total / itemsPerPage) || 1);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientById = async (patientId: string) => {
    try {
      const response = await apiClient.getPatientById(patientId);
      if (response.success) {
        setSelectedPatient(response.data);
        setShowPatientDetails(true);
      }
    } catch (error) {
      console.error('Failed to fetch patient:', error);
      toast.error('Failed to load patient details');
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleEditPatient = (patient: Patient) => {
    navigate(`/patients/${patient._id}/edit`);
  };

  const handleBookAppointment = (patient: Patient) => {
    navigate(`/appointments?patientId=${patient._id}`);
  };

  const handleViewMedicalHistory = (patient: Patient) => {
    navigate(`/patients/${patient._id}/history`);
  };

  const handleAddPatient = () => {
    navigate('/patients/register');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName? firstName[0] : ""}${lastName? lastName[0] : ""}`.toUpperCase();
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "ghost"}
          size="sm"
          className="h-8 px-3"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage patient records and history</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/patients/register?mode=quick')} variant="outline" className="gap-2">
            <Zap className="h-4 w-4" />
            Quick Register
          </Button>
          <Button onClick={handleAddPatient} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Patients</p>
            <p className="text-2xl font-display font-bold">{patients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">New This Month</p>
            <p className="text-2xl font-display font-bold text-green-600">+12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Patients</p>
            <p className="text-2xl font-display font-bold">{Math.floor(patients.length * 0.8)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Dues</p>
            <p className="text-2xl font-display font-bold text-orange-600">₹42,500</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, phone, or ID..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gender</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="0-18">0-18 years</SelectItem>
                <SelectItem value="19-35">19-35 years</SelectItem>
                <SelectItem value="36-60">36-60 years</SelectItem>
                <SelectItem value="60+">60+ years</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left p-4 font-medium text-sm">Patient</th>
                    <th className="text-left p-4 font-medium text-sm">Contact</th>
                    <th className="text-left p-4 font-medium text-sm">Age/Gender</th>
                    <th className="text-left p-4 font-medium text-sm">Last Visit</th>
                    <th className="text-left p-4 font-medium text-sm">Visits</th>
                    <th className="text-left p-4 font-medium text-sm">Status</th>
                    <th className="text-left p-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {patients.map((patient) => (
                    <tr 
                      key={patient._id} 
                      className="hover:bg-secondary/20 transition-colors duration-200"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {getInitials(patient.firstName, patient.lastName)}
                            </span>
                          </div>
                          <div>
                            <button
                              onClick={() => handleViewPatient(patient)}
                              className="font-medium hover:text-primary cursor-pointer"
                            >
                              {patient.firstName} {patient.lastName}
                            </button>
                            <p className="text-xs text-muted-foreground">ID: {patient._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {patient.phone}
                          </div>
                          {patient.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {calculateAge(patient.dateOfBirth)} yrs, {patient.gender}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Never'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium">{patient.totalVisits || 0}</span>
                      </td>
                      <td className="p-4">
                        {patient.pendingAmount && patient.pendingAmount > 0 ? (
                          <Badge variant="destructive">
                            ₹{patient.pendingAmount.toLocaleString()} Due
                          </Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewPatient(patient)} className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPatient(patient)} className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewMedicalHistory(patient)} className="gap-2">
                              <FileText className="h-4 w-4" />
                              Medical History
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBookAppointment(patient)} className="gap-2">
                              <Calendar className="h-4 w-4" />
                              Book Appointment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, patients.length)} of {patients.length} patients
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {renderPagination()}
              
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedPatient && (
        <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedPatient.firstName} {selectedPatient.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p>{selectedPatient.firstName} {selectedPatient.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Age</p>
                  <p>{calculateAge(selectedPatient.dateOfBirth)} years old</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Gender</p>
                  <p className="capitalize">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date of Birth</p>
                  <p>{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p>{selectedPatient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p>{selectedPatient.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {selectedPatient.address && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </h4>
                  <p className="text-sm">
                    {selectedPatient.address.street}, {selectedPatient.address.city}, {selectedPatient.address.state}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Medical Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Known Allergies</p>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPatient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No known allergies</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Visit Summary
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Visits</p>
                    <p className="text-lg font-bold">{selectedPatient.totalVisits || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Visit</p>
                    <p className="text-sm">{selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString() : 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pending Amount</p>
                    <p className="text-lg font-bold text-orange-600">
                      ₹{selectedPatient.pendingAmount || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleEditPatient(selectedPatient)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Patient
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleBookAppointment(selectedPatient)}
                  className="flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleViewMedicalHistory(selectedPatient)}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Medical History
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
