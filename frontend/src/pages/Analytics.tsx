import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  Repeat,
  Download,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const revenueData = [
  { name: 'Mon', revenue: 12500, appointments: 18 },
  { name: 'Tue', revenue: 15800, appointments: 22 },
  { name: 'Wed', revenue: 18200, appointments: 25 },
  { name: 'Thu', revenue: 14500, appointments: 20 },
  { name: 'Fri', revenue: 21000, appointments: 28 },
  { name: 'Sat', revenue: 24500, appointments: 32 },
  { name: 'Sun', revenue: 8500, appointments: 12 },
];

const monthlyData = [
  { month: 'Aug', revenue: 285000, patients: 180 },
  { month: 'Sep', revenue: 312000, patients: 195 },
  { month: 'Oct', revenue: 298000, patients: 188 },
  { month: 'Nov', revenue: 345000, patients: 220 },
  { month: 'Dec', revenue: 378000, patients: 245 },
  { month: 'Jan', revenue: 395000, patients: 268 },
];

const appointmentStatusData = [
  { name: 'Completed', value: 65, color: 'hsl(158, 64%, 42%)' },
  { name: 'Scheduled', value: 20, color: 'hsl(173, 58%, 39%)' },
  { name: 'No Show', value: 10, color: 'hsl(0, 72%, 51%)' },
  { name: 'Cancelled', value: 5, color: 'hsl(215, 15%, 50%)' },
];

const hourlyData = [
  { hour: '9AM', appointments: 8 },
  { hour: '10AM', appointments: 12 },
  { hour: '11AM', appointments: 15 },
  { hour: '12PM', appointments: 10 },
  { hour: '1PM', appointments: 4 },
  { hour: '2PM', appointments: 8 },
  { hour: '3PM', appointments: 14 },
  { hour: '4PM', appointments: 16 },
  { hour: '5PM', appointments: 12 },
  { hour: '6PM', appointments: 9 },
  { hour: '7PM', appointments: 6 },
];

const doctorPerformance = [
  { name: 'Dr. Priya Patel', patients: 145, revenue: 182500, rating: 4.9 },
  { name: 'Dr. Rajesh Gupta', patients: 128, revenue: 156000, rating: 4.8 },
  { name: 'Dr. Anita Sharma', patients: 112, revenue: 134500, rating: 4.7 },
  { name: 'Dr. Vikram Singh', patients: 98, revenue: 118000, rating: 4.6 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down';
  color: string;
}

function StatCard({ title, value, change, icon: Icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <div className={cn('flex items-center gap-1 mt-2 text-sm', trend === 'up' ? 'text-success' : 'text-destructive')}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{Math.abs(change)}%</span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">Track clinic performance and insights</p>
          </div>
          <div className="flex gap-3">
            <Select defaultValue="month">
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Monthly Revenue"
            value="₹3,95,000"
            change={12.5}
            icon={IndianRupee}
            trend="up"
            color="bg-success/10 text-success"
          />
          <StatCard
            title="Total Patients"
            value="1,247"
            change={8.2}
            icon={Users}
            trend="up"
            color="bg-primary/10 text-primary"
          />
          <StatCard
            title="Appointments"
            value="856"
            change={15.3}
            icon={Calendar}
            trend="up"
            color="bg-accent/10 text-accent"
          />
          <StatCard
            title="Avg. Wait Time"
            value="12 min"
            change={-18.5}
            icon={Clock}
            trend="up"
            color="bg-warning/10 text-warning"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-lg">Revenue Trend</h2>
                <p className="text-sm text-muted-foreground">Last 6 months performance</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </Badge>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(173, 58%, 39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" />
                  <XAxis dataKey="month" stroke="hsl(215, 15%, 50%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 50%)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(210, 20%, 88%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(173, 58%, 39%)"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="mb-6">
              <h2 className="font-display font-semibold text-lg">Appointment Status</h2>
              <p className="text-sm text-muted-foreground">This month breakdown</p>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {appointmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {appointmentStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-lg">Weekly Performance</h2>
                <p className="text-sm text-muted-foreground">Revenue & appointments</p>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" />
                  <XAxis dataKey="name" stroke="hsl(215, 15%, 50%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 50%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(210, 20%, 88%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="appointments" name="Appointments" fill="hsl(173, 58%, 39%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-lg">Peak Hours</h2>
                <p className="text-sm text-muted-foreground">Busiest times of day</p>
              </div>
              <Badge className="bg-accent/10 text-accent border-accent/30">
                <Activity className="h-3 w-3 mr-1" />
                4PM Peak
              </Badge>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 88%)" />
                  <XAxis dataKey="hour" stroke="hsl(215, 15%, 50%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 50%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(210, 20%, 88%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="hsl(12, 76%, 61%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(12, 76%, 61%)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-xl font-bold">92%</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">No-Show Rate</p>
              <p className="text-xl font-bold">8%</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Patients</p>
              <p className="text-xl font-bold">68</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Repeat className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Repeat Patient %</p>
              <p className="text-xl font-bold">74%</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-lg">Doctor Performance</h2>
              <p className="text-sm text-muted-foreground">This month's statistics</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="pb-3 font-medium">Doctor</th>
                  <th className="pb-3 font-medium text-center">Patients</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                  <th className="pb-3 font-medium text-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {doctorPerformance.map((doctor, index) => (
                  <tr key={doctor.name} className="border-b last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">{doctor.name.split(' ')[1][0]}</span>
                        </div>
                        <span className="font-medium">{doctor.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">{doctor.patients}</td>
                    <td className="py-4 text-right font-medium">₹{doctor.revenue.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        ★ {doctor.rating}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
