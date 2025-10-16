import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface NegotiationFormData {
  title: string;
  supplier: string;
  product: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  maxPrice: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  description: string;
  deliveryDeadline: string;
  qualityRequirements: string[];
  paymentTerms: string;
}

interface NegotiationFormProps {
  item?: NegotiationFormData;
  onSubmit: (data: NegotiationFormData) => void;
  onCancel: () => void;
}

const NegotiationForm = ({ item, onSubmit, onCancel }: NegotiationFormProps) => {
  const [formData, setFormData] = useState<NegotiationFormData>({
    title: item?.title || '',
    supplier: item?.supplier || '',
    product: item?.product || '',
    quantity: item?.quantity || 0,
    unit: item?.unit || 'kg',
    targetPrice: item?.targetPrice || 0,
    maxPrice: item?.maxPrice || 0,
    priority: item?.priority || 'medium',
    category: item?.category || '',
    description: item?.description || '',
    deliveryDeadline: item?.deliveryDeadline || '',
    qualityRequirements: item?.qualityRequirements || [],
    paymentTerms: item?.paymentTerms || ''
  });

  const [newQualityRequirement, setNewQualityRequirement] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addQualityRequirement = () => {
    if (newQualityRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        qualityRequirements: [...prev.qualityRequirements, newQualityRequirement.trim()]
      }));
      setNewQualityRequirement('');
    }
  };

  const removeQualityRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualityRequirements: prev.qualityRequirements.filter((_, i) => i !== index)
    }));
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'outline',
      urgent: 'destructive'
    } as const;

    const labels = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute',
      urgent: 'Urgente'
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titre de la négociation</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Négociation approvisionnement tomates"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Fournisseur</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
            placeholder="Nom du fournisseur"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product">Produit</Label>
          <Input
            id="product"
            value={formData.product}
            onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
            placeholder="Nom du produit"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fruits">Fruits</SelectItem>
              <SelectItem value="vegetables">Légumes</SelectItem>
              <SelectItem value="grains">Céréales</SelectItem>
              <SelectItem value="dairy">Produits laitiers</SelectItem>
              <SelectItem value="meat">Viande</SelectItem>
              <SelectItem value="other">Autres</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantité</Label>
          <div className="flex gap-2">
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              placeholder="0"
              min="0"
              required
            />
            <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="tonnes">tonnes</SelectItem>
                <SelectItem value="unités">unités</SelectItem>
                <SelectItem value="caisses">caisses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priorité</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{getPriorityBadge('low')}</SelectItem>
              <SelectItem value="medium">{getPriorityBadge('medium')}</SelectItem>
              <SelectItem value="high">{getPriorityBadge('high')}</SelectItem>
              <SelectItem value="urgent">{getPriorityBadge('urgent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetPrice">Prix cible (FCFA)</Label>
          <Input
            id="targetPrice"
            type="number"
            value={formData.targetPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Prix maximum (FCFA)</Label>
          <Input
            id="maxPrice"
            type="number"
            value={formData.maxPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
            placeholder="0"
            min="0"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="deliveryDeadline">Date de livraison souhaitée</Label>
          <Input
            id="deliveryDeadline"
            type="date"
            value={formData.deliveryDeadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deliveryDeadline: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description détaillée de la négociation..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Exigences qualité</Label>
        <div className="flex gap-2">
          <Input
            value={newQualityRequirement}
            onChange={(e) => setNewQualityRequirement(e.target.value)}
            placeholder="Ajouter une exigence qualité"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualityRequirement())}
          />
          <Button type="button" onClick={addQualityRequirement} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.qualityRequirements.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.qualityRequirements.map((req, index) => (
              <Badge key={index} variant="outline" className="gap-1">
                {req}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeQualityRequirement(index)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentTerms">Conditions de paiement</Label>
        <Textarea
          id="paymentTerms"
          value={formData.paymentTerms}
          onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
          placeholder="Conditions de paiement..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {item ? 'Mettre à jour' : 'Créer la négociation'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
};

export { NegotiationForm };