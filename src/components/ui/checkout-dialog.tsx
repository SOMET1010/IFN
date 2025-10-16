import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useOrder } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Smartphone, Truck, MapPin, Phone, User } from 'lucide-react';

interface CheckoutDialogProps {
  children: React.ReactNode;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ children }) => {
  const { cart, clearCart, getTotalAmount, setIsOpen } = useCart();
  const { createOrder, isLoading: isOrderLoading } = useOrder();
  const [isOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Delivery Information
    fullName: '',
    phone: '',
    address: '',
    city: '',
    deliveryInstructions: '',

    // Payment Information
    paymentMethod: 'mobile_money',
    mobileProvider: 'orange_money',
    mobileNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',

    // Delivery Method
    deliveryMethod: 'delivery',
    deliveryTime: 'standard'
  });

  const deliveryFee = 1000; // Fixed delivery fee
  const subtotal = getTotalAmount();
  const total = subtotal + deliveryFee;

  const mobileMoneyProviders = [
    { id: 'orange_money', name: 'Orange Money', color: 'text-orange-600' },
    { id: 'mtn_money', name: 'MTN Money', color: 'text-yellow-600' },
    { id: 'moov_money', name: 'Moov Money', color: 'text-blue-600' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create the order
      const order = await createOrder(
        cart?.items || [],
        {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          deliveryMethod: formData.deliveryMethod,
          deliveryInstructions: formData.deliveryInstructions
        },
        {
          paymentMethod: formData.paymentMethod,
          mobileProvider: formData.mobileProvider,
          cardNumber: formData.cardNumber
        }
      );

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success message
      alert(`Commande #${order.id} créée avec succès! Numéro de suivi: ${order.tracking_number}`);

      clearCart();
      setIsDialogOpen(false);
      setIsOpen(false);
      setStep(1);
    } catch (error) {
      alert('Une erreur est survenue lors de la commande. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderDeliveryStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Informations de Livraison</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Nom Complet</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Votre nom complet"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Numéro de Téléphone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+225 XX XX XX XX XX"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Votre adresse complète"
          required
        />
      </div>

      <div>
        <Label htmlFor="city">Ville</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          placeholder="Ex: Abidjan, Bouaké..."
          required
        />
      </div>

      <div>
        <Label htmlFor="deliveryInstructions">Instructions de Livraison (optionnel)</Label>
        <Input
          id="deliveryInstructions"
          value={formData.deliveryInstructions}
          onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
          placeholder="Repère, code d'accès, etc."
        />
      </div>

      <div>
        <Label>Méthode de Livraison</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <Card
            className={`cursor-pointer transition-all ${
              formData.deliveryMethod === 'delivery' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleInputChange('deliveryMethod', 'delivery')}
          >
            <CardContent className="p-4 text-center">
              <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Livraison</p>
              <p className="text-sm text-gray-500">2-3 jours ouvrables</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              formData.deliveryMethod === 'pickup' ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => handleInputChange('deliveryMethod', 'pickup')}
          >
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Retrait sur place</p>
              <p className="text-sm text-gray-500">Gratuit</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Méthode de Paiement</h3>

      <div className="space-y-3">
        <Card
          className={`cursor-pointer transition-all ${
            formData.paymentMethod === 'mobile_money' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleInputChange('paymentMethod', 'mobile_money')}
        >
          <CardContent className="p-4 flex items-center space-x-3">
            <Smartphone className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium">Mobile Money</p>
              <p className="text-sm text-gray-500">Orange Money, MTN Money, Moov Money</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            formData.paymentMethod === 'credit_card' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleInputChange('paymentMethod', 'credit_card')}
        >
          <CardContent className="p-4 flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium">Carte Bancaire</p>
              <p className="text-sm text-gray-500">Visa, Mastercard</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {formData.paymentMethod === 'mobile_money' && (
        <div className="space-y-4 mt-4">
          <div>
            <Label>Fournisseur</Label>
            <Select value={formData.mobileProvider} onValueChange={(value) => handleInputChange('mobileProvider', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mobileMoneyProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <span className={provider.color}>●</span> {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mobileNumber">Numéro Mobile Money</Label>
            <Input
              id="mobileNumber"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              placeholder="+225 XX XX XX XX XX"
              required
            />
          </div>
        </div>
      )}

      {formData.paymentMethod === 'credit_card' && (
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="cardNumber">Numéro de Carte</Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Date d'expiration</Label>
              <Input
                id="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder="MM/AA"
                required
              />
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                required
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Récapitulatif de la Commande</h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Articles ({cart?.items.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cart?.items.map((item) => (
            <div key={item.product_id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} {item.product.unit} × {formatCurrency(item.price)}
                </p>
              </div>
              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations de Livraison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>{formData.fullName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{formData.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{formData.address}, {formData.city}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="h-4 w-4 text-gray-500" />
            <span className="capitalize">
              {formData.deliveryMethod === 'delivery' ? 'Livraison' : 'Retrait sur place'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Méthode de Paiement</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.paymentMethod === 'mobile_money' ? (
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <span>
                {mobileMoneyProviders.find(p => p.id === formData.mobileProvider)?.name} - {formData.mobileNumber}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span>Carte se terminant par {formData.cardNumber?.slice(-4)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Livraison'}
            {step === 2 && 'Paiement'}
            {step === 3 && 'Confirmation'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && renderDeliveryStep()}
          {step === 2 && renderPaymentStep()}
          {step === 3 && renderConfirmationStep()}

          <div className="flex justify-between">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={isProcessing}
              >
                Précédent
              </Button>
            )}

            <div className="flex-1" />

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={isProcessing || isOrderLoading}
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isProcessing || isOrderLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing || isOrderLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Traitement...
                  </>
                ) : (
                  `Payer ${formatCurrency(total)}`
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};