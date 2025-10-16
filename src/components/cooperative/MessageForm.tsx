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

interface Message {
  id?: string;
  subject: string;
  content: string;
  type: 'announcement' | 'alert' | 'reminder' | 'information';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender: string;
  senderRole: string;
  recipients: string[];
  targetGroups: string[];
  status?: 'draft' | 'sent' | 'delivered' | 'read';
  scheduledAt?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
}

interface MessageFormProps {
  item?: Message | null;
  onSubmit: (data: Omit<Message, 'id' | 'createdAt' | 'status'>) => void;
  onCancel: () => void;
}

const targetGroupsOptions = [
  { value: 'all', label: 'Tous les membres' },
  { value: 'members', label: 'Membres actifs' },
  { value: 'committee', label: 'Comité de direction' },
  { value: 'staff', label: 'Personnel' },
  { value: 'warehouse_managers', label: 'Gestionnaires d\'entrepôts' },
  { value: 'drivers', label: 'Chauffeurs' },
  { value: 'farmers', label: 'Agriculteurs' }
];

const MessageForm = ({ item, onSubmit, onCancel }: MessageFormProps) => {
  const [formData, setFormData] = useState<Omit<Message, 'id' | 'createdAt' | 'status'>>({
    subject: '',
    content: '',
    type: 'information',
    priority: 'medium',
    sender: 'Direction',
    senderRole: 'admin',
    recipients: ['all'],
    targetGroups: [],
    scheduledAt: undefined,
    attachments: []
  });

  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [newAttachment, setNewAttachment] = useState({ name: '', file: null as File | null });

  useEffect(() => {
    if (item) {
      setFormData({
        subject: item.subject,
        content: item.content,
        type: item.type,
        priority: item.priority,
        sender: item.sender,
        senderRole: item.senderRole,
        recipients: item.recipients,
        targetGroups: item.targetGroups,
        scheduledAt: item.scheduledAt,
        attachments: item.attachments || []
      });
      
      if (item.scheduledAt) {
        setScheduledDate(new Date(item.scheduledAt));
      }
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      scheduledAt: scheduledDate ? scheduledDate.toISOString() : undefined
    };
    
    onSubmit(data);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | string[] | Array<{ name: string; type: string; size: string; url: string }> | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetGroupToggle = (group: string) => {
    const currentGroups = formData.targetGroups;
    const newGroups = currentGroups.includes(group)
      ? currentGroups.filter(g => g !== group)
      : [...currentGroups, group];
    
    handleInputChange('targetGroups', newGroups);
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
      announcement: "default",
      alert: "destructive",
      reminder: "secondary",
      information: "outline"
    } as const;

    const labels = {
      announcement: "Annonce",
      alert: "Alerte",
      reminder: "Rappel",
      information: "Information"
    };

    return (
      <Badge variant={variants[type as keyof typeof variants]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "outline",
      medium: "secondary",
      high: "default",
      urgent: "destructive"
    } as const;

    const labels = {
      low: "Basse",
      medium: "Moyenne",
      high: "Élevée",
      urgent: "Urgente"
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations du message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Sujet du message"
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
                  <SelectItem value="announcement">Annonce</SelectItem>
                  <SelectItem value="alert">Alerte</SelectItem>
                  <SelectItem value="reminder">Rappel</SelectItem>
                  <SelectItem value="information">Information</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sender">Expéditeur</Label>
              <Input
                id="sender"
                value={formData.sender}
                onChange={(e) => handleInputChange('sender', e.target.value)}
                placeholder="Nom de l'expéditeur"
                required
              />
            </div>

            <div>
              <Label htmlFor="senderRole">Rôle de l'expéditeur</Label>
              <Select value={formData.senderRole} onValueChange={(value) => handleInputChange('senderRole', value)}>
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
            <CardTitle className="text-lg">Destinataires et planification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Groupes cibles</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {targetGroupsOptions.map((group) => (
                  <div key={group.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={group.value}
                      checked={formData.targetGroups.includes(group.value)}
                      onCheckedChange={() => handleTargetGroupToggle(group.value)}
                    />
                    <Label htmlFor={group.value} className="text-sm">
                      {group.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Planification de l'envoi</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="schedule"
                  checked={!!scheduledDate}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      setScheduledDate(undefined);
                    }
                  }}
                />
                <Label htmlFor="schedule">Envoyer plus tard</Label>
              </div>
              
              {scheduledDate && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP p", { locale: fr }) : "Choisir une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Aperçu du message</p>
                <div className="flex items-center gap-2 mt-1">
                  {getTypeBadge(formData.type)}
                  {getPriorityBadge(formData.priority)}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{formData.sender}</p>
                <p>{formData.targetGroups.length} groupe(s) cible(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contenu du message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Contenu du message..."
              rows={6}
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
          {item ? 'Mettre à jour' : 'Créer le message'}
        </Button>
      </div>
    </form>
  );
};

export default MessageForm;
