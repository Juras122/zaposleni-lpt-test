import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { validateUserId } from '@/lib/api';
import { toast } from 'sonner';
import logoImage from '@/assets/LogoNapis.png';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      toast.error('Prosimo, vnesite identifikacijsko številko.');
      return;
    }

    setIsLoading(true);
    
    try {
      const isValid = await validateUserId(userId);
      
      if (isValid) {
        sessionStorage.setItem('loggedInUserId', userId);
        toast.success('Prijava uspešna!');
        navigate(`/profile?id=${userId}`);
      } else {
        toast.error('Identifikacijska številka ni pravilna.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Prišlo je do napake pri prijavi. Poskusite znova.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6">
            <img 
              src={logoImage} 
              alt="LPT Logo" 
              className="mx-auto h-16"
            />
          </div>
          <h1 className="text-3xl font-bold">Prijava</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vnesite svojo identifikacijsko številko
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userId">Identifikacijska številka</Label>
            <Input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Vnesite ID..."
              disabled={isLoading}
              className="h-12"
            />
          </div>

          <Button 
            type="submit" 
            className="h-12 w-full text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Prijavljanje...' : 'Prijava'}
          </Button>
          
        </form>
      </Card>
    </div>
  );
};

export default Login;
