import { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Bell,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Share,
  Award,
  Shield,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Truck,
  CreditCard,
  Building2,
  Headphones
} from 'lucide-react';

// Types pour l'interface de négociation
interface NegotiationSession {
  id: string;
  order_id: string;
  product_name: string;
  total_quantity: number;
  unit: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  current_phase: 'initial_contact' | 'price_negotiation' | 'terms_negotiation' | 'finalization' | 'closed';
  started_at: string;
  estimated_duration: string;
  participants: NegotiationParticipant[];
  messages: NegotiationMessage[];
  proposals: NegotiationProposal[];
  current_best_offer?: NegotiationProposal;
  supplier_ratings?: SupplierRating[];
  negotiation_goals: NegotiationGoals;
  constraints: NegotiationConstraints;
  ai_assistance_enabled: boolean;
}

interface NegotiationParticipant {
  id: string;
  name: string;
  role: 'cooperative_representative' | 'supplier_representative' | 'ai_assistant' | 'legal_advisor';
  organization: string;
  contact_info: {
    email?: string;
    phone?: string;
    position?: string;
  };
  permissions: ParticipantPermissions;
  is_active: boolean;
  joined_at: string;
}

interface ParticipantPermissions {
  can_send_messages: boolean;
  can_make_proposals: boolean;
  can_view_details: boolean;
  can_decide: boolean;
  can_invite_others: boolean;
}

interface NegotiationMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  type: 'text' | 'proposal' | 'acceptance' | 'rejection' | 'information' | 'question';
  attachments?: MessageAttachment[];
  timestamp: string;
  is_edited?: boolean;
  edited_at?: string;
  reactions?: MessageReaction[];
}

interface MessageAttachment {
  id: string;
  filename: string;
  type: 'document' | 'image' | 'spreadsheet' | 'contract';
  size: number;
  url: string;
  uploaded_at: string;
}

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface NegotiationProposal {
  id: string;
  session_id: string;
  proposer_id: string;
  proposer_name: string;
  price_per_unit: number;
  total_price: number;
  payment_terms: PaymentTerm[];
  delivery_terms: DeliveryTerm[];
  quality_specifications: QualitySpecification[];
  special_conditions: string[];
  valid_until: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  created_at: string;
  ai_score?: number;
  savings_estimate?: number;
  confidence_level?: number;
}

interface PaymentTerm {
  type: 'upfront' | 'installment' | 'on_delivery' | 'net_days';
  percentage: number;
  days?: number;
  conditions?: string;
}

interface DeliveryTerm {
  method: 'pickup' | 'delivery';
  location?: string;
  timeline: string;
  cost_responsibility: 'supplier' | 'cooperative' | 'shared';
  special_requirements?: string[];
}

interface QualitySpecification {
  parameter: string;
  standard: string;
  tolerance?: string;
  testing_method?: string;
  penalties?: string;
}

interface SupplierRating {
  supplier_id: string;
  supplier_name: string;
  overall_rating: number;
  reliability_score: number;
  quality_score: number;
  price_score: number;
  delivery_score: number;
  communication_score: number;
  total_reviews: number;
  last_review_date?: string;
  certifications: string[];
}

interface NegotiationGoals {
  target_price_per_unit: number;
  max_budget: number;
  min_quality_standard: string;
  preferred_delivery_timeline: string;
  payment_preferences: string[];
  must_have_conditions: string[];
  nice_to_have_conditions: string[];
}

interface NegotiationConstraints {
  hard_deadline: string;
  geographic_limits: string[];
  supplier_requirements: string[];
  regulatory_requirements: string[];
  budget_limits: {
    absolute_max: number;
    preferred_max: number;
  };
}

interface AIInsight {
  id: string;
  type: 'price_prediction' | 'negotiation_strategy' | 'risk_assessment' | 'market_analysis';
  title: string;
  content: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  timestamp: string;
}

interface NegotiationTemplate {
  id: string;
  name: string;
  description: string;
  product_categories: string[];
  typical_terms: {
    payment_terms: PaymentTerm[];
    delivery_terms: DeliveryTerm[];
    quality_clauses: string[];
  };
  success_rate: number;
  average_savings: number;
}

export function CooperativeNegotiationInterface() {
  // États principaux
  const [sessions, setSessions] = useState<NegotiationSession[]>([]);
  const [activeSession, setActiveSession] = useState<NegotiationSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [supplierRatings, setSupplierRatings] = useState<SupplierRating[]>([]);
  const [templates, setTemplates] = useState<NegotiationTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [recordingMode, setRecordingMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simuler le chargement des données
  useEffect(() => {
    // Données de démonstration pour les sessions de négociation
    const mockSessions: NegotiationSession[] = [
      {
        id: 'ns1',
        order_id: 'ao1',
        product_name: 'Engrais NPK 15-15-15',
        total_quantity: 225,
        unit: 'kg',
        status: 'active',
        current_phase: 'price_negotiation',
        started_at: '2024-03-20T09:00:00Z',
        estimated_duration: '2-3 jours',
        participants: [
          {
            id: 'p1',
            name: 'Marie Kouassi',
            role: 'cooperative_representative',
            organization: 'Coopérative Agricole Unie',
            contact_info: { email: 'marie@cooperative.ci', phone: '+225 01 02 03 04', position: 'Présidente' },
            permissions: {
              can_send_messages: true,
              can_make_proposals: true,
              can_view_details: true,
              can_decide: true,
              can_invite_others: true
            },
            is_active: true,
            joined_at: '2024-03-20T09:00:00Z'
          },
          {
            id: 'p2',
            name: 'Jean Moussa',
            role: 'supplier_representative',
            organization: 'AgriSupply Côte d\'Ivoire',
            contact_info: { email: 'jean@agrisupply.ci', phone: '+225 05 06 07 08', position: 'Directeur Commercial' },
            permissions: {
              can_send_messages: true,
              can_make_proposals: true,
              can_view_details: true,
              can_decide: true,
              can_invite_others: false
            },
            is_active: true,
            joined_at: '2024-03-20T09:15:00Z'
          },
          {
            id: 'p3',
            name: 'Assistant IA',
            role: 'ai_assistant',
            organization: 'AgriTrack AI',
            contact_info: {},
            permissions: {
              can_send_messages: true,
              can_make_proposals: false,
              can_view_details: true,
              can_decide: false,
              can_invite_others: false
            },
            is_active: true,
            joined_at: '2024-03-20T09:00:00Z'
          }
        ],
        messages: [
          {
            id: 'm1',
            session_id: 'ns1',
            sender_id: 'p1',
            sender_name: 'Marie Kouassi',
            content: 'Bonjour, je suis ravie de démarrer cette négociation. Nous représentons la Coopérative Agricole Unie et nous sommes intéressés par votre offre d\'engrais NPK.',
            type: 'text',
            timestamp: '2024-03-20T09:05:00Z'
          },
          {
            id: 'm2',
            session_id: 'ns1',
            sender_id: 'p2',
            sender_name: 'Jean Moussa',
            content: 'Bonjour Marie! C\'est un plaisir de travailler avec votre coopérative. Nous avons préparé une offre intéressante pour votre commande de 225kg d\'engrais NPK.',
            type: 'text',
            timestamp: '2024-03-20T09:20:00Z'
          },
          {
            id: 'm3',
            session_id: 'ns1',
            sender_id: 'p3',
            sender_name: 'Assistant IA',
            content: 'Analyse du marché : Le prix moyen actuel pour l\'engrais NPK 15-15-15 est de 850 FCFA/kg. Votre volume de 225kg vous positionne favorablement pour une négociation.',
            type: 'information',
            timestamp: '2024-03-20T09:25:00Z'
          }
        ],
        proposals: [
          {
            id: 'prop1',
            session_id: 'ns1',
            proposer_id: 'p2',
            proposer_name: 'Jean Moussa',
            price_per_unit: 820,
            total_price: 184500,
            payment_terms: [
              { type: 'on_delivery', percentage: 100, conditions: 'Paiement à la réception' }
            ],
            delivery_terms: [
              {
                method: 'delivery',
                location: 'Dépôt principal de la coopérative',
                timeline: '3-5 jours ouvrables',
                cost_responsibility: 'supplier'
              }
            ],
            quality_specifications: [
              {
                parameter: 'Taux d\'azote',
                standard: '15%',
                tolerance: '±0.5%',
                testing_method: 'Analyse en laboratoire'
              },
              {
                parameter: 'Taux de phosphore',
                standard: '15%',
                tolerance: '±0.5%',
                testing_method: 'Analyse en laboratoire'
              },
              {
                parameter: 'Taux de potassium',
                standard: '15%',
                tolerance: '±0.5%',
                testing_method: 'Analyse en laboratoire'
              }
            ],
            special_conditions: [
              'Garantie de satisfaction de 30 jours',
              'Support technique inclus',
              'Documentation complète fournie'
            ],
            valid_until: '2024-03-25T18:00:00Z',
            status: 'pending',
            created_at: '2024-03-20T09:30:00Z',
            ai_score: 8.2,
            savings_estimate: 6750,
            confidence_level: 0.85
          }
        ],
        current_best_offer: {
          id: 'prop1',
          session_id: 'ns1',
          proposer_id: 'p2',
          proposer_name: 'Jean Moussa',
          price_per_unit: 820,
          total_price: 184500,
          payment_terms: [{ type: 'on_delivery', percentage: 100, conditions: 'Paiement à la réception' }],
          delivery_terms: [{
            method: 'delivery',
            location: 'Dépôt principal de la coopérative',
            timeline: '3-5 jours ouvrables',
            cost_responsibility: 'supplier'
          }],
          quality_specifications: [],
          special_conditions: [],
          valid_until: '2024-03-25T18:00:00Z',
          status: 'pending',
          created_at: '2024-03-20T09:30:00Z',
          ai_score: 8.2,
          savings_estimate: 6750,
          confidence_level: 0.85
        },
        negotiation_goals: {
          target_price_per_unit: 800,
          max_budget: 190000,
          min_quality_standard: 'Norme OAC',
          preferred_delivery_timeline: '7 jours maximum',
          payment_preferences: ['Paiement à la livraison', '30 jours net'],
          must_have_conditions: ['Garantie de qualité', 'Support technique'],
          nice_to_have_conditions: ['Formation inclus', 'Documentation complète']
        },
        constraints: {
          hard_deadline: '2024-03-30',
          geographic_limits: ['Abidjan', 'Yamoussoukro', 'Bouaké'],
          supplier_requirements: ['Certification ISO 9001', 'Présence locale'],
          regulatory_requirements: ['Conformité aux normes OAC', 'Permis d\'importation valide'],
          budget_limits: {
            absolute_max: 200000,
            preferred_max: 185000
          }
        },
        ai_assistance_enabled: true
      }
    ];

    const mockSupplierRatings: SupplierRating[] = [
      {
        supplier_id: 's1',
        supplier_name: 'AgriSupply Côte d\'Ivoire',
        overall_rating: 4.5,
        reliability_score: 4.7,
        quality_score: 4.3,
        price_score: 4.2,
        delivery_score: 4.6,
        communication_score: 4.4,
        total_reviews: 127,
        last_review_date: '2024-03-15',
        certifications: ['ISO 9001', 'OAC', 'ECOCERT']
      }
    ];

    const mockTemplates: NegotiationTemplate[] = [
      {
        id: 't1',
        name: 'Engrais et Intrants',
        description: 'Template optimisé pour la négociation d\'engrais et produits phytosanitaires',
        product_categories: ['engrais', 'pesticides', 'semences'],
        typical_terms: {
          payment_terms: [
            { type: 'on_delivery', percentage: 100, conditions: 'Paiement à la réception' },
            { type: 'net_days', percentage: 100, days: 30, conditions: 'Crédit fournisseur' }
          ],
          delivery_terms: [
            {
              method: 'delivery',
              timeline: '3-7 jours',
              cost_responsibility: 'supplier'
            }
          ],
          quality_clauses: [
            'Conformité aux normes OAC',
            'Garantie de qualité',
            'Documentation technique'
          ]
        },
        success_rate: 87,
        average_savings: 12
      }
    ];

    setSessions(mockSessions);
    setSupplierRatings(mockSupplierRatings);
    setTemplates(mockTemplates);

    if (mockSessions.length > 0) {
      setActiveSession(mockSessions[0]);
    }
  }, []);

  // Export / Print comparator for proposals
  const exportProposalsCSV = () => {
    if (!activeSession) return;
    const rows = [
      ['Fournisseur/Proposeur','Prix unitaire','Prix total','Paiement','Livraison','Score IA'].join(','),
      ...activeSession.proposals.map(p => [
        p.proposer_name,
        p.price_per_unit,
        p.total_price,
        (p.payment_terms || []).map(t => `${t.type}:${t.percentage}${t.days ? '/'+t.days+'j' : ''}`).join('|'),
        (p.delivery_terms || []).map(d => `${d.method}:${d.timeline}`).join('|'),
        p.ai_score ?? ''
      ].join(','))
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `comparatif_offres_${activeSession.id}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const printProposals = () => {
    if (!activeSession) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const rows = activeSession.proposals.map(p => `<tr><td>${p.proposer_name}</td><td>${p.price_per_unit}</td><td>${p.total_price}</td><td>${(p.payment_terms||[]).map(t=>t.type+':'+t.percentage).join('<br/>')}</td><td>${(p.delivery_terms||[]).map(d=>d.method+':'+d.timeline).join('<br/>')}</td><td>${p.ai_score ?? ''}</td></tr>`).join('');
    w.document.write(`
      <html><head><title>Comparatif des offres</title>
      <style>body{font-family:Arial;padding:24px} h1{font-size:18px} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ccc;padding:6px;text-align:left}</style>
      </head><body>
        <h1>Comparatif des offres</h1>
        <table><thead><tr><th>Proposeur</th><th>PU</th><th>Total</th><th>Paiement</th><th>Livraison</th><th>Score IA</th></tr></thead><tbody>${rows}</tbody></table>
        <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    w.document.close();
  };

  // Auto-scroll vers les nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // Envoyer un message
  const sendMessage = () => {
    if (!newMessage.trim() || !activeSession) return;

    const message: NegotiationMessage = {
      id: `msg_${Date.now()}`,
      session_id: activeSession.id,
      sender_id: 'p1', // ID de l'utilisateur actuel
      sender_name: 'Marie Kouassi',
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString()
    };

    setActiveSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message]
    } : null);

    setNewMessage('');

    // Simuler une réponse de l'IA ou du fournisseur
    setTimeout(() => {
      simulateResponse();
    }, 1000 + Math.random() * 2000);
  };

  // Simuler une réponse
  const simulateResponse = () => {
    if (!activeSession) return;

    const responses = [
      {
        sender_id: 'p3',
        sender_name: 'Assistant IA',
        content: 'Analyse de votre message : je recommande de demander une réduction supplémentaire de 5% étant donné votre volume d\'achat.',
        type: 'information' as const
      },
      {
        sender_id: 'p2',
        sender_name: 'Jean Moussa',
        content: 'Je comprends votre position. Peut-être pourrions-nous discuter d\'un compromis sur les conditions de paiement?',
        type: 'text' as const
      },
      {
        sender_id: 'p3',
        sender_name: 'Assistant IA',
        content: 'Nouvelle analyse : Le marché actuel permet une négociation jusqu\'à 790 FCFA/kg pour ce volume. Je suggère de viser 795 FCFA/kg comme objectif réaliste.',
        type: 'information' as const
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const responseMessage: NegotiationMessage = {
      id: `msg_${Date.now()}`,
      session_id: activeSession.id,
      sender_id: randomResponse.sender_id,
      sender_name: randomResponse.sender_name,
      content: randomResponse.content,
      type: randomResponse.type,
      timestamp: new Date().toISOString()
    };

    setActiveSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, responseMessage]
    } : null);
  };

  // Accepter une proposition
  const acceptProposal = (proposalId: string) => {
    if (!activeSession) return;

    const acceptanceMessage: NegotiationMessage = {
      id: `msg_${Date.now()}`,
      session_id: activeSession.id,
      sender_id: 'p1',
      sender_name: 'Marie Kouassi',
      content: `J'accepte l'offre proposée (Proposition ${proposalId}). Je suis prête à finaliser les détails.`,
      type: 'acceptance',
      timestamp: new Date().toISOString()
    };

    setActiveSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, acceptanceMessage],
      status: 'completed' as const,
      current_phase: 'closed' as const,
      proposals: prev.proposals.map(p =>
        p.id === proposalId ? { ...p, status: 'accepted' as const } : p
      )
    } : null);
  };

  // Faire une contre-proposition
  const makeCounterOffer = (proposalId: string, newPrice: number) => {
    if (!activeSession) return;

    const counterMessage: NegotiationMessage = {
      id: `msg_${Date.now()}`,
      session_id: activeSession.id,
      sender_id: 'p1',
      sender_name: 'Marie Kouassi',
      content: `Merci pour votre offre. Je propose plutôt ${newPrice} FCFA/kg, ce qui représenterait un total de ${newPrice * activeSession.total_quantity} FCFA.`,
      type: 'proposal',
      timestamp: new Date().toISOString()
    };

    setActiveSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, counterMessage],
      proposals: prev.proposals.map(p =>
        p.id === proposalId ? { ...p, status: 'countered' as const } : p
      )
    } : null);
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      paused: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    } as const;

    const labels = {
      active: 'Active',
      paused: 'En pause',
      completed: 'Terminée',
      cancelled: 'Annulée'
    };

    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  // Obtenir le badge de phase
  const getPhaseBadge = (phase: string) => {
    const labels = {
      initial_contact: 'Contact initial',
      price_negotiation: 'Négociation des prix',
      terms_negotiation: 'Négociation des termes',
      finalization: 'Finalisation',
      closed: 'Clôturée'
    };

    const colors = {
      initial_contact: 'bg-gray-100 text-gray-800',
      price_negotiation: 'bg-orange-100 text-orange-800',
      terms_negotiation: 'bg-purple-100 text-purple-800',
      finalization: 'bg-blue-100 text-blue-800',
      closed: 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={colors[phase as keyof typeof colors]}>
        {labels[phase as keyof typeof labels]}
      </Badge>
    );
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Négociations actives</p>
                <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'active').length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de réussite</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Économies réalisées</p>
                <p className="text-2xl font-bold">2.4M FCFA</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">
                  {sessions.reduce((sum, session) => sum + session.participants.length, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des sessions et chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des sessions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sessions de négociation</CardTitle>
              <Button size="sm" onClick={() => setShowTemplates(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle session
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    activeSession?.id === session.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setActiveSession(session)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{session.product_name}</h4>
                      <p className="text-xs text-gray-600">
                        {session.total_quantity} {session.unit}
                      </p>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {getPhaseBadge(session.current_phase)}
                    <span className="text-xs text-gray-500">
                      {session.participants.filter(p => p.is_active).length} participants
                    </span>
                  </div>

                  {session.current_best_offer && (
                    <div className="mt-2 text-xs">
                      <span className="font-medium">Meilleure offre: </span>
                      <span className="text-green-600">
                        {session.current_best_offer.price_per_unit.toLocaleString()} FCFA/{session.unit}
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-1">
                    Démarrée le {new Date(session.started_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat de négociation */}
        <Card className="lg:col-span-2">
          {activeSession ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {activeSession.product_name}
                        {getStatusBadge(activeSession.status)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {activeSession.total_quantity} {activeSession.unit}
                      </CardDescription>
                      <div className="mt-1">
                        {getPhaseBadge(activeSession.current_phase)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAnalytics(true)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {activeSession.messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {message.sender_name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.sender_name}</span>
                          <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
                          {message.type === 'information' && (
                            <Badge variant="outline" className="text-xs">Information IA</Badge>
                          )}
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Meilleure offre actuelle */}
                {activeSession.current_best_offer && (
                  <div className="p-4 border-t bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm text-green-800">Meilleure offre actuelle</h4>
                        <p className="text-lg font-bold text-green-600">
                          {activeSession.current_best_offer.price_per_unit.toLocaleString()} FCFA/{activeSession.unit}
                        </p>
                        <p className="text-sm text-green-700">
                          Total: {activeSession.current_best_offer.total_price.toLocaleString()} FCFA
                        </p>
                        {activeSession.current_best_offer.savings_estimate && (
                          <p className="text-xs text-green-600">
                            Économies estimées: {activeSession.current_best_offer.savings_estimate.toLocaleString()} FCFA
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptProposal(activeSession.current_best_offer!.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accepter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => makeCounterOffer(
                            activeSession.current_best_offer!.id,
                            activeSession.current_best_offer!.price_per_unit - 10
                          )}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Contre-offre
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Zone de saisie */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={activeSession.status !== 'active'}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || activeSession.status !== 'active'}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {activeSession.ai_assistance_enabled && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      <Shield className="h-3 w-3 inline mr-1" />
                      Assistant IA actif - Suggestions automatiques disponibles
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent>
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Sélectionnez une session de négociation pour commencer</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Informations sur le fournisseur */}
      {activeSession && supplierRatings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Informations sur le fournisseur</CardTitle>
          </CardHeader>
          <CardContent>
            {supplierRatings.map((rating) => (
              <div key={rating.supplier_id} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">{rating.supplier_name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{rating.overall_rating}/5</span>
                    <span className="text-sm text-gray-500">({rating.total_reviews} avis)</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Fiabilité:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(rating.reliability_score / 5) * 100}%` }}
                          />
                        </div>
                        <span>{rating.reliability_score}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Qualité:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(rating.quality_score / 5) * 100}%` }}
                          />
                        </div>
                        <span>{rating.quality_score}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Prix:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${(rating.price_score / 5) * 100}%` }}
                          />
                        </div>
                        <span>{rating.price_score}/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-3">Certifications</h5>
                  <div className="flex flex-wrap gap-2">
                    {rating.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-3">Performance</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Livraison:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(rating.delivery_score / 5) * 100}%` }}
                          />
                        </div>
                        <span>{rating.delivery_score}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Communication:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-teal-600 h-2 rounded-full"
                            style={{ width: `${(rating.communication_score / 5) * 100}%` }}
                          />
                        </div>
                        <span>{rating.communication_score}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Comparateur d'offres */}
      {activeSession && (
        <Card>
          <CardHeader>
            <CardTitle>Comparateur d'offres</CardTitle>
          </CardHeader>
          <CardContent>
            {activeSession.proposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune proposition pour le moment.</p>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-4">Proposeur</th>
                        <th className="py-2 pr-4">PU</th>
                        <th className="py-2 pr-4">Total</th>
                        <th className="py-2 pr-4">Paiement</th>
                        <th className="py-2 pr-4">Livraison</th>
                        <th className="py-2 pr-4">Score IA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSession.proposals.map(p => (
                        <tr key={p.id} className="border-b">
                          <td className="py-2 pr-4">{p.proposer_name}</td>
                          <td className="py-2 pr-4">{p.price_per_unit}</td>
                          <td className="py-2 pr-4">{p.total_price}</td>
                          <td className="py-2 pr-4">{(p.payment_terms||[]).map(t => `${t.type}:${t.percentage}${t.days?'/'+t.days+'j':''}`).join(', ')}</td>
                          <td className="py-2 pr-4">{(p.delivery_terms||[]).map(d => `${d.method}:${d.timeline}`).join(', ')}</td>
                          <td className="py-2 pr-4">{p.ai_score ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={exportProposalsCSV}>Exporter CSV</Button>
                  <Button variant="outline" onClick={printProposals}>Imprimer</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog des templates */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modèles de négociation</DialogTitle>
            <DialogDescription>
              Choisissez un modèle pré-configuré pour démarrer une nouvelle négociation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Taux de réussite: {template.success_rate}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Économies moyennes: {template.average_savings}%
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm">Utiliser ce modèle</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
