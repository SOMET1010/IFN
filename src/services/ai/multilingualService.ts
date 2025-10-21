/**
 * Multilingual Support Service
 * Provides translation and localization for French, Baoulé, and Dioula
 */

import { AIBaseService } from './aiBaseService';

export interface Translation {
  key: string;
  language: 'fr' | 'baoulé' | 'dioula';
  text: string;
  context?: string;
}

export interface LocalizationConfig {
  language: 'fr' | 'baoulé' | 'dioula';
  region?: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  textDirection: 'ltr' | 'rtl';
}

export interface VoiceTranscription {
  originalText: string;
  language: 'fr' | 'baoulé' | 'dioula';
  confidence: number;
  alternatives?: string[];
}

export class MultilingualService extends AIBaseService {
  private static instance: MultilingualService;
  private translations: Map<string, Map<string, string>> = new Map();
  private phraseBook: Map<string, Map<string, string>> = new Map();

  static getInstance(): MultilingualService {
    if (!MultilingualService.instance) {
      MultilingualService.instance = new MultilingualService({
        modelName: 'multilingual',
        version: '2.0.0',
        threshold: 0.7
      });
      MultilingualService.instance.initializeTranslations();
    }
    return MultilingualService.instance;
  }

  async translate(
    text: string,
    fromLanguage: 'fr' | 'baoulé' | 'dioula',
    toLanguage: 'fr' | 'baoulé' | 'dioula'
  ): Promise<{
    translatedText: string;
    confidence: number;
    alternatives?: string[];
  }> {
    await this.delay(200);

    if (fromLanguage === toLanguage) {
      return {
        translatedText: text,
        confidence: 1.0
      };
    }

    const normalizedText = text.toLowerCase().trim();
    const phraseKey = `${normalizedText}_${fromLanguage}`;

    const translations = this.phraseBook.get(phraseKey);
    if (translations && translations.has(toLanguage)) {
      return {
        translatedText: translations.get(toLanguage)!,
        confidence: 0.95
      };
    }

    const words = text.split(' ');
    const translatedWords: string[] = [];

    for (const word of words) {
      const wordKey = `${word.toLowerCase()}_${fromLanguage}`;
      const wordTranslations = this.phraseBook.get(wordKey);

      if (wordTranslations && wordTranslations.has(toLanguage)) {
        translatedWords.push(wordTranslations.get(toLanguage)!);
      } else {
        translatedWords.push(word);
      }
    }

    return {
      translatedText: translatedWords.join(' '),
      confidence: 0.7
    };
  }

  async detectLanguage(text: string): Promise<{
    language: 'fr' | 'baoulé' | 'dioula';
    confidence: number;
  }> {
    await this.delay(100);

    const frenchKeywords = ['le', 'la', 'les', 'de', 'du', 'et', 'pour', 'avec', 'dans'];
    const baouleKeywords = ['n\'gban', 'wa', 'kè', 'blé', 'yè', 'akwaba'];
    const dioulaKeywords = ['ne', 'bɛ', 'ye', 'ka', 'ni', 'cogo'];

    const lowerText = text.toLowerCase();

    const frenchScore = frenchKeywords.filter(kw => lowerText.includes(kw)).length;
    const baouleScore = baouleKeywords.filter(kw => lowerText.includes(kw)).length;
    const dioulaScore = dioulaKeywords.filter(kw => lowerText.includes(kw)).length;

    if (frenchScore > baouleScore && frenchScore > dioulaScore) {
      return { language: 'fr', confidence: Math.min(0.95, 0.6 + frenchScore * 0.1) };
    }

    if (baouleScore > frenchScore && baouleScore > dioulaScore) {
      return { language: 'baoulé', confidence: Math.min(0.95, 0.6 + baouleScore * 0.1) };
    }

    if (dioulaScore > frenchScore && dioulaScore > baouleScore) {
      return { language: 'dioula', confidence: Math.min(0.95, 0.6 + dioulaScore * 0.1) };
    }

    return { language: 'fr', confidence: 0.5 };
  }

  async transcribeVoice(
    audioData: Blob | string,
    expectedLanguage?: 'fr' | 'baoulé' | 'dioula'
  ): Promise<VoiceTranscription> {
    await this.delay(800);

    const sampleTranscriptions: Record<string, string[]> = {
      fr: [
        'Je veux acheter des tomates',
        'Combien coûte le riz?',
        'Ajouter au panier',
        'Confirmer la commande'
      ],
      baoulé: [
        'N\'gban ti wa blé tomates',
        'Riz nin yè coman?',
        'Kè panier',
        'Sran commande'
      ],
      dioula: [
        'Ne bɛ a fɛ ka tomates san',
        'Riz nin sɔngɔ ye jumɛn?',
        'A don panier kɔnɔ',
        'Commande lajɛ'
      ]
    };

    const language = expectedLanguage || 'fr';
    const transcriptions = sampleTranscriptions[language];
    const originalText = transcriptions[Math.floor(Math.random() * transcriptions.length)];

    return {
      originalText,
      language,
      confidence: 0.8 + Math.random() * 0.15,
      alternatives: transcriptions.filter(t => t !== originalText).slice(0, 2)
    };
  }

  async generateSpeech(
    text: string,
    language: 'fr' | 'baoulé' | 'dioula',
    voiceType: 'male' | 'female' = 'female'
  ): Promise<{
    audioUrl: string;
    duration: number;
    format: string;
  }> {
    await this.delay(600);

    const duration = text.length * 0.1;

    return {
      audioUrl: `data:audio/mp3;base64,mock_audio_data_${Date.now()}`,
      duration: Math.round(duration),
      format: 'mp3'
    };
  }

  async getLocalizedContent(
    contentKey: string,
    language: 'fr' | 'baoulé' | 'dioula',
    variables?: Record<string, string>
  ): Promise<string> {
    await this.delay(50);

    const languageTranslations = this.translations.get(language);

    if (!languageTranslations || !languageTranslations.has(contentKey)) {
      return contentKey;
    }

    let content = languageTranslations.get(contentKey)!;

    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(`{${key}}`, value);
      }
    }

    return content;
  }

  async getLocalizationConfig(
    language: 'fr' | 'baoulé' | 'dioula'
  ): Promise<LocalizationConfig> {
    await this.delay(50);

    const configs: Record<string, LocalizationConfig> = {
      fr: {
        language: 'fr',
        region: 'CI',
        currency: 'FCFA',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: '1 234,56',
        textDirection: 'ltr'
      },
      baoulé: {
        language: 'baoulé',
        region: 'CI',
        currency: 'FCFA',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: '1 234,56',
        textDirection: 'ltr'
      },
      dioula: {
        language: 'dioula',
        region: 'CI',
        currency: 'FCFA',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: '1 234,56',
        textDirection: 'ltr'
      }
    };

    return configs[language];
  }

  async getSuggestedLanguage(
    userLocation?: string,
    browserLanguage?: string
  ): Promise<'fr' | 'baoulé' | 'dioula'> {
    await this.delay(100);

    if (browserLanguage) {
      if (browserLanguage.startsWith('fr')) {
        return 'fr';
      }
    }

    if (userLocation) {
      const regionLanguages: Record<string, 'fr' | 'baoulé' | 'dioula'> = {
        'Yamoussoukro': 'baoulé',
        'Bouaké': 'baoulé',
        'Korhogo': 'dioula',
        'Odienné': 'dioula',
        'Abidjan': 'fr',
        'San-Pédro': 'fr'
      };

      return regionLanguages[userLocation] || 'fr';
    }

    return 'fr';
  }

  async getCommonPhrases(language: 'fr' | 'baoulé' | 'dioula'): Promise<Array<{
    category: string;
    phrases: Array<{ original: string; translation: string }>;
  }>> {
    await this.delay(150);

    const commonPhrases: Record<string, Array<{
      category: string;
      phrases: Array<{ original: string; translation: string }>;
    }>> = {
      fr: [
        {
          category: 'Salutations',
          phrases: [
            { original: 'Bonjour', translation: 'Hello' },
            { original: 'Bonsoir', translation: 'Good evening' },
            { original: 'Comment allez-vous?', translation: 'How are you?' }
          ]
        },
        {
          category: 'Commerce',
          phrases: [
            { original: 'Combien ça coûte?', translation: 'How much does it cost?' },
            { original: 'Je veux acheter', translation: 'I want to buy' },
            { original: 'C\'est trop cher', translation: 'It\'s too expensive' }
          ]
        }
      ],
      baoulé: [
        {
          category: 'Salutations',
          phrases: [
            { original: 'Akwaba', translation: 'Bienvenue' },
            { original: 'Kè nin?', translation: 'Comment vas-tu?' },
            { original: 'Wa blé yè', translation: 'Ça va bien' }
          ]
        },
        {
          category: 'Commerce',
          phrases: [
            { original: 'Nin yè coman?', translation: 'Ça coûte combien?' },
            { original: 'N\'gban ti wa blé', translation: 'Je veux acheter' },
            { original: 'Dòsù sran', translation: 'C\'est cher' }
          ]
        }
      ],
      dioula: [
        {
          category: 'Salutations',
          phrases: [
            { original: 'I ni sɔgɔma', translation: 'Bonjour' },
            { original: 'I ka kɛnɛ wa?', translation: 'Comment vas-tu?' },
            { original: 'Tɔɔrɔ tɛ', translation: 'Pas de problème' }
          ]
        },
        {
          category: 'Commerce',
          phrases: [
            { original: 'A sɔngɔ ye jumɛn?', translation: 'Ça coûte combien?' },
            { original: 'Ne bɛ a fɛ ka san', translation: 'Je veux acheter' },
            { original: 'A gɛlɛya ka bon', translation: 'C\'est trop cher' }
          ]
        }
      ]
    };

    return commonPhrases[language] || [];
  }

  private initializeTranslations(): void {
    const frenchTranslations = new Map<string, string>([
      ['welcome', 'Bienvenue'],
      ['login', 'Connexion'],
      ['logout', 'Déconnexion'],
      ['dashboard', 'Tableau de bord'],
      ['inventory', 'Inventaire'],
      ['sales', 'Ventes'],
      ['orders', 'Commandes'],
      ['products', 'Produits'],
      ['add', 'Ajouter'],
      ['edit', 'Modifier'],
      ['delete', 'Supprimer'],
      ['save', 'Enregistrer'],
      ['cancel', 'Annuler'],
      ['confirm', 'Confirmer'],
      ['search', 'Rechercher'],
      ['filter', 'Filtrer'],
      ['price', 'Prix'],
      ['quantity', 'Quantité'],
      ['total', 'Total'],
      ['stock', 'Stock'],
      ['low_stock', 'Stock faible'],
      ['out_of_stock', 'Rupture de stock'],
      ['payment', 'Paiement'],
      ['success', 'Succès'],
      ['error', 'Erreur'],
      ['warning', 'Avertissement']
    ]);

    const baouleTranslations = new Map<string, string>([
      ['welcome', 'Akwaba'],
      ['login', 'Kɔ kɔnɔ'],
      ['logout', 'Bɔ kɔnɔ'],
      ['dashboard', 'Tablɔ'],
      ['inventory', 'N\'gan'],
      ['sales', 'Sran'],
      ['orders', 'Commande'],
      ['products', 'Produit nin'],
      ['add', 'Fa kɛ'],
      ['edit', 'Yɛlɛma'],
      ['delete', 'Bɔ'],
      ['save', 'Mara'],
      ['cancel', 'Bali'],
      ['confirm', 'Sran'],
      ['search', 'Ninga'],
      ['filter', 'Sunguru'],
      ['price', 'Sɔngɔ'],
      ['quantity', 'Hakɛ'],
      ['total', 'Bɛɛ'],
      ['stock', 'Stock'],
      ['low_stock', 'Stock dogo'],
      ['out_of_stock', 'Stock tɛ'],
      ['payment', 'Sara'],
      ['success', 'Wa ye'],
      ['error', 'Fili'],
      ['warning', 'Lasɔmini']
    ]);

    const dioulaTranslations = new Map<string, string>([
      ['welcome', 'I ni ce'],
      ['login', 'Don kɔnɔ'],
      ['logout', 'Bɔ kɔnɔ'],
      ['dashboard', 'Jateminɛ yɔrɔ'],
      ['inventory', 'Fɛn minw bɛ yen'],
      ['sales', 'Feere'],
      ['orders', 'Ɲininkali'],
      ['products', 'Fɛn'],
      ['add', 'Fara'],
      ['edit', 'Yɛlɛma'],
      ['delete', 'Bɔ'],
      ['save', 'Mara'],
      ['cancel', 'Dabila'],
      ['confirm', 'Lajɛ'],
      ['search', 'Ɲini'],
      ['filter', 'Sugandi'],
      ['price', 'Sɔngɔ'],
      ['quantity', 'Hakɛ'],
      ['total', 'Bɛɛ'],
      ['stock', 'Stock'],
      ['low_stock', 'Stock dɔgɔ'],
      ['out_of_stock', 'Stock tɛ'],
      ['payment', 'Sara'],
      ['success', 'Ɲɛtaa'],
      ['error', 'Fili'],
      ['warning', 'Lasɔmini']
    ]);

    this.translations.set('fr', frenchTranslations);
    this.translations.set('baoulé', baouleTranslations);
    this.translations.set('dioula', dioulaTranslations);

    this.phraseBook.set('bonjour_fr', new Map([
      ['baoulé', 'Akwaba'],
      ['dioula', 'I ni sɔgɔma']
    ]));

    this.phraseBook.set('merci_fr', new Map([
      ['baoulé', 'Akpè'],
      ['dioula', 'I ni cɛ']
    ]));

    this.phraseBook.set('combien_fr', new Map([
      ['baoulé', 'Coman'],
      ['dioula', 'Jumɛn']
    ]));

    this.phraseBook.set('acheter_fr', new Map([
      ['baoulé', 'Sran'],
      ['dioula', 'San']
    ]));

    this.phraseBook.set('vendre_fr', new Map([
      ['baoulé', 'Fɛ'],
      ['dioula', 'Feere']
    ]));
  }
}

export const multilingualService = MultilingualService.getInstance();
