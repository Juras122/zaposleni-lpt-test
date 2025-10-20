import { useQuery } from '@tanstack/react-query';
import { fetchAllUsers } from '@/lib/api';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users } from 'lucide-react';

export default function UserManagement() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['allUsers'],
    queryFn: fetchAllUsers,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Upravljanje uporabnikov</h1>
          </div>
          <p className="text-muted-foreground">
            Pregled vseh uporabnikov sistema
          </p>
        </div>

        <Card className="shadow-elegant">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-destructive">
              Napaka pri nalaganju uporabnikov: {(error as Error).message}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Ime</TableHead>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.ime}</TableCell>
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
      </main>
    </div>
  );
}
