import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Store,
  Sprout,
  Users,
  Phone,
  MapPin,
  User,
  Mic,
  Volume2,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type UserRole = 'merchant' | 'producer' | 'cooperative';

const roleConfig = {
  merchant: {
    icon: Store,
    label: 'Commerçant',
    color: 'blue',
    placeholder: 'Ex: Boutique Chez Marie',
    locationPlaceholder: 'Ex: Adjamé, Abidjan'
  },
  producer: {
    icon: Sprout,
    label: 'Producteur',
    color: 'green',
    placeholder: 'Ex: Kouassi Jean',
    locationPlaceholder: 'Ex: Yamoussoukro'
  },
  cooperative: {
    icon: Users,
    label: 'Coopérative',
    color: 'orange',
    placeholder: 'Ex: Coopérative Espoir',
    locationPlaceholder: 'Ex: Bouaké'
  }
};

export default function SimplifiedSignup() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<'role' | 'info'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });

  // Simple vocal synthesis for reading instructions
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Simple vocal input
  const startVoiceInput = (field: 'name' | 'phone' | 'location') => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Non disponible",
        description: "La saisie vocale n'est pas disponible sur ce navigateur.",
        variant: "destructive"
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ ...prev, [field]: transcript }));
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Erreur",
        description: "La saisie vocale a échoué. Réessayez.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('info');
    speak(`Vous avez choisi ${roleConfig[role].label}. Veuillez renseigner vos informations.`);
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;

    // Validation minimale
    if (!formData.name.trim()) {
      toast({
        title: "Information manquante",
        description: "Veuillez entrer votre nom.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Information manquante",
        description: "Veuillez entrer votre numéro de téléphone.",
        variant: "destructive"
      });
      return;
    }

    // Phone validation simple
    const phoneRegex = /^[0-9+\s-]{8,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Numéro invalide",
        description: "Vérifiez votre numéro de téléphone.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.location.trim()) {
      toast({
        title: "Information manquante",
        description: "Veuillez entrer votre localisation.",
        variant: "destructive"
      });
      return;
    }

    // Create account with minimal info
    const result = await signup({
      email: `${formData.phone.replace(/[^0-9]/g, '')}@temp.ivoire.ci`, // Temp email
      password: Math.random().toString(36).slice(-12), // Auto-generated
      name: formData.name,
      role: selectedRole,
      phone: formData.phone,
      location: formData.location,
      businessName: selectedRole !== 'producer' ? formData.name : undefined
    });

    if (result.success) {
      toast({
        title: "Bienvenue!",
        description: "Votre compte a été créé avec succès."
      });
      speak("Bienvenue! Votre compte a été créé avec succès.");

      // Redirect to appropriate dashboard
      setTimeout(() => {
        navigate(`/${selectedRole}/dashboard`);
      }, 1500);
    } else if (result.error) {
      toast({
        title: "Erreur",
        description: result.error.message,
        variant: "destructive"
      });
    }
  };

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Rejoignez-nous
            </h1>
            <p className="text-xl text-gray-600">
              Qui êtes-vous?
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => speak("Choisissez votre profil: Commerçant, Producteur, ou Coopérative")}
              className="gap-2"
            >
              <Volume2 className="h-5 w-5" />
              Écouter les instructions
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(roleConfig) as [UserRole, typeof roleConfig[UserRole]][]).map(([role, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl border-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl p-8 text-center bg-white",
                    config.color === 'blue' && "border-blue-500 hover:bg-blue-50",
                    config.color === 'green' && "border-green-500 hover:bg-green-50",
                    config.color === 'orange' && "border-orange-500 hover:bg-orange-50"
                  )}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                      "w-24 h-24 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      config.color === 'blue' && "bg-blue-100",
                      config.color === 'green' && "bg-green-100",
                      config.color === 'orange' && "bg-orange-100"
                    )}>
                      <Icon className={cn(
                        "h-12 w-12",
                        config.color === 'blue' && "text-blue-600",
                        config.color === 'green' && "text-green-600",
                        config.color === 'orange' && "text-orange-600"
                      )} />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {config.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              J'ai déjà un compte
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Info form
  const config = selectedRole ? roleConfig[selectedRole] : roleConfig.merchant;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl border-4 border-orange-200">
          <CardHeader className="text-center space-y-4 pb-8 bg-gradient-to-br from-orange-100 to-green-100">
            <div className="flex justify-center">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center",
                config.color === 'blue' && "bg-blue-500",
                config.color === 'green' && "bg-green-500",
                config.color === 'orange' && "bg-orange-500"
              )}>
                <Icon className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">
              Créer mon compte {config.label}
            </CardTitle>
            <p className="text-base text-gray-600">
              Seulement 3 informations nécessaires
            </p>
          </CardHeader>

          <CardContent className="pt-8 space-y-6">
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Votre nom
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={config.placeholder}
                    className="text-lg h-14 text-center"
                    disabled={isListening}
                  />
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => startVoiceInput('name')}
                    disabled={isListening}
                    className="h-14 w-14 shrink-0"
                  >
                    <Mic className={cn("h-6 w-6", isListening && "text-red-500 animate-pulse")} />
                  </Button>
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Votre téléphone
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+225 07 XX XX XX XX"
                    className="text-lg h-14 text-center"
                    disabled={isListening}
                  />
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => startVoiceInput('phone')}
                    disabled={isListening}
                    className="h-14 w-14 shrink-0"
                  >
                    <Mic className={cn("h-6 w-6", isListening && "text-red-500 animate-pulse")} />
                  </Button>
                </div>
              </div>

              {/* Location Field */}
              <div className="space-y-3">
                <Label htmlFor="location" className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Votre localisation
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={config.locationPlaceholder}
                    className="text-lg h-14 text-center"
                    disabled={isListening}
                  />
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => startVoiceInput('location')}
                    disabled={isListening}
                    className="h-14 w-14 shrink-0"
                  >
                    <Mic className={cn("h-6 w-6", isListening && "text-red-500 animate-pulse")} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                size="lg"
                className="h-16 text-xl font-bold bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep('role')}
                disabled={isLoading}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Changer de profil
              </Button>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-700">
                <strong>Astuce:</strong> Utilisez le bouton micro pour parler au lieu d'écrire
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
