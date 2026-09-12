import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  MessageSquare, 
  Mail, 
  CreditCard, 
  Cloud, 
  Database,
  Shield,
  Settings,
  CheckCircle,
  XCircle,
  ExternalLink,
  Key
} from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  isConnected: boolean;
  status: 'active' | 'inactive' | 'error';
}

export default function Integrations() {
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: '1', name: 'WhatsApp Business', description: 'Send appointment reminders and notifications via WhatsApp', icon: MessageSquare, category: 'communication', isConnected: true, status: 'active' },
    { id: '2', name: 'SMS Gateway', description: 'Send SMS notifications to patients', icon: MessageSquare, category: 'communication', isConnected: true, status: 'active' },
    { id: '3', name: 'Email Service', description: 'Send email notifications and reports', icon: Mail, category: 'communication', isConnected: true, status: 'active' },
    { id: '4', name: 'Razorpay', description: 'Accept online payments from patients', icon: CreditCard, category: 'payment', isConnected: false, status: 'inactive' },
    { id: '5', name: 'PayTM', description: 'UPI and wallet payments', icon: CreditCard, category: 'payment', isConnected: false, status: 'inactive' },
    { id: '6', name: 'Google Calendar', description: 'Sync appointments with Google Calendar', icon: Cloud, category: 'productivity', isConnected: false, status: 'inactive' },
    { id: '7', name: 'Cloud Backup', description: 'Automatic backup to cloud storage', icon: Database, category: 'storage', isConnected: true, status: 'active' },
    { id: '8', name: 'Lab Integration', description: 'Connect with external lab systems', icon: Zap, category: 'healthcare', isConnected: false, status: 'inactive' },
  ]);

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(int => {
      if (int.id === integrationId) {
        const newConnected = !int.isConnected;
        toast.success(`${int.name} ${newConnected ? 'connected' : 'disconnected'}`);
        return { ...int, isConnected: newConnected, status: newConnected ? 'active' : 'inactive' };
      }
      return int;
    }));
  };

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      active: { label: 'Active', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800', icon: XCircle },
      error: { label: 'Error', className: 'bg-red-100 text-red-800', icon: XCircle },
    };
    const c = config[status];
    const Icon = c.icon;
    return (
      <Badge className={c.className}>
        <Icon className="h-3 w-3 mr-1" />
        {c.label}
      </Badge>
    );
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'communication', label: 'Communication' },
    { id: 'payment', label: 'Payment' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'storage', label: 'Storage' },
    { id: 'healthcare', label: 'Healthcare' },
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredIntegrations = activeCategory === 'all' 
    ? integrations 
    : integrations.filter(int => int.category === activeCategory);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Integrations</h1>
            <p className="text-muted-foreground">Connect third-party services to enhance functionality</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Integrations</p>
                  <p className="text-2xl font-bold">{integrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'inactive').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Secure</p>
                  <p className="text-2xl font-bold">100%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>{cat.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        {getStatusBadge(integration.status)}
                      </div>
                    </div>
                    <Switch
                      checked={integration.isConnected}
                      onCheckedChange={() => handleToggleIntegration(integration.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleConfigure(integration)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>Enter your API credentials to connect this service</DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4">
              <div>
                <Label>API Key</Label>
                <Input type="password" placeholder="Enter API key" />
              </div>
              <div>
                <Label>API Secret</Label>
                <Input type="password" placeholder="Enter API secret" />
              </div>
              {selectedIntegration.category === 'communication' && (
                <div>
                  <Label>Sender ID / Phone Number</Label>
                  <Input placeholder="Enter sender ID" />
                </div>
              )}
              {selectedIntegration.category === 'payment' && (
                <>
                  <div>
                    <Label>Merchant ID</Label>
                    <Input placeholder="Enter merchant ID" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Test Mode</p>
                      <p className="text-sm text-muted-foreground">Use sandbox environment</p>
                    </div>
                    <Switch />
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfigDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast.success('Configuration saved');
                  setShowConfigDialog(false);
                }}>
                  <Key className="h-4 w-4 mr-2" />
                  Save & Connect
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
