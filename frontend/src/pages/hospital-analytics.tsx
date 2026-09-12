import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Users,
  Clock,
  TrendingUp,
  Download,
  Calendar,
  Building,
  Heart,
  TrendingDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const patientFlowData = [
  { name: 'Jan', outpatient: 1200, inpatient: 400, emergency: 300 },
  { name: 'Feb', outpatient: 1350, inpatient: 450, emergency: 320 },
  { name: 'Mar', outpatient: 1500, inpatient: 480, emergency: 380 },
  { name: 'Apr', outpatient: 1420, inpatient: 430, emergency: 310 },
  { name: 'May', outpatient: 1650, inpatient: 520, emergency: 400 },
  { name: 'Jun', outpatient: 1800, inpatient: 550, emergency: 420 },
];

const deptOccupancyData = [
  { name: 'Cardiology', occupancy: 88, beds: 50 },
  { name: 'Neurology', occupancy: 75, beds: 30 },
  { name: 'Pediatrics', occupancy: 62, beds: 40 },
  { name: 'Oncology', occupancy: 92, beds: 25 },
  { name: 'Orthopedics', occupancy: 70, beds: 35 },
  { name: 'ICU', occupancy: 95, beds: 20 },
];

export default function HospitalAnalytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Hospital Analytics</h1>
            <p className="text-muted-foreground">Real-time metrics, patient flow, and resource utilization</p>
          </div>
          <div className="flex gap-3">
            <Select defaultValue="6months">
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Analytics
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Patients</p>
                <p className="text-2xl font-bold">2,770</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +14.2% from last month
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bed Occupancy</p>
                <p className="text-2xl font-bold">81.4%</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +2.1% from last week
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. ER Wait Time</p>
                <p className="text-2xl font-bold">18 min</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3" /> -12.5% improvement
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                <p className="text-2xl font-bold">4.8 / 5.0</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  Based on 840 responses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Patient Flow Trend</CardTitle>
              <CardDescription>Monthly breakdown of admissions and visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={patientFlowData}>
                    <defs>
                      <linearGradient id="outpatientColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="inpatientColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(215, 60%, 50%)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(215, 60%, 50%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                    <XAxis dataKey="name" stroke="hsl(215, 15%, 50%)" />
                    <YAxis stroke="hsl(215, 15%, 50%)" />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="outpatient" name="Outpatients" stroke="hsl(173, 58%, 39%)" fillOpacity={1} fill="url(#outpatientColor)" />
                    <Area type="monotone" dataKey="inpatient" name="Inpatients" stroke="hsl(215, 60%, 50%)" fillOpacity={1} fill="url(#inpatientColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Occupancy</CardTitle>
              <CardDescription>Current bed utilization percentages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptOccupancyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                    <XAxis type="number" domain={[0, 100]} stroke="hsl(215, 15%, 50%)" />
                    <YAxis type="category" dataKey="name" stroke="hsl(215, 15%, 50%)" width={80} />
                    <Tooltip />
                    <Bar dataKey="occupancy" name="Occupancy %" fill="hsl(12, 76%, 61%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Department Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b">
                    <th className="pb-3 font-medium">Department</th>
                    <th className="pb-3 font-medium text-center">Total Beds</th>
                    <th className="pb-3 font-medium text-center">Occupancy Rate</th>
                    <th className="pb-3 font-medium text-center">Avg Length of Stay</th>
                    <th className="pb-3 font-medium text-right">Weekly Discharges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {deptOccupancyData.map((dept) => (
                    <tr key={dept.name}>
                      <td className="py-4 font-medium">{dept.name}</td>
                      <td className="py-4 text-center">{dept.beds}</td>
                      <td className="py-4 text-center">
                        <Badge variant="outline" className={dept.occupancy > 85 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-success/10 text-success border-success/20'}>
                          {dept.occupancy}%
                        </Badge>
                      </td>
                      <td className="py-4 text-center">{(3.2 + (dept.occupancy / 30)).toFixed(1)} Days</td>
                      <td className="py-4 text-right">{(dept.beds * 0.4).toFixed(0)} patients</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
