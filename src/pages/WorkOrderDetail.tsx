import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProfileSidebar } from "@/components/ProfileSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { fetchUserProfile, fetchWorkOrderDetail, addWorkEntry, fetchWorkEntries, updateWorkOrder, deleteWorkOrder, updateWorkEntry, deleteWorkEntry } from "@/lib/api";
import { UserProfile, WorkOrderDetail, WorkEntry } from "@/types";
import { ArrowLeft, Calendar, MapPin, Package, User, FileText, Plus, Pencil, Trash2, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const WorkOrderDetailPage = () => {
  const { serijska } = useParams<{ serijska: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orderDetail, setOrderDetail] = useState<WorkOrderDetail | null>(null);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditEntryDialogOpen, setIsEditEntryDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [vrstaObelezbe, setVrstaObelezbe] = useState<string>("");
  const [dolzina, setDolzina] = useState("");
  const [steviloElementov, setSteviloElementov] = useState("");
  const [currentEntry, setCurrentEntry] = useState<WorkEntry | null>(null);
  
  // Edit form states
  const [editNaslov, setEditNaslov] = useState("");
  const [editNarocnik, setEditNarocnik] = useState("");
  const [editIzvajalec, setEditIzvajalec] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editLokacija, setEditLokacija] = useState("");
  const [editVrsta, setEditVrsta] = useState("");
  const [editMaterial, setEditMaterial] = useState("");
  const [editDRazpisa, setEditDRazpisa] = useState("");
  const [editRRazpisa, setEditRRazpisa] = useState("");
  const [editOpis, setEditOpis] = useState("");

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

  const handleOpenEditDialog = () => {
    if (orderDetail) {
      setEditNaslov(orderDetail.naslov);
      setEditNarocnik(orderDetail.narocnik);
      setEditIzvajalec(orderDetail.izvajalec);
      setEditStatus(orderDetail.status);
      setEditLokacija(orderDetail.lokacija);
      setEditVrsta(orderDetail.vrsta);
      setEditMaterial(orderDetail.material);
      setEditDRazpisa(orderDetail.d_razpisa);
      setEditRRazpisa(orderDetail.r_razpisa);
      setEditOpis(orderDetail.opis);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateWorkOrder = async () => {
    if (!serijska) {
      toast.error("Napaka: Manjka ID delovnega naloga");
      return;
    }

    if (!editNaslov.trim()) {
      toast.error("Prosim vnesite naslov");
      return;
    }

    setIsSaving(true);

    try {
      const updatedOrder = await updateWorkOrder(serijska, {
        naslov: editNaslov,
        narocnik: editNarocnik,
        izvajalec: editIzvajalec,
        status: editStatus,
        lokacija: editLokacija,
        vrsta: editVrsta,
        material: editMaterial,
        d_razpisa: editDRazpisa,
        r_razpisa: editRRazpisa,
        opis: editOpis,
      });

      setOrderDetail(updatedOrder);
      toast.success("Delovni nalog uspešno posodobljen");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating work order:", error);
      toast.error("Napaka pri posodabljanju delovnega naloga");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkOrder = async () => {
    if (!serijska) {
      toast.error("Napaka: Manjka ID delovnega naloga");
      return;
    }

    setIsDeleting(true);

    try {
      await deleteWorkOrder(serijska);
      toast.success("Delovni nalog uspešno izbrisan");
      navigate(`/work-orders?id=${userId}`);
    } catch (error) {
      console.error("Error deleting work order:", error);
      toast.error("Napaka pri brisanju delovnega naloga");
    } finally {
      setIsDeleting(false);
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

  const handleOpenEditEntryDialog = (entry: WorkEntry) => {
    setCurrentEntry(entry);
    setVrstaObelezbe(entry.naziv_elementa);
    setDolzina(entry.dolzina || "");
    setSteviloElementov(entry.st_elemtov || "");
    setIsEditEntryDialogOpen(true);
  };

  const handleUpdateEntry = async () => {
    if (!currentEntry) {
      toast.error("Napaka: Ni izbranega vnosa");
      return;
    }

    if (!vrstaObelezbe) {
      toast.error("Prosim izberite vrsto označbe");
      return;
    }

    setIsSaving(true);

    try {
      const updatedEntry = await updateWorkEntry(currentEntry.id, {
        nazivElementa: vrstaObelezbe,
        dolzina: dolzina || undefined,
        stElementov: steviloElementov || undefined,
      });

      setWorkEntries(workEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
      toast.success("Popis dela uspešno posodobljen");

      // Reset form
      setVrstaObelezbe("");
      setDolzina("");
      setSteviloElementov("");
      setCurrentEntry(null);
      setIsEditEntryDialogOpen(false);
    } catch (error) {
      console.error("Error updating work entry:", error);
      toast.error("Napaka pri posodabljanju popisa dela");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    setIsDeleting(true);

    try {
      await deleteWorkEntry(entryId);
      setWorkEntries(workEntries.filter(e => e.id !== entryId));
      toast.success("Popis dela uspešno izbrisan");
    } catch (error) {
      console.error("Error deleting work entry:", error);
      toast.error("Napaka pri brisanju popisa dela");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportToPDF = () => {
    if (!orderDetail) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // NASLOV DOKUMENTA
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('POPIS DELA - DELOVNI NALOG', pageWidth / 2, 20, { align: 'center' });
    
    // Serijska številka
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text(orderDetail.serijska, pageWidth / 2, 30, { align: 'center' });
    
    // Reset barve
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    // OSNOVNI PODATKI
    let yPosition = 45;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Osnovni podatki', 14, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const basicInfo = [
      ['Naslov:', orderDetail.naslov],
      ['Naročnik:', orderDetail.narocnik || '-'],
      ['Izvajalec:', orderDetail.izvajalec || '-'],
      ['Status:', getStatusLabel(orderDetail.status)],
      ['Lokacija:', orderDetail.lokacija || '-'],
      ['Vrsta dela:', orderDetail.vrsta || '-'],
      ['Material:', orderDetail.material || '-'],
      ['Datum razpisa:', orderDetail.d_razpisa || '-'],
      ['Rok razpisa:', orderDetail.r_razpisa || '-'],
    ];
    
    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: basicInfo,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    // OPIS DELA
    if (orderDetail.opis) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Opis dela', 14, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitOpis = doc.splitTextToSize(orderDetail.opis, pageWidth - 28);
      doc.text(splitOpis, 14, yPosition);
      yPosition += (splitOpis.length * 5) + 10;
    }
    
    // Nova stran če je premalo prostora
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    // TABELA WORK ENTRIES
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Popis dela', 14, yPosition);
    yPosition += 8;
    
    if (workEntries.length > 0) {
      const tableData = workEntries.map((entry, index) => [
        (index + 1).toString(),
        entry.naziv_elementa,
        entry.dolzina || '-',
        entry.st_elemtov || '-',
        new Date(entry.datum_vnosa).toLocaleDateString('sl-SI')
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['#', 'Vrsta označbe', 'Dolžina (m)', 'Št. elementov', 'Datum vnosa']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 60 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 30 },
          4: { halign: 'center', cellWidth: 35 }
        },
        margin: { left: 14, right: 14 }
      });
      
      // Skupno število elementov in dolžin
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      
      const totalDolzina = workEntries
        .filter(e => e.dolzina)
        .reduce((sum, e) => sum + parseFloat(e.dolzina!), 0)
        .toFixed(2);
        
      const totalElementov = workEntries
        .filter(e => e.st_elemtov)
        .reduce((sum, e) => sum + parseInt(e.st_elemtov!), 0);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Skupna dolžina: ${totalDolzina} m`, 14, yPosition);
      doc.text(`Skupno število elementov: ${totalElementov}`, 14, yPosition + 7);
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Ni še nobenega vnosa.', 14, yPosition);
    }
    
    // FOOTER
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      const footerText = `Generiran: ${new Date().toLocaleString('sl-SI')} | Stran ${i} od ${pageCount}`;
      doc.text(footerText, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }
    
    // Shrani PDF
    const fileName = `popis-dela-${orderDetail.serijska}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success('PDF uspešno izvožen');
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleOpenEditDialog} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Uredi
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Izbriši
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ste prepričani?</AlertDialogTitle>
                      <AlertDialogDescription>
                        To dejanje je nepovratno. Delovni nalog bo trajno izbrisan iz evidence.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Prekliči</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteWorkOrder} disabled={isDeleting}>
                        {isDeleting ? "Brisanje..." : "Izbriši"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Uredi delovni nalog</DialogTitle>
                  <DialogDescription>Posodobite podatke delovnega naloga</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-naslov">Naslov *</Label>
                    <Input
                      id="edit-naslov"
                      value={editNaslov}
                      onChange={(e) => setEditNaslov(e.target.value)}
                      placeholder="Vnesite naslov"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-narocnik">Naročnik</Label>
                    <Input
                      id="edit-narocnik"
                      value={editNarocnik}
                      onChange={(e) => setEditNarocnik(e.target.value)}
                      placeholder="Vnesite naročnika"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-izvajalec">Izvajalec</Label>
                    <Input
                      id="edit-izvajalec"
                      value={editIzvajalec}
                      onChange={(e) => setEditIzvajalec(e.target.value)}
                      placeholder="Vnesite izvajalca"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status *</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Izberite status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="aktiven">Aktiven</SelectItem>
                        <SelectItem value="zakljucen">Zaključen</SelectItem>
                        <SelectItem value="preklican">Preklican</SelectItem>
                        <SelectItem value="cakanje">Čakanje</SelectItem>
                        <SelectItem value="vpripravi">V pripravi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-lokacija">Lokacija</Label>
                    <Input
                      id="edit-lokacija"
                      value={editLokacija}
                      onChange={(e) => setEditLokacija(e.target.value)}
                      placeholder="Vnesite lokacijo"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-vrsta">Vrsta dela</Label>
                    <Input
                      id="edit-vrsta"
                      value={editVrsta}
                      onChange={(e) => setEditVrsta(e.target.value)}
                      placeholder="Vnesite vrsto dela"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-material">Material</Label>
                    <Input
                      id="edit-material"
                      value={editMaterial}
                      onChange={(e) => setEditMaterial(e.target.value)}
                      placeholder="Vnesite material"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-d-razpisa">Datum razpisa</Label>
                    <Input
                      id="edit-d-razpisa"
                      type="date"
                      value={editDRazpisa}
                      onChange={(e) => setEditDRazpisa(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-r-razpisa">Rok razpisa</Label>
                    <Input
                      id="edit-r-razpisa"
                      type="date"
                      value={editRRazpisa}
                      onChange={(e) => setEditRRazpisa(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-opis">Opis dela</Label>
                    <Textarea
                      id="edit-opis"
                      value={editOpis}
                      onChange={(e) => setEditOpis(e.target.value)}
                      placeholder="Vnesite opis dela"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                    Prekliči
                  </Button>
                  <Button onClick={handleUpdateWorkOrder} disabled={isSaving}>
                    {isSaving ? "Shranjevanje..." : "Shrani"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6 shadow-elegant">
                <h2 className="mb-4 text-lg font-semibold">Osnovni podatki</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(orderDetail.status)}>
                        {getStatusLabel(orderDetail.status)}
                      </Badge>
                    </div>
                  </div>
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
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleExportToPDF}
                      className="gap-2"
                      disabled={!orderDetail || workEntries.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      Izvozi v PDF
                    </Button>
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
                          vrstaObelezbe === "GRBINA (VELIKA)" ||
                          vrstaObelezbe === "GRBINA (MALA)") && (
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
                </div>

                  <Dialog open={isEditEntryDialogOpen} onOpenChange={setIsEditEntryDialogOpen}>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Uredi popis</DialogTitle>
                        <DialogDescription>Posodobite popis dela</DialogDescription>
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
                            <Label htmlFor="edit-dolzina">Dolžina (m)</Label>
                            <Input
                              id="edit-dolzina"
                              type="number"
                              step="0.01"
                              placeholder="Vnesite dolžino"
                              value={dolzina}
                              onChange={(e) => setDolzina(e.target.value)}
                            />
                          </div>
                        )}

                        {(vrstaObelezbe === "STOP (0,5x0,3)" ||
                          vrstaObelezbe === "GRBINA (VELIKA)" ||
                          vrstaObelezbe === "GRBINA (MALA)") && (
                          <div className="grid gap-2">
                            <Label htmlFor="edit-steviloElementov">Število elementov</Label>
                            <Input
                              id="edit-steviloElementov"
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
                              <Label htmlFor="edit-dolzina">Dolžina (m)</Label>
                              <Input
                                id="edit-dolzina"
                                type="number"
                                step="0.01"
                                placeholder="Vnesite dolžino"
                                value={dolzina}
                                onChange={(e) => setDolzina(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-steviloElementov">Število elementov</Label>
                              <Input
                                id="edit-steviloElementov"
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
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditEntryDialogOpen(false);
                            setVrstaObelezbe("");
                            setDolzina("");
                            setSteviloElementov("");
                            setCurrentEntry(null);
                          }}
                          disabled={isSaving}
                        >
                          Prekliči
                        </Button>
                        <Button onClick={handleUpdateEntry} disabled={isSaving}>
                          {isSaving ? "Shranjevanje..." : "Shrani"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                {workEntries.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vrsta označbe</TableHead>
                          <TableHead>Dolžina (m)</TableHead>
                          <TableHead>Število elementov</TableHead>
                          <TableHead>Datum vnosa</TableHead>
                          <TableHead className="text-right">Akcije</TableHead>
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
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditEntryDialog(entry)}
                                  className="gap-2"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Uredi
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                      Izbriši
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Ste prepričani?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        To dejanje je nepovratno. Popis dela bo trajno izbrisan iz evidence.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Prekliči</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteEntry(entry.id)} 
                                        disabled={isDeleting}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {isDeleting ? "Brisanje..." : "Izbriši"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
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
