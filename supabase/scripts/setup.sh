#!/bin/bash

# Script de configuration pour Supabase - Plateforme d'Inclusion Numérique

set -e

echo "🚀 Configuration de Supabase pour la plateforme d'inclusion numérique"
echo "================================================================"

# Vérifier si la CLI Supabase est installée
if ! command -v supabase &> /dev/null; then
    echo "❌ La CLI Supabase n'est pas installée."
    echo "Veuillez l'installer avec: npm install -g supabase"
    exit 1
fi

# Vérifier si le projet est lié
if ! supabase link --list &> /dev/null; then
    echo "📝 Configuration du projet Supabase..."
    read -p "Entrez votre project reference Supabase: " project_ref
    read -p "Entrez votre clé de service Supabase: " service_key

    supabase link --project-ref "$project_ref"
    supabase config set --project-ref "$project_ref"

    echo "✅ Projet lié avec succès"
fi

# Appliquer les migrations dans l'ordre
echo "📊 Application des migrations..."

echo "1/5: Schéma de base..."
supabase db push --linked

echo "2/5: Politiques RLS..."
supabase db push --linked

echo "3/5: Fonctions et triggers..."
supabase db push --linked

echo "4/5: Données initiales..."
supabase db push --linked

echo "5/5: Vues et indexes..."
supabase db push --linked

echo "✅ Toutes les migrations ont été appliquées avec succès"

# Créer les buckets de stockage nécessaires
echo "📁 Création des buckets de stockage..."

# Bucket pour les images de produits
supabase storage create products --public

# Bucket pour les documents d'enrôlement
supabase storage create documents --private

# Bucket pour les avatars
supabase storage create avatars --public

# Bucket pour les reçus
supabase storage create receipts --private

echo "✅ Buckets de stockage créés"

# Définir les politiques pour les buckets
echo "🔒 Configuration des politiques de stockage..."

# Politiques pour le bucket products
supabase storage set-policy products --policy '{
    "public": true,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/gif", "image/webp"],
    "max_file_size": 5242880
}'

# Politiques pour le bucket documents
supabase storage set-policy documents --policy '{
    "public": false,
    "allowed_mime_types": ["image/jpeg", "image/png", "application/pdf"],
    "max_file_size": 10485760
}'

echo "✅ Politiques de stockage configurées"

# Créer les utilisateurs initiaux
echo "👤 Création des utilisateurs initiaux..."

# Créer l'administrateur
echo "Création de l'administrateur..."
supabase auth signup --email "admin@inclusionnumerique.ci" --password "Admin123!" --data '{"name": "Administrateur Système", "role": "admin"}'

# Créer les utilisateurs de test
echo "Création des utilisateurs de test..."
supabase auth signup --email "merchant@example.com" --password "Merchant123!" --data '{"name": "Marchand Exemple", "role": "merchant"}'
supabase auth signup --email "producer@example.com" --password "Producer123!" --data '{"name": "Producteur Exemple", "role": "producer"}'
supabase auth signup --email "cooperative@example.com" --password "Cooperative123!" --data '{"name": "Coopérative Exemple", "role": "cooperative"}'

echo "✅ Utilisateurs créés"

# Afficher les informations de connexion
echo ""
echo "🎉 Configuration terminée !"
echo "================================================================"
echo "📱 URL de l'application: http://localhost:8080"
echo "🗄️  URL du dashboard Supabase: $(supabase status | grep 'API URL' | awk '{print $3}')"
echo ""
echo "🔑 Identifiants de test:"
echo "   Admin: admin@inclusionnumerique.ci / Admin123!"
echo "   Marchand: merchant@example.com / Merchant123!"
echo "   Producteur: producer@example.com / Producer123!"
echo "   Coopérative: cooperative@example.com / Cooperative123!"
echo ""
echo "⚠️  N'oubliez pas de changer les mots de passe par défaut !"
echo "================================================================"

# Vérifier le statut
echo "📊 Vérification du statut..."
supabase status

echo ""
echo "✅ La plateforme est prête à être utilisée !"