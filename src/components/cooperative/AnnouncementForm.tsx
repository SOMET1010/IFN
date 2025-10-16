import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Paperclip, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Announcement {
  id?: string;
  title: string;
  content: string;
  type: 'general' | 'important' | 'emergency';
  author: string;
  authorRole: string;
  status?: 'published' | 'archived' | 'draft';
  visibility: 'all' | 'members' | 'committee' | 'staff';
  expiresAt?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
}

interface AnnouncementFormProps {
  item?: Announcement | null;
  onSubmit: (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'readCount'>) => void;
  onCancel: () => void;
}

const AnnouncementForm = ({ item, onSubmit, onCancel }: AnnouncementFormProps) => {
  const [formData, setFormData] = useState<Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'readCount'>>({
    title: '',
    content: '',
    type: 'general',
    author: 'Direction',
    authorRole: 'admin',
    status: 'draft',
    visibility: 'all',
    expiresAt: undefined,
    attachments: []
  });

  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [newAttachment, setNewAttachment] = useState({ name: '', file: null as File | null });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        content: item.content,
        type: item.type,
        author: item.author,
        authorRole: item.authorRole,
        status: item.status,
        visibility: item.visibility,
        expiresAt: item.expiresAt,
        attachments: item.attachments || []
      });
      
      if (item.expiresAt) {
        setExpiryDate(new Date(item.expiresAt));
      }
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      expiresAt: expiryDate ? expiryDate.toISOString() : undefined
    };
    
    onSubmit(data);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | string[] | Array<{ name: string; type: string; size: string; url: string }> | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAttachment = () => {
    if (newAttachment.name && newAttachment.file) {
      const attachment = {
        name: newAttachment.name,
        type: newAttachment.file.type,
        size: `${(newAttachment.file.size / 1024 / 1024).toFixed(2)}MB`,
        url: URL.createObjectURL(newAttachment.file)
      };
      
      handleInputChange('attachments', [...(formData.attachments || []), attachment]);
      setNewAttachment({ name: '', file: null });
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = (formData.attachments || []).filter((_, i) => i !== index);
    handleInputChange('attachments', newAttachments);
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      general: "outline",
      important: "default",
      emergency: "destructive"
    } as const;

    const labels = {
      general: "Général",
      important: "Important",
      emergency: "Urgence"
    };

    return (
      <Badge variant={variants[type as keyof typeof variants]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const getVisibilityBadge = (visibility: string) => {
    const variants = {
      all: "default",
      members: "secondary",
      committee: "outline",
      staff: "outline"
    } as const;

    const labels = {
      all: "Tout le monde",
      members: "Membres",
      committee: "Comité",
      staff: "Personnel"
    };

    return (
      <Badge variant={variants[visibility as keyof typeof variants]}>
        {labels[visibility as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations de l'annonce</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Titre de l'annonce"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Général</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="emergency">Urgence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visibility">Visibilité</Label>
              <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la visibilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout le monde</SelectItem>
                  <SelectItem value="members">Membres uniquement</SelectItem>
                  <SelectItem value="committee">Comité uniquement</SelectItem>
                  <SelectItem value="staff">Personnel uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="author">Auteur</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Nom de l'auteur"
                required
              />
            </div>

            <div>
              <Label htmlFor="authorRole">Rôle de l'auteur</Label>
              <Select value={formData.authorRole} onValueChange={(value) => handleInputChange('authorRole', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administration</SelectItem>
                  <SelectItem value="committee">Comité</SelectItem>
                  <SelectItem value="staff">Personnel</SelectItem>
                  <SelectItem value="member">Membre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Options de publication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date d'expiration</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="expiry"
                  checked={!!expiryDate}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      setExpiryDate(undefined);
                    }
                  }}
                />
                <Label htmlFor="expiry">Définir une date d'expiration</Label>
              </div>
              
              {expiryDate && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP p", { locale: fr }) : "Choisir une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Aperçu de l'annonce</p>
                <div className="flex items-center gap-2 mt-1">
                  {getTypeBadge(formData.type)}
                  {getVisibilityBadge(formData.visibility)}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{formData.author}</p>
                <p>{formData.status === 'published' ? 'Publié' : 'Brouillon'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contenu de l'annonce</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Contenu de l'annonce..."
              rows={8}
              required
            />
          </div>

          <div>
            <Label>Pièces jointes</Label>
            <div className="space-y-2 mt-2">
              {(formData.attachments || []).map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">{attachment.type} • {attachment.size}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center gap-2 p-3 border border-dashed rounded-lg">
                <Input
                  placeholder="Nom du fichier"
                  value={newAttachment.name}
                  onChange={(e) => setNewAttachment(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1"
                />
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNewAttachment(prev => ({ ...prev, file }));
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddAttachment}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {item ? 'Mettre à jour' : 'Créer l\'annonce'}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
