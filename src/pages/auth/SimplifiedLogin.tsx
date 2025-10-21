import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Phone,
  Smartphone,
  Loader2,
  ArrowRight,
  Volume2,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type LoginMethod = 'phone' | 'mobilemoney';

export default function SimplifiedLogin() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const [method, setMethod] = useState<LoginMethod>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
  };

  const handleSendOTP = async () => {
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      toast({
        title: "Numéro invalide",
        description: "Entrez un numéro de téléphone valide.",
        variant: "destructive"
      });
      return;
    }

    // Simulate OTP sending
    setStep('otp');
    toast({
      title: "Code envoyé!",
      description: `Un code a été envoyé au ${phone}`,
    });
    speak(`Un code de vérification a été envoyé au ${phone}`);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      toast({
        title: "Code invalide",
        description: "Entrez le code à 4 chiffres.",
        variant: "destructive"
      });
      return;
    }

    // Simulate login
    const success = await login(phone, otp);

    if (success) {
      toast({
        title: "Connexion réussie!",
        description: "Bienvenue!"
      });
      speak("Connexion réussie! Bienvenue!");
      navigate('/dashboard');
    } else {
      toast({
        title: "Erreur",
        description: "Code incorrect. Réessayez.",
        variant: "destructive"
      });
    }
  };

  const handleMobileMoneyLogin = () => {
    toast({
      title: "Mobile Money",
      description: "Composez *123# pour vous connecter via Mobile Money",
    });
    speak("Composez étoile 1 2 3 dièse pour vous connecter via Mobile Money");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-green-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Phone className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Connexion</h1>
          <p className="text-lg text-gray-600">Simple et rapide avec votre téléphone</p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => speak("Bienvenue! Connectez-vous avec votre numéro de téléphone")}
            className="gap-2"
          >
            <Volume2 className="h-5 w-5" />
            Écouter les instructions
          </Button>
        </div>

        {/* Login Methods */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMethod('phone')}
            className={cn(
              "p-4 rounded-2xl border-3 transition-all text-center",
              method === 'phone'
                ? "bg-orange-100 border-orange-500 shadow-lg scale-105"
                : "bg-white border-gray-200 hover:border-orange-300"
            )}
          >
            <Phone className={cn(
              "h-8 w-8 mx-auto mb-2",
              method === 'phone' ? "text-orange-600" : "text-gray-400"
            )} />
            <div className="font-semibold">Téléphone</div>
          </button>

          <button
            onClick={() => setMethod('mobilemoney')}
            className={cn(
              "p-4 rounded-2xl border-3 transition-all text-center",
              method === 'mobilemoney'
                ? "bg-green-100 border-green-500 shadow-lg scale-105"
                : "bg-white border-gray-200 hover:border-green-300"
            )}
          >
            <Smartphone className={cn(
              "h-8 w-8 mx-auto mb-2",
              method === 'mobilemoney' ? "text-green-600" : "text-gray-400"
            )} />
            <div className="font-semibold">Mobile Money</div>
          </button>
        </div>

        {/* Phone Login */}
        {method === 'phone' && (
          <Card className="border-4 border-orange-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-br from-orange-100 to-yellow-50">
              <CardTitle className="text-2xl text-center">
                {step === 'phone' ? 'Votre numéro' : 'Entrez le code'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {step === 'phone' ? (
                <>
                  <div className="space-y-3">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="07 XX XX XX XX"
                      className="text-center text-2xl h-16 font-bold tracking-wider"
                      maxLength={14}
                    />
                    <p className="text-center text-sm text-gray-600">
                      Format: 07 12 34 56 78
                    </p>
                  </div>

                  <Button
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        Recevoir le code
                        <ArrowRight className="h-6 w-6 ml-2" />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3].map((index) => (
                        <Input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={otp[index] || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                              const newOtp = otp.split('');
                              newOtp[index] = value;
                              setOtp(newOtp.join(''));

                              // Auto-focus next input
                              if (value && index < 3) {
                                const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                                nextInput?.focus();
                              }
                            }
                          }}
                          className="w-16 h-20 text-center text-3xl font-bold"
                        />
                      ))}
                    </div>
                    <p className="text-center text-sm text-gray-600">
                      Code envoyé à {phone}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={isLoading || otp.length !== 4}
                      size="lg"
                      className="w-full h-16 text-xl font-bold bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-6 w-6 mr-2" />
                          Connexion
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => {
                        setStep('phone');
                        setOtp('');
                      }}
                      className="w-full"
                    >
                      Changer de numéro
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={handleSendOTP}
                      className="w-full text-orange-600"
                    >
                      Renvoyer le code
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mobile Money Login */}
        {method === 'mobilemoney' && (
          <Card className="border-4 border-green-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-br from-green-100 to-emerald-50">
              <CardTitle className="text-2xl text-center">Mobile Money</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Smartphone className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    Composez sur votre téléphone:
                  </p>
                  <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                    <p className="text-4xl font-bold text-green-700">*123#</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Puis suivez les instructions
                  </p>
                </div>
              </div>

              <Button
                onClick={handleMobileMoneyLogin}
                size="lg"
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Smartphone className="h-6 w-6 mr-2" />
                Ouvrir Mobile Money
              </Button>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-900">
                  <strong>Premiers pas?</strong>
                  <br />
                  L'inscription se fait directement via *123#
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signup Link */}
        <div className="text-center space-y-3">
          <Button
            onClick={() => navigate('/signup/simplified')}
            variant="outline"
            size="lg"
            className="w-full h-14 text-lg font-semibold border-2"
          >
            Créer un nouveau compte
          </Button>

          <p className="text-sm text-gray-600">
            C'est gratuit et rapide!
          </p>
        </div>
      </div>
    </div>
  );
}
