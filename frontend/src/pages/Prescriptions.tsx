import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Pill, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
  refills?: number;
}

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

interface Appointment {
  _id: string;
  patientId: Patient;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  diagnosis?: string;
}

const commonMedicines = [
  { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'Twice daily' },
  { name: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'Three times daily' },
  { name: 'Amoxicillin 250mg', dosage: '250mg', frequency: 'Three times daily' },
  { name: 'Omeprazole 20mg', dosage: '20mg', frequency: 'Once daily' },
  { name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily' },
  { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily' },
  { name: 'Atorvastatin 10mg', dosage: '10mg', frequency: 'Once daily' },
  { name: 'Aspirin 75mg', dosage: '75mg', frequency: 'Once daily' }
];

const frequencies = [
  'Once daily',
  'Twice daily', 
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'Before meals',
  'After meals',
  'At bedtime'
];

const durations = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '30 days',
  '60 days',
  '90 days',
  'Until finished',
  'As needed'
];

export function Prescriptions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('appointmentId');
  const patientId = searchParams.get('patientId');
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  
  const [prescriptionData, setPrescriptionData] = useState({
    medications: [] as Medication[],
    diagnosis: '',
    symptoms: [] as string[],
    advice: '',
    followUpDate: '',
    followUpInstructions: ''
  });

  const [currentMedication, setCurrentMedication] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: 1,
    refills: 0
  });

  useEffect(() => {
    if (appointmentId && patientId) {
      fetchData();
    } else {
      setLoading(false);
    }
    fetchPrescriptions();
  }, [appointmentId, patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentResponse, patientResponse] = await Promise.all([
        apiClient.getAppointmentById(appointmentId!),
        apiClient.getPatientById(patientId!)
      ]);
      
      if (appointmentResponse.success) {
        setAppointment(appointmentResponse.data);
        if (appointmentResponse.data.diagnosis) {
          setPrescriptionData(prev => ({
            ...prev,
            diagnosis: appointmentResponse.data.diagnosis
          }));
        }
      }
      if (patientResponse.success) {
        setPatient(patientResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await apiClient.getPrescriptions({ patientId });
      if (response.success) {
        setPrescriptions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    }
  };

  const handleAddMedication = () => {
    if (!currentMedication.name || !currentMedication.dosage || !currentMedication.frequency || !currentMedication.duration) {
      toast.error('Please fill in all required medication fields');
      return;
    }

    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, { ...currentMedication }]
    }));

    setCurrentMedication({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1,
      refills: 0
    });
  };

  const handleRemoveMedication = (index: number) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSelectCommonMedicine = (medicine: any) => {
    setCurrentMedication(prev => ({
      ...prev,
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency
    }));
  };

  const handleCreatePrescription = async () => {
    if (prescriptionData.medications.length === 0) {
      toast.error('Please add at least one medication');
      return;
    }

    if (!prescriptionData.diagnosis) {
      toast.error('Please enter a diagnosis');
      return;
    }

    try {
      setSaving(true);
      const prescriptionPayload = {
        patientId: patientId!,
        appointmentId: appointmentId || undefined,
        medications: prescriptionData.medications,
        diagnosis: prescriptionData.diagnosis,
        symptoms: prescriptionData.symptoms,
        advice: prescriptionData.advice,
        followUpDate: prescriptionData.followUpDate || undefined,
        followUpInstructions: prescriptionData.followUpInstructions
      };

      const response = await apiClient.createPrescription(prescriptionPayload);
      if (response.success) {
        toast.success('Prescription created successfully');
        setPrescriptionData({
          medications: [],
          diagnosis: '',
          symptoms: [],
          advice: '',
          followUpDate: '',
          followUpInstructions: ''
        });
        fetchPrescriptions();
      }
    } catch (error) {
      console.error('Failed to create prescription:', error);
      toast.error('Failed to create prescription');
    } finally {
      setSaving(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'dispensed': return 'bg-green-100 text-green-800';
      case 'partially_dispensed': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Prescriptions</h1>
            <p className="text-muted-foreground">Create and manage patient prescriptions</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <Tabs defaultValue="new-prescription" className="space-y-4">
          <TabsList>
            <TabsTrigger value="new-prescription">New Prescription</TabsTrigger>
            <TabsTrigger value="prescription-history">Prescription History</TabsTrigger>
          </TabsList>

          <TabsContent value="new-prescription">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {patient && (
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Patient Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {calculateAge(patient.dateOfBirth)} years old • {patient.gender}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{patient.phone}</span>
                        </div>
                        {patient.email && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{patient.email}</span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Allergies</h4>
                        {patient.allergies && patient.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {patient.allergies.map((allergy, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No known allergies</p>
                        )}
                      </div>

                      {appointment && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">Current Appointment</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <span>{appointment.appointmentTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Reason:</span>
                                <span>{appointment.reason}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className={patient ? "lg:col-span-2" : "lg:col-span-3"}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Create Prescription
                    </CardTitle>
                    <CardDescription>
                      Add medications and treatment instructions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis *</Label>
                      <Textarea
                        id="diagnosis"
                        placeholder="Enter diagnosis"
                        value={prescriptionData.diagnosis}
                        onChange={(e) => setPrescriptionData(prev => ({ ...prev, diagnosis: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="symptoms">Symptoms</Label>
                      <Input
                        id="symptoms"
                        placeholder="Enter symptoms (comma separated)"
                        value={prescriptionData.symptoms.join(', ')}
                        onChange={(e) => setPrescriptionData(prev => ({ 
                          ...prev, 
                          symptoms: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium">Quick Select Common Medicines</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {commonMedicines.map((medicine, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectCommonMedicine(medicine)}
                            className="text-xs h-auto p-2 text-left"
                          >
                            {medicine.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Add Medication</Label>
                        <Button onClick={handleAddMedication} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="medName">Medicine Name *</Label>
                          <Input
                            id="medName"
                            placeholder="Enter medicine name"
                            value={currentMedication.name}
                            onChange={(e) => setCurrentMedication(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dosage">Dosage *</Label>
                          <Input
                            id="dosage"
                            placeholder="e.g., 500mg, 1 tablet"
                            value={currentMedication.dosage}
                            onChange={(e) => setCurrentMedication(prev => ({ ...prev, dosage: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="frequency">Frequency *</Label>
                          <Select value={currentMedication.frequency} onValueChange={(value) => setCurrentMedication(prev => ({ ...prev, frequency: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {frequencies.map((freq) => (
                                <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="duration">Duration *</Label>
                          <Select value={currentMedication.duration} onValueChange={(value) => setCurrentMedication(prev => ({ ...prev, duration: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              {durations.map((duration) => (
                                <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={currentMedication.quantity}
                            onChange={(e) => setCurrentMedication(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="refills">Refills</Label>
                          <Input
                            id="refills"
                            type="number"
                            min="0"
                            value={currentMedication.refills}
                            onChange={(e) => setCurrentMedication(prev => ({ ...prev, refills: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="instructions">Instructions</Label>
                        <Input
                          id="instructions"
                          placeholder="Special instructions (e.g., take with food)"
                          value={currentMedication.instructions}
                          onChange={(e) => setCurrentMedication(prev => ({ ...prev, instructions: e.target.value }))}
                        />
                      </div>
                    </div>

                    {prescriptionData.medications.length > 0 && (
                      <div>
                        <Label className="text-base font-medium">Prescribed Medications</Label>
                        <div className="space-y-3 mt-2">
                          {prescriptionData.medications.map((med, index) => (
                            <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{med.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {med.dosage} • {med.frequency} • {med.duration}
                                </p>
                                {med.instructions && (
                                  <p className="text-sm text-muted-foreground italic">
                                    Instructions: {med.instructions}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  Quantity: {med.quantity} • Refills: {med.refills}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveMedication(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="advice">Advice & Instructions</Label>
                      <Textarea
                        id="advice"
                        placeholder="General advice and instructions for the patient"
                        value={prescriptionData.advice}
                        onChange={(e) => setPrescriptionData(prev => ({ ...prev, advice: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="followUpDate">Follow-up Date</Label>
                        <Input
                          id="followUpDate"
                          type="date"
                          value={prescriptionData.followUpDate}
                          onChange={(e) => setPrescriptionData(prev => ({ ...prev, followUpDate: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="followUpInstructions">Follow-up Instructions</Label>
                        <Input
                          id="followUpInstructions"
                          placeholder="Follow-up instructions"
                          value={prescriptionData.followUpInstructions}
                          onChange={(e) => setPrescriptionData(prev => ({ ...prev, followUpInstructions: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreatePrescription} 
                      disabled={saving || prescriptionData.medications.length === 0}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Create Prescription
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prescription-history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prescription History
                </CardTitle>
                <CardDescription>
                  Previous prescriptions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <div key={prescription._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">Prescription #{prescription.prescriptionNumber}</h4>
                            <p className="text-sm text-muted-foreground">
                              {prescription.patientId?.firstName} {prescription.patientId?.lastName} • 
                              {new Date(prescription.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(prescription.status)}>
                            {prescription.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">Diagnosis:</p>
                            <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium">Medications:</p>
                            <div className="space-y-1 mt-1">
                              {prescription.medications?.map((med: any, index: number) => (
                                <div key={index} className="text-sm text-muted-foreground">
                                  • {med.name} - {med.dosage}, {med.frequency}, {med.duration}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {prescription.advice && (
                            <div>
                              <p className="text-sm font-medium">Advice:</p>
                              <p className="text-sm text-muted-foreground">{prescription.advice}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No prescriptions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}