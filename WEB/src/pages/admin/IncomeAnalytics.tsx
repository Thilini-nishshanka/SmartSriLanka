import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, ChartBar } from 'lucide-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { analyticsService } from '@/services/analyticsService';
import { API_PATHS } from '@/lib/api-paths';
import { Skeleton } from '@/components/ui/skeleton';

const IncomeAnalytics = () => {
  const { data, error, isLoading } = useSWR(
    API_PATHS.ANALYTICS.INCOME_SUMMARY,
    () => analyticsService.getIncomeSummary()
  );

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Failed to load analytics data.</p>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: "Today's Income",
      value: `$${(data?.todayIncome || 0).toLocaleString()}`,
      icon: DollarSign,
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Monthly Income',
      value: `$${(data?.monthlyIncome || 0).toLocaleString()}`,
      icon: Calendar,
      trend: `${data?.monthlyGrowth || 0 >= 0 ? '+' : ''}${data?.monthlyGrowth || 0}%`,
      description: 'Compared to last month',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-500',
    },
    {
      title: 'Yearly Income',
      value: `$${(data?.yearlyIncome || 0).toLocaleString()}`,
      icon: TrendingUp,
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-500',
    },
  ];

  const monthlyBreakdown = data?.monthlyBreakdown || Array(9).fill({ month: '', income: 0 });
  const topTours = data?.topTours || Array(5).fill({ name: '', revenue: 0 });

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Income Analytics</h1>
          <p className="text-muted-foreground">Track your tour revenue and performance</p>
        </div>

        {/* Income Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-card overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} pointer-events-none`} />
                  <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    {stat.trend && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600 font-medium">{stat.trend}</span>
                        <span className="text-muted-foreground">{stat.description}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Breakdown */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar className="h-5 w-5" />
                Monthly Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading && Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
                {!isLoading && monthlyBreakdown.filter(m => m.income > 0).map((month, index) => {
                  const maxIncome = Math.max(...monthlyBreakdown.map(m => m.income), 1);
                  const widthPercent = (month.income / maxIncome) * 100 || 0;
                  return (
                    <div key={month.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <span className="text-muted-foreground">${month.income.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercent}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="h-full bg-gradient-primary rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Tours */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performing Tours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading && Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-lg" />
                ))}
                {!isLoading && topTours.map((tour, index) => (
                  <div
                    key={tour.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                          {index + 1}
                        </span>
                        <p className="font-medium text-sm truncate" title={tour.name}>{tour.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${tour.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default IncomeAnalytics;
