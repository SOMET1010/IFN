import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Mic,
  MicOff,
  Package,
  Plus,
  Minus,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Smartphone,
  Volume2,
  VolumeX,
  Settings,
  Camera,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';

// Types pour les besoins des membres
interface MemberNeed {
  id: string;
  member_id: string;
  member_name: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  preferred_price_range?: {
    min: number;
    max: number;
  };
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  delivery_deadline?: string;
  special_requirements?: string;
  photos?: string[];
  voice_note?: string;
  status: 'draft' | 'submitted' | 'validated' | 'integrated';
  created_at: string;
  updated_at: string;
}

interface GroupOrder {
  id: string;
  product_name: string;
  category: string;
  total_quantity: number;
  unit: string;
  participants_count: number;
  average_target_price: number;
  status: 'collecting' | 'aggregating' | 'negotiating' | 'confirmed' | 'cancelled';
  deadline: string;
  created_at: string;
  member_needs: MemberNeed[];
}

interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  confidence: number;
  timestamp: string;
  status: 'pending' | 'processed' | 'failed';
}

interface MobileSettings {
  voice_input: boolean;
  auto_detect_language: boolean;
  offline_mode: boolean;
  photo_capture: boolean;
  push_notifications: boolean;
  language: string;
}

const productCategories = [
  { value: 'engrais', label: 'Engrais' },
  { value: 'semences', label: 'Semences' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'outils', label: 'Outils Agricoles' },
  { value: 'equipement', label: 'Équipement' },
  { value: 'intrants', label: 'Intrants' },
  { value: 'emballage', label: 'Emballage' },
  { value: 'transport', label: 'Transport' },
];

const units = [
  { value: 'kg', label: 'Kilogramme (kg)' },
  { value: 'tonne', label: 'Tonne' },
  { value: 'litre', label: 'Litre (L)' },
  { value: 'piece', label: 'Pièce' },
  { value: 'sac', label: 'Sac' },
  { value: 'carton', label: 'Carton' },
  { value: 'bouteille', label: 'Bouteille' },
];

const urgencyLevels = [
  { value: 'low', label: 'Faible', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Élevé', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

export function CooperativeMobileNeedsCollection() {
  // États principaux
  const [currentNeed, setCurrentNeed] = useState<Partial<MemberNeed>>({
    product_name: '',
    category: '',
    quantity: 1,
    unit: 'kg',
    urgency_level: 'medium',
    special_requirements: '',
    status: 'draft'
  });
  const [memberNeeds, setMemberNeeds] = useState<MemberNeed[]>([]);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [settings, setSettings] = useState<MobileSettings>({
    voice_input: true,
    auto_detect_language: true,
    offline_mode: false,
    photo_capture: true,
    push_notifications: true,
    language: 'fr'
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Références
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialisation de la reconnaissance vocale
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = settings.language === 'bf' ? 'fr-CI' : settings.language;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result: SpeechRecognitionResult) => result[0])
          .map((result) => result.transcript)
          .join('');
        setTranscript(transcript);
        processVoiceCommand(transcript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [settings.language, processVoiceCommand]);

  // Démarrer/arrêter l'enregistrement vocal
  const toggleRecording = () => {
    if (!settings.voice_input) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  // Traiter les commandes vocales
  const processVoiceCommand = useCallback((command: string) => {
    setIsProcessing(true);

    const voiceCommand: VoiceCommand = {
      id: Date.now().toString(),
      command: command,
      action: '',
      confidence: Math.random() * 0.2 + 0.8,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Extraire les informations de la commande vocale
    const extractedInfo = extractProductInfo(command);
    if (extractedInfo) {
      setCurrentNeed(prev => ({
        ...prev,
        ...extractedInfo
      }));
      voiceCommand.action = `Extraction: ${extractedInfo.product_name || 'Produit inconnu'}`;
      voiceCommand.status = 'processed';
    } else {
      voiceCommand.action = 'Commande non comprise';
      voiceCommand.status = 'failed';
    }

    setVoiceCommands(prev => [voiceCommand, ...prev]);
    setIsProcessing(false);
  }, [extractProductInfo]);

  // Extraire les informations du produit depuis une commande vocale
  const extractProductInfo = useCallback((command: string): Partial<MemberNeed> | null => {
    const lowerCommand = command.toLowerCase();

    // Détection du type de produit
    let product = '';
    let category = '';

    if (lowerCommand.includes('engrais')) {
      product = 'Engrais';
      category = 'engrais';
    } else if (lowerCommand.includes('semence')) {
      product = 'Semences';
      category = 'semences';
    } else if (lowerCommand.includes('pesticide')) {
      product = 'Pesticides';
      category = 'pesticides';
    } else if (lowerCommand.includes('outil')) {
      product = 'Outils agricoles';
      category = 'outils';
    }

    // Extraction de la quantité
    const quantityMatch = command.match(/(\d+)\s*(kg|tonne|litre|piece|sac|carton|bouteille)/i);
    let quantity = 1;
    let unit = 'kg';

    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1]);
      unit = quantityMatch[2].toLowerCase();
    }

    // Extraction du niveau d'urgence
    let urgency_level: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    if (lowerCommand.includes('urgent') || lowerCommand.includes('immédiat')) {
      urgency_level = 'urgent';
    } else if (lowerCommand.includes('important') || lowerCommand.includes('vite')) {
      urgency_level = 'high';
    } else if (lowerCommand.includes('pas urgent')) {
      urgency_level = 'low';
    }

    if (product) {
      return {
        product_name: product,
        category,
        quantity,
        unit,
        urgency_level
      };
    }

    return null;
  }, []);

  // Valider le formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!currentNeed.product_name?.trim()) {
      errors.product_name = 'Le nom du produit est requis';
    }

    if (!currentNeed.category) {
      errors.category = 'La catégorie est requise';
    }

    if (!currentNeed.quantity || currentNeed.quantity <= 0) {
      errors.quantity = 'La quantité doit être supérieure à 0';
    }

    if (!currentNeed.unit) {
      errors.unit = 'L\'unité est requise';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre le besoin
  const submitNeed = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const newNeed: MemberNeed = {
      id: Date.now().toString(),
      member_id: 'current_member_id', // À remplacer par l'ID réel du membre
      member_name: 'Membre Actuel', // À remplacer par le nom réel du membre
      product_name: currentNeed.product_name!,
      category: currentNeed.category!,
      quantity: currentNeed.quantity!,
      unit: currentNeed.unit!,
      preferred_price_range: currentNeed.preferred_price_range,
      urgency_level: currentNeed.urgency_level!,
      delivery_deadline: currentNeed.delivery_deadline,
      special_requirements: currentNeed.special_requirements,
      photos: selectedImages,
      voice_note: transcript,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Simuler l'envoi au serveur
    await new Promise(resolve => setTimeout(resolve, 1000));

    setMemberNeeds(prev => [newNeed, ...prev]);

    // Réinitialiser le formulaire
    setCurrentNeed({
      product_name: '',
      category: '',
      quantity: 1,
      unit: 'kg',
      urgency_level: 'medium',
      special_requirements: '',
      status: 'draft'
    });
    setTranscript('');
    setSelectedImages([]);
    setValidationErrors({});

    setIsSubmitting(false);

    // Feedback vocal
    if (settings.voice_input && synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance('Besoin enregistré avec succès');
      utterance.lang = settings.language;
      synthesisRef.current.speak(utterance);
    }
  };

  // Gérer la capture d'image
  const handleImageCapture = () => {
    // Simuler la capture d'image
    const newImage = `captured_${Date.now()}.jpg`;
    setSelectedImages(prev => [...prev, newImage]);
  };

  // Supprimer une image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Obtenir les infos d'urgence
  const getUrgencyInfo = (level: string) => {
    return urgencyLevels.find(u => u.value === level) || urgencyLevels[1];
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mes Besoins</h1>
            <p className="text-sm text-gray-600">Coopérative Agricole</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant={settings.voice_input ? "default" : "outline"}
              size="icon"
              onClick={() => setSettings(prev => ({ ...prev, voice_input: !prev.voice_input }))}
            >
              {settings.voice_input ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{memberNeeds.length}</div>
            <div className="text-xs text-gray-600">Mes besoins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{groupOrders.length}</div>
            <div className="text-xs text-gray-600">Commandes groupées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {memberNeeds.filter(n => n.status === 'submitted').length}
            </div>
            <div className="text-xs text-gray-600">En attente</div>
          </div>
        </div>
      </div>

      {/* Formulaire de saisie */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouveau Besoin
          </CardTitle>
          <CardDescription>
            Exprimez votre besoin en produits ou services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contrôle vocal */}
          {settings.voice_input && (
            <div className="space-y-3">
              <div className="flex justify-center">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="lg"
                  className={`h-16 w-16 rounded-full ${isRecording ? 'animate-pulse' : ''}`}
                  onClick={toggleRecording}
                  disabled={isProcessing}
                >
                  {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
              </div>

              {transcript && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <p className="text-sm">
                      <span className="font-medium">Commande vocale:</span> {transcript}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Champ produit */}
          <div className="space-y-2">
            <Label htmlFor="product">Produit *</Label>
            <Input
              id="product"
              value={currentNeed.product_name || ''}
              onChange={(e) => setCurrentNeed(prev => ({ ...prev, product_name: e.target.value }))}
              placeholder="Ex: Engrais NPK, Semences de cacao..."
              className={validationErrors.product_name ? 'border-red-500' : ''}
            />
            {validationErrors.product_name && (
              <p className="text-red-500 text-xs">{validationErrors.product_name}</p>
            )}
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={currentNeed.category || ''}
              onValueChange={(value) => setCurrentNeed(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.category && (
              <p className="text-red-500 text-xs">{validationErrors.category}</p>
            )}
          </div>

          {/* Quantité et unité */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input
                id="quantity"
                type="number"
                value={currentNeed.quantity || ''}
                onChange={(e) => setCurrentNeed(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                className={validationErrors.quantity ? 'border-red-500' : ''}
              />
              {validationErrors.quantity && (
                <p className="text-red-500 text-xs">{validationErrors.quantity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unité *</Label>
              <Select
                value={currentNeed.unit || ''}
                onValueChange={(value) => setCurrentNeed(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger className={validationErrors.unit ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.unit && (
                <p className="text-red-500 text-xs">{validationErrors.unit}</p>
              )}
            </div>
          </div>

          {/* Niveau d'urgence */}
          <div className="space-y-2">
            <Label>Urgence</Label>
            <div className="grid grid-cols-2 gap-2">
              {urgencyLevels.map(level => (
                <Button
                  key={level.value}
                  variant={currentNeed.urgency_level === level.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentNeed(prev => ({ ...prev, urgency_level: level.value as 'low' | 'medium' | 'high' | 'urgent' }))}
                  className={currentNeed.urgency_level === level.value ? level.color : ''}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Prix souhaité */}
          <div className="space-y-2">
            <Label>Fourchette de prix (optionnel)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min FCFA"
                value={currentNeed.preferred_price_range?.min || ''}
                onChange={(e) => setCurrentNeed(prev => ({
                  ...prev,
                  preferred_price_range: {
                    ...prev.preferred_price_range!,
                    min: parseInt(e.target.value) || 0
                  }
                }))}
              />
              <Input
                type="number"
                placeholder="Max FCFA"
                value={currentNeed.preferred_price_range?.max || ''}
                onChange={(e) => setCurrentNeed(prev => ({
                  ...prev,
                  preferred_price_range: {
                    ...prev.preferred_price_range!,
                    max: parseInt(e.target.value) || 0
                  }
                }))}
              />
            </div>
          </div>

          {/* Date limite */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Date limite souhaitée (optionnel)</Label>
            <Input
              id="deadline"
              type="date"
              value={currentNeed.delivery_deadline || ''}
              onChange={(e) => setCurrentNeed(prev => ({ ...prev, delivery_deadline: e.target.value }))}
            />
          </div>

          {/* Exigences spéciales */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Exigences spéciales (optionnel)</Label>
            <Textarea
              id="requirements"
              value={currentNeed.special_requirements || ''}
              onChange={(e) => setCurrentNeed(prev => ({ ...prev, special_requirements: e.target.value }))}
              placeholder="Qualité, marque spécifique, conditions de livraison..."
              rows={3}
            />
          </div>

          {/* Photos */}
          {settings.photo_capture && (
            <div className="space-y-3">
              <Label>Photos (optionnel)</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImageCapture}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Prendre photo
                </Button>
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bouton de soumission */}
          <Button
            onClick={submitNeed}
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Soumettre le besoin
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Historique des besoins */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Mes Besoins Récents</CardTitle>
        </CardHeader>
        <CardContent>
          {memberNeeds.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Aucun besoin enregistré
            </p>
          ) : (
            <div className="space-y-3">
              {memberNeeds.slice(0, 5).map(need => {
                const urgencyInfo = getUrgencyInfo(need.urgency_level);
                return (
                  <div key={need.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{need.product_name}</h4>
                        <p className="text-sm text-gray-600">
                          {need.quantity} {need.unit} • {need.category}
                        </p>
                      </div>
                      <Badge className={urgencyInfo.color}>
                        {urgencyInfo.label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(need.created_at)}</span>
                      <Badge variant="outline" className="text-xs">
                        {need.status === 'submitted' ? 'Soumis' :
                         need.status === 'validated' ? 'Validé' :
                         need.status === 'integrated' ? 'Intégré' : 'Brouillon'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog des paramètres */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Paramètres Mobile</DialogTitle>
            <DialogDescription>
              Configurez les options de l'application mobile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Saisie vocale</Label>
              <Switch
                checked={settings.voice_input}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, voice_input: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Capture photo</Label>
              <Switch
                checked={settings.photo_capture}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, photo_capture: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Notifications push</Label>
              <Switch
                checked={settings.push_notifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push_notifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Mode hors ligne</Label>
              <Switch
                checked={settings.offline_mode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, offline_mode: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Langue</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="bf">Baoulé</SelectItem>
                  <SelectItem value="dy">Dioula</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}