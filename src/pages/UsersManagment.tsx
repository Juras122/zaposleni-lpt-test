import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ProfileSidebar } from '@/components/ProfileSidebar';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchUserProfile, fetchAllUsers } from '@/lib/api';
import { UserProfile } from '@/types';
import { Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

type SortField = 'id' | 'ime' | 'naziv' | 'email' | 'telefon';
type SortDirection = 'asc' | 'desc' | null;

const UsersManagment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('id');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [profileData, usersData] = await Promise.all([
          fetchUserProfile(userId),
          fetchAllUsers()
        ]);
        setProfile(profileData);
        setUsers(usersData);
      } catch (error) {
        console.error('Napaka pri nalaganju podatkov:', error);
        toast.error('Napaka pri nalaganju podatkov');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, navigate]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedUsers = () => {
    if (!sortField || !sortDirection) {
      return users;
    }

    return [...users].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProfileSidebar profile={profile} />
          
          <div className="flex-1">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Upravljanje uporabnikov</h2>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Ni uporabnikov v sistemu
                </p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center">
                            ID
                            {getSortIcon('id')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('ime')}
                        >
                          <div className="flex items-center">
                            Ime
                            {getSortIcon('ime')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('naziv')}
                        >
                          <div className="flex items-center">
                            Naziv
                            {getSortIcon('naziv')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center">
                            Email
                            {getSortIcon('email')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('telefon')}
                        >
                          <div className="flex items-center">
                            Telefon
                            {getSortIcon('telefon')}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSortedUsers().map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.ime}</TableCell>
                          <TableCell>{user.naziv}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.telefon}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagment;