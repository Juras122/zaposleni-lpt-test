import { useQuery } from "@tanstack/react-query";
import { fetchAllUsers } from "@/lib/api";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const UserManagement = () => {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["allUsers"],
    queryFn: fetchAllUsers,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Upravljanje Uporabnikov</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Napaka</AlertTitle>
            <AlertDescription>
              Prišlo je do napake pri nalaganju uporabnikov. Prosimo poskusite ponovno.
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
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
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.ime}</TableCell>
                        <TableCell>{user.naziv}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.telefon}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Ni uporabnikov v sistemu.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default UserManagement;
