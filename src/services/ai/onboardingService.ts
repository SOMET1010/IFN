/**
 * Onboarding and Contextual Help Service
 * Provides adaptive onboarding and intelligent help system
 */

import { AIBaseService } from './aiBaseService';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  action?: string;
  illustration?: string;
  videoUrl?: string;
  duration: number;
  required: boolean;
  completed: boolean;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  userRole: 'merchant' | 'producer' | 'cooperative' | 'admin';
  steps: OnboardingStep[];
  currentStepIndex: number;
  completionPercentage: number;
  estimatedTimeRemaining: number;
}

export interface ContextualHelp {
  id: string;
  page: string;
  context: string;
  helpText: string;
  tips: string[];
  relatedArticles: Array<{
    title: string;
    url: string;
  }>;
  videoTutorial?: {
    title: string;
    url: string;
    duration: number;
  };
}

export interface UserProgress {
  userId: string;
  role: string;
  completedSteps: string[];
  techLiteracy: 'beginner' | 'intermediate' | 'advanced';
  learningSpeed: 'slow' | 'normal' | 'fast';
  preferredLearningStyle: 'visual' | 'textual' | 'interactive' | 'video';
  needsSimplifiedMode: boolean;
}

export class OnboardingService extends AIBaseService {
  private static instance: OnboardingService;
  private onboardingFlows: Map<string, OnboardingFlow> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private helpContent: Map<string, ContextualHelp[]> = new Map();

  static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService({
        modelName: 'onboarding',
        version: '2.0.0',
        threshold: 0.7
      });
      OnboardingService.instance.initializeOnboarding();
    }
    return OnboardingService.instance;
  }

  async startOnboarding(
    userId: string,
    userRole: 'merchant' | 'producer' | 'cooperative' | 'admin'
  ): Promise<OnboardingFlow> {
    await this.delay(200);

    const flowId = `flow_${userId}_${Date.now()}`;
    const steps = this.generateOnboardingSteps(userRole);

    const flow: OnboardingFlow = {
      id: flowId,
      name: `Démarrage ${this.getRoleName(userRole)}`,
      userRole,
      steps,
      currentStepIndex: 0,
      completionPercentage: 0,
      estimatedTimeRemaining: steps.reduce((sum, step) => sum + step.duration, 0)
    };

    this.onboardingFlows.set(flowId, flow);

    return flow;
  }

  async getAdaptiveOnboarding(
    userId: string,
    userRole: string
  ): Promise<OnboardingFlow> {
    await this.delay(250);

    const progress = this.getUserProgress(userId);
    const techLevel = progress.techLiteracy;

    const baseSteps = this.generateOnboardingSteps(userRole as any);
    let adaptedSteps: OnboardingStep[];

    switch (techLevel) {
      case 'beginner':
        adaptedSteps = this.addDetailedGuidance(baseSteps);
        break;
      case 'advanced':
        adaptedSteps = this.simplifyForAdvancedUsers(baseSteps);
        break;
      default:
        adaptedSteps = baseSteps;
    }

    adaptedSteps = this.filterCompletedSteps(adaptedSteps, progress.completedSteps);

    const flowId = `adaptive_${userId}_${Date.now()}`;
    const flow: OnboardingFlow = {
      id: flowId,
      name: 'Parcours personnalisé',
      userRole: userRole as any,
      steps: adaptedSteps,
      currentStepIndex: 0,
      completionPercentage: this.calculateProgress(adaptedSteps, progress.completedSteps),
      estimatedTimeRemaining: this.estimateTime(adaptedSteps, progress)
    };

    return flow;
  }

  async completeStep(
    flowId: string,
    stepId: string,
    timeSpent: number
  ): Promise<{
    nextStep?: OnboardingStep;
    completionPercentage: number;
    isComplete: boolean;
  }> {
    await this.delay(100);

    const flow = this.onboardingFlows.get(flowId);
    if (!flow) {
      throw new Error('Flux d\'onboarding non trouvé');
    }

    const stepIndex = flow.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) {
      throw new Error('Étape non trouvée');
    }

    flow.steps[stepIndex].completed = true;
    flow.currentStepIndex = stepIndex + 1;

    const completedCount = flow.steps.filter(s => s.completed).length;
    flow.completionPercentage = Math.round((completedCount / flow.steps.length) * 100);

    const remainingSteps = flow.steps.slice(flow.currentStepIndex);
    flow.estimatedTimeRemaining = remainingSteps.reduce((sum, step) => sum + step.duration, 0);

    const isComplete = flow.currentStepIndex >= flow.steps.length;
    const nextStep = isComplete ? undefined : flow.steps[flow.currentStepIndex];

    return {
      nextStep,
      completionPercentage: flow.completionPercentage,
      isComplete
    };
  }

  async getContextualHelp(
    page: string,
    userRole: string,
    userAction?: string
  ): Promise<ContextualHelp | null> {
    await this.delay(150);

    const pageHelp = this.helpContent.get(page);
    if (!pageHelp || pageHelp.length === 0) {
      return this.generateFallbackHelp(page, userRole);
    }

    let relevantHelp = pageHelp[0];

    if (userAction) {
      const actionSpecificHelp = pageHelp.find(h => h.context.includes(userAction));
      if (actionSpecificHelp) {
        relevantHelp = actionSpecificHelp;
      }
    }

    return relevantHelp;
  }

  async detectUserStruggles(
    userId: string,
    page: string,
    timeSpent: number,
    clickCount: number,
    errorCount: number
  ): Promise<{
    isStruggling: boolean;
    suggestedHelp?: ContextualHelp;
    recommendation: string;
  }> {
    await this.delay(100);

    const progress = this.getUserProgress(userId);

    let struggleScore = 0;

    if (timeSpent > 120) {
      struggleScore += 0.3;
    }

    if (clickCount > 20) {
      struggleScore += 0.3;
    }

    if (errorCount > 2) {
      struggleScore += 0.4;
    }

    const isStruggling = struggleScore > 0.5;

    let recommendation = '';
    let suggestedHelp: ContextualHelp | undefined;

    if (isStruggling) {
      suggestedHelp = await this.getContextualHelp(page, progress.role);

      if (progress.techLiteracy === 'beginner') {
        recommendation = 'Voulez-vous activer le mode guidé pour une assistance pas-à-pas?';
      } else {
        recommendation = 'Besoin d\'aide? Consultez notre tutoriel vidéo ou contactez le support.';
      }
    }

    return {
      isStruggling,
      suggestedHelp,
      recommendation
    };
  }

  async suggestNextAction(
    userId: string,
    currentPage: string,
    recentActions: string[]
  ): Promise<Array<{
    action: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    page?: string;
  }>> {
    await this.delay(150);

    const progress = this.getUserProgress(userId);
    const completedSteps = progress.completedSteps;

    const suggestions: Array<{
      action: string;
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      page?: string;
    }> = [];

    switch (progress.role) {
      case 'merchant':
        if (!completedSteps.includes('first_sale')) {
          suggestions.push({
            action: 'create_first_sale',
            title: 'Créer votre première vente',
            description: 'Commencez à utiliser le système de vente',
            priority: 'high',
            page: '/merchant/sales'
          });
        }

        if (!completedSteps.includes('add_inventory')) {
          suggestions.push({
            action: 'add_inventory',
            title: 'Ajouter des produits au stock',
            description: 'Remplissez votre inventaire',
            priority: 'high',
            page: '/merchant/inventory'
          });
        }

        suggestions.push({
          action: 'view_analytics',
          title: 'Voir vos statistiques',
          description: 'Consultez vos performances de vente',
          priority: 'medium',
          page: '/merchant/dashboard'
        });
        break;

      case 'producer':
        if (!completedSteps.includes('first_harvest')) {
          suggestions.push({
            action: 'record_harvest',
            title: 'Enregistrer une récolte',
            description: 'Documentez votre production',
            priority: 'high',
            page: '/producer/harvests'
          });
        }

        suggestions.push({
          action: 'create_offer',
          title: 'Créer une offre de vente',
          description: 'Proposez vos produits sur le marché',
          priority: 'medium',
          page: '/producer/offers'
        });
        break;

      case 'cooperative':
        suggestions.push({
          action: 'manage_members',
          title: 'Gérer les membres',
          description: 'Ajoutez ou consultez vos membres',
          priority: 'high',
          page: '/cooperative/members'
        });

        suggestions.push({
          action: 'aggregate_orders',
          title: 'Agréger les commandes',
          description: 'Regroupez les besoins pour négocier',
          priority: 'medium',
          page: '/cooperative/orders'
        });
        break;
    }

    return suggestions;
  }

  async updateUserProgress(
    userId: string,
    completedStep: string,
    timeSpent: number,
    helpRequested: boolean
  ): Promise<UserProgress> {
    await this.delay(50);

    const progress = this.getUserProgress(userId);

    if (!progress.completedSteps.includes(completedStep)) {
      progress.completedSteps.push(completedStep);
    }

    if (helpRequested && progress.techLiteracy === 'advanced') {
      progress.techLiteracy = 'intermediate';
    }

    if (timeSpent < 30 && !helpRequested && progress.techLiteracy === 'beginner') {
      progress.learningSpeed = 'fast';
    } else if (timeSpent > 120 || helpRequested) {
      progress.learningSpeed = 'slow';
    }

    this.userProgress.set(userId, progress);

    return progress;
  }

  async getSimplifiedMode(
    userId: string
  ): Promise<{
    enabled: boolean;
    features: string[];
    hiddenFeatures: string[];
  }> {
    await this.delay(100);

    const progress = this.getUserProgress(userId);

    if (!progress.needsSimplifiedMode) {
      return {
        enabled: false,
        features: [],
        hiddenFeatures: []
      };
    }

    return {
      enabled: true,
      features: [
        'Gros boutons',
        'Navigation simplifiée',
        'Aide contextuelle permanente',
        'Tutoriels vidéo',
        'Assistancevocale'
      ],
      hiddenFeatures: [
        'Fonctionnalités avancées',
        'Raccourcis clavier',
        'Paramètres détaillés'
      ]
    };
  }

  private generateOnboardingSteps(
    userRole: 'merchant' | 'producer' | 'cooperative' | 'admin'
  ): OnboardingStep[] {
    const commonSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        title: 'Bienvenue!',
        description: 'Découvrez votre espace de travail et les fonctionnalités principales',
        duration: 2,
        required: true,
        completed: false
      },
      {
        id: 'navigation',
        title: 'Navigation',
        description: 'Apprenez à vous déplacer dans l\'application',
        targetElement: '#main-menu',
        duration: 3,
        required: true,
        completed: false
      }
    ];

    const roleSpecificSteps: Record<string, OnboardingStep[]> = {
      merchant: [
        {
          id: 'inventory_intro',
          title: 'Gérer votre stock',
          description: 'Ajoutez et suivez vos produits',
          targetElement: '#inventory-link',
          action: 'navigate_inventory',
          duration: 5,
          required: true,
          completed: false
        },
        {
          id: 'first_sale',
          title: 'Créer une vente',
          description: 'Enregistrez votre première transaction',
          targetElement: '#sales-link',
          action: 'create_sale',
          duration: 7,
          required: true,
          completed: false
        },
        {
          id: 'barcode_scanner',
          title: 'Scanner un produit',
          description: 'Utilisez le scanner de code-barres',
          action: 'demo_scanner',
          duration: 4,
          required: false,
          completed: false
        }
      ],
      producer: [
        {
          id: 'record_harvest',
          title: 'Enregistrer une récolte',
          description: 'Documentez votre production',
          targetElement: '#harvests-link',
          action: 'create_harvest',
          duration: 5,
          required: true,
          completed: false
        },
        {
          id: 'create_offer',
          title: 'Créer une offre',
          description: 'Proposez vos produits sur le marché',
          targetElement: '#offers-link',
          action: 'create_offer',
          duration: 6,
          required: true,
          completed: false
        },
        {
          id: 'vocal_interface',
          title: 'Interface vocale',
          description: 'Utilisez les commandes vocales',
          action: 'demo_voice',
          duration: 4,
          required: false,
          completed: false
        }
      ],
      cooperative: [
        {
          id: 'add_members',
          title: 'Ajouter des membres',
          description: 'Enregistrez les membres de votre coopérative',
          targetElement: '#members-link',
          action: 'add_member',
          duration: 6,
          required: true,
          completed: false
        },
        {
          id: 'aggregate_needs',
          title: 'Agréger les besoins',
          description: 'Collectez et regroupez les commandes',
          targetElement: '#orders-link',
          action: 'aggregate_orders',
          duration: 7,
          required: true,
          completed: false
        }
      ],
      admin: [
        {
          id: 'system_overview',
          title: 'Vue d\'ensemble',
          description: 'Découvrez le tableau de bord administrateur',
          duration: 5,
          required: true,
          completed: false
        },
        {
          id: 'user_management',
          title: 'Gestion des utilisateurs',
          description: 'Apprenez à gérer les comptes utilisateurs',
          duration: 6,
          required: true,
          completed: false
        }
      ]
    };

    return [...commonSteps, ...roleSpecificSteps[userRole]];
  }

  private addDetailedGuidance(steps: OnboardingStep[]): OnboardingStep[] {
    return steps.map(step => ({
      ...step,
      description: `${step.description}\n\nNous vous guiderons étape par étape.`,
      duration: Math.round(step.duration * 1.5)
    }));
  }

  private simplifyForAdvancedUsers(steps: OnboardingStep[]): OnboardingStep[] {
    return steps.filter(step => step.required);
  }

  private filterCompletedSteps(steps: OnboardingStep[], completedSteps: string[]): OnboardingStep[] {
    return steps.map(step => ({
      ...step,
      completed: completedSteps.includes(step.id)
    }));
  }

  private calculateProgress(steps: OnboardingStep[], completedSteps: string[]): number {
    const completed = steps.filter(s => completedSteps.includes(s.id)).length;
    return Math.round((completed / steps.length) * 100);
  }

  private estimateTime(steps: OnboardingStep[], progress: UserProgress): number {
    const remainingSteps = steps.filter(s => !progress.completedSteps.includes(s.id));
    let totalTime = remainingSteps.reduce((sum, step) => sum + step.duration, 0);

    if (progress.learningSpeed === 'slow') {
      totalTime *= 1.5;
    } else if (progress.learningSpeed === 'fast') {
      totalTime *= 0.7;
    }

    return Math.round(totalTime);
  }

  private getUserProgress(userId: string): UserProgress {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        userId,
        role: 'merchant',
        completedSteps: [],
        techLiteracy: 'intermediate',
        learningSpeed: 'normal',
        preferredLearningStyle: 'visual',
        needsSimplifiedMode: false
      });
    }

    return this.userProgress.get(userId)!;
  }

  private getRoleName(role: string): string {
    const names: Record<string, string> = {
      merchant: 'Commerçant',
      producer: 'Producteur',
      cooperative: 'Coopérative',
      admin: 'Administrateur'
    };

    return names[role] || role;
  }

  private generateFallbackHelp(page: string, userRole: string): ContextualHelp {
    return {
      id: `help_${page}_${Date.now()}`,
      page,
      context: 'général',
      helpText: 'Cette page vous permet de gérer vos activités. Consultez les tutoriels pour en savoir plus.',
      tips: [
        'Utilisez le menu de navigation pour accéder aux différentes sections',
        'Les boutons d\'action sont situés en haut de la page',
        'Vous pouvez toujours demander de l\'aide en cliquant sur l\'icône d\'aide'
      ],
      relatedArticles: []
    };
  }

  private initializeOnboarding(): void {
    const inventoryHelp: ContextualHelp = {
      id: 'help_inventory_1',
      page: '/merchant/inventory',
      context: 'gestion du stock',
      helpText: 'Gérez efficacement votre inventaire en ajoutant, modifiant ou supprimant des produits.',
      tips: [
        'Définissez des alertes de stock bas pour ne jamais manquer de produits',
        'Utilisez le scanner de code-barres pour ajouter rapidement des produits',
        'Exportez votre inventaire régulièrement pour vos rapports'
      ],
      relatedArticles: [
        { title: 'Comment gérer son stock', url: '/help/inventory-management' },
        { title: 'Alertes automatiques', url: '/help/stock-alerts' }
      ],
      videoTutorial: {
        title: 'Gestion de l\'inventaire',
        url: '/videos/inventory-tutorial',
        duration: 180
      }
    };

    this.helpContent.set('/merchant/inventory', [inventoryHelp]);
  }
}

export const onboardingService = OnboardingService.getInstance();
