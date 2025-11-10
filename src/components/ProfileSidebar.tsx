import { UserProfile } from "@/types";
import { Card } from "@/components/ui/card";
import {
  User,
  Clock,
  FileText,
  Package,
  Users,
  Calculator,
  DollarSign,
  ChevronDown,
  ChartColumnBig,
  Rss,
  Lightbulb,
  Paintbrush,
  Construction,
  TrafficCone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ProfileSidebarProps {
  profile: UserProfile;
}

export const ProfileSidebar = ({ profile }: ProfileSidebarProps) => {
  const currentPath = window.location.pathname;
  const userId = profile.id;

  // Funkcija za preverjanje dovoljenja za segment (indeks v stringu dovoljenja)
  const hasPermission = (index: number): boolean => {
    if (!profile.dovoljenja) return true; // Če dovoljenja niso definirana, dovoli vse
    return profile.dovoljenja[index] === "1";
  };

  const menuSegments = [
    {
      id: "profil-segment",
      label: "Profil & Čas",
      icon: User,
      items: [
        {
          id: "profil",
          label: "Profil",
          icon: User,
          path: `/profile?id=${userId}`,
          active: currentPath === "/profile",
        },
        {
          id: "whm",
          label: "Evidenca delovnega časa",
          icon: Clock,
          path: `/work-hours?id=${userId}`,
          active: currentPath === "/work-hours",
        },
        { id: "PROF_USER_stat", label: "Osebna statistika", icon: ChartColumnBig },
      ],
    },
    {
      id: "nesvetlobna-segment",
      label: "Nesvetlobna signalizacija",
      icon: TrafficCone,
      items: [
        {
          id: "pdn",
          label: "Talne označbe",
          icon: Paintbrush,
          path: `/work-orders?id=${userId}`,
          active: currentPath === "/work-orders" || currentPath.startsWith("/work-order/"),
        },
        { id: "NSZ", label: "Zapore", icon: Construction },
        { id: "sdms", label: "SDMS", icon: Rss, external: "https://sdms.lpt.si" },
        { id: "NS_stat", label: "Statistika", icon: ChartColumnBig },
      ],
    },
    {
      id: "svetlobna-segment",
      label: "Svetlobna signalizacija",
      icon: Lightbulb,
      items: [
        { id: "SS", label: "Semaforizacija", icon: Lightbulb },
        { id: "SS_stat", label: "Semaforizacija statistika", icon: ChartColumnBig },
        { id: "sdms", label: "SDMS", icon: Rss, external: "https://sdms.lpt.si" },
      ],
    },
    { id: "PKA", label: "Parkirišča", icon: FileText, 
    items:
    },
    
    {
      id: "drugo-segment",
      label: "Druge storitve",
      icon: Package,
      items: [
        { id: "OPT", label: "Optika", icon: FileText },
        { id: "TRZ", label: "Tržnice", icon: FileText },
        { id: "PAJ", label: "Odvoz vozil", icon: FileText },
      ],
    },
    {
      id: "upravljanje-segment",
      label: "Upravljanje",
      icon: Users,
      items: [
        {
          id: "skld",
          label: "Skladišče",
          icon: Package,
          path: `/warehouse?id=${userId}`,
          active: currentPath === "/warehouse",
        },
        {
          id: "upr",
          label: "Upravljanje uporabnikov",
          icon: Users,
          path: `/users-managment?id=${userId}`,
          active: currentPath === "/users-managment",
        },
      ],
    },
    {
      id: "financno-segment",
      label: "Finančno",
      icon: DollarSign,
      items: [
        { id: "obrc", label: "Obračun", icon: Calculator },
        { id: "finc", label: "Finance", icon: DollarSign },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-80 flex-shrink-0">
      <div className="space-y-4">
        <Card className="p-6 shadow-elegant">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{profile.ime}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{profile.naziv}</p>
          </div>
        </Card>

        <Card className="p-4 shadow-elegant">
          <Accordion type="multiple" className="w-full">
            {menuSegments.map((segment, index) => {
              // Preveri dovoljenje za ta segment
              if (!hasPermission(index)) return null;

              const hasActiveItem = segment.items.some((item) => item.active);

              return (
                <AccordionItem key={segment.id} value={segment.id} className="border-b-0">
                  <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-accent rounded-lg">
                    <div className="flex items-center gap-3">
                      <segment.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{segment.label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <div className="space-y-1 pl-4">
                      {segment.items.map((item) => {
                        const Icon = item.icon;
                        const className = `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-smooth ${
                          item.active
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`;

                        // External link
                        if (item.external) {
                          return (
                            <a
                              key={item.id}
                              href={item.external}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={className}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="flex-1">{item.label}</span>
                            </a>
                          );
                        }

                        // Internal link
                        if (item.path) {
                          return (
                            <Link key={item.id} to={item.path} className={className}>
                              <Icon className="h-4 w-4" />
                              <span className="flex-1">{item.label}</span>
                            </Link>
                          );
                        }

                        // Disabled item
                        return (
                          <div key={item.id} className={`${className} opacity-50 cursor-not-allowed`}>
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Card>
      </div>
    </aside>
  );
};
