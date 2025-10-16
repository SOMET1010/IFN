import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MerchantClient } from '@/types/merchant';
import { MerchantClientService } from '@/services/merchant/merchantClientService';
import { Phone, User, Mail, MapPin, Star, Clock, ShoppingCart } from 'lucide-react';

interface QuickClientRegisterProps {
  onClientRegistered?: (client: MerchantClient) => void;
  onClientSelected?: (client: MerchantClient) => void;
}

export default function QuickClientRegister({ onClientRegistered, onClientSelected }: QuickClientRegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    preferences: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingClient, setExistingClient] = useState<MerchantClient | null>(null);
  const [searchingPhone, setSearchingPhone] = useState(false);

  const clientService = MerchantClientService.getInstance();

  const handlePhoneChange = async (phone: string) => {
    setFormData(prev => ({ ...prev, phone }));
    setExistingClient(null);
    setError(null);

    if (phone.length >= 8) {
      setSearchingPhone(true);
      try {
        const client = await clientService.getClientByPhone(phone);
        if (client) {
          setExistingClient(client);
        }
      } catch (err) {
        console.error('Error searching client:', err);
      } finally {
        setSearchingPhone(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const client = await clientService.quickRegisterClient(formData);
      setExistingClient(client);
      onClientRegistered?.(client);

      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        preferences: []
      });
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du client');
      console.error('Error registering client:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingClient = () => {
    if (existingClient) {
      onClientSelected?.(existingClient);
    }
  };

  const getLoyaltyBadgeColor = (points: number) => {
    if (points >= 1000) return 'bg-yellow-500';
    if (points >= 500) return 'bg-gray-400';
    if (points >= 200) return 'bg-orange-400';
    return 'bg-blue-500';
  };

  const getLoyaltyLevel = (points: number) => {
    if (points >= 1000) return 'Or';
    if (points >= 500) return 'Argent';
    if (points >= 200) return 'Bronze';
    return 'Standard';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Enregistrement Rapide Client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingClient && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Client existant trouvé!</span>
                <Badge className={getLoyaltyBadgeColor(existingClient.loyaltyPoints)}>
                  {getLoyaltyLevel(existingClient.loyaltyPoints)}
                </Badge>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{existingClient.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{existingClient.phone}</span>
                </div>
                {existingClient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{existingClient.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>{existingClient.loyaltyPoints} points fidélité</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>{existingClient.visitCount} visites</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Dernière visite: {new Date(existingClient.lastVisit).toLocaleDateString()}</span>
                </div>
              </div>

              <Button
                onClick={handleSelectExistingClient}
                className="w-full mt-2"
              >
                Sélectionner ce client
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!existingClient && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+225 XX XX XX XX XX"
                required
                disabled={searchingPhone}
              />
              {searchingPhone && (
                <div className="text-sm text-gray-500">Recherche du client...</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom du client"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optionnel)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="client@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse (optionnel)</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Adresse du client"
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !formData.name || !formData.phone}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer le client'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}