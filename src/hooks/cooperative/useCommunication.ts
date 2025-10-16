import { useState, useEffect } from 'react';

interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'announcement' | 'alert' | 'reminder' | 'information';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender: string;
  senderRole: string;
  recipients: string[];
  targetGroups: string[];
  status: 'draft' | 'sent' | 'delivered' | 'read';
  createdAt: string;
  scheduledAt?: string;
  deliveredAt?: string;
  readAt?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  readBy?: Array<{
    memberId: string;
    memberName: string;
    readAt: string;
  }>;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'important' | 'emergency';
  author: string;
  authorRole: string;
  status: 'published' | 'archived' | 'draft';
  visibility: 'all' | 'members' | 'committee' | 'staff';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  attachments?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  readCount: number;
  comments?: Array<{
    id: string;
    author: string;
    authorRole: string;
    content: string;
    createdAt: string;
  }>;
  readBy?: Array<{
    memberId: string;
    memberName: string;
    readAt: string;
  }>;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  categories: {
    announcements: boolean;
    alerts: boolean;
    reminders: boolean;
    orders: boolean;
    routes: boolean;
    warehouses: boolean;
  };
}

interface CommunicationStats {
  totalMessages: number;
  unreadMessages: number;
  totalAnnouncements: number;
  recentAnnouncements: number;
  deliveryRate: number;
  readRate: number;
}

export const useCommunication = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Données de démonstration
  const mockMessages: Message[] = [
    {
      id: '1',
      subject: 'Maintenance des entrepôts',
      content: 'La maintenance annuelle des entrepôts est prévue pour le 15 octobre. Veuillez préparer vos stocks.',
      type: 'reminder',
      priority: 'medium',
      sender: 'Direction Technique',
      senderRole: 'admin',
      recipients: ['all'],
      targetGroups: ['warehouse_managers', 'members'],
      status: 'delivered',
      createdAt: '2024-10-01T10:00:00Z',
      scheduledAt: '2024-10-01T10:00:00Z',
      deliveredAt: '2024-10-01T10:05:00Z',
      readBy: [
        { memberId: '1', memberName: 'Jean Dupont', readAt: '2024-10-01T10:15:00Z' },
        { memberId: '2', memberName: 'Marie Martin', readAt: '2024-10-01T11:20:00Z' }
      ]
    },
    {
      id: '2',
      subject: 'Nouvelle commande groupée',
      content: 'Une nouvelle commande groupée d\'engrais est ouverte. Date limite de participation: 20 octobre.',
      type: 'announcement',
      priority: 'high',
      sender: 'Service des Approvisionnements',
      senderRole: 'staff',
      recipients: ['all'],
      targetGroups: ['members'],
      status: 'sent',
      createdAt: '2024-10-02T14:30:00Z',
      attachments: [
        { name: 'catalogue_engrais.pdf', type: 'pdf', size: '2.5MB', url: '/files/catalogue_engrais.pdf' }
      ]
    },
    {
      id: '3',
      subject: 'Alerte météo',
      content: 'Des fortes pluies sont attendues dans la région. Veuillez sécuriser vos équipements et stocks.',
      type: 'alert',
      priority: 'urgent',
      sender: 'Comité de Sécurité',
      senderRole: 'committee',
      recipients: ['all'],
      targetGroups: ['all'],
      status: 'read',
      createdAt: '2024-10-03T08:00:00Z',
      deliveredAt: '2024-10-03T08:01:00Z',
      readAt: '2024-10-03T08:30:00Z'
    }
  ];

  const mockAnnouncements: Announcement[] = [
    {
      id: '1',
      title: 'Assemblée Générale Annuelle',
      content: 'L\'assemblée générale annuelle de la coopérative se tiendra le 25 novembre 2024 à 14h. Tous les membres sont invités à participer.',
      type: 'important',
      author: 'Présidence',
      authorRole: 'committee',
      status: 'published',
      visibility: 'all',
      createdAt: '2024-10-01T09:00:00Z',
      updatedAt: '2024-10-01T09:00:00Z',
      readCount: 45,
      comments: [
        {
          id: '1',
          author: 'Jean Dupont',
          authorRole: 'member',
          content: 'Serait-il possible d\'avoir l\'ordre du jour à l\'avance ?',
          createdAt: '2024-10-01T10:30:00Z'
        }
      ]
    },
    {
      id: '2',
      title: 'Nouveaux tarifs de transport',
      content: 'À compter du 1er novembre, de nouveaux tarifs de transport seront appliqués pour les livraisons. Consultez le tableau détaillé.',
      type: 'general',
      author: 'Service Logistique',
      authorRole: 'staff',
      status: 'published',
      visibility: 'all',
      createdAt: '2024-10-02T16:00:00Z',
      updatedAt: '2024-10-02T16:00:00Z',
      readCount: 32,
      attachments: [
        { name: 'tarifs_transport_nov2024.pdf', type: 'pdf', size: '1.8MB', url: '/files/tarifs_transport.pdf' }
      ]
    },
    {
      id: '3',
      title: 'Urgence: Problème système',
      content: 'Le système de gestion des stocks est temporairement indisponible. Nos techniciens travaillent sur une résolution.',
      type: 'emergency',
      author: 'Direction Informatique',
      authorRole: 'admin',
      status: 'published',
      visibility: 'all',
      createdAt: '2024-10-03T11:00:00Z',
      updatedAt: '2024-10-03T12:30:00Z',
      expiresAt: '2024-10-03T18:00:00Z',
      readCount: 67
    }
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setLoading(true);
    setTimeout(() => {
      setMessages(mockMessages);
      setAnnouncements(mockAnnouncements);
      setLoading(false);
    }, 1000);
  }, []);

  // CRUD Messages
  const createMessage = (messageData: Omit<Message, 'id' | 'createdAt' | 'status'>) => {
    const newMessage: Message = {
      ...messageData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const updateMessage = (id: string, messageData: Partial<Message>) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === id ? { ...message, ...messageData } : message
      )
    );
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  };

  const sendMessage = (id: string) => {
    updateMessage(id, { 
      status: 'sent',
      deliveredAt: new Date().toISOString() 
    });
  };

  // CRUD Announcements
  const createAnnouncement = (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'readCount'>) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readCount: 0
    };
    setAnnouncements(prev => [...prev, newAnnouncement]);
    return newAnnouncement;
  };

  const updateAnnouncement = (id: string, announcementData: Partial<Announcement>) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === id 
          ? { ...announcement, ...announcementData, updatedAt: new Date().toISOString() } 
          : announcement
      )
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
  };

  const publishAnnouncement = (id: string) => {
    updateAnnouncement(id, { status: 'published' });
  };

  const archiveAnnouncement = (id: string) => {
    updateAnnouncement(id, { status: 'archived' });
  };

  // Search and Filter
  const searchMessages = (query: string) => {
    return messages.filter(message =>
      message.subject.toLowerCase().includes(query.toLowerCase()) ||
      message.content.toLowerCase().includes(query.toLowerCase()) ||
      message.sender.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filterMessagesByType = (type: string) => {
    if (type === 'all') return messages;
    return messages.filter(message => message.type === type);
  };

  const filterMessagesByPriority = (priority: string) => {
    if (priority === 'all') return messages;
    return messages.filter(message => message.priority === priority);
  };

  const filterMessagesByStatus = (status: string) => {
    if (status === 'all') return messages;
    return messages.filter(message => message.status === status);
  };

  const searchAnnouncements = (query: string) => {
    return announcements.filter(announcement =>
      announcement.title.toLowerCase().includes(query.toLowerCase()) ||
      announcement.content.toLowerCase().includes(query.toLowerCase()) ||
      announcement.author.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filterAnnouncementsByType = (type: string) => {
    if (type === 'all') return announcements;
    return announcements.filter(announcement => announcement.type === type);
  };

  const filterAnnouncementsByVisibility = (visibility: string) => {
    if (visibility === 'all') return announcements;
    return announcements.filter(announcement => announcement.visibility === visibility);
  };

  const filterAnnouncementsByStatus = (status: string) => {
    if (status === 'all') return announcements;
    return announcements.filter(announcement => announcement.status === status);
  };

  // Stats
  const getStats = (): CommunicationStats => {
    const unreadMessages = messages.filter(m => m.status !== 'read').length;
    const recentAnnouncements = announcements.filter(a => 
      new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const deliveredMessages = messages.filter(m => m.status === 'delivered' || m.status === 'read').length;
    const readMessages = messages.filter(m => m.status === 'read').length;
    
    const deliveryRate = messages.length > 0 ? Math.round((deliveredMessages / messages.length) * 100) : 0;
    const readRate = deliveredMessages > 0 ? Math.round((readMessages / deliveredMessages) * 100) : 0;

    return {
      totalMessages: messages.length,
      unreadMessages,
      totalAnnouncements: announcements.length,
      recentAnnouncements,
      deliveryRate,
      readRate
    };
  };

  // Export
  const exportMessages = () => {
    const headers = ['ID', 'Sujet', 'Type', 'Priorité', 'Expéditeur', 'Statut', 'Date création'];
    const csvContent = [
      headers.join(','),
      ...messages.map(msg => [
        msg.id,
        msg.subject,
        msg.type,
        msg.priority,
        msg.sender,
        msg.status,
        msg.createdAt
      ].join(','))
    ].join('\n');
    return csvContent;
  };

  const exportAnnouncements = () => {
    const headers = ['ID', 'Titre', 'Type', 'Auteur', 'Statut', 'Visibilité', 'Date création', 'Lectures'];
    const csvContent = [
      headers.join(','),
      ...announcements.map(ann => [
        ann.id,
        ann.title,
        ann.type,
        ann.author,
        ann.status,
        ann.visibility,
        ann.createdAt,
        ann.readCount
      ].join(','))
    ].join('\n');
    return csvContent;
  };

  // Mark as read
  const markMessageAsRead = (id: string) => {
    updateMessage(id, { 
      status: 'read',
      readAt: new Date().toISOString() 
    });
  };

  const markAnnouncementAsRead = (id: string, memberId: string, memberName: string) => {
    const announcement = announcements.find(a => a.id === id);
    if (announcement) {
      const readBy = announcement.readBy || [];
      if (!readBy.find(r => r.memberId === memberId)) {
        readBy.push({ memberId, memberName, readAt: new Date().toISOString() });
        updateAnnouncement(id, { 
          readBy,
          readCount: announcement.readCount + 1 
        });
      }
    }
  };

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setMessages(mockMessages);
      setAnnouncements(mockAnnouncements);
      setLoading(false);
    }, 500);
  };

  return {
    // State
    messages,
    announcements,
    loading,
    error,

    // Messages CRUD
    createMessage,
    updateMessage,
    deleteMessage,
    sendMessage,

    // Announcements CRUD
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
    archiveAnnouncement,

    // Search and Filter
    searchMessages,
    filterMessagesByType,
    filterMessagesByPriority,
    filterMessagesByStatus,
    searchAnnouncements,
    filterAnnouncementsByType,
    filterAnnouncementsByVisibility,
    filterAnnouncementsByStatus,

    // Stats
    getStats,

    // Export
    exportMessages,
    exportAnnouncements,

    // Mark as read
    markMessageAsRead,
    markAnnouncementAsRead,

    // Refresh
    refresh
  };
};
