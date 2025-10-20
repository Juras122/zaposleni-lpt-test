import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchUserProfile, fetchWorkOrders } from '@/lib/api';
import { UserProfile, WorkOrder } from '@/types';
import { FileText, MapPin, Package } from 'lucide-react';
import { toast } from 'sonner';

const WorkOrders = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const urlUserId = searchParams.get('id');
      const sessionUserId = sessionStorage.getItem('loggedInUserId');
      const userId = urlUserId || sessionUserId;

      if (!userId) {
        toast.error('Niste prijavljeni');
        navigate('/');
        return;
      }

      if (!urlUserId && sessionUserId) {
        navigate(`/work-orders?id=${sessionUserId}`, { replace: true });
      }

      if (urlUserId) {
        sessionStorage.setItem('loggedInUserId', urlUserId);
      }

      try {
        const [profileData, ordersData] = await Promise.all([
          fetchUserProfile(userId),
          fetchWorkOrders()
        ]);
        
        setProfile(profileData);
        setWorkOrders(ordersData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Napaka pri nalaganju podatkov');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams, navigate]);

  const handleViewOrder = (serijska: string) => {
    const userId = searchParams.get('id') || sessionStorage.getItem('loggedInUserId');
    navigate(`/work-order/${serijska}?id=${userId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Nalaganje...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ProfileSidebar profile={profile} />
          
          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Pregled delovnih nalogov</h1>
              <p className="mt-2 text-muted-foreground">
                Aktivni delovni nalogi: <span className="font-semibold text-primary">{workOrders.length}</span>
              </p>
            </div>

            <Card className="overflow-hidden shadow-elegant">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold">Serijska številka</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Lokacija</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Vrsta</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Material</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Datum razpisa</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Načrt</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Akcije</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {workOrders.map((order) => (
                      <tr key={order.serijska} className="transition-smooth hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-semibold text-primary">
                            {order.serijska}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === 'aktiven' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {order.lokacija}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{order.vrsta}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {order.material}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{order.r_razpisa}</td>
                        <td className="px-6 py-4">
                          {order.nacrt && (
                            <div className="flex items-center gap-1 text-sm text-primary">
                              <FileText className="h-4 w-4" />
                              {order.nacrt}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewOrder(order.serijska)}
                          >
                            Poglej
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default WorkOrders;
