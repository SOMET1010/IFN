import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Store,
  CheckCircle,
  ChevronRight,
  Gift,
  Star,
  Trophy,
  Mic,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  benefit: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'email' | 'tel';
    placeholder: string;
    required: boolean;
  }[];
  completed: boolean;
  points: number;
}

export function ProgressiveProfile() {
  const { user, updateUser } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(30);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    alternatePhone: '',
    businessDescription: '',
    businessHours: ''
  });

  const sections: ProfileSection[] = [
    {
      id: 'contact',
      title: 'Informations de contact',
      description: 'Ajoutez un email pour recevoir des notifications',
      icon: Mail,
      benefit: 'Recevez des alertes importantes',
      fields: [
        {
          id: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'votre@email.com',
          required: false
        },
        {
          id: 'alternatePhone',
          label: 'Téléphone secondaire',
          type: 'tel',
          placeholder: '+225 XX XX XX XX XX',
          required: false
        }
      ],
      completed: !!user?.email,
      points: 20
    },
    {
      id: 'business',
      title: 'Détails de votre activité',
      description: 'Décrivez votre activité en quelques mots',
      icon: Store,
      benefit: 'Attirez plus de clients',
      fields: [
        {
          id: 'businessDescription',
          label: 'Description',
          type: 'text',
          placeholder: 'Ex: Vente de fruits et légumes frais',
          required: false
        },
        {
          id: 'businessHours',
          label: 'Horaires',
          type: 'text',
          placeholder: 'Ex: Lun-Sam 8h-18h',
          required: false
        }
      ],
      completed: false,
      points: 30
    }
  ];

  useEffect(() => {
    calculateCompletion();
  }, [formData, user]);

  const calculateCompletion = () => {
    let points = 30; // Base points for having an account

    if (formData.email) points += 20;
    if (formData.alternatePhone) points += 10;
    if (formData.businessDescription) points += 20;
    if (formData.businessHours) points += 10;

    setCompletionPercentage(Math.min(points, 100));
    setTotalPoints(points);
  };

  const startVoiceInput = (fieldId: string) => {
    if (!('webkitSpeechRecognition' in window)) {
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    setActiveField(fieldId);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ ...prev, [fieldId]: transcript }));
      setIsListening(false);
      setActiveField(null);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setActiveField(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setActiveField(null);
    };

    recognition.start();
  };

  const handleSaveSection = async (sectionId: string) => {
    try {
      await updateUser(formData);
      setExpandedSection(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getCompletionMessage = () => {
    if (completionPercentage < 50) {
      return "Continuez! Chaque information compte.";
    } else if (completionPercentage < 80) {
      return "Très bien! Vous y êtes presque.";
    } else if (completionPercentage < 100) {
      return "Excellent! Encore un petit effort.";
    } else {
      return "Parfait! Profil 100% complet!";
    }
  };

  const getCompletionColor = () => {
    if (completionPercentage < 50) return "text-red-600";
    if (completionPercentage < 80) return "text-orange-600";
    return "text-green-600";
  };

  if (!showBanner) return null;

  return (
    <div className="mb-6">
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-bl-full opacity-30" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-200 rounded-tr-full opacity-30" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBanner(false)}
          className="absolute top-2 right-2 z-10"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="relative">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">Complétez votre profil</CardTitle>
              <p className="text-gray-600">
                {getCompletionMessage()}
              </p>
            </div>
            <div className="text-right">
              <div className={cn("text-3xl font-bold", getCompletionColor())}>
                {completionPercentage}%
              </div>
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Star className="h-4 w-4 fill-orange-500" />
                {totalPoints} points
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 relative">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;

            return (
              <div key={section.id}>
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md",
                    section.completed ? "bg-green-50 border-green-300" : "bg-white border-gray-200 hover:border-orange-300"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    section.completed ? "bg-green-500" : "bg-orange-500"
                  )}>
                    {section.completed ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <Icon className="h-6 w-6 text-white" />
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-semibold text-lg flex items-center gap-2">
                      {section.title}
                      {!section.completed && (
                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                          +{section.points} pts
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{section.description}</p>
                    <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                      <Gift className="h-3 w-3" />
                      {section.benefit}
                    </div>
                  </div>

                  <ChevronRight className={cn(
                    "h-5 w-5 text-gray-400 transition-transform shrink-0",
                    isExpanded && "rotate-90"
                  )} />
                </button>

                {isExpanded && (
                  <div className="mt-3 ml-16 p-4 bg-white rounded-xl border-2 border-orange-200 space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-base font-medium">
                          {field.label}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={field.id}
                            type={field.type}
                            value={formData[field.id as keyof typeof formData]}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="text-base h-12"
                            disabled={isListening && activeField === field.id}
                          />
                          <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            onClick={() => startVoiceInput(field.id)}
                            disabled={isListening}
                            className="h-12 w-12 shrink-0"
                          >
                            <Mic className={cn(
                              "h-5 w-5",
                              isListening && activeField === field.id && "text-red-500 animate-pulse"
                            )} />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleSaveSection(section.id)}
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Enregistrer
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setExpandedSection(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {completionPercentage === 100 && (
            <div className="mt-4 p-4 bg-green-100 border-2 border-green-300 rounded-xl text-center">
              <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-green-800 text-lg">
                Félicitations! Profil 100% complet!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Vous bénéficiez maintenant de tous les avantages de la plateforme.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
