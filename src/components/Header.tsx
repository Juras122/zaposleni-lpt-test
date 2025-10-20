import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUserId');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">LPT</span>
          </div>
          <span className="text-xl font-semibold">LPT Portal</span>
        </div>
        
        <nav className="flex items-center gap-6">
          <a 
            href="https://www.lpt.si/" 
            className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            LPT
          </a>
          <Button variant="ghost" onClick={handleLogout}>
            Odjava
          </Button>
        </nav>
      </div>
    </header>
  );
};
