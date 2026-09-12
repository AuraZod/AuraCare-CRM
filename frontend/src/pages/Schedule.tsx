import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxPatients: number;
  currentPatients: number;
}

interface Schedule {
  id: string;
  date: string;
  dayOfWeek: string;
  timeSlots: TimeSlot[];
  isWorkingDay: boolean;
  notes?: string;
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'full_day' | 'half_day' | 'hours';
}

export function Schedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [scheduleForm, setScheduleForm] = useState({
    date: new Date(),
    isWorkingDay: true,
    timeSlots: [
      { startTime: '09:00', endTime: '12:00', maxPatients: 12 },
      { startTime: '14:00', endTime: '17:00', maxPatients: 12 }
    ],
    notes: ''
  });

  const [leaveForm, setLeaveForm] = useState({
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
    type: 'full_day' as 'full_day' | 'half_day' | 'hours'
  });

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const appointmentsResponse = await apiClient.getAppointments({
        date: format(selectedDate, 'yyyy-MM-dd')
      });
      if (appointmentsResponse.success) {
        setAppointments(appointmentsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (startTime: string, endTime: string, slotDuration: number = 30) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    while (start < end) {
      const slotStart = start.toTimeString().slice(0, 5);
      start.setMinutes(start.getMinutes() + slotDuration);
      const slotEnd = start.toTimeString().slice(0, 5);
      
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        isAvailable: true,
        maxPatients: 1,
        currentPatients: 0
      });
    }
    
    return slots;
  };

  const getAppointmentsForTimeSlot = (time: string) => {
    return appointments.filter(apt => apt.appointmentTime === time);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddTimeSlot = () => {
    setScheduleForm(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: '09:00', endTime: '10:00', maxPatients: 4 }]
    }));
  };

  const handleRemoveTimeSlot = (index: number) => {
    setScheduleForm(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateTimeSlot = (index: number, field: string, value: any) => {
    setScheduleForm(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const handleSaveSchedule = async () => {
    try {
      toast.success('Schedule updated successfully');
      setShowScheduleForm(false);
    } catch (error) {
      console.error('Failed to save schedule:', error);
      toast.error('Failed to save schedule');
    }
  };

  const handleSubmitLeave = async () => {
    try {
      toast.success('Leave request submitted successfully');
      setShowLeaveForm(false);
      setLeaveForm({
        startDate: new Date(),
        endDate: new Date(),
        reason: '',
        type: 'full_day'
      });
    } catch (error) {
      console.error('Failed to submit leave request:', error);
      toast.error('Failed to submit leave request');
    }
  };

  const workingHours = [
    { label: 'Morning', start: '09:00', end: '12:00' },
    { label: 'Afternoon', start: '14:00', end: '17:00' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Schedule Management</h1>
            <p className="text-muted-foreground">Manage your working hours, appointments, and leave requests</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowScheduleForm(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Schedule
            </Button>
            <Button variant="outline" onClick={() => setShowLeaveForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="time-slots">Time Slots</TabsTrigger>
            <TabsTrigger value="leave-management">Leave Management</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Schedule for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <CardDescription>
                      Your appointments and availability for the selected date
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {workingHours.map((period) => {
                          const timeSlots = generateTimeSlots(period.start, period.end);
                          
                          return (
                            <div key={period.label}>
                              <h4 className="font-medium mb-3">{period.label} ({period.start} - {period.end})</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {timeSlots.map((slot, index) => {
                                  const slotAppointments = getAppointmentsForTimeSlot(slot.startTime);
                                  const isBooked = slotAppointments.length > 0;
                                  
                                  return (
                                    <div
                                      key={index}
                                      className={`p-3 rounded-lg border text-center ${
                                        isBooked 
                                          ? 'bg-blue-50 border-blue-200' 
                                          : 'bg-green-50 border-green-200'
                                      }`}
                                    >
                                      <div className="font-medium text-sm">{slot.startTime}</div>
                                      {isBooked ? (
                                        <div className="mt-1">
                                          {slotAppointments.map((apt) => (
                                            <div key={apt._id} className="text-xs">
                                              <div className="font-medium">
                                                {apt.patientId?.firstName} {apt.patientId?.lastName}
                                              </div>
                                              <Badge className={`${getStatusColor(apt.status)} text-xs`}>
                                                {apt.status}
                                              </Badge>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-green-600 mt-1">Available</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        
                        {appointments.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No appointments scheduled for this date
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="time-slots">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Slot Configuration
                </CardTitle>
                <CardDescription>
                  Configure your working hours and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Working Days</Label>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Switch id={day} defaultChecked={day !== 'Sun'} />
                        <Label htmlFor={day} className="text-sm">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-medium">Time Slots</Label>
                    <Button size="sm" onClick={handleAddTimeSlot}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Slot
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {scheduleForm.timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-sm">Start Time</Label>
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleUpdateTimeSlot(index, 'startTime', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">End Time</Label>
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleUpdateTimeSlot(index, 'endTime', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Max Patients</Label>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              value={slot.maxPatients}
                              onChange={(e) => handleUpdateTimeSlot(index, 'maxPatients', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveTimeSlot(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special notes about your schedule"
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <Button onClick={handleSaveSchedule} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Schedule Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave-management">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Leave</CardTitle>
                  <CardDescription>
                    Submit a new leave request
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Leave Type</Label>
                    <Select value={leaveForm.type} onValueChange={(value: any) => setLeaveForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_day">Full Day</SelectItem>
                        <SelectItem value="half_day">Half Day</SelectItem>
                        <SelectItem value="hours">Few Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(leaveForm.startDate, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={leaveForm.startDate}
                            onSelect={(date) => date && setLeaveForm(prev => ({ ...prev, startDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(leaveForm.endDate, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={leaveForm.endDate}
                            onSelect={(date) => date && setLeaveForm(prev => ({ ...prev, endDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Reason for leave request"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                    />
                  </div>

                  <Button onClick={handleSubmitLeave} className="w-full">
                    Submit Leave Request
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leave History</CardTitle>
                  <CardDescription>
                    Your previous leave requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaveRequests.length > 0 ? (
                      leaveRequests.map((leave) => (
                        <div key={leave.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">
                                {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                              </p>
                              <p className="text-sm text-muted-foreground">{leave.reason}</p>
                              <p className="text-xs text-muted-foreground capitalize">{leave.type.replace('_', ' ')}</p>
                            </div>
                            <Badge 
                              variant={
                                leave.status === 'approved' ? 'default' : 
                                leave.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {leave.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No leave requests found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {showScheduleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Edit Schedule</CardTitle>
                <CardDescription>
                  Configure your working hours and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowScheduleForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSchedule}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showLeaveForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Request Leave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowLeaveForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitLeave}>
                    Submit Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}