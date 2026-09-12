import { useState, useEffect } from 'react';
import { Search, User, Phone, Mail, Calendar, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  allergies: string[];
}

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  placeholder?: string;
  className?: string;
}

interface QuickPatientForm {
  firstName: string;
  yearOfBirth: string;
  gender: string;
  phone: string;
  city: string;
  state: string;
}

export function PatientSearch({ onPatientSelect, placeholder = "Search patients...", className = "" }: PatientSearchProps) {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [hospitalSettings, setHospitalSettings] = useState<any>(null);
  const [creatingPatient, setCreatingPatient] = useState(false);
  
  const [quickPatientForm, setQuickPatientForm] = useState<QuickPatientForm>({
    firstName: '',
    yearOfBirth: '',
    gender: '',
    phone: '',
    city: '',
    state: 'Maharashtra'
  });
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchHospitalSettings = async () => {
      try {
        const response = await apiClient.getHospitalSettings();
        if (response.success) {
          setHospitalSettings(response.data);
          setQuickPatientForm(prev => ({
            ...prev,
            city: response.data.city || prev.city,
            state: response.data.state || prev.state
          }));
        }
      } catch (error) {
        console.error('Failed to fetch hospital settings:', error);
      }
    };

    fetchHospitalSettings();
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchPatients(debouncedQuery);
    } else {
      setPatients([]);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  const searchPatients = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await apiClient.searchPatients(searchQuery);
      if (response.success) {
        setPatients(response.data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Failed to search patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    const fullName = `${patient.firstName}${patient.lastName ? ` ${patient.lastName}` : ''}`;
    setQuery(fullName);
    setShowResults(false);
  };

  const handleNewPatientClick = () => {
    setShowResults(false);
    setShowNewPatientDialog(true);
  };

  const handleCreateQuickPatient = async () => {
    if (!quickPatientForm.firstName || !quickPatientForm.yearOfBirth || !quickPatientForm.gender || !quickPatientForm.phone || !quickPatientForm.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreatingPatient(true);
      const payload = {
        firstName: quickPatientForm.firstName,
        dateOfBirth: `${quickPatientForm.yearOfBirth}-01-01`,
        gender: quickPatientForm.gender,
        phone: quickPatientForm.phone,
        address: {
          city: quickPatientForm.city,
          state: quickPatientForm.state
        }
      };
      
      const response = await apiClient.createPatient(payload);
      if (response.success) {
        toast.success('Patient created successfully');
        
        const newPatient: Patient = {
          _id: response.data._id,
          firstName: quickPatientForm.firstName,
          lastName: '',
          dateOfBirth: `${quickPatientForm.yearOfBirth}-01-01`,
          gender: quickPatientForm.gender,
          phone: quickPatientForm.phone,
          email: '',
          allergies: []
        };
        
        onPatientSelect(newPatient);
        setShowNewPatientDialog(false);
        
        setQuickPatientForm({
          firstName: '',
          yearOfBirth: '',
          gender: '',
          phone: '',
          city: hospitalSettings?.city || '',
          state: hospitalSettings?.state || 'Maharashtra'
        });
      }
    } catch (error) {
      console.error('Failed to create patient:', error);
      toast.error('Failed to create patient');
    } finally {
      setCreatingPatient(false);
    }
  };

  const validateQuickPatient = (): boolean => {
    return !!(quickPatientForm.firstName && quickPatientForm.yearOfBirth && quickPatientForm.gender && quickPatientForm.phone && quickPatientForm.city);
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

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (patients.length > 0) {
              setShowResults(true);
            }
          }}
          className="pl-10"
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : patients.length > 0 ? (
              <div className="divide-y">
                {patients.map((patient) => (
                  <div
                    key={patient._id}
                    className="p-4 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">
                            {patient.firstName}{patient.lastName ? ` ${patient.lastName}` : ''}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {calculateAge(patient.dateOfBirth)}y, {patient.gender}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{patient.phone}</span>
                          </div>
                          
                          {patient.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{patient.email}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {patient.allergies && patient.allergies.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {patient.allergies.map((allergy, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Button size="sm" variant="ghost">
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div
                  className="p-4 hover:bg-blue-50 cursor-pointer transition-colors border-t-2 border-dashed border-blue-200"
                  onClick={handleNewPatientClick}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-700">Create New Patient</h4>
                      <p className="text-sm text-blue-600">Add a new patient to the system</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="p-4 text-center text-muted-foreground">
                  No patients found matching "{query}"
                </div>
                <div
                  className="p-4 hover:bg-blue-50 cursor-pointer transition-colors border-t border-dashed border-blue-200"
                  onClick={handleNewPatientClick}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-700">Create New Patient</h4>
                      <p className="text-sm text-blue-600">Add a new patient to the system</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}

      <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Patient</DialogTitle>
            <DialogDescription>
              Add a new patient with basic information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={quickPatientForm.firstName}
                onChange={(e) => setQuickPatientForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="yearOfBirth">Year of Birth *</Label>
              <Input
                id="yearOfBirth"
                type="number"
                placeholder="YYYY"
                min="1900"
                max={new Date().getFullYear()}
                value={quickPatientForm.yearOfBirth}
                onChange={(e) => setQuickPatientForm(prev => ({ ...prev, yearOfBirth: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={quickPatientForm.gender} 
                onValueChange={(value) => setQuickPatientForm(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={quickPatientForm.phone}
                onChange={(e) => setQuickPatientForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder={hospitalSettings?.city ? `Default: ${hospitalSettings.city}` : "Enter city"}
                  value={quickPatientForm.city}
                  onChange={(e) => setQuickPatientForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder={hospitalSettings?.state ? `Default: ${hospitalSettings.state}` : "Enter state"}
                  value={quickPatientForm.state}
                  onChange={(e) => setQuickPatientForm(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
            </div>

            {hospitalSettings && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span> City and state are pre-filled with hospital location ({hospitalSettings.city}, {hospitalSettings.state}).
                </p>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNewPatientDialog(false)} 
                className="flex-1"
                disabled={creatingPatient}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateQuickPatient} 
                className="flex-1"
                disabled={!validateQuickPatient() || creatingPatient}
              >
                {creatingPatient ? 'Creating...' : 'Create Patient'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}