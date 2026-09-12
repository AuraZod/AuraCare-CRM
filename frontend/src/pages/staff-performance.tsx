import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Star,
  Clock,
  ThumbsUp,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const staffMembers = [
  { name: 'Dr. Rajesh Kumar', role: 'Doctor', dept: 'Cardiology', load: 45, rating: 4.9, responseTime: '12 min' },
  { name: 'Dr. Priya Patel', role: 'Doctor', dept: 'Pediatrics', load: 52, rating: 4.8, responseTime: '15 min' },
  { name: 'Sarah Johnson', role: 'Receptionist', dept: 'Front Desk', load: 120, rating: 4.7, responseTime: '3 min' },
  { name: 'Priya Sharma', role: 'Diagnostics', dept: 'Laboratory', load: 38, rating: 4.6, responseTime: '22 min' },
  { name: 'Amit Patel', role: 'Pharmacy', dept: 'Pharmacy', load: 95, rating: 4.8, responseTime: '5 min' },
  { name: 'Dr. Vikram Singh', role: 'Doctor', dept: 'Management', load: 15, rating: 4.9, responseTime: '10 min' },
];

export default function StaffPerformance() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Staff Performance</h1>
          <p className="text-muted-foreground">Monitor performance, response times, and patient feedback ratings</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold">18 / 20</p>
                <p className="text-xs text-muted-foreground mt-1">Currently on duty</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">4.8 / 5.0</p>
                <p className="text-xs text-success mt-1">Top rated CRM this week</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">11.2 min</p>
                <p className="text-xs text-success mt-1">-1.5 min improvement</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <ThumbsUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient Satisfaction</p>
                <p className="text-2xl font-bold">96.4%</p>
                <p className="text-xs text-muted-foreground mt-1">Based on patient surveys</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Staff Directory & Performance Logs</CardTitle>
                <CardDescription>Comprehensive list of staff members with performance stats</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search staff..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Department</th>
                    <th className="pb-3 font-medium text-center">Patient Load (Weekly)</th>
                    <th className="pb-3 font-medium text-center">Avg Response Time</th>
                    <th className="pb-3 font-medium text-center">Satisfaction Rate</th>
                    <th className="pb-3 font-medium text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {staffMembers.map((staff) => (
                    <tr key={staff.name} className="hover:bg-muted/30">
                      <td className="py-4 font-medium">{staff.name}</td>
                      <td className="py-4">
                        <Badge variant="secondary">{staff.role}</Badge>
                      </td>
                      <td className="py-4">{staff.dept}</td>
                      <td className="py-4 text-center">{staff.load}</td>
                      <td className="py-4 text-center">{staff.responseTime}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 max-w-[120px] mx-auto">
                          <Progress value={staff.rating * 20} className="h-1.5" />
                          <span className="text-xs font-semibold">{(staff.rating * 20).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          ★ {staff.rating.toFixed(1)}
                        </Badge>
                      </td>
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
