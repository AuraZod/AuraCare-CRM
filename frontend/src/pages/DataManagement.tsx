import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  HardDrive,
  Cloud,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Backup {
  id: string;
  name: string;
  size: string;
  date: string;
  type: 'auto' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
}

interface StorageStats {
  totalSize: number;
  backupSize: number;
  categories: {
    patients: number;
    appointments: number;
    prescriptions: number;
    testorders: number;
    invoices: number;
    inventory: number;
    equipment: number;
    sessions: number;
    auditlogs: number;
    users: number;
  };
  summary: {
    totalCollections: number;
    totalDocuments: number;
    averageDocumentSize: number;
  };
}

interface RetentionSettings {
  patientRecords: string;
  backupFiles: string;
  auditLogs: string;
  sessions: string;
  appointments: string;
  prescriptions: string;
}

export default function DataManagement() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  
  const [backups, setBackups] = useState<Backup[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [retentionSettings, setRetentionSettings] = useState<RetentionSettings | null>(null);
  
  const [exportDataType, setExportDataType] = useState('all');
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [storageResponse, backupsResponse, retentionResponse] = await Promise.all([
        api.getStorageStats(),
        api.getBackups(),
        api.getRetentionSettings()
      ]);

      if (storageResponse.success) {
        setStorageStats(storageResponse.data);
      }

      if (backupsResponse.success) {
        setBackups(backupsResponse.data);
      }

      if (retentionResponse.success) {
        setRetentionSettings(retentionResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data management information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.exportData({
        dataType: exportDataType,
        format: exportFormat
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (response.success) {
        toast.success(`Data exported successfully as ${exportFormat.toUpperCase()}`);
        
        if (response.fileName) {
          await api.downloadExportedFile(response.fileName);
        }
        
        setShowExportDialog(false);
      } else {
        throw new Error(response.message || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const response = await api.createBackup({ type: 'manual' });
      
      if (response.success) {
        toast.success('Backup created successfully');
        setBackups(prev => [response.data, ...prev]);
      } else {
        throw new Error(response.message || 'Backup failed');
      }
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) return;
    
    try {
      const response = await api.deleteBackup(backupId);
      
      if (response.success) {
        setBackups(prev => prev.filter(b => b.id !== backupId));
        toast.success('Backup deleted successfully');
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete backup error:', error);
      toast.error('Failed to delete backup');
    }
  };

  const handleRestoreBackup = (backup: Backup) => {
    if (!confirm(`Are you sure you want to restore from ${backup.name}? This will overwrite current data.`)) return;
    toast.info('Restore functionality will be implemented in a future update');
  };

  const handleRetentionUpdate = async (field: keyof RetentionSettings, value: string) => {
    if (!retentionSettings) return;
    
    const updatedSettings = { ...retentionSettings, [field]: value };
    
    try {
      const response = await api.updateRetentionSettings(updatedSettings);
      
      if (response.success) {
        setRetentionSettings(updatedSettings);
        toast.success('Retention settings updated');
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Retention update error:', error);
      toast.error('Failed to update retention settings');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading data management...</span>
        </div>
      </DashboardLayout>
    );
  }

  const totalStorageGB = storageStats?.totalSize || 0;
  const usedStorageGB = Object.values(storageStats?.categories || {}).reduce((sum, val) => sum + val, 0) / 1024;
  const storageUsagePercent = totalStorageGB > 0 ? (usedStorageGB / totalStorageGB) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Data Management</h1>
            <p className="text-muted-foreground">Backup, export, and manage your hospital data</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleBackup} disabled={isCreatingBackup}>
              {isCreatingBackup ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              {isCreatingBackup ? 'Creating...' : 'Backup Now'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>Current storage consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      {usedStorageGB.toFixed(2)} GB used of {totalStorageGB.toFixed(2)} GB
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {storageUsagePercent.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={storageUsagePercent} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Patient Data</span>
                    </div>
                    <p className="text-lg font-bold">
                      {((storageStats?.categories.patients || 0) / 1024).toFixed(2)} GB
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Appointments</span>
                    </div>
                    <p className="text-lg font-bold">
                      {((storageStats?.categories.appointments || 0) / 1024).toFixed(2)} GB
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Backups</span>
                    </div>
                    <p className="text-lg font-bold">
                      {(storageStats?.backupSize || 0).toFixed(2)} GB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  <span>Cloud Sync</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Encryption</span>
                </div>
                <Badge className="bg-green-100 text-green-800">AES-256</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span>Last Backup</span>
                </div>
                <span className="text-sm">
                  {backups.length > 0 
                    ? new Date(backups[0].date).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-orange-600" />
                  <span>Total Records</span>
                </div>
                <span className="text-sm font-medium">
                  {storageStats?.summary.totalDocuments.toLocaleString() || '0'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Backup History</CardTitle>
                <CardDescription>Manage your data backups</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No backups found. Create your first backup to get started.
                </div>
              ) : (
                backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{backup.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{new Date(backup.date).toLocaleString()}</span>
                          <span>•</span>
                          <span>{backup.size}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {backup.type === 'auto' ? 'Automatic' : 'Manual'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {backup.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleRestoreBackup(backup)}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive" 
                        onClick={() => handleDeleteBackup(backup.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention Policy</CardTitle>
            <CardDescription>Configure how long data is retained</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <Label>Patient Records</Label>
                <Select 
                  value={retentionSettings?.patientRecords || 'forever'} 
                  onValueChange={(value) => handleRetentionUpdate('patientRecords', value)}
                >
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="5years">5 Years</SelectItem>
                    <SelectItem value="10years">10 Years</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 border rounded-lg">
                <Label>Backup Files</Label>
                <Select 
                  value={retentionSettings?.backupFiles || '30days'} 
                  onValueChange={(value) => handleRetentionUpdate('backupFiles', value)}
                >
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 Days</SelectItem>
                    <SelectItem value="30days">30 Days</SelectItem>
                    <SelectItem value="90days">90 Days</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 border rounded-lg">
                <Label>Audit Logs</Label>
                <Select 
                  value={retentionSettings?.auditLogs || '1year'} 
                  onValueChange={(value) => handleRetentionUpdate('auditLogs', value)}
                >
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">30 Days</SelectItem>
                    <SelectItem value="90days">90 Days</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>Choose what data to export and format</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Data Type</Label>
              <Select value={exportDataType} onValueChange={setExportDataType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data</SelectItem>
                  <SelectItem value="patients">Patients Only</SelectItem>
                  <SelectItem value="appointments">Appointments Only</SelectItem>
                  <SelectItem value="billing">Billing Only</SelectItem>
                  <SelectItem value="prescriptions">Prescriptions Only</SelectItem>
                  <SelectItem value="inventory">Inventory Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isExporting && (
              <div>
                <Label>Export Progress</Label>
                <Progress value={exportProgress} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{exportProgress}% complete</p>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowExportDialog(false)} 
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>Upload a file to import data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop your file here, or click to browse</p>
              <Input type="file" className="max-w-xs mx-auto" accept=".csv,.xlsx,.json" />
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">Importing data will merge with existing records. Duplicates will be skipped.</p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}