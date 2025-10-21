import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { fetchWarehouseItems, fetchUserProfile } from "@/lib/api";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { UserProfile, WarehouseItem } from "@/types";

export default function Warehouse() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [sortField, setSortField] = useState<keyof WarehouseItem | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data: items, isLoading } = useQuery({
    queryKey: ["warehouse"],
    queryFn: fetchWarehouseItems,
  });

  const sortedItems = useMemo(() => {
    if (!items || !sortField) return items;
    
    return [...items].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue || '');
      const bStr = String(bValue || '');
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, 'sl');
      } else {
        return bStr.localeCompare(aStr, 'sl');
      }
    });
  }, [items, sortField, sortDirection]);

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

  const handleSort = (field: keyof WarehouseItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort('serijska_koda')}
                          >
                            <div className="flex items-center gap-2">
                              Serijska koda
                              {sortField === 'serijska_koda' && (
                                sortDirection === 'asc' ? 
                                  <ArrowUp className="h-4 w-4" /> : 
                                  <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort('ime')}
                          >
                            <div className="flex items-center gap-2">
                              Ime
                              {sortField === 'ime' && (
                                sortDirection === 'asc' ? 
                                  <ArrowUp className="h-4 w-4" /> : 
                                  <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort('stevilo')}
                          >
                            <div className="flex items-center gap-2">
                              Število
                              {sortField === 'stevilo' && (
                                sortDirection === 'asc' ? 
                                  <ArrowUp className="h-4 w-4" /> : 
                                  <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort('enota')}
                          >
                            <div className="flex items-center gap-2">
                              Enota
                              {sortField === 'enota' && (
                                sortDirection === 'asc' ? 
                                  <ArrowUp className="h-4 w-4" /> : 
                                  <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort('lokacija')}
                          >
                            <div className="flex items-center gap-2">
                              Lokacija
                              {sortField === 'lokacija' && (
                                sortDirection === 'asc' ? 
                                  <ArrowUp className="h-4 w-4" /> : 
                                  <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort('datum_vnosa')}
                          >
                            <div className="flex items-center gap-2">
                              Datum vnosa
                              {sortField === 'datum_vnosa' && (
                                sortDirection === 'asc' ? 
                                  <ArrowUp className="h-4 w-4" /> : 
                                  <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50 select-none"
                            onClick={() => handleSort('zadnja_sprememba')}
                          >
                            <div className="flex items-center gap-2">
                              Zadnja sprememba
                              {sortField === 'zadnja_sprememba' && (
                                sortDirection === 'asc' ? 
                                  <ArrowUp className="h-4 w-4" /> : 
                                  <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="text-right">Akcije</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedItems?.map((item) => (
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
