import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Microscope, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Search,
  Filter,
  Calendar,
  Wrench
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { apiClient } from "@/lib/api";


interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  status: 'operational' | 'maintenance' | 'out-of-order' | 'calibration';
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  usageHours: number;
  notes?: string;
}

const Equipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEquipment();
      if (response.success) {
        const list = response.data?.equipment || (Array.isArray(response.data) ? response.data : []);
        const formattedList = list.map((item: any) => ({
          ...item,
          id: item._id || item.id,
        }));
        setEquipment(formattedList);
        setFilteredEquipment(formattedList);
      }
    } catch (error) {
      console.error("Failed to load equipment:", error);
      toast({
        title: "Error",
        description: "Failed to load equipment. Make sure you are authenticated.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    let filtered = equipment;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredEquipment(filtered);
  }, [equipment, searchTerm, statusFilter]);

  const getStatusBadge = (status: Equipment['status']) => {
    const statusConfig = {
      operational: { color: "bg-green-500", icon: CheckCircle, text: "Operational" },
      maintenance: { color: "bg-yellow-500", icon: Clock, text: "Maintenance" },
      'out-of-order': { color: "bg-red-500", icon: AlertTriangle, text: "Out of Order" },
      calibration: { color: "bg-blue-500", icon: Settings, text: "Calibration" }
    };

    const config = statusConfig[status] || { color: "bg-gray-500", icon: Settings, text: status };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const handleAddEquipment = async (formData: FormData) => {
    try {
      const newEquipment = {
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        model: formData.get('model') as string,
        serialNumber: formData.get('serialNumber') as string,
        location: formData.get('location') as string,
        notes: formData.get('notes') as string || undefined,
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageHours: 0
      };

      const response = await apiClient.createEquipment(newEquipment);
      if (response.success) {
        setIsAddDialogOpen(false);
        toast({
          title: "Equipment Added",
          description: `${newEquipment.name} has been added successfully.`,
        });
        fetchEquipment();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add equipment.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to add equipment.",
        variant: "destructive"
      });
    }
  };

  const handleMaintenanceUpdate = async (equipmentId: string, formData: FormData) => {
    try {
      const data = {
        status: formData.get('status') as Equipment['status'],
        lastMaintenance: formData.get('lastMaintenance') as string,
        nextMaintenance: formData.get('nextMaintenance') as string,
        notes: formData.get('notes') as string || "",
      };

      const response = await apiClient.updateEquipmentMaintenance(equipmentId, data);
      if (response.success) {
        setIsMaintenanceDialogOpen(false);
        setSelectedEquipment(null);
        toast({
          title: "Equipment Updated",
          description: "Equipment status and maintenance updated successfully.",
        });
        fetchEquipment();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update equipment.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to update equipment.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Equipment Management</h1>
            <p className="text-muted-foreground">Monitor and manage medical equipment</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddEquipment(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div>
                  <Label htmlFor="name">Equipment Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Imaging">Imaging</SelectItem>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" name="model" required />
                </div>
                <div>
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input id="serialNumber" name="serialNumber" required />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" required />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" />
                </div>
                <Button type="submit" className="w-full">Add Equipment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="out-of-order">Out of Order</SelectItem>
              <SelectItem value="calibration">Calibration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground">Loading equipment list...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span>{item.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serial:</span>
                      <span>{item.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{item.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Usage:</span>
                      <span>{item.usageHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Maintenance:</span>
                      <span>{item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  
                  {item.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">{item.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedEquipment(item);
                        setIsMaintenanceDialogOpen(true);
                      }}
                    >
                      <Wrench className="w-3 h-3 mr-1" />
                      Maintenance
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Equipment Status</DialogTitle>
            </DialogHeader>
            {selectedEquipment && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleMaintenanceUpdate(selectedEquipment.id, new FormData(e.currentTarget));
              }} className="space-y-4">
                <div>
                  <Label>Equipment: {selectedEquipment.name}</Label>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedEquipment.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out-of-order">Out of Order</SelectItem>
                      <SelectItem value="calibration">Calibration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                  <Input 
                    id="lastMaintenance" 
                    name="lastMaintenance" 
                    type="date" 
                    defaultValue={selectedEquipment.lastMaintenance ? new Date(selectedEquipment.lastMaintenance).toISOString().split('T')[0] : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                  <Input 
                    id="nextMaintenance" 
                    name="nextMaintenance" 
                    type="date" 
                    defaultValue={selectedEquipment.nextMaintenance ? new Date(selectedEquipment.nextMaintenance).toISOString().split('T')[0] : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    defaultValue={selectedEquipment.notes || ""}
                  />
                </div>
                <Button type="submit" className="w-full">Update Equipment</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {!loading && filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <Microscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No equipment found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Add your first piece of equipment to get started"
              }
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Equipment;