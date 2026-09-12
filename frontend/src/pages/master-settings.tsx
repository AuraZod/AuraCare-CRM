import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ShieldAlert, Database, RefreshCw, Key } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '@/config/app-config';

export default function MasterSettings() {
  const [loading, setLoading] = useState(false);
  const [dbBackupInterval, setDbBackupInterval] = useState('daily');
  const [enableMaintenanceMode, setEnableMaintenanceMode] = useState(false);
  const [enableAuditLogAutoPurge, setEnableAuditLogAutoPurge] = useState(true);
  const prefix = config.siteName.replace(/\s+/g, '-').toUpperCase();
  const [licenseKey, setLicenseKey] = useState(`${prefix}-CORP-9928-8837-2991-X`);
  const [smsGateway, setSmsGateway] = useState('Twilio Gateway');

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Master configuration saved successfully');
    }, 800);
  };

  const handleBackup = () => {
    toast.info('Starting immediate database backup to cloud storage...');
    const filePrefix = config.siteName.replace(/\s+/g, '_').toUpperCase();
    setTimeout(() => {
      toast.success(`Backup snapshot ${filePrefix}_DB_BACKUP_20260609.tar.gz created successfully`);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Master Settings</h1>
            <p className="text-muted-foreground">Global system variables, database snapshots, and license activation</p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>

        <Tabs defaultValue="system" className="space-y-4">
          <TabsList>
            <TabsTrigger value="system">System Variables</TabsTrigger>
            <TabsTrigger value="database">Database & Backups</TabsTrigger>
            <TabsTrigger value="license">Licensing & Modules</TabsTrigger>
          </TabsList>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>Global Core Parameters</CardTitle>
                <CardDescription>Configure core system-wide settings for all hospital branches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm">System Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Restrict CRM access to Super Admins only for software updates</p>
                  </div>
                  <Switch checked={enableMaintenanceMode} onCheckedChange={setEnableMaintenanceMode} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm">Auto-Purge Audits</p>
                    <p className="text-xs text-muted-foreground">Automatically delete logs older than 180 days to save space</p>
                  </div>
                  <Switch checked={enableAuditLogAutoPurge} onCheckedChange={setEnableAuditLogAutoPurge} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms">SMS Notification Gateway</Label>
                    <Select value={smsGateway} onValueChange={setSmsGateway}>
                      <SelectTrigger id="sms"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Twilio Gateway">Twilio API Gateway</SelectItem>
                        <SelectItem value="AWS SNS">Amazon Web Services SNS</SelectItem>
                        <SelectItem value="Firebase Messaging">Firebase Cloud Messaging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select defaultValue="ist">
                      <SelectTrigger id="timezone"><SelectValue placeholder="Select Timezone" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ist">Kolkata (GMT +5:30)</SelectItem>
                        <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="est">Eastern Standard Time (GMT -5:00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Schedule system backups, download archives, and clear cached state</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Automatic Backup Schedule</Label>
                    <Select value={dbBackupInterval} onValueChange={setDbBackupInterval}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily at 02:00 AM</SelectItem>
                        <SelectItem value="weekly">Weekly on Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Active Connections</Label>
                    <Input value="12 Connected Sessions" readOnly className="bg-muted text-muted-foreground" />
                  </div>
                </div>

                <div className="p-4 border border-warning/30 bg-warning/10 rounded-lg flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-warning">Warning: Resource Intensive Operation</p>
                    <p className="text-xs text-muted-foreground">Creating a full backup snapshot packages the entire MongoDB file system. Perform this action during low traffic periods.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={handleBackup}>
                    <Database className="h-4 w-4" />
                    Back Up Now
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 text-destructive hover:bg-destructive/10" onClick={() => toast.error('Action protected by multi-factor auth')}>
                    <RefreshCw className="h-4 w-4" />
                    Clear Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="license">
            <Card>
              <CardHeader>
                <CardTitle>Software Licensing</CardTitle>
                <CardDescription>Activate premium enterprise modules and manage your registration credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="license-key">Enterprise License Key</Label>
                  <div className="flex gap-2">
                    <Input id="license-key" type="password" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} className="font-mono" />
                    <Button variant="outline" size="icon" onClick={() => toast.info('Key validated successfully')}>
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Current Plan</p>
                    <p className="font-bold text-lg text-primary">{config.siteName} Enterprise</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-muted-foreground">Expires On</p>
                    <p className="font-bold text-lg text-primary">Dec 31, 2026</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
