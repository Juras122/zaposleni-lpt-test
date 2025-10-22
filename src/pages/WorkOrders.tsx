import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Header } from "@/components/Header";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchUserProfile, fetchWorkOrders, createWorkOrder } from "@/lib/api";
import { UserProfile, WorkOrder } from "@/types";
import { MapPin, Package, ArrowUpDown, ArrowUp, ArrowDown, Plus } from "lucide-react";
import { toast } from "sonner";

const workOrderSchema = z.object({
  serijska: z.string().min(1, "Serijska številka je obvezna"),
  naslov: z.string().min(1, "Naslov je obvezen"),
  narocnik: z.string().optional(),
  izvajalec: z.string().optional(),
  status: z.enum(["aktiven", "zakljucen", "preklican", "cakanje", "vpripravi"], {
    required_error: "Status je obvezen",
  }),
  lokacija: z.string().optional(),
  vrsta: z.string().optional(),
  material: z.string().optional(),
  d_razpisa: z.string().optional(),
  r_razpisa: z.string().optional(),
  opis: z.string().optional(),
  nacrt: z.string().optional(),
});

type SortField = "serijska" | "status" | "lokacija" | "vrsta" | "material" | "r_razpisa";
type SortDirection = "asc" | "desc" | null;

const WorkOrders = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof workOrderSchema>>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      serijska: "",
      naslov: "",
      narocnik: "",
      izvajalec: "",
      status: "aktiven",
      lokacija: "",
      vrsta: "",
      material: "",
      d_razpisa: "",
      r_razpisa: "",
      opis: "",
      nacrt: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const urlUserId = searchParams.get("id");
      const sessionUserId = sessionStorage.getItem("loggedInUserId");
      const userId = urlUserId || sessionUserId;

      if (!userId) {
        toast.error("Niste prijavljeni");
        navigate("/");
        return;
      }

      if (!urlUserId && sessionUserId) {
        navigate(`/work-orders?id=${sessionUserId}`, { replace: true });
      }

      if (urlUserId) {
        sessionStorage.setItem("loggedInUserId", urlUserId);
      }

      try {
        const [profileData, ordersData] = await Promise.all([fetchUserProfile(userId), fetchWorkOrders()]);

        setProfile(profileData);
        setWorkOrders(ordersData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Napaka pri nalaganju podatkov");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams, navigate]);

  const handleViewOrder = (serijska: string) => {
    const userId = searchParams.get("id") || sessionStorage.getItem("loggedInUserId");
    navigate(`/work-order/${serijska}?id=${userId}`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedOrders = () => {
    if (!sortField || !sortDirection) {
      return workOrders;
    }

    return [...workOrders].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Convert date strings to comparable format (DD.MM.YYYY to YYYY-MM-DD)
      if (sortField === "r_razpisa") {
        const aDate = aValue.split(".").reverse().join("-");
        const bDate = bValue.split(".").reverse().join("-");
        aValue = aDate;
        bValue = bDate;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const onSubmit = async (data: z.infer<typeof workOrderSchema>) => {
    try {
      setIsSubmitting(true);
      await createWorkOrder({
        serijska: data.serijska,
        naslov: data.naslov,
        status: data.status,
        narocnik: data.narocnik,
        izvajalec: data.izvajalec,
        lokacija: data.lokacija,
        vrsta: data.vrsta,
        material: data.material,
        d_razpisa: data.d_razpisa,
        r_razpisa: data.r_razpisa,
        opis: data.opis,
        nacrt: data.nacrt,
      });
      toast.success("Delovni nalog uspešno ustvarjen");
      setIsDialogOpen(false);
      form.reset();

      // Refresh seznam
      const ordersData = await fetchWorkOrders();
      setWorkOrders(ordersData);
    } catch (error) {
      console.error("Error creating work order:", error);
      toast.error("Napaka pri kreiranju delovnega naloga");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "aktiven":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cakanje":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "vpripravi":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "zakljucen":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      case "preklican":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "aktiven": return "Aktiven";
      case "cakanje": return "Čakanje";
      case "vpripravi": return "V pripravi";
      case "zakljucen": return "Zaključen";
      case "preklican": return "Preklican";
      default: return status;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Pregled delovnih nalogov</h1>
                <p className="mt-2 text-muted-foreground">
                  Aktivni delovni nalogi: <span className="font-semibold text-primary">{workOrders.length}</span>
                </p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj delovni nalog
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nov delovni nalog</DialogTitle>
                    <DialogDescription>Izpolnite podatke za nov delovni nalog</DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="serijska"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Serijska številka *</FormLabel>
                              <FormControl>
                                <Input placeholder="RDN-2024-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Izberite status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="aktiven">Aktiven</SelectItem>
                                  <SelectItem value="zakljucen">Zaključen</SelectItem>
                                  <SelectItem value="preklican">Preklican</SelectItem>
                                  <SelectItem value="cakanje">Čakanje</SelectItem>
                                  <SelectItem value="vpripravi">V pripravi</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="naslov"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Naslov *</FormLabel>
                            <FormControl>
                              <Input placeholder="Naslov delovnega naloga" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="narocnik"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Naročnik</FormLabel>
                              <FormControl>
                                <Input placeholder="Ime naročnika" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="izvajalec"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Izvajalec</FormLabel>
                              <FormControl>
                                <Input placeholder="Ime izvajalca" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="lokacija"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lokacija</FormLabel>
                              <FormControl>
                                <Input placeholder="Lokacija" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vrsta"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vrsta</FormLabel>
                              <FormControl>
                                <Input placeholder="Vrsta" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="material"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Material</FormLabel>
                            <FormControl>
                              <Input placeholder="Material" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="d_razpisa"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Datum razpisa</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="r_razpisa"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rok razpisa</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="opis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Opis</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Opis delovnega naloga" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nacrt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Načrt (URL)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            form.reset();
                          }}
                          disabled={isSubmitting}
                        >
                          Prekliči
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Dodajanje..." : "Dodaj delovni nalog"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="overflow-hidden shadow-elegant">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-smooth"
                        onClick={() => handleSort("serijska")}
                      >
                        <div className="flex items-center">
                          Serijska številka
                          <SortIcon field="serijska" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-smooth"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon field="status" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-smooth"
                        onClick={() => handleSort("lokacija")}
                      >
                        <div className="flex items-center">
                          Lokacija
                          <SortIcon field="lokacija" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-smooth"
                        onClick={() => handleSort("vrsta")}
                      >
                        <div className="flex items-center">
                          Vrsta
                          <SortIcon field="vrsta" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-smooth"
                        onClick={() => handleSort("material")}
                      >
                        <div className="flex items-center">
                          Material
                          <SortIcon field="material" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-muted/70 transition-smooth"
                        onClick={() => handleSort("r_razpisa")}
                      >
                        <div className="flex items-center">
                          Datum razpisa
                          <SortIcon field="r_razpisa" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Akcije</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {getSortedOrders().map((order) => (
                      <tr key={order.serijska} className="transition-smooth hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-semibold text-primary">{order.serijska}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
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
                        <td className="px-6 py-4 text-right">
                          <Button size="sm" variant="outline" onClick={() => handleViewOrder(order.serijska)}>
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
