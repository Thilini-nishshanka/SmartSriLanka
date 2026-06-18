import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Map, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import useSWR from 'swr';
import { analyticsService } from '@/services/analyticsService';
import { API_PATHS } from '@/lib/api-paths';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { data, error, isLoading } = useSWR(
    API_PATHS.ANALYTICS.DASHBOARD_SUMMARY,
    () => analyticsService.getDashboardSummary()
  );

  const stats = [
    { title: 'Total Revenue', value: `$${(data?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp },
    { title: 'Total Bookings', value: data?.totalBookings || 0, icon: Calendar },
    { title: 'Active Tours', value: data?.activeTours || 0, icon: Map },
    { title: 'Total Reviews', value: data?.totalReviews || 0, icon: MessageSquare },
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Failed to load dashboard data.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="shadow-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-7 w-1/2" />
                  </CardContent>
                </Card>
              ))
            : stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                {!isLoading && data?.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex-1 truncate pr-4">
                      <p className="font-medium truncate">Booking #{booking.id}</p>
                      <p className="text-sm text-muted-foreground truncate">{booking.serviceName}</p>
                    </div>
                    <span className="text-sm font-medium text-primary">${booking.amount.toLocaleString()}</span>
                  </div>
                ))}
                {!isLoading && data?.recentBookings.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent bookings.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                {!isLoading && data?.recentReviews.map((review) => (
                  <div key={review.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{review.userName}</p>
                      <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {review.comment}
                    </p>
                  </div>
                ))}
                {!isLoading && data?.recentReviews.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent reviews.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
