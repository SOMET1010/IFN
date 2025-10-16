import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Plus, Camera, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Product } from '@/types';

interface ProductPublicationProps {
  onProductPublished: (product: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}

const ProductPublication = ({ onProductPublished, onCancel }: ProductPublicationProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    quantity: 0,
    unit: 'kg',
    location: '',
    producer: '',
    variety: '',
    quality: '',
    origin: '',
    harvest_date: '',
    status: 'available' as const
  });

  const totalSteps = 5;

  const categories = [
    { id: 'fruits', name: 'Fruits' },
    { id: 'legumes', name: 'Légumes' },
    { id: 'volaille', name: 'Volaille' },
    { id: 'poissons', name: 'Poissons' },
    { id: 'cereales', name: 'Céréales' }
  ];

  const qualities = [
    { id: 'premium', name: 'Premium' },
    { id: 'standard', name: 'Standard' },
    { id: 'economique', name: 'Économique' }
  ];

  const units = ['kg', 'g', 'L', 'unité', 'botte', 'sac'];

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedImages(prev => [...prev, ...files].slice(0, 8));
  }, []);

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateProductCode = () => {
    const categoryCode = productData.category.substring(0, 3).toUpperCase();
    const producerCode = productData.producer.substring(0, 3).toUpperCase();
    const randomCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryCode}-${producerCode}-${randomCode}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newProduct = {
      ...productData,
      id: generateProductCode(),
      image: uploadedImages[0] ? URL.createObjectURL(uploadedImages[0]) : undefined
    };

    onProductPublished(newProduct);
    setIsSubmitting(false);
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepComplete = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return productData.name && productData.category && productData.description;
      case 2:
        return uploadedImages.length > 0;
      case 3:
        return productData.price > 0 && productData.quantity > 0 && productData.unit;
      case 4:
        return productData.variety && productData.quality && productData.origin;
      case 5:
        return productData.location && productData.producer && productData.harvest_date;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Publier une nouvelle offre</h1>
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Étape {step} sur {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% complété</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Informations de base"}
                  {step === 2 && "Photos du produit"}
                  {step === 3 && "Prix et quantité"}
                  {step === 4 && "Détails de qualité"}
                  {step === 5 && "Informations producteur"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du produit *
                      </label>
                      <Input
                        value={productData.name}
                        onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Tomates cerises"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie *
                      </label>
                      <Select value={productData.category} onValueChange={(value) => setProductData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <Textarea
                        value={productData.description}
                        onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Décrivez votre produit en détail..."
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Images */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photos du produit *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}

                        {uploadedImages.length < 8 && (
                          <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                            <Camera className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Ajouter photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {uploadedImages.length}/8 photos ajoutées
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3: Price and Quantity */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prix unitaire *
                        </label>
                        <Input
                          type="number"
                          value={productData.price || ''}
                          onChange={(e) => setProductData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantité *
                        </label>
                        <Input
                          type="number"
                          value={productData.quantity || ''}
                          onChange={(e) => setProductData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unité *
                      </label>
                      <Select value={productData.unit} onValueChange={(value) => setProductData(prev => ({ ...prev, unit: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Suggestions */}
                    {productData.category && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Suggestions de prix</h4>
                        <div className="flex space-x-2">
                          <Badge variant="secondary">Marché: 500-800 FCFA/kg</Badge>
                          <Badge variant="secondary">Premium: +20%</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Quality Details */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variété *
                      </label>
                      <Input
                        value={productData.variety}
                        onChange={(e) => setProductData(prev => ({ ...prev, variety: e.target.value }))}
                        placeholder="Ex: Roma"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualité *
                      </label>
                      <Select value={productData.quality} onValueChange={(value) => setProductData(prev => ({ ...prev, quality: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la qualité" />
                        </SelectTrigger>
                        <SelectContent>
                          {qualities.map(quality => (
                            <SelectItem key={quality.id} value={quality.id}>
                              {quality.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Origine *
                      </label>
                      <Input
                        value={productData.origin}
                        onChange={(e) => setProductData(prev => ({ ...prev, origin: e.target.value }))}
                        placeholder="Ex: Yamoussoukro"
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Producer Information */}
                {step === 5 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du producteur *
                      </label>
                      <Input
                        value={productData.producer}
                        onChange={(e) => setProductData(prev => ({ ...prev, producer: e.target.value }))}
                        placeholder="Votre nom ou nom de l'exploitation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Localisation *
                      </label>
                      <Input
                        value={productData.location}
                        onChange={(e) => setProductData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Ville, quartier"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de récolte *
                      </label>
                      <Input
                        type="date"
                        value={productData.harvest_date}
                        onChange={(e) => setProductData(prev => ({ ...prev, harvest_date: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Précédent
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 === step
                    ? 'bg-blue-600 text-white'
                    : i + 1 < step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i + 1 < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
            ))}
          </div>

          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!isStepComplete(step)}
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepComplete(step) || isSubmitting}
            >
              {isSubmitting ? 'Publication en cours...' : 'Publier l\'offre'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPublication;