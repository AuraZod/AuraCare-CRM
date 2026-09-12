import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const financialFlowData = [
  { month: 'Jan', revenue: 250000, expenses: 80000 },
  { month: 'Feb', revenue: 280000, expenses: 95000 },
  { month: 'Mar', revenue: 310000, expenses: 85000 },
  { month: 'Apr', revenue: 290000, expenses: 90000 },
  { month: 'May', revenue: 340000, expenses: 110000 },
  { month: 'Jun', revenue: 395000, expenses: 120000 },
];

const transactions = [
  { id: 'TXN1001', patient: 'Ramesh Kumar', service: 'Consultation + Lab Test', amount: 1200, type: 'income', status: 'paid', date: 'Jun 09, 2026' },
  { id: 'TXN1002', patient: 'Meera Sharma', service: 'Cardiology ECG', amount: 800, type: 'income', status: 'paid', date: 'Jun 09, 2026' },
  { id: 'TXN1003', patient: 'Vendor: ABC Pharma', service: 'Medicine Stock Refill', amount: 15000, type: 'expense', status: 'paid', date: 'Jun 08, 2026' },
  { id: 'TXN1004', patient: 'Arjun Singh', service: 'General consultation', amount: 500, type: 'income', status: 'pending', date: 'Jun 08, 2026' },
  { id: 'TXN1005', patient: 'Suresh Verma', service: 'Lab Diagnostic Test', amount: 2400, type: 'income', status: 'paid', date: 'Jun 07, 2026' },
];

export default function FinancialControl() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Financial Control</h1>
            <p className="text-muted-foreground">Manage hospital income, operating expenses, and cash flow</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Statement
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹3,95,000</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1 font-medium">
                  <TrendingUp className="h-3 w-3" /> +12.5% vs last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Receivables</p>
                <p className="text-2xl font-bold">₹18,450</p>
                <p className="text-xs text-muted-foreground mt-1">From 24 patients</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Operating Expenses</p>
                <p className="text-2xl font-bold">₹1,20,000</p>
                <p className="text-xs text-muted-foreground mt-1">Staff salary & supplier bills</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Margin</p>
                <p className="text-2xl font-bold">69.6%</p>
                <p className="text-xs text-success mt-1">Stable cash flow</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Visual comparison of hospital revenue and monthly operations cost</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                    <XAxis dataKey="month" stroke="hsl(215, 15%, 50%)" />
                    <YAxis stroke="hsl(215, 15%, 50%)" tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue (₹)" fill="hsl(173, 58%, 39%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses (₹)" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profitability Ratio</CardTitle>
              <CardDescription>Financial health overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Gross Profit Ratio</p>
                  <p className="text-xs text-muted-foreground">Before operating overhead</p>
                </div>
                <Badge className="bg-success/15 text-success">85.4%</Badge>
              </div>
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Operating Profit Ratio</p>
                  <p className="text-xs text-muted-foreground">Standard hospital operations</p>
                </div>
                <Badge className="bg-primary/15 text-primary">70.2%</Badge>
              </div>
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Cash Recovery Index</p>
                  <p className="text-xs text-muted-foreground">Collected vs billed revenue</p>
                </div>
                <Badge className="bg-success/15 text-success">98.1%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions Ledger</CardTitle>
            <CardDescription>History of payments, purchases, and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b">
                    <th className="pb-3 font-medium">Txn ID</th>
                    <th className="pb-3 font-medium">Party / Patient</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium text-center">Amount</th>
                    <th className="pb-3 font-medium text-center">Type</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-muted/30">
                      <td className="py-4 font-mono text-sm">{txn.id}</td>
                      <td className="py-4 font-medium">{txn.patient}</td>
                      <td className="py-4 text-sm">{txn.service}</td>
                      <td className="py-4 text-center font-semibold">₹{txn.amount.toLocaleString()}</td>
                      <td className="py-4 text-center">
                        <Badge variant="outline" className={txn.type === 'income' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                          {txn.type === 'income' ? <ArrowUpRight className="h-3 w-3 mr-1 inline" /> : <ArrowDownRight className="h-3 w-3 mr-1 inline" />}
                          {txn.type}
                        </Badge>
                      </td>
                      <td className="py-4 text-center">
                        <Badge className={txn.status === 'paid' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                          {txn.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-right text-sm text-muted-foreground">{txn.date}</td>
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
