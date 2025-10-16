export interface PasswordStrengthResult {
  score: number; // 0-100
  strength: 'very_weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  feedback: {
    message: string;
    suggestions: string[];
    warning?: string;
  };
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    special: boolean;
    noCommonPatterns: boolean;
  };
}

export class PasswordStrengthService {
  // Common weak passwords to check against
  private static readonly COMMON_PASSWORDS = [
    'password', '123456', '12345678', '123456789', '12345',
    'qwerty', 'abc123', 'password1', 'admin', 'welcome',
    'letmein', 'monkey', 'dragon', 'master', 'hello',
    'football', 'baseball', 'superman', 'iloveyou', 'sunshine'
  ];

  // Common patterns to avoid
  private static readonly PATTERNS = [
    /123456/, /abcde/, /qwerty/, /asdfg/,
    /(.)\1{2,}/, // Repeated characters (aaa)
    /(012|123|234|345|456|567|678|789|890)/, // Sequential numbers
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i // Sequential letters
  ];

  static checkPasswordStrength(password: string): PasswordStrengthResult {
    const requirements = this.checkRequirements(password);
    let score = this.calculateScore(password, requirements);
    const patterns = this.checkPatterns(password);

    // Reduce score for common passwords
    if (this.isCommonPassword(password)) {
      score = Math.max(0, score - 30);
    }

    // Reduce score for common patterns
    if (patterns.hasCommonPatterns) {
      score = Math.max(0, score - 20);
    }

    const strength = this.getStrengthLevel(score);
    const feedback = this.generateFeedback(password, requirements, patterns, score);

    return {
      score,
      strength,
      feedback,
      requirements: {
        ...requirements,
        noCommonPatterns: !patterns.hasCommonPatterns
      }
    };
  }

  private static checkRequirements(password: string): PasswordStrengthResult['requirements'] {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      noCommonPatterns: false // Will be checked separately
    };
  }

  private static calculateScore(password: string, requirements: PasswordStrengthResult['requirements']): number {
    let score = 0;

    // Length scoring
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety scoring
    const varietyScore = [
      requirements.lowercase ? 10 : 0,
      requirements.uppercase ? 10 : 0,
      requirements.numbers ? 10 : 0,
      requirements.special ? 15 : 0
    ].reduce((a, b) => a + b, 0);

    score += varietyScore;

    // Entropy bonus
    const entropy = this.calculateEntropy(password);
    if (entropy > 3.5) score += 15;
    else if (entropy > 3.0) score += 10;
    else if (entropy > 2.5) score += 5;

    // Length bonus for very long passwords
    if (password.length >= 20) score += 10;

    return Math.min(100, score);
  }

  private static calculateEntropy(password: string): number {
    const charset = new Set(password).size;
    const length = password.length;

    if (length === 0) return 0;

    return Math.log2(Math.pow(charset, length)) / length;
  }

  private static checkPatterns(password: string): { hasCommonPatterns: boolean; patterns: string[] } {
    const foundPatterns: string[] = [];

    for (const pattern of this.PATTERNS) {
      if (pattern.test(password)) {
        foundPatterns.push(pattern.toString());
      }
    }

    return {
      hasCommonPatterns: foundPatterns.length > 0,
      patterns: foundPatterns
    };
  }

  private static isCommonPassword(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    return this.COMMON_PASSWORDS.includes(lowerPassword);
  }

  private static getStrengthLevel(score: number): PasswordStrengthResult['strength'] {
    if (score >= 90) return 'very_strong';
    if (score >= 70) return 'strong';
    if (score >= 50) return 'good';
    if (score >= 30) return 'fair';
    if (score >= 15) return 'weak';
    return 'very_weak';
  }

  private static generateFeedback(
    password: string,
    requirements: PasswordStrengthResult['requirements'],
    patterns: { hasCommonPatterns: boolean; patterns: string[] },
    score: number
  ): PasswordStrengthResult['feedback'] {
    const suggestions: string[] = [];
    let message = '';
    let warning: string | undefined;

    if (score >= 90) {
      message = 'Mot de passe très fort !';
    } else if (score >= 70) {
      message = 'Mot de passe fort';
    } else if (score >= 50) {
      message = 'Mot de passe correct';
    } else if (score >= 30) {
      message = 'Mot de passe faible';
    } else {
      message = 'Mot de passe très faible';
    }

    // Generate suggestions based on missing requirements
    if (!requirements.length) {
      suggestions.push('Utilisez au moins 8 caractères');
    }
    if (!requirements.uppercase) {
      suggestions.push('Ajoutez des lettres majuscules');
    }
    if (!requirements.lowercase) {
      suggestions.push('Ajoutez des lettres minuscules');
    }
    if (!requirements.numbers) {
      suggestions.push('Ajoutez des chiffres');
    }
    if (!requirements.special) {
      suggestions.push('Ajoutez des caractères spéciaux (!@#$%^&*)');
    }

    // Pattern warnings
    if (patterns.hasCommonPatterns) {
      warning = 'Évitez les motifs communs (123, abc, etc.)';
      suggestions.push('Évitez les séquences évidentes');
    }

    if (this.isCommonPassword(password)) {
      warning = 'Ce mot de passe est trop courant';
      suggestions.push('Choisissez un mot de passe plus unique');
    }

    // Length suggestions
    if (password.length < 12) {
      suggestions.push('Utilisez au moins 12 caractères pour plus de sécurité');
    }

    // Variety suggestions
    const usedCharTypes = [
      requirements.lowercase,
      requirements.uppercase,
      requirements.numbers,
      requirements.special
    ].filter(Boolean).length;

    if (usedCharTypes < 3) {
      suggestions.push('Mélangez différents types de caractères');
    }

    return {
      message,
      suggestions,
      warning
    };
  }

  // Generate a secure random password
  static generateSecurePassword(options: {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSpecial?: boolean;
    excludeSimilar?: boolean;
  } = {}): string {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSpecial = true,
      excludeSimilar = false
    } = options;

    let charset = '';
    if (includeLowercase) charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += excludeSimilar ? '23456789' : '0123456789';
    if (includeSpecial) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset.length === 0) {
      charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    }

    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    // Ensure at least one character from each included set
    const sets = [
      includeLowercase ? /[a-z]/ : null,
      includeUppercase ? /[A-Z]/ : null,
      includeNumbers ? /[0-9]/ : null,
      includeSpecial ? /[!@#$%^&*()_+\-=[]{}|;:,.<>?]/ : null
    ].filter(Boolean) as RegExp[];

    for (const set of sets) {
      if (!set.test(password)) {
        // Replace a random character with one from this set
        const setCharset = set.toString().replace(/[\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const randomChar = setCharset[Math.floor(Math.random() * setCharset.length)];
        const randomIndex = Math.floor(Math.random() * password.length);
        password = password.substring(0, randomIndex) + randomChar + password.substring(randomIndex + 1);
      }
    }

    return password;
  }

  // Check if password meets minimum requirements
  static meetsMinimumRequirements(password: string): boolean {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }

  // Estimate time to crack (very rough estimate)
  static estimateTimeToCrack(password: string): string {
    const entropy = this.calculateEntropy(password);
    const guessesPerSecond = 1e9; // Modern GPU can do ~1 billion guesses/second

    const totalGuesses = Math.pow(2, entropy * password.length);
    const secondsToCrack = totalGuesses / guessesPerSecond;

    if (secondsToCrack < 1) return 'instantanément';
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} secondes`;
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} heures`;
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} jours`;
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} années`;

    return 'plusieurs siècles';
  }
}