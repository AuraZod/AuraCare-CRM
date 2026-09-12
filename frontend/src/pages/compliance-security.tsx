import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Lock,
  Activity,
  CheckCircle,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const initialLogs = [
  { time: '2026-06-09 18:05:22', user: 'Sunita Verma (admin)', action: 'update_settings', resource: 'hospital_setup', ip: '192.168.1.45', status: 'success' },
  { time: '2026-06-09 17:58:10', user: 'Dr. Rajesh Kumar (doctor)', action: 'create_prescription', resource: 'prescriptions', ip: '192.168.1.12', status: 'success' },
  { time: '2026-06-09 17:40:05', user: 'Sarah Johnson (receptionist)', action: 'create_appointment', resource: 'appointments', ip: '192.168.1.8', status: 'success' },
  { time: '2026-06-09 17:15:33', user: 'Unauthorized User', action: 'failed_login_attempt', resource: 'authentication', ip: '203.0.113.88', status: 'failed' },
  { time: '2026-06-09 16:50:11', user: 'Dr. Vikram Singh (super_admin)', action: 'create_user', resource: 'users', ip: '192.168.1.2', status: 'success' },
];

const initialSessions = [
  { id: 'SES8829', user: 'Dr. Vikram Singh', device: 'Chrome / Windows PC', ip: '192.168.1.2', location: 'Local Network', active: 'Just now' },
  { id: 'SES8830', user: 'Sunita Verma', device: 'Safari / Mac', ip: '192.168.1.45', location: 'Local Network', active: '5 mins ago' },
  { id: 'SES8831', user: 'Sarah Johnson', device: 'Firefox / Windows PC', ip: '192.168.1.8', location: 'Local Network', active: '12 mins ago' },
];

export default function ComplianceSecurity() {
  const [sessions, setSessions] = useState(initialSessions);

  const handleRevoke = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success(`Session ${id} has been successfully terminated`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Compliance & Security</h1>
            <p className="text-muted-foreground">Monitor system access logs, active sessions, and compliance metrics</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => toast.success('Security status refreshed')}>
            <RefreshCw className="h-4 w-4" />
            Refresh Log
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Status</p>
                <p className="text-2xl font-bold">Healthy</p>
                <p className="text-xs text-success mt-1">Zero vulnerabilities detected</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Encryption</p>
                <p className="text-2xl font-bold">AES-256</p>
                <p className="text-xs text-muted-foreground mt-1">SSL certificates active</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Across all devices</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance Index</p>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-success mt-1">HIPAA compliant architecture</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Real-Time Audit Trail</CardTitle>
              <CardDescription>Track all state changes, log entries, and read/write mutations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b">
                      <th className="pb-3 font-medium">Timestamp</th>
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Action</th>
                      <th className="pb-3 font-medium">IP Address</th>
                      <th className="pb-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {initialLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="py-3.5 text-xs font-mono">{log.time}</td>
                        <td className="py-3.5 text-sm font-medium">{log.user}</td>
                        <td className="py-3.5 text-sm">
                          <span className="font-mono text-xs px-1.5 py-0.5 bg-muted rounded">{log.action}</span>
                        </td>
                        <td className="py-3.5 text-sm text-muted-foreground">{log.ip}</td>
                        <td className="py-3.5 text-right">
                          <Badge variant="outline" className={log.status === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                            {log.status === 'success' ? <CheckCircle className="h-3 w-3 mr-1 inline" /> : <AlertOctagon className="h-3 w-3 mr-1 inline" />}
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Logins</CardTitle>
              <CardDescription>Device access tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{session.user}</p>
                      <p className="text-xs text-muted-foreground">{session.device}</p>
                    </div>
                    <Badge variant="secondary">{session.active}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>IP: {session.ip}</span>
                    <span>{session.location}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/10" onClick={() => handleRevoke(session.id)}>
                    Revoke Access
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
