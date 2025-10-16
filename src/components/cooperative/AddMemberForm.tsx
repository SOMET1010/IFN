import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AddMemberFormProps {
  onClose?: () => void;
  onSubmit?: (data: any) => void;
}

interface FormData {
  // Étape 1: Informations personnelles
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  
  // Étape 2: Localisation
  address: string;
  city: string;
  region: string;
  
  // Étape 3: Activité professionnelle
  occupation: string;
  specialization: string;
  experience: string;
  productionCapacity: string;
  
  // Étape 4: Documents
  idCard?: File;
  proofOfAddress?: File;
  photo?: File;
}

const steps = [
  { id: 1, title: "Informations personnelles", icon: User },
  { id: 2, title: "Localisation", icon: MapPin },
  { id: 3, title: "Activité professionnelle", icon: Briefcase },
  { id: 4, title: "Documents", icon: Upload },
];

export const AddMemberForm = ({ onClose, onSubmit }: AddMemberFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    region: "",
    occupation: "",
    specialization: "",
    experience: "",
    productionCapacity: "",
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit?.(formData);
    onClose?.();
  };

  const handleFileUpload = (field: keyof FormData, file: File) => {
    updateFormData(field, file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        <CardHeader className="bg-gradient-to-r from-orange-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle>Ajouter un Nouveau Membre</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        {/* Stepper */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStep >= step.id
                        ? "bg-gradient-to-r from-orange-500 to-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-xs mt-2 text-center hidden md:block">
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu du formulaire */}
        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          <AnimatePresence mode="wait">
            {/* Étape 1: Informations personnelles */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      placeholder="Kouadio"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      placeholder="Yao"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        placeholder="+225 07 12 34 56 78"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        placeholder="k.yao@example.ci"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Genre *</Label>
                    <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="female">Femme</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 2: Localisation */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="address">Adresse complète *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    placeholder="Rue, quartier, commune..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      placeholder="Abidjan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Région *</Label>
                    <Select value={formData.region} onValueChange={(value) => updateFormData("region", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abidjan">Abidjan</SelectItem>
                        <SelectItem value="yamoussoukro">Yamoussoukro</SelectItem>
                        <SelectItem value="bouake">Bouaké</SelectItem>
                        <SelectItem value="daloa">Daloa</SelectItem>
                        <SelectItem value="san-pedro">San-Pédro</SelectItem>
                        <SelectItem value="korhogo">Korhogo</SelectItem>
                        <SelectItem value="man">Man</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 3: Activité professionnelle */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="occupation">Activité principale *</Label>
                  <Select value={formData.occupation} onValueChange={(value) => updateFormData("occupation", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cacao">Producteur de cacao</SelectItem>
                      <SelectItem value="cafe">Producteur de café</SelectItem>
                      <SelectItem value="anacarde">Producteur d'anacarde</SelectItem>
                      <SelectItem value="karite">Producteur de karité</SelectItem>
                      <SelectItem value="mangue">Producteur de mangues</SelectItem>
                      <SelectItem value="banane">Producteur de bananes</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialization">Spécialisation</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => updateFormData("specialization", e.target.value)}
                    placeholder="Ex: Cacao bio certifié"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience">Années d'expérience *</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience}
                      onChange={(e) => updateFormData("experience", e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productionCapacity">Capacité de production (kg/an)</Label>
                    <Input
                      id="productionCapacity"
                      type="number"
                      value={formData.productionCapacity}
                      onChange={(e) => updateFormData("productionCapacity", e.target.value)}
                      placeholder="5000"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 4: Documents */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <Label htmlFor="idCard" className="cursor-pointer">
                      <span className="text-sm font-medium">Carte d'identité *</span>
                      <p className="text-xs text-gray-500 mt-1">Cliquez pour télécharger</p>
                    </Label>
                    <Input
                      id="idCard"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files && handleFileUpload("idCard", e.target.files[0])}
                    />
                    {formData.idCard && (
                      <p className="text-xs text-green-600 mt-2">✓ {formData.idCard.name}</p>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <Label htmlFor="proofOfAddress" className="cursor-pointer">
                      <span className="text-sm font-medium">Justificatif de domicile</span>
                      <p className="text-xs text-gray-500 mt-1">Cliquez pour télécharger</p>
                    </Label>
                    <Input
                      id="proofOfAddress"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files && handleFileUpload("proofOfAddress", e.target.files[0])}
                    />
                    {formData.proofOfAddress && (
                      <p className="text-xs text-green-600 mt-2">✓ {formData.proofOfAddress.name}</p>
                    )}
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <Label htmlFor="photo" className="cursor-pointer">
                      <span className="text-sm font-medium">Photo de profil</span>
                      <p className="text-xs text-gray-500 mt-1">Cliquez pour télécharger</p>
                    </Label>
                    <Input
                      id="photo"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFileUpload("photo", e.target.files[0])}
                    />
                    {formData.photo && (
                      <p className="text-xs text-green-600 mt-2">✓ {formData.photo.name}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Navigation */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          <div className="text-sm text-gray-500">
            Étape {currentStep} sur {steps.length}
          </div>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

