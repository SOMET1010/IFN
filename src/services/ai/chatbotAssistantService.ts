/**
 * AI Chatbot Assistant Service
 * Provides intelligent conversational assistance for users
 */

import { AIBaseService } from './aiBaseService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: ChatContext;
  startTime: Date;
  lastActivity: Date;
  resolved: boolean;
  satisfaction?: number;
}

export interface ChatContext {
  userRole: 'merchant' | 'producer' | 'cooperative' | 'admin' | 'guest';
  currentPage?: string;
  recentActions?: string[];
  preferences?: Record<string, unknown>;
  language: 'fr' | 'baoulé' | 'dioula';
}

export interface Intent {
  name: string;
  confidence: number;
  entities: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  intent: Intent;
  suggestedActions?: Array<{
    label: string;
    action: string;
    icon?: string;
  }>;
  quickReplies?: string[];
  requiresHumanAssistance: boolean;
}

export class ChatbotAssistantService extends AIBaseService {
  private static instance: ChatbotAssistantService;
  private sessions: Map<string, ChatSession> = new Map();
  private knowledgeBase: Map<string, string[]> = new Map();

  static getInstance(): ChatbotAssistantService {
    if (!ChatbotAssistantService.instance) {
      ChatbotAssistantService.instance = new ChatbotAssistantService({
        modelName: 'chatbot-assistant',
        version: '2.0.0',
        threshold: 0.65
      });
      ChatbotAssistantService.instance.initializeKnowledgeBase();
    }
    return ChatbotAssistantService.instance;
  }

  async startSession(userId: string, context: ChatContext): Promise<ChatSession> {
    const sessionId = `session_${Date.now()}_${userId}`;

    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [],
      context,
      startTime: new Date(),
      lastActivity: new Date(),
      resolved: false
    };

    const welcomeMessage = this.generateWelcomeMessage(context);
    session.messages.push({
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    });

    this.sessions.set(sessionId, session);

    return session;
  }

  async sendMessage(
    sessionId: string,
    userMessage: string
  ): Promise<ChatResponse> {
    await this.delay(300);

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session non trouvée');
    }

    const messageId = `msg_${Date.now()}`;
    session.messages.push({
      id: messageId,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    session.lastActivity = new Date();

    const intent = this.detectIntent(userMessage, session.context);
    const response = await this.generateResponse(userMessage, intent, session);

    session.messages.push({
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      metadata: { intent: intent.name }
    });

    return response;
  }

  async getContextualHelp(
    page: string,
    userRole: string
  ): Promise<{
    tips: string[];
    commonQuestions: Array<{ question: string; answer: string }>;
    tutorials: Array<{ title: string; description: string; link: string }>;
  }> {
    await this.delay(200);

    const helpContent = this.getHelpContentForPage(page, userRole);

    return helpContent;
  }

  async answerQuestion(
    question: string,
    context: ChatContext
  ): Promise<string> {
    await this.delay(250);

    const normalizedQuestion = question.toLowerCase().trim();

    const keywords = this.extractKeywords(normalizedQuestion);
    let bestMatch = '';
    let bestScore = 0;

    for (const [topic, answers] of this.knowledgeBase.entries()) {
      for (const keyword of keywords) {
        if (topic.includes(keyword)) {
          const score = keywords.filter(k => topic.includes(k)).length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = answers[0];
          }
        }
      }
    }

    if (bestMatch) {
      return bestMatch;
    }

    return this.generateFallbackResponse(question, context);
  }

  async provideTutorial(
    topic: string,
    userRole: string
  ): Promise<{
    title: string;
    steps: Array<{
      stepNumber: number;
      title: string;
      description: string;
      tip?: string;
    }>;
    videoUrl?: string;
    estimatedTime: number;
  }> {
    await this.delay(300);

    const tutorials: Record<string, any> = {
      'créer_vente': {
        title: 'Comment créer une vente',
        steps: [
          {
            stepNumber: 1,
            title: 'Accéder à la page des ventes',
            description: 'Cliquez sur "Ventes" dans le menu principal',
            tip: 'Vous pouvez aussi utiliser le raccourci clavier Alt+V'
          },
          {
            stepNumber: 2,
            title: 'Ajouter des produits',
            description: 'Cliquez sur "Ajouter un produit" et sélectionnez dans la liste',
            tip: 'Utilisez le scanner de code-barres pour aller plus vite'
          },
          {
            stepNumber: 3,
            title: 'Choisir le mode de paiement',
            description: 'Sélectionnez le mode de paiement souhaité (espèces, mobile money, etc.)',
            tip: 'Le paiement mobile money est instantané'
          },
          {
            stepNumber: 4,
            title: 'Valider la vente',
            description: 'Vérifiez le montant total et cliquez sur "Valider"',
            tip: 'Un reçu électronique sera automatiquement généré'
          }
        ],
        estimatedTime: 3
      },
      'gérer_stock': {
        title: 'Comment gérer votre stock',
        steps: [
          {
            stepNumber: 1,
            title: 'Accéder à l\'inventaire',
            description: 'Cliquez sur "Inventaire" dans le menu',
            tip: 'La page montre votre stock actuel en temps réel'
          },
          {
            stepNumber: 2,
            title: 'Ajouter un produit',
            description: 'Cliquez sur "Ajouter au stock" et remplissez les informations',
            tip: 'Définissez des alertes de stock bas pour ne jamais manquer de produits'
          },
          {
            stepNumber: 3,
            title: 'Suivre les mouvements',
            description: 'Consultez l\'historique pour voir toutes les entrées et sorties',
            tip: 'Exportez les données en Excel pour vos rapports'
          }
        ],
        estimatedTime: 2
      }
    };

    const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '_');
    return tutorials[normalizedTopic] || tutorials['créer_vente'];
  }

  async getSuggestedActions(
    context: ChatContext,
    recentActivity: string[]
  ): Promise<Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
  }>> {
    await this.delay(200);

    const suggestions: Array<{
      id: string;
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      category: string;
      action: string;
    }> = [];

    switch (context.userRole) {
      case 'merchant':
        suggestions.push(
          {
            id: 'check_stock',
            title: 'Vérifier le stock',
            description: 'Vous avez des produits en stock faible',
            priority: 'high',
            category: 'Inventaire',
            action: '/merchant/inventory'
          },
          {
            id: 'create_sale',
            title: 'Créer une vente',
            description: 'Enregistrer une nouvelle transaction',
            priority: 'medium',
            category: 'Ventes',
            action: '/merchant/sales'
          }
        );
        break;

      case 'producer':
        suggestions.push(
          {
            id: 'add_harvest',
            title: 'Enregistrer une récolte',
            description: 'Ajouter votre dernière récolte',
            priority: 'high',
            category: 'Production',
            action: '/producer/harvests'
          },
          {
            id: 'create_offer',
            title: 'Créer une offre',
            description: 'Publier une offre de vente',
            priority: 'medium',
            category: 'Ventes',
            action: '/producer/offers'
          }
        );
        break;

      case 'cooperative':
        suggestions.push(
          {
            id: 'manage_members',
            title: 'Gérer les membres',
            description: 'Voir les contributions des membres',
            priority: 'medium',
            category: 'Membres',
            action: '/cooperative/members'
          },
          {
            id: 'aggregate_orders',
            title: 'Agréger les commandes',
            description: 'Regrouper les commandes pour négocier',
            priority: 'high',
            category: 'Commandes',
            action: '/cooperative/orders'
          }
        );
        break;
    }

    return suggestions;
  }

  endSession(sessionId: string, resolved: boolean = true, satisfaction?: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.resolved = resolved;
      session.satisfaction = satisfaction;
    }
  }

  private initializeKnowledgeBase(): void {
    this.knowledgeBase.set('comment_créer_vente', [
      'Pour créer une vente, allez dans le menu "Ventes" puis cliquez sur "Nouvelle vente". Sélectionnez vos produits, la quantité, et validez le paiement.',
      'Vous pouvez aussi scanner les codes-barres des produits pour aller plus vite.'
    ]);

    this.knowledgeBase.set('comment_gérer_stock', [
      'Accédez à "Inventaire" depuis le menu principal. Vous pouvez ajouter, modifier ou supprimer des produits. Le système vous alertera automatiquement quand le stock est bas.',
      'Utilisez les filtres pour trouver rapidement vos produits et exportez vos données en Excel.'
    ]);

    this.knowledgeBase.set('comment_accepter_paiement', [
      'Nous acceptons les paiements en espèces, mobile money (Orange Money, MTN Money, Moov Money) et par carte bancaire.',
      'Les paiements mobile money sont instantanés et sécurisés.'
    ]);

    this.knowledgeBase.set('comment_suivre_commande', [
      'Allez dans "Mes commandes" pour voir l\'état de toutes vos commandes. Vous recevrez des notifications à chaque étape de livraison.',
      'Le suivi en temps réel est disponible pour toutes les commandes.'
    ]);

    this.knowledgeBase.set('comment_contacter_support', [
      'Notre support est disponible 24/7 par téléphone au +225 XX XX XX XX XX, par email à support@agrimarket.ci, ou via le chat en direct.',
      'Les questions urgentes sont traitées en priorité.'
    ]);
  }

  private generateWelcomeMessage(context: ChatContext): string {
    const greetings: Record<string, string> = {
      'fr': 'Bonjour! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui?',
      'baoulé': 'Akwaba! N\'gban assistan virtual. Kè n\'ti wa blé?',
      'dioula': 'I ni sɔgɔma! Ne ye i ka assistant virtual ye. Ne bɛ se ka i dɛmɛ cogo di?'
    };

    return greetings[context.language] || greetings['fr'];
  }

  private detectIntent(message: string, context: ChatContext): Intent {
    const lowerMessage = message.toLowerCase();

    const intents = [
      {
        name: 'create_sale',
        keywords: ['vente', 'vendre', 'créer vente', 'enregistrer vente'],
        confidence: 0
      },
      {
        name: 'check_inventory',
        keywords: ['stock', 'inventaire', 'produit', 'quantité'],
        confidence: 0
      },
      {
        name: 'payment_inquiry',
        keywords: ['paiement', 'payer', 'mobile money', 'argent'],
        confidence: 0
      },
      {
        name: 'order_tracking',
        keywords: ['commande', 'suivi', 'livraison', 'où est'],
        confidence: 0
      },
      {
        name: 'help_tutorial',
        keywords: ['aide', 'comment', 'tutoriel', 'apprendre'],
        confidence: 0
      },
      {
        name: 'price_inquiry',
        keywords: ['prix', 'coûte', 'combien'],
        confidence: 0
      },
      {
        name: 'general_question',
        keywords: ['quoi', 'pourquoi', 'qui', 'quand'],
        confidence: 0
      }
    ];

    for (const intent of intents) {
      for (const keyword of intent.keywords) {
        if (lowerMessage.includes(keyword)) {
          intent.confidence += 0.2;
        }
      }
    }

    intents.sort((a, b) => b.confidence - a.confidence);

    const topIntent = intents[0];

    return {
      name: topIntent.confidence > 0.3 ? topIntent.name : 'general_question',
      confidence: Math.min(0.95, topIntent.confidence),
      entities: this.extractEntities(message, topIntent.name)
    };
  }

  private extractEntities(message: string, intentName: string): Record<string, unknown> {
    const entities: Record<string, unknown> = {};

    const numberMatch = message.match(/\d+/);
    if (numberMatch) {
      entities.number = parseInt(numberMatch[0]);
    }

    const productNames = ['tomate', 'oignon', 'riz', 'maïs', 'cacao', 'café', 'banane'];
    for (const product of productNames) {
      if (message.toLowerCase().includes(product)) {
        entities.product = product;
        break;
      }
    }

    return entities;
  }

  private async generateResponse(
    message: string,
    intent: Intent,
    session: ChatSession
  ): Promise<ChatResponse> {
    let responseMessage = '';
    const suggestedActions: Array<{ label: string; action: string; icon?: string }> = [];
    const quickReplies: string[] = [];
    let requiresHumanAssistance = false;

    switch (intent.name) {
      case 'create_sale':
        responseMessage = 'Je peux vous guider pour créer une vente. Voulez-vous que je vous montre comment faire étape par étape?';
        suggestedActions.push(
          { label: 'Créer une vente maintenant', action: 'navigate_sales', icon: 'ShoppingCart' },
          { label: 'Voir le tutoriel', action: 'show_tutorial_sale', icon: 'PlayCircle' }
        );
        quickReplies.push('Oui, montrez-moi', 'Je préfère le faire moi-même');
        break;

      case 'check_inventory':
        responseMessage = 'Je peux vous aider à gérer votre inventaire. Que souhaitez-vous faire?';
        suggestedActions.push(
          { label: 'Voir mon stock', action: 'navigate_inventory', icon: 'Package' },
          { label: 'Ajouter un produit', action: 'show_add_product', icon: 'Plus' }
        );
        quickReplies.push('Voir le stock', 'Ajouter un produit', 'Vérifier les alertes');
        break;

      case 'payment_inquiry':
        responseMessage = 'Nous acceptons plusieurs modes de paiement: espèces, Orange Money, MTN Money, Moov Money, et carte bancaire. Le paiement mobile money est instantané et très sécurisé.';
        quickReplies.push('Comment payer en mobile money?', 'Quels sont les frais?');
        break;

      case 'order_tracking':
        responseMessage = 'Je peux vous aider à suivre vos commandes. Voulez-vous voir l\'état de vos commandes récentes?';
        suggestedActions.push(
          { label: 'Voir mes commandes', action: 'navigate_orders', icon: 'Package' }
        );
        quickReplies.push('Oui, montrez-moi', 'Où est ma dernière commande?');
        break;

      case 'help_tutorial':
        responseMessage = 'Je suis là pour vous aider! Sur quel sujet avez-vous besoin d\'aide?';
        quickReplies.push(
          'Comment créer une vente',
          'Comment gérer mon stock',
          'Comment accepter un paiement',
          'Comment suivre une commande'
        );
        break;

      case 'price_inquiry':
        responseMessage = 'Pour connaître le prix d\'un produit, allez dans le catalogue ou utilisez la recherche. Je peux aussi vous montrer les tendances de prix du marché.';
        suggestedActions.push(
          { label: 'Voir les prix', action: 'navigate_marketplace', icon: 'DollarSign' },
          { label: 'Tendances du marché', action: 'show_market_trends', icon: 'TrendingUp' }
        );
        break;

      default:
        const answer = await this.answerQuestion(message, session.context);
        responseMessage = answer;

        if (!answer || answer.includes('Je ne suis pas sûr')) {
          requiresHumanAssistance = true;
          responseMessage += '\n\nVoulez-vous que je vous mette en contact avec notre support humain?';
          quickReplies.push('Oui, contactez le support', 'Non, merci');
        } else {
          quickReplies.push('C\'est clair, merci', 'J\'ai une autre question');
        }
        break;
    }

    return {
      message: responseMessage,
      intent,
      suggestedActions,
      quickReplies,
      requiresHumanAssistance
    };
  }

  private extractKeywords(text: string): string[] {
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais', 'dans', 'sur', 'pour', 'avec'];
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => word.length > 2 && !stopWords.includes(word));
  }

  private generateFallbackResponse(question: string, context: ChatContext): string {
    return `Je ne suis pas sûr de bien comprendre votre question. Pouvez-vous la reformuler ou être plus précis? Sinon, je peux vous mettre en contact avec notre support humain qui pourra mieux vous aider.`;
  }

  private getHelpContentForPage(
    page: string,
    userRole: string
  ): {
    tips: string[];
    commonQuestions: Array<{ question: string; answer: string }>;
    tutorials: Array<{ title: string; description: string; link: string }>;
  } {
    const helpContent: Record<string, any> = {
      'inventory': {
        tips: [
          'Définissez des alertes de stock bas pour ne jamais être en rupture',
          'Utilisez le scanner de code-barres pour ajouter rapidement des produits',
          'Exportez votre inventaire régulièrement pour vos rapports'
        ],
        commonQuestions: [
          {
            question: 'Comment ajouter un nouveau produit?',
            answer: 'Cliquez sur "Ajouter au stock", remplissez les informations et validez'
          },
          {
            question: 'Comment modifier la quantité d\'un produit?',
            answer: 'Cliquez sur le produit, puis sur "Modifier" et ajustez la quantité'
          }
        ],
        tutorials: [
          {
            title: 'Gestion de l\'inventaire',
            description: 'Apprenez à gérer efficacement votre stock',
            link: '/tutorials/inventory'
          }
        ]
      },
      'sales': {
        tips: [
          'Utilisez le scanner pour aller plus vite lors des ventes',
          'Vérifiez toujours le stock avant de valider une vente',
          'Les reçus électroniques sont envoyés automatiquement par email'
        ],
        commonQuestions: [
          {
            question: 'Comment annuler une vente?',
            answer: 'Contactez le support dans les 24h avec le numéro de transaction'
          },
          {
            question: 'Puis-je faire un avoir?',
            answer: 'Oui, allez dans l\'historique des ventes et cliquez sur "Créer un avoir"'
          }
        ],
        tutorials: [
          {
            title: 'Créer une vente',
            description: 'Guide complet du processus de vente',
            link: '/tutorials/sales'
          }
        ]
      }
    };

    return helpContent[page] || {
      tips: ['Utilisez le menu de navigation pour accéder aux différentes sections'],
      commonQuestions: [],
      tutorials: []
    };
  }
}

export const chatbotAssistantService = ChatbotAssistantService.getInstance();
