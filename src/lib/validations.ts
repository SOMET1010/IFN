import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .min(1, "L'email est requis")
  .email("Veuillez entrer une adresse email valide")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format d'email invalide");

// Password validation schema
export const passwordSchema = z.string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(100, "Le mot de passe ne doit pas dépasser 100 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial");

// Phone number validation schema (Ivory Coast format)
export const phoneSchema = z.string()
  .min(1, "Le numéro de téléphone est requis")
  .regex(/^(\\+225|00225)?[0-9]{8,10}$/, "Format de numéro de téléphone invalide (ex: +225 01 02 03 04)");

// Login form validation schema
export const loginSchema = z.object({
  email: z.union([
    emailSchema,
    phoneSchema
  ], {
    message: "Veuillez entrer un email ou un numéro de téléphone valide"
  }),
  password: z.string()
    .min(1, "Le mot de passe est requis")
    .max(100, "Le mot de passe ne doit pas dépasser 100 caractères"),
  rememberMe: z.boolean().optional()
});

// Registration form validation schema
export const registerSchema = z.object({
  name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides"),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['producer', 'merchant', 'cooperative'], {
    errorMap: () => ({ message: "Veuillez sélectionner un rôle valide" })
  }),
  location: z.string()
    .min(2, "La localisation est requise")
    .max(100, "La localisation ne doit pas dépasser 100 caractères"),
  agreeToTerms: z.boolean()
    .refine(val => val === true, "Vous devez accepter les conditions d'utilisation")
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

// Password reset validation schema
export const passwordResetSchema = z.object({
  email: z.union([
    emailSchema,
    phoneSchema
  ], {
    message: "Veuillez entrer un email ou un numéro de téléphone valide"
  })
});

// Password change validation schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, "Le mot de passe actuel est requis"),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas",
  path: ["confirmPassword"]
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "Le nouveau mot de passe doit être différent de l'ancien",
  path: ["newPassword"]
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// Helper functions
export const validateEmail = (email: string): string[] => {
  const result = emailSchema.safeParse(email);
  return result.success ? [] : [result.error.message || "Email invalide"];
};

export const validatePassword = (password: string): string[] => {
  const result = passwordSchema.safeParse(password);
  return result.success ? [] : result.error.errors.map(err => err.message);
};

export const validateLoginForm = (data: Partial<LoginFormData>): string[] => {
  const result = loginSchema.safeParse(data);
  return result.success ? [] : result.error.errors.map(err => err.message);
};

export const validateRegisterForm = (data: Partial<RegisterFormData>): string[] => {
  const result = registerSchema.safeParse(data);
  return result.success ? [] : result.error.errors.map(err => err.message);
};