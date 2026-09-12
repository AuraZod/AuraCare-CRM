import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  UserPlus, 
  Save, 
  ArrowLeft,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  FileText,
  Plus,
  Trash2,
  Zap
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface PatientForm {
  firstName: string;
  lastName: string;
  yearOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  medicalHistory: string;
  
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  
  occupation: string;
  maritalStatus: string;
  notes: string;
}

interface QuickPatientForm {
  firstName: string;
  yearOfBirth: string;
  gender: string;
  phone: string;
  city: string;
  state: string;
}

const initialForm: PatientForm = {
  firstName: '',
  lastName: '',
  yearOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  address: {
    street: '',
    city: '',
    state: 'Maharashtra',
    zipCode: '',
    country: 'India'
  },
  bloodGroup: '',
  allergies: [],
  chronicConditions: [],
  currentMedications: [],
  medicalHistory: '',
  insurance: {
    provider: '',
    policyNumber: '',
    groupNumber: ''
  },
  occupation: '',
  maritalStatus: '',
  notes: ''
};

const initialQuickPatient: QuickPatientForm = {
  firstName: '',
  yearOfBirth: '',
  gender: '',
  phone: '',
  city: '',
  state: 'Maharashtra'
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other'];
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
const relationships = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];

const commonAllergies = [
  'Penicillin', 'Aspirin', 'Ibuprofen', 'Peanuts', 'Shellfish', 
  'Latex', 'Dust', 'Pollen', 'Pet Dander', 'Eggs', 'Milk', 'Soy'
];

const commonConditions = [
  'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Arthritis',
  'Thyroid Disorder', 'High Cholesterol', 'Kidney Disease', 'Liver Disease'
];

export function PatientRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<PatientForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationMode, setRegistrationMode] = useState<'default' | 'quick'>('default');
  const [quickPatients, setQuickPatients] = useState<QuickPatientForm[]>([initialQuickPatient]);
  const [hospitalSettings, setHospitalSettings] = useState<any>(null);
  const [loadingHospitalSettings, setLoadingHospitalSettings] = useState(true);
  const totalSteps = 4;

  useEffect(() => {
    const fetchHospitalSettings = async () => {
      try {
        setLoadingHospitalSettings(true);
        const response = await apiClient.getHospitalSettings();
        if (response.success) {
          setHospitalSettings(response.data);
          
          setForm(prev => ({
            ...prev,
            address: {
              ...prev.address,
              city: response.data.city || prev.address.city,
              state: response.data.state || prev.address.state
            }
          }));

          setQuickPatients(prev => 
            prev.map(patient => ({
              ...patient,
              city: response.data.city || patient.city,
              state: response.data.state || patient.state
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch hospital settings:', error);
      } finally {
        setLoadingHospitalSettings(false);
      }
    };

    fetchHospitalSettings();
  }, []);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'quick') {
      setRegistrationMode('quick');
    }
  }, [searchParams]);

  const updateForm = (field: string, value: any) => {
    setForm(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        const [parentKey, childKey] = keys;
        const parentValue = prev[parentKey as keyof PatientForm];
        
        if (typeof parentValue === 'object' && parentValue !== null) {
          return {
            ...prev,
            [parentKey]: {
              ...parentValue,
              [childKey]: value
            }
          };
        }
      }
      return prev;
    });
  };

  const updateQuickPatient = (index: number, field: keyof QuickPatientForm, value: string) => {
    setQuickPatients(prev => 
      prev.map((patient, i) => 
        i === index ? { ...patient, [field]: value } : patient
      )
    );
  };

  const addQuickPatient = () => {
    const newPatient = {
      ...initialQuickPatient,
      city: hospitalSettings?.city || initialQuickPatient.city,
      state: hospitalSettings?.state || initialQuickPatient.state
    };
    setQuickPatients(prev => [...prev, newPatient]);
  };

  const removeQuickPatient = (index: number) => {
    if (quickPatients.length > 1) {
      setQuickPatients(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateQuickPatient = (patient: QuickPatientForm): boolean => {
    return !!(patient.firstName && patient.yearOfBirth && patient.gender && patient.phone && patient.city);
  };

  const handleArrayUpdate = (field: keyof PatientForm, item: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), item]
        : (prev[field] as string[]).filter(i => i !== item)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(form.firstName && form.yearOfBirth && form.gender && form.phone);
      case 2:
        return !!(form.address.city);
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const isEmpty = (value: any): boolean => {
        if (value === null || value === undefined || value === '') return true;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') {
          return Object.values(value).every(v => isEmpty(v));
        }
        return false;
      };

      const payload: any = {
        firstName: form.firstName,
        dateOfBirth: `${form.yearOfBirth}-01-01`,
        gender: form.gender,
        phone: form.phone,
        address: {
          city: form.address.city
        }
      };

      if (!isEmpty(form.lastName)) {
        payload.lastName = form.lastName;
      }

      if (!isEmpty(form.email)) {
        payload.email = form.email;
      }

      if (!isEmpty(form.address.street)) {
        payload.address.street = form.address.street;
      }
      if (!isEmpty(form.address.state)) {
        payload.address.state = form.address.state;
      }
      if (!isEmpty(form.address.zipCode)) {
        payload.address.zipCode = form.address.zipCode;
      }
      if (!isEmpty(form.address.country)) {
        payload.address.country = form.address.country;
      }

      if (!isEmpty(form.emergencyContact.name) || !isEmpty(form.emergencyContact.phone)) {
        payload.emergencyContact = {};
        if (!isEmpty(form.emergencyContact.name)) {
          payload.emergencyContact.name = form.emergencyContact.name;
        }
        if (!isEmpty(form.emergencyContact.phone)) {
          payload.emergencyContact.phone = form.emergencyContact.phone;
        }
        if (!isEmpty(form.emergencyContact.relationship)) {
          payload.emergencyContact.relationship = form.emergencyContact.relationship;
        }
      }

      if (!isEmpty(form.bloodGroup)) {
        payload.bloodGroup = form.bloodGroup;
      }

      if (!isEmpty(form.allergies)) {
        payload.allergies = form.allergies;
      }

      if (!isEmpty(form.chronicConditions)) {
        payload.chronicConditions = form.chronicConditions;
      }

      if (!isEmpty(form.currentMedications)) {
        payload.currentMedications = form.currentMedications;
      }

      if (!isEmpty(form.medicalHistory)) {
        payload.medicalHistory = form.medicalHistory;
      }

      if (!isEmpty(form.insurance.provider) || !isEmpty(form.insurance.policyNumber) || !isEmpty(form.insurance.groupNumber)) {
        payload.insurance = {};
        if (!isEmpty(form.insurance.provider)) {
          payload.insurance.provider = form.insurance.provider;
        }
        if (!isEmpty(form.insurance.policyNumber)) {
          payload.insurance.policyNumber = form.insurance.policyNumber;
        }
        if (!isEmpty(form.insurance.groupNumber)) {
          payload.insurance.groupNumber = form.insurance.groupNumber;
        }
      }

      if (!isEmpty(form.occupation)) {
        payload.occupation = form.occupation;
      }

      if (!isEmpty(form.maritalStatus)) {
        payload.maritalStatus = form.maritalStatus;
      }

      if (!isEmpty(form.notes)) {
        payload.notes = form.notes;
      }
      
      const response = await apiClient.createPatient(payload);
      if (response.success) {
        toast.success('Patient registered successfully');
        navigate('/patients');
      }
    } catch (error) {
      console.error('Failed to register patient:', error);
      toast.error('Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSubmit = async () => {
    const validPatients = quickPatients.filter(validateQuickPatient);
    
    if (validPatients.length === 0) {
      toast.error('Please fill in all required fields for at least one patient');
      return;
    }

    try {
      setLoading(true);
      const results = [];
      
      for (const patient of validPatients) {
        const payload = {
          firstName: patient.firstName,
          dateOfBirth: `${patient.yearOfBirth}-01-01`,
          gender: patient.gender,
          phone: patient.phone,
          address: {
            city: patient.city,
            state: patient.state
          }
        };
        
        try {
          const response = await apiClient.createPatient(payload);
          if (response.success) {
            results.push({ success: true, name: patient.firstName });
          }
        } catch (error) {
          results.push({ success: false, name: patient.firstName, error });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        toast.success(`${successCount} patient(s) registered successfully${failCount > 0 ? `, ${failCount} failed` : ''}`);
      }
      
      if (failCount === 0) {
        navigate('/patients');
      } else {
        const failedPatients = results
          .map((result, index) => ({ result, patient: validPatients[index] }))
          .filter(({ result }) => !result.success)
          .map(({ patient }) => patient);
        
        setQuickPatients(failedPatients.length > 0 ? failedPatients : [initialQuickPatient]);
      }
    } catch (error) {
      console.error('Failed to register patients:', error);
      toast.error('Failed to register patients');
    } finally {
      setLoading(false);
    }
  };

  const renderQuickRegistration = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Quick Patient Registration</h3>
            <p className="text-sm text-muted-foreground">Register multiple patients with basic information</p>
            {hospitalSettings && (
              <p className="text-xs text-blue-600 mt-1">
                City and state are pre-filled with hospital location ({hospitalSettings.city}, {hospitalSettings.state})
              </p>
            )}
          </div>
          <Button onClick={addQuickPatient} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Patient
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-secondary/30 p-3 border-b">
            <div className="grid grid-cols-7 gap-4 text-sm font-medium">
              <div>Name *</div>
              <div>Year of Birth *</div>
              <div>Gender *</div>
              <div>Phone *</div>
              <div>City *</div>
              <div>State</div>
              <div>Actions</div>
            </div>
          </div>
          
          <div className="divide-y">
            {quickPatients.map((patient, index) => (
              <div key={index} className="p-3">
                <div className="grid grid-cols-7 gap-4 items-center">
                  <Input
                    placeholder="First name"
                    value={patient.firstName}
                    onChange={(e) => updateQuickPatient(index, 'firstName', e.target.value)}
                    className="h-9"
                  />
                  <Input
                    type="number"
                    placeholder="YYYY"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={patient.yearOfBirth}
                    onChange={(e) => updateQuickPatient(index, 'yearOfBirth', e.target.value)}
                    className="h-9"
                  />
                  <Select 
                    value={patient.gender} 
                    onValueChange={(value) => updateQuickPatient(index, 'gender', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Phone number"
                    value={patient.phone}
                    onChange={(e) => updateQuickPatient(index, 'phone', e.target.value)}
                    className="h-9"
                  />
                  <Input
                    placeholder={hospitalSettings?.city ? `Default: ${hospitalSettings.city}` : "City"}
                    value={patient.city}
                    onChange={(e) => updateQuickPatient(index, 'city', e.target.value)}
                    className="h-9"
                  />
                  <Input
                    placeholder={hospitalSettings?.state ? `Default: ${hospitalSettings.state}` : "State"}
                    value={patient.state}
                    onChange={(e) => updateQuickPatient(index, 'state', e.target.value)}
                    className="h-9"
                  />
                  <div className="flex gap-1">
                    {quickPatients.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => removeQuickPatient(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {!validateQuickPatient(patient) && (
                  <div className="mt-2 text-xs text-destructive">
                    Please fill in all required fields (marked with *)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            {quickPatients.filter(validateQuickPatient).length} of {quickPatients.length} patients ready to register
          </div>
          <Button 
            onClick={handleQuickSubmit} 
            disabled={loading || quickPatients.filter(validateQuickPatient).length === 0}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Registering...' : `Register ${quickPatients.filter(validateQuickPatient).length} Patient(s)`}
          </Button>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="yearOfBirth">Year of Birth *</Label>
                  <Input
                    id="yearOfBirth"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={form.yearOfBirth}
                    onChange={(e) => updateForm('yearOfBirth', e.target.value)}
                    placeholder="Enter year of birth"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={form.gender} onValueChange={(value) => updateForm('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender} value={gender.toLowerCase()}>{gender}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Emergency Contact (Optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={form.emergencyContact.name}
                    onChange={(e) => updateForm('emergencyContact.name', e.target.value)}
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select value={form.emergencyContact.relationship} onValueChange={(value) => updateForm('emergencyContact.relationship', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationships.map((rel) => (
                        <SelectItem key={rel} value={rel.toLowerCase()}>{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone Number</Label>
                  <Input
                    id="emergencyPhone"
                    value={form.emergencyContact.phone}
                    onChange={(e) => updateForm('emergencyContact.phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </h3>
              {hospitalSettings && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Note:</span> City and state are pre-filled with hospital location ({hospitalSettings.city}, {hospitalSettings.state}). You can modify them if needed.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={form.address.street}
                    onChange={(e) => updateForm('address.street', e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={form.address.city}
                      onChange={(e) => updateForm('address.city', e.target.value)}
                      placeholder={hospitalSettings?.city ? `Default: ${hospitalSettings.city}` : "Enter city"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={form.address.state}
                      onChange={(e) => updateForm('address.state', e.target.value)}
                      placeholder={hospitalSettings?.state ? `Default: ${hospitalSettings.state}` : "Enter state"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={form.address.zipCode}
                      onChange={(e) => updateForm('address.zipCode', e.target.value)}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={form.address.country}
                      onChange={(e) => updateForm('address.country', e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Additional Details (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={form.occupation}
                    onChange={(e) => updateForm('occupation', e.target.value)}
                    placeholder="Enter occupation"
                  />
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select value={form.maritalStatus} onValueChange={(value) => updateForm('maritalStatus', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatuses.map((status) => (
                        <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Medical Information (Optional)
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={form.bloodGroup} onValueChange={(value) => updateForm('bloodGroup', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Known Allergies</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {commonAllergies.map((allergy) => (
                      <div key={allergy} className="flex items-center space-x-2">
                        <Checkbox
                          id={allergy}
                          checked={form.allergies.includes(allergy)}
                          onCheckedChange={(checked) => handleArrayUpdate('allergies', allergy, checked as boolean)}
                        />
                        <Label htmlFor={allergy} className="text-sm">{allergy}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Chronic Conditions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {commonConditions.map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={form.chronicConditions.includes(condition)}
                          onCheckedChange={(checked) => handleArrayUpdate('chronicConditions', condition, checked as boolean)}
                        />
                        <Label htmlFor={condition} className="text-sm">{condition}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    value={form.medicalHistory}
                    onChange={(e) => updateForm('medicalHistory', e.target.value)}
                    placeholder="Enter any relevant medical history"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Insurance & Additional Information (Optional)
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Insurance Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="provider">Insurance Provider</Label>
                      <Input
                        id="provider"
                        value={form.insurance.provider}
                        onChange={(e) => updateForm('insurance.provider', e.target.value)}
                        placeholder="Enter insurance provider"
                      />
                    </div>
                    <div>
                      <Label htmlFor="policyNumber">Policy Number</Label>
                      <Input
                        id="policyNumber"
                        value={form.insurance.policyNumber}
                        onChange={(e) => updateForm('insurance.policyNumber', e.target.value)}
                        placeholder="Enter policy number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="groupNumber">Group Number</Label>
                      <Input
                        id="groupNumber"
                        value={form.insurance.groupNumber}
                        onChange={(e) => updateForm('insurance.groupNumber', e.target.value)}
                        placeholder="Enter group number"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => updateForm('notes', e.target.value)}
                    placeholder="Any additional notes or special instructions"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/patients')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <UserPlus className="h-6 w-6" />
                Patient Registration
              </h1>
              <p className="text-muted-foreground">Register a new patient in the system</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
            <Button
              variant={registrationMode === 'default' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRegistrationMode('default')}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Default
            </Button>
            <Button
              variant={registrationMode === 'quick' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRegistrationMode('quick')}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              Quick
            </Button>
          </div>
        </div>

        {registrationMode === 'default' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {registrationMode === 'quick' ? 'Quick Registration' : (
                <>
                  {currentStep === 1 && 'Personal Information'}
                  {currentStep === 2 && 'Address & Contact'}
                  {currentStep === 3 && 'Medical Information'}
                  {currentStep === 4 && 'Insurance & Notes'}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {registrationMode === 'quick' 
                ? 'Register multiple patients quickly with essential information only'
                : (
                  <>
                    {currentStep === 1 && 'Enter the patient\'s basic personal details'}
                    {currentStep === 2 && 'Provide address and additional contact information'}
                    {currentStep === 3 && 'Add medical history and health information (optional)'}
                    {currentStep === 4 && 'Complete insurance details and additional notes (optional)'}
                  </>
                )
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrationMode === 'quick' ? renderQuickRegistration() : renderStep()}
          </CardContent>
        </Card>

        {registrationMode === 'default' && (
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Registering...' : 'Register Patient'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}