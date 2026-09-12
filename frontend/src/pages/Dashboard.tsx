import { 
  Calendar, 
  Users, 
  IndianRupee, 
  TrendingUp,
  Clock,
  UserCheck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ModulesOverview } from '@/components/dashboard/ModulesOverview';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    queueCount: 0,
    todayRevenue: 0,
    totalPatients: 0,
    repeatPatientPercentage: 0,
    avgWaitTime: 12,
    monthlyGrowth: 23
  });

  useEffect(() => {
    const fetchGeneralDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/dashboard/general');
        if (response.success && response.data) {
          setStats(prev => ({ ...prev, ...response.data.stats }));
        }
      } catch (error) {
        console.error('Failed to fetch general dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGeneralDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Good Morning, {user?.name || 'User'}! 👋</h1>
        <p className="text-muted-foreground">Here's what's happening at your clinic today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={<Calendar className="h-6 w-6 text-primary" />}
        />
        <StatsCard
          title="Patients in Queue"
          value={stats.queueCount}
          icon={<Clock className="h-6 w-6 text-primary-foreground" />}
          variant="primary"
        />
        <StatsCard
          title="Today's Revenue"
          value={`₹${(stats.todayRevenue || 0).toLocaleString()}`}
          icon={<IndianRupee className="h-6 w-6 text-accent-foreground" />}
          variant="accent"
        />
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<Users className="h-6 w-6 text-success" />}
        />
      </div>

      <div className="mb-6">
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <ModulesOverview />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <StatsCard
          title="Repeat Patients"
          value={`${stats.repeatPatientPercentage}%`}
          icon={<UserCheck className="h-6 w-6 text-success" />}
        />
        <StatsCard
          title="Avg. Wait Time"
          value={`${stats.avgWaitTime} min`}
          icon={<Clock className="h-6 w-6 text-warning" />}
        />
        <StatsCard
          title="Monthly Growth"
          value={`+${stats.monthlyGrowth}%`}
          icon={<TrendingUp className="h-6 w-6 text-success-foreground" />}
          variant="success"
        />
      </div>
    </DashboardLayout>
  );
}
