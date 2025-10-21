import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { fetchWarehouseItems, fetchUserProfile } from "@/lib/api";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UserProfile } from "@/types";

export default function Warehouse() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const { data: items, isLoading } = useQuery({
    queryKey: ["warehouse"],
    queryFn: fetchWarehouseItems,
  });

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

      if (!urlUserId && sessionUserId) {
        navigate(`/warehouse?id=${sessionUserId}`, { replace: true });
      }

      if (urlUserId) {
        sessionStorage.setItem('loggedInUserId', urlUserId);
      }

      try {
        const profileData = await fetchUserProfile(userId);
        setProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Napaka pri nalaganju profila');
        navigate('/');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [searchParams, navigate]);

  const handleAdd = () => {
    toast.info("Dodajanje elementa - v razvoju");
  };

  const handleEdit = (id: string) => {
    toast.info(`Urejanje elementa ${id} - v razvoju`);
  };

  const handleDelete = (id: string) => {
    toast.info(`Odstranjevanje elementa ${id} - v razvoju`);
  };

  if (isLoadingProfile) {
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

          <main className="flex-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-2xl font-bold">Skladišče</CardTitle>
                <Button onClick={handleAdd} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Dodaj
                </Button>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Nalaganje...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Serijska koda</TableHead>
                          <TableHead>Ime</TableHead>
                          <TableHead>Število</TableHead>
                          <TableHead>Enota</TableHead>
                          <TableHead>Lokacija</TableHead>
                          <TableHead>Datum vnosa</TableHead>
                          <TableHead>Zadnja sprememba</TableHead>
                          <TableHead className="text-right">Akcije</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.serijska_koda}</TableCell>
                            <TableCell>{item.ime}</TableCell>
                            <TableCell>{item.stevilo}</TableCell>
                            <TableCell>{item.enota}</TableCell>
                            <TableCell>{item.lokacija}</TableCell>
                            <TableCell>{item.datum_vnosa}</TableCell>
                            <TableCell>{item.zadnja_sprememba}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item.id)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
