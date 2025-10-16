import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Camera, Mic, MicOff, Image as ImageIcon, Upload, X, Star, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProducerHarvest } from '@/types';
import { producerHarvestService } from '@/services/producer/producerHarvestService';
import { useToast } from '@/hooks/use-toast';

const harvestSchema = z.object({
  product: z.string().min(1, 'Le produit est requis'),
  variety: z.string().optional(),
  quantity: z.number().min(0.1, 'La quantité doit être supérieure à 0'),
  unit: z.enum(['kg', 'piece', 'tonne', 'sac']),
  date: z.date({
    required_error: 'La date de récolte est requise',
    invalid_type_error: 'Date invalide',
  }),
  location: z.string().optional(),
  quality: z.enum(['Standard', 'Premium', 'Bio', 'AOP', 'Label Rouge']),
  weather_conditions: z.string().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
  voiceNotes: z.array(z.string()).optional(),
  grade: z.number().min(1).max(5).optional(),
});

type HarvestFormData = z.infer<typeof harvestSchema>;

interface HarvestFormProps {
  harvest?: ProducerHarvest;
  producerId: string;
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function HarvestForm({
  harvest,
  producerId,
  onSuccess,
  isOpen = false,
  onOpenChange,
  showTrigger = true
}: HarvestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [photos, setPhotos] = useState<string[]>(harvest?.photos || []);
  const [voiceNotes, setVoiceNotes] = useState<string[]>(harvest?.voiceNotes || []);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const form = useForm<HarvestFormData>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      product: harvest?.product || '',
      variety: harvest?.variety || '',
      quantity: harvest?.quantity || 0,
      unit: harvest?.unit || 'kg',
      date: harvest?.date ? new Date(harvest.date) : new Date(),
      location: harvest?.location || '',
      quality: harvest?.quality || 'Standard',
      weather_conditions: harvest?.weather_conditions || '',
      notes: harvest?.notes || '',
      photos: harvest?.photos || [],
      voiceNotes: harvest?.voiceNotes || [],
      grade: harvest?.grade || undefined,
    },
  });

  // Cleanup function for media streams
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Photo capture functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setPhotos(prev => [...prev, dataUrl]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhotos(prev => [...prev, dataUrl]);
        setShowCamera(false);
        stopCamera();
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      toast({ title: 'Caméra indisponible', description: 'Impossible d\'accéder à la caméra', variant: 'destructive' });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setVoiceNotes(prev => [...prev, audioUrl]);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error);
      toast({ title: 'Microphone indisponible', description: 'Impossible d\'accéder au microphone', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      stopCamera();
    }
  };

  const removeVoiceNote = (index: number) => {
    setVoiceNotes(prev => {
      const newNotes = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]); // Clean up URL
      return newNotes;
    });
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: HarvestFormData) => {
    setIsSubmitting(true);
    try {
      const harvestData = {
        producer_id: producerId,
        product: data.product,
        variety: data.variety,
        quantity: data.quantity,
        unit: data.unit,
        date: data.date.toISOString().split('T')[0],
        location: data.location,
        quality: data.quality,
        weather_conditions: data.weather_conditions,
        notes: data.notes,
        photos: photos,
        voiceNotes: voiceNotes,
        grade: data.grade,
      };

      let response;
      if (harvest?.id) {
        response = await producerHarvestService.updateHarvest(harvest.id, harvestData);
      } else {
        response = await producerHarvestService.createHarvest(harvestData);
      }

      if (response.success) {
        form.reset();
        setPhotos([]);
        setVoiceNotes([]);
        onSuccess?.();
        onOpenChange?.(false);
        toast({ title: harvest?.id ? 'Récolte mise à jour' : 'Récolte enregistrée', description: `${harvestData.product} • ${harvestData.quantity} ${harvestData.unit}` });
      } else {
        toast({ title: 'Erreur', description: response.error || 'Une erreur est survenue', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la récolte:', error);
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="ivoire" className="gap-2">
            {harvest ? 'Modifier' : 'Nouvelle Récolte'}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {harvest ? 'Modifier la récolte' : 'Enregistrer une nouvelle récolte'}
          </DialogTitle>
          <DialogDescription>
            {harvest 
              ? 'Modifiez les informations de votre récolte existante.' 
              : 'Enregistrez les détails de votre récolte pour suivre votre production et la mettre à disposition des acheteurs.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produit *</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Cacao, Café, Anacarde" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variety"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variété</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Forastero, Criollo, Arabica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualité *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la qualité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Bio">Bio</SelectItem>
                        <SelectItem value="AOP">AOP</SelectItem>
                        <SelectItem value="Label Rouge">Label Rouge</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note qualité (1-5)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 cursor-pointer transition-colors ${
                              star <= (field.value || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => field.onChange(star)}
                          />
                        ))}
                        {field.value && (
                          <span className="text-sm text-muted-foreground ml-2">
                            {field.value}/5
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="ex: 450"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'unité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="piece">pièce</SelectItem>
                        <SelectItem value="tonne">tonne</SelectItem>
                        <SelectItem value="sac">sac</SelectItem>
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
                      <Input placeholder="ex: Parcelle A, Champ Nord" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weather_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conditions météo</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Sec, Humide, Pluvieux" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Date de récolte *</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch('date') ? (
                  format(form.watch('date'), 'PPP', { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
              {showCalendar && (
                <div className="absolute z-10 bg-white border rounded-md shadow-lg">
                  <Calendar
                    mode="single"
                    selected={form.watch('date')}
                    onSelect={(date) => {
                      form.setValue('date', date);
                      setShowCalendar(false);
                    }}
                    locale={fr}
                    disabled={(date) => date > new Date()}
                  />
                </div>
              )}
            </div>

            {/* Photo Capture Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Photos des récoltes</Label>
              <div className="flex gap-2 mb-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Télécharger photos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startCamera}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Prendre photo
                </Button>
              </div>

              {/* Camera Preview */}
              {showCamera && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-48 object-cover rounded-md bg-black"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={capturePhoto}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Capturer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={stopCamera}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Recording Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Notes vocales</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="gap-2"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      Arrêter ({formatRecordingTime(recordingTime)})
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>

              {/* Voice Notes List */}
              {voiceNotes.length > 0 && (
                <div className="space-y-2">
                  {voiceNotes.map((note, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      <audio src={note} controls className="flex-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVoiceNote(index)}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes écrites</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observations, rendement, problèmes rencontrés, etc."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1 w-full sm:w-auto">
                {isSubmitting ? 'Enregistrement...' : harvest ? 'Modifier' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} className="flex-1 w-full sm:w-auto">
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
