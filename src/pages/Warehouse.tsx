import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWarehouseItems } from '@/lib/api';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Warehouse() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['warehouse'],
    queryFn: fetchWarehouseItems,
  });

  const handleAdd = () => {
    toast.info('Dodajanje elementa - v razvoju');
  };

  const handleEdit = (id: string) => {
    toast.info(`Urejanje elementa ${id} - v razvoju`);
  };

  const handleDelete = (id: string) => {
    toast.info(`Odstranjevanje elementa ${id} - v razvoju`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
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
              <div className="text-center py-8 text-muted-foreground">
                Nalaganje...
              </div>
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
                        <TableCell className="font-medium">
                          {item.serijska_koda}
                        </TableCell>
                        <TableCell>{item.ime}</TableCell>
                        <TableCell>{item.stevilo}</TableCell>
                        <TableCell>{item.enota}</TableCell>
                        <TableCell>{item.lokacija}</TableCell>
                        <TableCell>{item.datum_vnosa}</TableCell>
                        <TableCell>{item.zadnja_sprememba}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                            >
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
  );
}
