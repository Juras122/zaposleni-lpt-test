import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchUserProfile, fetchWorkOrderDetail } from '@/lib/api';
import { UserProfile, WorkOrderDetail } from '@/types';
import { ArrowLeft, Calendar, MapPin, Package, User, FileText } from 'lucide-react';
import { toast } from 'sonner';

const WorkOrderDetailPage = () => {
  const { serijska } = useParams<{ serijska: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orderDetail, setOrderDetail] = useState<WorkOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const urlUserId = searchParams.get('id');
      const sessionUserId = sessionStorage.getItem('loggedInUserId');
      const userId = urlUserId || sessionUserId;

      if (!userId || !serijska) {
        toast.error('Niste prijavljeni');
        navigate('/');
        return;
      }

      if (urlUserId) {
        sessionStorage.setItem('loggedInUserId', urlUserId);
      }

      try {
        const [profileData, detailData] = await Promise.all([
          fetchUserProfile(userId),
          fetchWorkOrderDetail(serijska)
        ]);
        
        setProfile(profileData);
        setOrderDetail(detailData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Napaka pri nalaganju podatkov');
        navigate('/work-orders');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [serijska, searchParams, navigate]);

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

  if (!profile || !orderDetail) {
    return null;
  }

  const userId = searchParams.get('id') || sessionStorage.getItem('loggedInUserId');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ProfileSidebar profile={profile} />
          
          <main className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/work-orders?id=${userId}`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Nazaj
              </Button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  Delovni nalog: <span className="text-primary">{orderDetail.serijska}</span>
                </h1>
                <p className="mt-2 text-xl text-muted-foreground">{orderDetail.naslov}</p>
              </div>
              <Button variant="outline">Uredi</Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6 shadow-elegant">
                <h2 className="mb-4 text-lg font-semibold">Osnovni podatki</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Naročnik</p>
                      <p className="font-medium">{orderDetail.narocnik}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Izvajalec</p>
                      <p className="font-medium">{orderDetail.izvajalec}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Lokacija</p>
                      <p className="font-medium">{orderDetail.lokacija}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-elegant">
                <h2 className="mb-4 text-lg font-semibold">Datumi in roki</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Datum razpisa</p>
                      <p className="font-medium">{orderDetail.datum_razpisa}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Rok izvedbe</p>
                      <p className="font-medium text-destructive">{orderDetail.rok_izvedbe}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-elegant">
                <h2 className="mb-4 text-lg font-semibold">Tehnični podatki</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vrsta dela</p>
                      <p className="font-medium">{orderDetail.vrsta}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Material</p>
                      <p className="font-medium">{orderDetail.material}</p>
                    </div>
                  </div>
                  {orderDetail.nacrti && (
                    <div className="flex items-start gap-3">
                      <FileText className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Načrti</p>
                        <Button variant="link" className="h-auto p-0 font-medium">
                          Prenesi {orderDetail.nacrti}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 shadow-elegant lg:col-span-2">
                <h2 className="mb-4 text-lg font-semibold">Opis dela</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {orderDetail.opis_dela}
                </p>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetailPage;
