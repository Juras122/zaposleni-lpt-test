import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchUserProfile, fetchWorkOrderDetail, addWorkEntry, fetchWorkEntries } from "@/lib/api";
import { UserProfile, WorkOrderDetail, WorkEntry } from "@/types";
import { ArrowLeft, Calendar, MapPin, Package, User, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

const WorkOrderDetailPage = () => {
  const { serijska } = useParams<{ serijska: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orderDetail, setOrderDetail] = useState<WorkOrderDetail | null>(null);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [vrstaObelezbe, setVrstaObelezbe] = useState<string>("");
  const [dolzina, setDolzina] = useState("");
  const [steviloElementov, setSteviloElementov] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const urlUserId = searchParams.get("id");
      const sessionUserId = sessionStorage.getItem("loggedInUserId");
      const userId = urlUserId || sessionUserId;

      if (!userId || !serijska) {
        toast.error("Niste prijavljeni");
        navigate("/");
        return;
      }

      if (urlUserId) {
        sessionStorage.setItem("loggedInUserId", urlUserId);
      }

      try {
        const [profileData, detailData] = await Promise.all([fetchUserProfile(userId), fetchWorkOrderDetail(serijska)]);

        setProfile(profileData);
        setOrderDetail(detailData);

        // Pridobi work entries
        try {
          const entriesData = await fetchWorkEntries(serijska);
          setWorkEntries(entriesData);
        } catch (entriesError) {
          console.warn("Could not load work entries:", entriesError);
          setWorkEntries([]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Napaka pri nalaganju podatkov");
        navigate("/work-orders");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [serijska, searchParams, navigate]);

  const handleAddPopis = async () => {
    if (!vrstaObelezbe) {
      toast.error("Prosim izberite vrsto označbe");
      return;
    }

    if (!serijska) {
      toast.error("Napaka: Manjka ID delovnega naloga");
      return;
    }

    // Validacija glede na vrsto označbe
    if (vrstaObelezbe === "STOP" && !dolzina) {
      toast.error("Prosim vnesite dolžino");
      return;
    }

    if (vrstaObelezbe === "STOP (0,5x0,3)" && !steviloElementov) {
      toast.error("Prosim vnesite število elementov");
      return;
    }

    if (
      (vrstaObelezbe === "PREHOD ZA PEŠCE (NAVADEN)" || vrstaObelezbe === "PREHOD ZA PEŠCE (KOCKE)") &&
      (!dolzina || !steviloElementov)
    ) {
      toast.error("Prosim vnesite dolžino in število elementov");
      return;
    }

    setIsSaving(true);

    try {
      const newEntry = await addWorkEntry({
        workOrderId: serijska,
        nazivElementa: vrstaObelezbe,
        dolzina: dolzina || undefined,
        stElementov: steviloElementov || undefined,
      });

      setWorkEntries([newEntry, ...workEntries]);
      toast.success("Popis dela uspešno dodan");

      // Reset form
      setVrstaObelezbe("");
      setDolzina("");
      setSteviloElementov("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding work entry:", error);
      toast.error("Napaka pri shranjevanju popisa dela");
    } finally {
      setIsSaving(false);
    }
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

  if (!profile || !orderDetail) {
    return null;
  }

  const userId = searchParams.get("id") || sessionStorage.getItem("loggedInUserId");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto p-4 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ProfileSidebar profile={profile} />

          <main className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(`/work-orders?id=${userId}`)} className="gap-2">
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
                      <p className="font-medium">{orderDetail.d_razpisa}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Datum razpisa (rok)</p>
                      <p className="font-medium text-destructive">{orderDetail.r_razpisa}</p>
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
                  {orderDetail.nacrt && (
                    <div className="flex items-start gap-3">
                      <FileText className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Načrt</p>
                        <Button variant="link" className="h-auto p-0 font-medium">
                          Prenesi {orderDetail.nacrt}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 shadow-elegant lg:col-span-2">
                <h2 className="mb-4 text-lg font-semibold">Opis dela</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{orderDetail.opis}</p>
              </Card>

              <Card className="p-6 shadow-elegant lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Popis dela</h2>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Dodaj
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Dodaj popis</DialogTitle>
                        <DialogDescription>Izberi vrsto označbe</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Select value={vrstaObelezbe} onValueChange={setVrstaObelezbe}>
                            <SelectTrigger>
                              <SelectValue placeholder="Izberite vrsto označbe" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STOP">STOP</SelectItem>
                              <SelectItem value="STOP (0,5x0,3)">STOP (0,5x0,3)</SelectItem>
                              <SelectItem value="PREHOD ZA PEŠCE (NAVADEN)">PREHOD ZA PEŠCE (NAVADEN)</SelectItem>
                              <SelectItem value="PREHOD ZA PEŠCE (KOCKE)">PREHOD ZA PEŠCE (KOCKE)</SelectItem>
                              <SelectItem value="GRBINA (VELIKA)">GRBINA (VELIKA)</SelectItem>
                              <SelectItem value="GRBINA (MALA)">GRBINA (MALA)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {vrstaObelezbe === "STOP" && (
                          <div className="grid gap-2">
                            <Label htmlFor="dolzina">Dolžina (m)</Label>
                            <Input
                              id="dolzina"
                              type="number"
                              step="0.01"
                              placeholder="Vnesite dolžino"
                              value={dolzina}
                              onChange={(e) => setDolzina(e.target.value)}
                            />
                          </div>
                        )}

                        {(vrstaObelezbe === "STOP (0,5x0,3)" || 
                          vrstaObelezbe === "GRBINA (VELIKA)"||)
                          vrstaObelezbe === "GRBINA (MALA)"||)&& (
                          <div className="grid gap-2">
                            <Label htmlFor="steviloElementov">Število elementov</Label>
                            <Input
                              id="steviloElementov"
                              type="number"
                              placeholder="Vnesite število elementov"
                              value={steviloElementov}
                              onChange={(e) => setSteviloElementov(e.target.value)}
                            />
                          </div>
                        )}

                        {(vrstaObelezbe === "PREHOD ZA PEŠCE (NAVADEN)" ||
                          vrstaObelezbe === "PREHOD ZA PEŠCE (KOCKE)") && (
                          <>
                            <div className="grid gap-2">
                              <Label htmlFor="dolzina">Dolžina (m)</Label>
                              <Input
                                id="dolzina"
                                type="number"
                                step="0.01"
                                placeholder="Vnesite dolžino"
                                value={dolzina}
                                onChange={(e) => setDolzina(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="steviloElementov">Število elementov</Label>
                              <Input
                                id="steviloElementov"
                                type="number"
                                placeholder="Vnesite število elementov"
                                value={steviloElementov}
                                onChange={(e) => setSteviloElementov(e.target.value)}
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                          Prekliči
                        </Button>
                        <Button onClick={handleAddPopis} disabled={isSaving}>
                          {isSaving ? "Shranjevanje..." : "Shrani"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {workEntries.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vrsta označbe</TableHead>
                          <TableHead>Dolžina (m)</TableHead>
                          <TableHead>Število elementov</TableHead>
                          <TableHead>Datum vnosa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.naziv_elementa}</TableCell>
                            <TableCell>{entry.dolzina || "-"}</TableCell>
                            <TableCell>{entry.st_elemtov || "-"}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(entry.datum_vnosa).toLocaleDateString("sl-SI", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ni še nobenega vpisa. Dodajte prvi popis dela.
                  </p>
                )}
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetailPage;
