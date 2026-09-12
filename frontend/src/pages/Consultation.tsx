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
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle,
  FileText,
  TestTube,
  Pill,
  Save,
  Clock,
  Activity
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: any;
  allergies: string[];
  medicalHistory: any;
}

interface Appointment {
  _id: string;
  patientId: Patient;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: string;
  priority: string;
  symptoms?: string[];
  vitals?: any;
  diagnosis?: string;
  notes?: string;
}

export function Consultation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = searchParams.get('appointmentId');
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [consultationData, setConsultationData] = useState({
    symptoms: '',
    vitals: {
      bloodPressure: '',
      temperature: '',
      pulse: '',
      weight: '',
      height: ''
    },
    diagnosis: '',
    notes: '',
    followUpDate: '',
    followUpNotes: ''
  });

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    } else {
      setLoading(false);
    }
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAppointmentById(appointmentId!);
      if (response.success) {
        setAppointment(response.data);
        if (response.data.symptoms) {
          setConsultationData(prev => ({
            ...prev,
            symptoms: response.data.symptoms.join(', ')
          }));
        }
        if (response.data.vitals) {
          setConsultationData(prev => ({
            ...prev,
            vitals: { ...prev.vitals, ...response.data.vitals }
          }));
        }
        if (response.data.diagnosis) {
          setConsultationData(prev => ({
            ...prev,
            diagnosis: response.data.diagnosis
          }));
        }
        if (response.data.notes) {
          setConsultationData(prev => ({
            ...prev,
            notes: response.data.notes
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      toast.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConsultation = async () => {
    if (!appointment) return;

    try {
      setSaving(true);
      const updateData = {
        symptoms: consultationData.symptoms.split(',').map(s => s.trim()).filter(s => s),
        vitals: consultationData.vitals,
        diagnosis: consultationData.diagnosis,
        notes: consultationData.notes,
        followUpDate: consultationData.followUpDate || undefined,
        followUpNotes: consultationData.followUpNotes || undefined,
        status: 'in-progress'
      };

      const response = await apiClient.updateAppointment(appointment._id, updateData);
      if (response.success) {
        toast.success('Consultation saved successfully');
        setAppointment(response.data);
      }
    } catch (error) {
      console.error('Failed to save consultation:', error);
      toast.error('Failed to save consultation');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!appointment) return;

    try {
      setSaving(true);
      const updateData = {
        symptoms: consultationData.symptoms.split(',').map(s => s.trim()).filter(s => s),
        vitals: consultationData.vitals,
        diagnosis: consultationData.diagnosis,
        notes: consultationData.notes,
        followUpDate: consultationData.followUpDate || undefined,
        followUpNotes: consultationData.followUpNotes || undefined,
        status: 'completed',
        actualEndTime: new Date().toISOString()
      };

      const response = await apiClient.updateAppointment(appointment._id, updateData);
      if (response.success) {
        toast.success('Consultation completed successfully');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to complete consultation:', error);
      toast.error('Failed to complete consultation');
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!appointment) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Appointment Selected</h2>
          <p className="text-muted-foreground mb-4">Please select an appointment to start consultation</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const patient = appointment.patientId;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Consultation</h1>
            <p className="text-muted-foreground">
              {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button onClick={handleSaveConsultation} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button onClick={handleCompleteConsultation} disabled={saving}>
              <Activity className="h-4 w-4 mr-2" />
              Complete Consultation
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>
                      {patient.address?.street}, {patient.address?.city}, {patient.address?.state}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Allergies</h4>
                  {patient.allergies && patient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No known allergies</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Appointment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span>{appointment.reason}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge variant={appointment.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {appointment.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline">{appointment.status}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="consultation" className="space-y-4">
              <TabsList>
                <TabsTrigger value="consultation">Consultation</TabsTrigger>
                <TabsTrigger value="history">Medical History</TabsTrigger>
              </TabsList>

              <TabsContent value="consultation">
                <Card>
                  <CardHeader>
                    <CardTitle>Consultation Notes</CardTitle>
                    <CardDescription>
                      Record patient symptoms, vitals, diagnosis, and treatment plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="symptoms">Symptoms</Label>
                      <Textarea
                        id="symptoms"
                        placeholder="Enter patient symptoms (comma separated)"
                        value={consultationData.symptoms}
                        onChange={(e) => setConsultationData(prev => ({
                          ...prev,
                          symptoms: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium">Vital Signs</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label htmlFor="bp" className="text-sm">Blood Pressure</Label>
                          <Input
                            id="bp"
                            placeholder="120/80"
                            value={consultationData.vitals.bloodPressure}
                            onChange={(e) => setConsultationData(prev => ({
                              ...prev,
                              vitals: { ...prev.vitals, bloodPressure: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="temp" className="text-sm">Temperature (°F)</Label>
                          <Input
                            id="temp"
                            placeholder="98.6"
                            value={consultationData.vitals.temperature}
                            onChange={(e) => setConsultationData(prev => ({
                              ...prev,
                              vitals: { ...prev.vitals, temperature: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="pulse" className="text-sm">Pulse (bpm)</Label>
                          <Input
                            id="pulse"
                            placeholder="72"
                            value={consultationData.vitals.pulse}
                            onChange={(e) => setConsultationData(prev => ({
                              ...prev,
                              vitals: { ...prev.vitals, pulse: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight" className="text-sm">Weight (kg)</Label>
                          <Input
                            id="weight"
                            placeholder="70"
                            value={consultationData.vitals.weight}
                            onChange={(e) => setConsultationData(prev => ({
                              ...prev,
                              vitals: { ...prev.vitals, weight: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="height" className="text-sm">Height (cm)</Label>
                          <Input
                            id="height"
                            placeholder="170"
                            value={consultationData.vitals.height}
                            onChange={(e) => setConsultationData(prev => ({
                              ...prev,
                              vitals: { ...prev.vitals, height: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Textarea
                        id="diagnosis"
                        placeholder="Enter diagnosis and clinical findings"
                        value={consultationData.diagnosis}
                        onChange={(e) => setConsultationData(prev => ({
                          ...prev,
                          diagnosis: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Clinical Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes and observations"
                        value={consultationData.notes}
                        onChange={(e) => setConsultationData(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="followUpDate">Follow-up Date</Label>
                        <Input
                          id="followUpDate"
                          type="date"
                          value={consultationData.followUpDate}
                          onChange={(e) => setConsultationData(prev => ({
                            ...prev,
                            followUpDate: e.target.value
                          }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="followUpNotes">Follow-up Instructions</Label>
                        <Input
                          id="followUpNotes"
                          placeholder="Follow-up instructions"
                          value={consultationData.followUpNotes}
                          onChange={(e) => setConsultationData(prev => ({
                            ...prev,
                            followUpNotes: e.target.value
                          }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => navigate(`/prescriptions/new?appointmentId=${appointment._id}&patientId=${patient._id}`)}
                        className="flex-1"
                      >
                        <Pill className="h-4 w-4 mr-2" />
                        Write Prescription
                      </Button>
                      <Button 
                        onClick={() => navigate(`/orders/new?appointmentId=${appointment._id}&patientId=${patient._id}`)}
                        variant="outline"
                        className="flex-1"
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Order Tests
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical History</CardTitle>
                    <CardDescription>
                      Patient's previous medical records and history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patient.medicalHistory ? (
                      <div className="space-y-4">
                        {patient.medicalHistory.conditions && patient.medicalHistory.conditions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Previous Conditions</h4>
                            <div className="space-y-2">
                              {patient.medicalHistory.conditions.map((condition: any, index: number) => (
                                <div key={index} className="p-3 border rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{condition.condition}</p>
                                      {condition.diagnosedDate && (
                                        <p className="text-sm text-muted-foreground">
                                          Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                    <Badge variant="outline">{condition.status}</Badge>
                                  </div>
                                  {condition.notes && (
                                    <p className="text-sm text-muted-foreground mt-2">{condition.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {patient.medicalHistory.medications && patient.medicalHistory.medications.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Current Medications</h4>
                            <div className="space-y-2">
                              {patient.medicalHistory.medications.map((medication: any, index: number) => (
                                <div key={index} className="p-3 border rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{medication.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {medication.dosage} - {medication.frequency}
                                      </p>
                                    </div>
                                    <Badge variant="outline">{medication.status}</Badge>
                                  </div>
                                  {medication.purpose && (
                                    <p className="text-sm text-muted-foreground mt-2">{medication.purpose}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No medical history available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}