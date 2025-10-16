import { PasswordStrengthService, PasswordStrengthResult } from '@/services/auth/passwordStrengthService';

export interface UIEnhancementOptions {
  theme: 'light' | 'dark' | 'auto';
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  showPasswordStrength: boolean;
  autoHideHeaders: boolean;
  compactMode: boolean;
  showTooltips: boolean;
  enableKeyboardShortcuts: boolean;
}

export interface AnimationSettings {
  duration: number;
  easing: string;
  stagger: number;
}

export class UIEnhancementService {
  private static readonly STORAGE_KEY = 'ui_enhancements';
  private static readonly ANIMATION_DURATION = 300;
  private static readonly DEFAULT_OPTIONS: UIEnhancementOptions = {
    theme: 'auto',
    animations: true,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    showPasswordStrength: true,
    autoHideHeaders: false,
    compactMode: false,
    showTooltips: true,
    enableKeyboardShortcuts: true
  };

  // Initialize UI enhancements
  static initialize(): void {
    this.loadSettings();
    this.setupEventListeners();
    this.detectSystemPreferences();
    this.setupKeyboardShortcuts();
  }

  // Load saved settings
  static loadSettings(): UIEnhancementOptions {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const options = stored ? { ...this.DEFAULT_OPTIONS, ...JSON.parse(stored) } : this.DEFAULT_OPTIONS;
      this.applySettings(options);
      return options;
    } catch {
      this.applySettings(this.DEFAULT_OPTIONS);
      return this.DEFAULT_OPTIONS;
    }
  }

  // Save settings
  static saveSettings(options: Partial<UIEnhancementOptions>): UIEnhancementOptions {
    const current = this.loadSettings();
    const updated = { ...current, ...options };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.applySettings(updated);
    return updated;
  }

  // Apply UI settings
  static applySettings(options: UIEnhancementOptions): void {
    // Theme
    this.applyTheme(options.theme);

    // Animations
    this.applyAnimationSettings(options.animations, options.reducedMotion);

    // Accessibility
    this.applyAccessibilitySettings(options.highContrast, options.largeText);

    // Features
    this.applyFeatureSettings(options);
  }

  // Theme management
  static applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    const root = document.documentElement;

    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }

  // Animation settings
  static applyAnimationSettings(animations: boolean, reducedMotion: boolean): void {
    const root = document.documentElement;

    if (reducedMotion) {
      root.style.setProperty('--animation-duration', '0ms');
      root.style.setProperty('--transition-duration', '0ms');
      document.body.classList.add('reduced-motion');
    } else if (animations) {
      root.style.setProperty('--animation-duration', `${this.ANIMATION_DURATION}ms`);
      root.style.setProperty('--transition-duration', `${this.ANIMATION_DURATION}ms`);
      document.body.classList.remove('reduced-motion');
    } else {
      root.style.setProperty('--animation-duration', '0ms');
      root.style.setProperty('--transition-duration', '0ms');
    }
  }

  // Accessibility settings
  static applyAccessibilitySettings(highContrast: boolean, largeText: boolean): void {
    const root = document.documentElement;

    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    if (largeText) {
      root.style.setProperty('--font-size-scale', '1.2');
      document.body.classList.add('large-text');
    } else {
      root.style.setProperty('--font-size-scale', '1');
      document.body.classList.remove('large-text');
    }
  }

  // Feature settings
  static applyFeatureSettings(options: UIEnhancementOptions): void {
    // Password strength indicator
    if (options.showPasswordStrength) {
      this.enablePasswordStrengthIndicators();
    }

    // Auto-hide headers
    if (options.autoHideHeaders) {
      this.enableAutoHideHeaders();
    }

    // Compact mode
    if (options.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }

    // Tooltips
    if (!options.showTooltips) {
      document.body.classList.add('no-tooltips');
    } else {
      document.body.classList.remove('no-tooltips');
    }
  }

  // Password strength indicators
  static enablePasswordStrengthIndicators(): void {
    const style = document.createElement('style');
    style.textContent = `
      .password-strength-indicator {
        height: 4px;
        background: #e5e7eb;
        border-radius: 2px;
        margin-top: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .password-strength-bar {
        height: 100%;
        transition: all 0.3s ease;
        border-radius: 2px;
      }

      .password-strength-very-weak { background: #ef4444; width: 20%; }
      .password-strength-weak { background: #f97316; width: 40%; }
      .password-strength-fair { background: #eab308; width: 60%; }
      .password-strength-good { background: #84cc16; width: 80%; }
      .password-strength-strong { background: #22c55e; width: 100%; }
      .password-strength-very-strong { background: #16a34a; width: 100%; }

      .password-strength-text {
        font-size: 0.875rem;
        margin-top: 4px;
        font-weight: 500;
      }

      .password-strength-very-weak .password-strength-text { color: #ef4444; }
      .password-strength-weak .password-strength-text { color: #f97316; }
      .password-strength-fair .password-strength-text { color: #eab308; }
      .password-strength-good .password-strength-text { color: #84cc16; }
      .password-strength-strong .password-strength-text { color: #22c55e; }
      .password-strength-very-strong .password-strength-text { color: #16a34a; }

      .password-requirements {
        margin-top: 8px;
        font-size: 0.75rem;
        color: #6b7280;
      }

      .requirement {
        display: flex;
        align-items: center;
        margin-bottom: 2px;
      }

      .requirement.met {
        color: #16a34a;
      }

      .requirement::before {
        content: '○';
        margin-right: 4px;
      }

      .requirement.met::before {
        content: '●';
      }
    `;
    document.head.appendChild(style);
  }

  // Create password strength indicator
  static createPasswordStrengthIndicator(inputElement: HTMLInputElement): HTMLElement {
    const container = document.createElement('div');
    container.className = 'password-strength-container';

    const strengthBar = document.createElement('div');
    strengthBar.className = 'password-strength-indicator';
    const strengthFill = document.createElement('div');
    strengthFill.className = 'password-strength-bar';
    strengthBar.appendChild(strengthFill);

    const strengthText = document.createElement('div');
    strengthText.className = 'password-strength-text';

    const requirements = document.createElement('div');
    requirements.className = 'password-requirements';

    container.appendChild(strengthBar);
    container.appendChild(strengthText);
    container.appendChild(requirements);

    // Insert after the input
    inputElement.parentNode?.insertBefore(container, inputElement.nextSibling);

    // Add event listener
    inputElement.addEventListener('input', () => {
      this.updatePasswordStrength(inputElement.value, strengthFill, strengthText, requirements);
    });

    return container;
  }

  // Update password strength display
  static updatePasswordStrength(
    password: string,
    strengthFill: HTMLElement,
    strengthText: HTMLElement,
    requirements: HTMLElement
  ): void {
    const result = PasswordStrengthService.checkPasswordStrength(password);

    // Update strength bar
    strengthFill.className = `password-strength-bar password-strength-${result.strength}`;

    // Update text
    strengthText.textContent = result.feedback.message;
    strengthText.className = `password-strength-text password-strength-${result.strength}`;

    // Update requirements
    const reqs = [
      { key: 'length', label: '8 caractères minimum', met: result.requirements.length },
      { key: 'uppercase', label: 'Lettre majuscule', met: result.requirements.uppercase },
      { key: 'lowercase', label: 'Lettre minuscule', met: result.requirements.lowercase },
      { key: 'numbers', label: 'Chiffre', met: result.requirements.numbers },
      { key: 'special', label: 'Caractère spécial', met: result.requirements.special },
      { key: 'noCommonPatterns', label: 'Pas de motifs communs', met: result.requirements.noCommonPatterns }
    ];

    requirements.innerHTML = reqs.map(req =>
      `<div class="requirement ${req.met ? 'met' : ''}" data-requirement="${req.key}">${req.label}</div>`
    ).join('');

    // Add warning if needed
    if (result.feedback.warning) {
      const warning = document.createElement('div');
      warning.className = 'password-warning';
      warning.textContent = result.feedback.warning;
      warning.style.color = '#ef4444';
      warning.style.fontSize = '0.75rem';
      warning.style.marginTop = '4px';
      requirements.appendChild(warning);
    }
  }

  // Auto-hide headers
  static enableAutoHideHeaders(): void {
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop && scrollTop > 100) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // Add CSS for header hiding
    const style = document.createElement('style');
    style.textContent = `
      header {
        transition: transform 0.3s ease-in-out;
      }
      header.header-hidden {
        transform: translateY(-100%);
      }
    `;
    document.head.appendChild(style);
  }

  // Setup event listeners
  static setupEventListeners(): void {
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const options = this.loadSettings();
      if (options.theme === 'auto') {
        this.applyTheme('auto');
      }
    });

    // Listen for reduced motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
      const options = this.loadSettings();
      this.applyAnimationSettings(options.animations, options.reducedMotion);
    });
  }

  // Detect system preferences
  static detectSystemPreferences(): void {
    const options = this.loadSettings();

    // Auto-detect theme if set to auto
    if (options.theme === 'auto') {
      this.applyTheme('auto');
    }

    // Auto-detect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.saveSettings({ reducedMotion: true });
    }
  }

  // Keyboard shortcuts
  static setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      const options = this.loadSettings();
      if (!options.enableKeyboardShortcuts) return;

      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }

      // Ctrl/Cmd + B for sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.toggleSidebar();
      }

      // Ctrl/Cmd + D for dark mode toggle
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        this.toggleTheme();
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  }

  // Keyboard shortcut actions
  static openSearch(): void {
    const searchInput = document.querySelector('input[type="search"], [placeholder*="Rechercher"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  static toggleSidebar(): void {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('sidebar-collapsed');
    }
  }

  static toggleTheme(): void {
    const options = this.loadSettings();
    const newTheme = options.theme === 'dark' ? 'light' : 'dark';
    this.saveSettings({ theme: newTheme });
  }

  static closeModals(): void {
    const modals = document.querySelectorAll('.modal, .dialog');
    modals.forEach(modal => {
      modal.classList.remove('open');
      modal.classList.add('closed');
    });
  }

  // Get current settings
  static getCurrentSettings(): UIEnhancementOptions {
    return this.loadSettings();
  }

  // Reset to defaults
  static resetToDefaults(): UIEnhancementOptions {
    localStorage.removeItem(this.STORAGE_KEY);
    this.applySettings(this.DEFAULT_OPTIONS);
    return this.DEFAULT_OPTIONS;
  }

  // Export settings
  static exportSettings(): string {
    const settings = this.loadSettings();
    return JSON.stringify(settings, null, 2);
  }

  // Import settings
  static importSettings(settingsJson: string): boolean {
    try {
      const settings = JSON.parse(settingsJson);
      this.saveSettings(settings);
      return true;
    } catch {
      return false;
    }
  }

  // Check if feature is enabled
  static isFeatureEnabled(feature: keyof UIEnhancementOptions): boolean {
    const options = this.loadSettings();
    return options[feature];
  }

  // Get animation settings
  static getAnimationSettings(): AnimationSettings {
    const options = this.loadSettings();
    return {
      duration: options.animations && !options.reducedMotion ? this.ANIMATION_DURATION : 0,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      stagger: 50
    };
  }
}