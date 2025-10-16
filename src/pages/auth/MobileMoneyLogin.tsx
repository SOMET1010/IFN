import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Smartphone } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MobileMoneyLogin = () => {
  const [provider, setProvider] = useState('orange');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendCode = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({ title: 'Code envoyé', description: `Un code a été envoyé au ${phone}` });
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    toast({ title: 'Connexion Mobile Money', description: 'Authentification simulée avec succès' });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Connexion Mobile Money</h1>
          <p className="text-muted-foreground mt-2">Connectez-vous avec votre portefeuille mobile</p>
        </div>

        <Card className="border border-border/80 shadow-soft">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Opérateur</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orange">Orange Money</SelectItem>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="moov">Moov Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 0102030405"
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp">Code reçu par SMS</Label>
                  <button type="button" onClick={handleSendCode} className="text-sm text-primary hover:underline">
                    Envoyer un code
                  </button>
                </div>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Saisissez le code"
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12" variant="ivoire" disabled={isLoading}>
                {isLoading ? 'Connexion…' : (
                  <span className="inline-flex items-center gap-2"><Smartphone className="h-5 w-5" /> Se connecter</span>
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-2 text-muted-foreground">OU</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full h-12" onClick={() => navigate('/login')}>
                Se connecter avec Email / Mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileMoneyLogin;

