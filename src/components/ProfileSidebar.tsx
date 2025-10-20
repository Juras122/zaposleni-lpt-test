import { UserProfile } from '@/types';
import { Card } from '@/components/ui/card';
import { User, Clock, FileText, Package, Users, Calculator, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileSidebarProps {
  profile: UserProfile;
}

export const ProfileSidebar = ({ profile }: ProfileSidebarProps) => {
  const currentPath = window.location.pathname;
  const userId = profile.id;

  const menuItems = [
    { id: 'profil', label: 'Profil', icon: User, path: `/profile?id=${userId}`, active: currentPath === '/profile' },
    { id: 'whm', label: 'Evidenca delovnega časa', icon: Clock, path: `/work-hours?id=${userId}`, active: currentPath === '/work-hours' },
    { id: 'sdms', label: 'SDMS', icon: FileText, external: 'https://sdms.lpt.si' },
    { id: 'pdn', label: 'Pregled delovnih nalogov', icon: FileText, path: `/work-orders?id=${userId}`, active: currentPath === '/work-orders' || currentPath.startsWith('/work-order/') },
    { id: 'skld', label: 'Skladišče', icon: Package },
    { id: 'upr', label: 'Upravljanje uporabnikov', icon: Users },
    { id: 'obrc', label: 'Obračun', icon: Calculator },
    { id: 'finc', label: 'Finance', icon: DollarSign }
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
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const className = `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-smooth ${
                item.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
                  <Link
                    key={item.id}
                    to={item.path}
                    className={className}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              }

              // Disabled item
              return (
                <div
                  key={item.id}
                  className={`${className} opacity-50 cursor-not-allowed`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                </div>
              );
            })}
          </nav>
        </Card>
      </div>
    </aside>
  );
};
