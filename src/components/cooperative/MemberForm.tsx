import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, MapPin, Phone, Mail, Calendar, Package } from 'lucide-react';
import { memberService, CooperativeMember } from '@/services/cooperative/memberService';

const memberSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: z.enum(['Producteur', 'Marchand', 'Transformateur', 'Éleveur', 'Pêcheur']),
  location: z.string().min(2, 'La localisation est requise'),
  phone: z.string().regex(/^\+?\d{8,15}$/, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  contribution: z.number().min(0, 'La contribution ne peut être négative'),
  products: z.array(z.string()).min(1, 'Au moins un produit est requis'),
  farmSize: z.number().min(0).optional(),
  mainCrop: z.string().optional(),
  monthlyProduction: z.number().min(0).optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  member?: CooperativeMember;
  onSuccess?: (member: CooperativeMember) => void;
  trigger?: React.ReactNode;
}

export const MemberForm: React.FC<MemberFormProps> = ({ member, onSuccess, trigger }) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<string[]>(member?.products || []);
  const [newProduct, setNewProduct] = useState('');

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member?.name || '',
      role: member?.role || 'Producteur',
      location: member?.location || '',
      phone: member?.phone || '',
      email: member?.email || '',
      contribution: member?.contribution || 0,
      products: member?.products || [],
      farmSize: member?.farmSize,
      mainCrop: member?.mainCrop,
      monthlyProduction: member?.monthlyProduction,
    },
  });

  const onSubmit = (data: MemberFormData) => {
    const memberData = {
      ...data,
      products,
    };

    const validation = memberService.validateMember(memberData);
    if (!validation.isValid) {
      alert('Erreurs de validation:\n' + validation.errors.join('\n'));
      return;
    }

    let savedMember: CooperativeMember;
    if (member) {
      savedMember = memberService.update(member.id, memberData)!;
    } else {
      savedMember = memberService.create(memberData);
    }

    onSuccess?.(savedMember);
    setOpen(false);
    form.reset();
    setProducts([]);
  };

  const addProduct = () => {
    if (newProduct.trim() && !products.includes(newProduct.trim())) {
      setProducts([...products, newProduct.trim()]);
      setNewProduct('');
    }
  };

  const removeProduct = (productToRemove: string) => {
    setProducts(products.filter(p => p !== productToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {member ? 'Modifier' : 'Ajouter'} un membre
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {member ? 'Modifier le membre' : 'Ajouter un nouveau membre'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Informations de base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du membre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rôle</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Producteur">Producteur</SelectItem>
                            <SelectItem value="Marchand">Marchand</SelectItem>
                            <SelectItem value="Transformateur">Transformateur</SelectItem>
                            <SelectItem value="Éleveur">Éleveur</SelectItem>
                            <SelectItem value="Pêcheur">Pêcheur</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation</FormLabel>
                        <FormControl>
                          <Input placeholder="Ville, village..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+225 XX XX XX XX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optionnel)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contribution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contribution initiale (FCFA)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Production */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Production
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="farmSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Superficie (hectares)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mainCrop"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Culture principale</FormLabel>
                        <FormControl>
                          <Input placeholder="Cacao, café, anacarde..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyProduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Production mensuelle (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Produits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Produits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter un produit"
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                    />
                    <Button type="button" onClick={addProduct} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {products.map((product, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {product}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeProduct(product)}
                        />
                      </Badge>
                    ))}
                  </div>

                  <input type="hidden" {...form.register('products')} />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {member ? 'Mettre à jour' : 'Créer'} le membre
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};