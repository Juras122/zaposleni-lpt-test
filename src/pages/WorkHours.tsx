import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { fetchUserProfile, fetchWorkHours } from '@/lib/api';
import { UserProfile, WorkHour } from '@/types';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

const WorkHours = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
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
        navigate(`/work-hours?id=${sessionUserId}`, { replace: true });
      }

      if (urlUserId) {
        sessionStorage.setItem('loggedInUserId', urlUserId);
      }

      try {
        const [profileData, workHoursData] = await Promise.all([
          fetchUserProfile(userId),
          fetchWorkHours(userId)
        ]);
        
        setProfile(profileData);
        setWorkHours(workHoursData);
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

  const totalHours = workHours.reduce((sum, wh) => {
    const hours = parseFloat(wh.stevilo) || 0;
    return sum + hours;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ProfileSidebar profile={profile} />
          
          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Evidenca delovnega časa</h1>
              <p className="mt-2 text-muted-foreground">
                Skupno ur tega meseca: <span className="font-semibold text-primary">{totalHours.toFixed(1)}h</span>
              </p>
            </div>

            <Card className="overflow-hidden shadow-elegant">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold">Datum</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Dan</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Prihod</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Odhod</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Število ur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {workHours.map((wh) => (
                      <tr key={wh.id} className="transition-smooth hover:bg-muted/30">
                        <td className="px-6 py-4 text-sm">{wh.datum}</td>
                        <td className="px-6 py-4 text-sm">{wh.dan}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            {wh.prihod}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {wh.odhod}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                            {wh.stevilo}h
                          </span>
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

export default WorkHours;
