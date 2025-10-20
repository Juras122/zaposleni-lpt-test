import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import logoImage from '@/assets/LogoNapis.png';

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUserId');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <img 
            src={logoImage} 
            alt="LPT Logo" 
            className="h-10"
          />
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
