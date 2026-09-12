import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

export default function HospitalSetup() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    name: '',
    tagline: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    website: '',
    logo: '',
    workingHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '14:00', isOpen: true },
      sunday: { open: '09:00', close: '14:00', isOpen: false },
    },
    departments: [],
    appointmentSystemType: 'time-limited',
    appointmentDuration: 30,
    maxAppointmentsPerSlot: 1,
    enableOnlineBooking: true,
    enableSmsNotifications: true,
    enableEmailNotifications: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{success: boolean; data: any}>('/settings/hospital');
        setSettings(response.data);
      } catch (error) {
        toast.error('Failed to load hospital settings');
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiClient.post<{success: boolean; data: any}>('/settings/hospital', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hospital Setup</h1>
            <p className="text-muted-foreground">Configure your hospital settings and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hours">Working Hours</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic details about your hospital</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Hospital Name</Label>
                    <Input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <Input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input value={settings.website} onChange={(e) => setSettings({ ...settings, website: e.target.value })} />
                  </div>
                  <div>
                    <Label>Logo</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              setSettings({ ...settings, logo: result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Button variant="outline" size="icon"><Upload className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input value={settings.city} onChange={(e) => setSettings({ ...settings, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input value={settings.state} onChange={(e) => setSettings({ ...settings, state: e.target.value })} />
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <Input value={settings.pincode} onChange={(e) => setSettings({ ...settings, pincode: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>Set your hospital's operating hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {days.map((day) => (
                    <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-24 capitalize font-medium">{day}</div>
                      <Switch
                        checked={settings.workingHours[day as keyof typeof settings.workingHours].isOpen}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          workingHours: {
                            ...settings.workingHours,
                            [day]: { ...settings.workingHours[day as keyof typeof settings.workingHours], isOpen: checked }
                          }
                        })}
                      />
                      {settings.workingHours[day as keyof typeof settings.workingHours].isOpen && (
                        <>
                          <Input
                            type="time"
                            className="w-32"
                            value={settings.workingHours[day as keyof typeof settings.workingHours].open}
                            onChange={(e) => setSettings({
                              ...settings,
                              workingHours: {
                                ...settings.workingHours,
                                [day]: { ...settings.workingHours[day as keyof typeof settings.workingHours], open: e.target.value }
                              }
                            })}
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            className="w-32"
                            value={settings.workingHours[day as keyof typeof settings.workingHours].close}
                            onChange={(e) => setSettings({
                              ...settings,
                              workingHours: {
                                ...settings.workingHours,
                                [day]: { ...settings.workingHours[day as keyof typeof settings.workingHours], close: e.target.value }
                              }
                            })}
                          />
                        </>
                      )}
                      {!settings.workingHours[day as keyof typeof settings.workingHours].isOpen && (
                        <span className="text-muted-foreground">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Departments</CardTitle>
                <CardDescription>Manage hospital departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Add new department" id="newDept" />
                    <Button onClick={() => {
                      const input = document.getElementById('newDept') as HTMLInputElement;
                      if (input.value) {
                        setSettings({ ...settings, departments: [...settings.departments, input.value] });
                        input.value = '';
                      }
                    }}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.departments.map((dept, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                        <span>{dept}</span>
                        <button
                          onClick={() => setSettings({ ...settings, departments: settings.departments.filter((_, i) => i !== idx) })}
                          className="text-muted-foreground hover:text-destructive"
                        >×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Settings</CardTitle>
                <CardDescription>Configure appointment preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Appointment System Type</Label>
                  <Select 
                    value={settings.appointmentSystemType} 
                    onValueChange={(value) => setSettings({ ...settings, appointmentSystemType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment system type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time-limited">Time-Limited System</SelectItem>
                      <SelectItem value="unlimited">Unlimited System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {settings.appointmentSystemType === 'time-limited' 
                      ? 'Fixed time slots with limited appointments per slot' 
                      : 'No time slot restrictions, unlimited appointments'
                    }
                  </p>
                </div>

                {settings.appointmentSystemType === 'time-limited' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default Appointment Duration (minutes)</Label>
                      <Input 
                        type="number" 
                        value={settings.appointmentDuration} 
                        onChange={(e) => setSettings({ ...settings, appointmentDuration: parseInt(e.target.value) })} 
                      />
                    </div>
                    <div>
                      <Label>Max Appointments Per Slot</Label>
                      <Input 
                        type="number" 
                        value={settings.maxAppointmentsPerSlot} 
                        onChange={(e) => setSettings({ ...settings, maxAppointmentsPerSlot: parseInt(e.target.value) })} 
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Enable Online Booking</p>
                    <p className="text-sm text-muted-foreground">Allow patients to book appointments online</p>
                  </div>
                  <Switch checked={settings.enableOnlineBooking} onCheckedChange={(checked) => setSettings({ ...settings, enableOnlineBooking: checked })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Send SMS reminders to patients</p>
                  </div>
                  <Switch checked={settings.enableSmsNotifications} onCheckedChange={(checked) => setSettings({ ...settings, enableSmsNotifications: checked })} />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Send email reminders to patients</p>
                  </div>
                  <Switch checked={settings.enableEmailNotifications} onCheckedChange={(checked) => setSettings({ ...settings, enableEmailNotifications: checked })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
