import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  MessageSquare,
  Send,
  Clock,
  CheckCheck,
  User,
  FileText,
  Phone,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { config } from '@/config/app-config';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';


interface Message {
  id: string;
  patient_name: string;
  patient_phone: string;
  message: string;
  type: 'appointment' | 'prescription' | 'reminder' | 'general';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  channel: 'whatsapp' | 'sms';
  sent_at: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  message: string;
  variables: string[];
}



const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Appointment Confirmation',
    category: 'Appointments',
    message: 'Dear {{patient_name}}, your appointment with {{doctor_name}} is confirmed for {{date}} at {{time}}. Reply CONFIRM to confirm or CANCEL to reschedule.',
    variables: ['patient_name', 'doctor_name', 'date', 'time'],
  },
  {
    id: '2',
    name: 'Appointment Reminder',
    category: 'Appointments',
    message: 'Hi {{patient_name}}, this is a reminder for your appointment tomorrow at {{time}} with {{doctor_name}}. See you soon!',
    variables: ['patient_name', 'doctor_name', 'time'],
  },
  {
    id: '3',
    name: 'Prescription Ready',
    category: 'Prescriptions',
    message: `Dear {{patient_name}}, your prescription is ready for collection at ${config.siteName} Clinic. Clinic timings: 9 AM - 8 PM.`,
    variables: ['patient_name'],
  },
  {
    id: '4',
    name: 'Follow-up Reminder',
    category: 'Reminders',
    message: 'Hi {{patient_name}}, it\'s time for your follow-up visit. Please book an appointment at your earliest convenience. Call: {{clinic_phone}}',
    variables: ['patient_name', 'clinic_phone'],
  },
  {
    id: '5',
    name: 'Payment Reminder',
    category: 'Billing',
    message: 'Dear {{patient_name}}, you have a pending balance of ₹{{amount}}. Please clear your dues at your next visit or pay online.',
    variables: ['patient_name', 'amount'],
  },
];

const statusConfig = {
  sent: { color: 'bg-primary/10 text-primary border-primary/30', icon: Clock },
  delivered: { color: 'bg-success/10 text-success border-success/30', icon: CheckCheck },
  read: { color: 'bg-success/10 text-success border-success/30', icon: CheckCheck },
  failed: { color: 'bg-destructive/10 text-destructive border-destructive/30', icon: Clock },
};

const typeConfig = {
  appointment: { color: 'text-primary', bgColor: 'bg-primary/10' },
  prescription: { color: 'text-success', bgColor: 'bg-success/10' },
  reminder: { color: 'text-warning', bgColor: 'bg-warning/10' },
  general: { color: 'text-muted-foreground', bgColor: 'bg-secondary' },
};

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('messages');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'appointment' | 'prescription' | 'reminder' | 'general'>('general');

  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>('/messages');
      if (res.success) {
        const list = res.data || [];
        const mapped = list.map((msg: any) => ({
          id: msg._id || msg.id,
          patient_name: msg.patientId ? `${msg.patientId.firstName} ${msg.patientId.lastName}` : 'Unknown Patient',
          patient_phone: msg.patientId?.phone || 'N/A',
          message: msg.message,
          type: msg.type || 'general',
          status: msg.status || 'sent',
          channel: msg.channel || 'whatsapp',
          sent_at: msg.sentAt || msg.createdAt || new Date().toISOString(),
        }));
        setMessages(mapped);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await apiClient.getPatients();
      if (res.success) {
        setPatients(res.data?.patients || res.data || []);
      }
    } catch (err) {
      console.error("Failed to load patients:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchPatients();
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    let text = template.message;
    const patient = patients.find(p => (p._id || p.id) === selectedPatientId);
    if (patient) {
      text = text.replace(/\{\{patient_name\}\}/g, `${patient.firstName} ${patient.lastName}`);
    } else {
      text = text.replace(/\{\{patient_name\}\}/g, 'Valued Patient');
    }
    text = text.replace(/\{\{doctor_name\}\}/g, 'Dr. Patel');
    text = text.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
    text = text.replace(/\{\{time\}\}/g, '11:00 AM');
    text = text.replace(/\{\{clinic_phone\}\}/g, '+91 99999 88888');
    text = text.replace(/\{\{amount\}\}/g, '1,500');

    setMessageText(text);

    const catLower = template.category.toLowerCase();
    if (catLower.includes('appoint')) {
      setMessageType('appointment');
    } else if (catLower.includes('presc')) {
      setMessageType('prescription');
    } else if (catLower.includes('remind')) {
      setMessageType('reminder');
    } else {
      setMessageType('general');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedPatientId || !messageText) {
      toast({
        title: 'Validation Error',
        description: 'Please select a recipient and enter a message.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await apiClient.post<any>('/messages', {
        patientId: selectedPatientId,
        message: messageText,
        type: messageType,
        channel: channel,
      });

      if (res.success) {
        setIsComposeOpen(false);
        setSelectedPatientId('');
        setMessageText('');
        setChannel('whatsapp');
        toast({
          title: 'Message Sent',
          description: 'Message has been logged and queued for delivery.',
        });
        fetchMessages();
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to send message.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await apiClient.delete<any>(`/messages/${id}`);
      if (res.success) {
        toast({
          title: 'Deleted',
          description: 'Message log deleted successfully.',
        });
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to delete message log.',
        variant: 'destructive',
      });
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = 
      msg.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Messages</h1>
            <p className="text-muted-foreground">Communication hub for WhatsApp & SMS</p>
          </div>
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground shadow-md">
                <Plus className="h-4 w-4" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Send Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p: any) => (
                        <SelectItem key={p._id || p.id} value={p._id || p.id}>
                          {p.firstName} {p.lastName} ({p.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select onValueChange={(val: any) => setChannel(val)} value={channel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Message</Label>
                    <Select onValueChange={handleSelectTemplate}>
                      <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue placeholder="Use template" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockTemplates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea 
                    placeholder="Type your message..." 
                    rows={4} 
                    value={messageText} 
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
                  <Button className="gap-2 gradient-primary text-primary-foreground" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Sent Today</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCheck className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">94%</p>
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">1,245</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockTemplates.length}</p>
              <p className="text-sm text-muted-foreground">Templates</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="messages" className="gap-1.5">
              <MessageSquare className="h-4 w-4" /> Messages
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5">
              <FileText className="h-4 w-4" /> Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-4 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
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
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredMessages.map((msg) => {
                const statusStyle = statusConfig[msg.status as keyof typeof statusConfig] || statusConfig.sent;
                const StatusIcon = statusStyle.icon;
                const typeStyle = typeConfig[msg.type as keyof typeof typeConfig] || typeConfig.general;

                return (
                  <div
                    key={msg.id}
                    className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn('p-2.5 rounded-lg', typeStyle.bgColor)}>
                        <MessageSquare className={cn('h-5 w-5', typeStyle.color)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{msg.patient_name}</p>
                              <Badge variant="outline" className="text-xs capitalize">
                                {msg.channel}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{msg.message}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {msg.patient_phone}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(msg.sent_at).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: undefined,
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={statusStyle.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedPatientId(msg.patient_id || '');
                                  setMessageText(msg.message);
                                  setChannel(msg.channel);
                                  setIsComposeOpen(true);
                                }}>
                                  <Send className="h-4 w-4 mr-2" /> Resend
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  navigator.clipboard.writeText(msg.message);
                                  toast({ title: 'Copied', description: 'Message text copied to clipboard.' });
                                }}>
                                  <Copy className="h-4 w-4 mr-2" /> Copy Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteMessage(msg.id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete Log
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Manage message templates for quick communication
              </p>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Template
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {mockTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{template.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">{template.category}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{template.message}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-4 gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
