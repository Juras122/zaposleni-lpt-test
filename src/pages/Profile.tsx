import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { PersonalStats } from '@/components/PersonalStats';
import { StatsCard } from '@/components/StatsCard';
import { Card } from '@/components/ui/card';
import { fetchUserProfile, fetchWorkHours } from '@/lib/api';
import { UserProfile, WorkHour } from '@/types';
import { Clock, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const urlUserId = searchParams.get('id');
      const sessionUserId = sessionStorage.getItem('loggedInUserId');
      const userId = urlUserId || sessionUserId;

      if (!userId) {
        toast.error('Niste prijavljeni');
        navigate('/');
        return;
      }

      // Update URL if needed
      if (!urlUserId && sessionUserId) {
        navigate(`/profile?id=${sessionUserId}`, { replace: true });
      }

      // Store in session
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
        console.error('Error loading profile:', error);
        toast.error('Napaka pri nalaganju profila');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
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

  const totalWorkHours = workHours.reduce((sum, wh) => sum + wh.stevilo, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ProfileSidebar profile={profile} />
          
          <main className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">
                Dobrodošli nazaj, <span className="text-primary">{profile.ime}</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Tukaj je pregled vaše aktivnosti in statistike
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatsCard
                title="Evidenca delovnega časa"
                value={`${totalWorkHours}h`}
                icon={Clock}
                description="Skupno število ur ta mesec"
              />
              <StatsCard
                title="Sporočila"
                value="0"
                icon={Mail}
                description="Nova sporočila"
              />
              <StatsCard
                title="Zaključene naloge"
                value="0"
                icon={CheckCircle}
                description="Ta teden"
              />
            </div>

            <Card className="p-6 shadow-elegant">
              <h2 className="mb-4 text-xl font-semibold">Podatki o profilu</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Ime</p>
                  <p className="text-base font-medium">{profile.ime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Naziv</p>
                  <p className="text-base font-medium">{profile.naziv}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base font-medium">{profile.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                  <p className="text-base font-medium">{profile.telefon}</p>
                </div>
              </div>
            </Card>

            <PersonalStats workHours={workHours} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
