import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Volume2,
  AlertTriangle,
  CheckCircle,
  LogOut,
  ArrowLeft,
  Shield,
  Download,
  Trash2
} from 'lucide-react';

export default function SimplifiedSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    voiceHelp: true,
    darkMode: false,
    language: 'fr'
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.')) {
      alert('Votre demande de suppression a été enregistrée. Vous recevrez une confirmation par téléphone.');
      logout();
    }
  };

  const handleExportData = () => {
    alert('Vos données seront envoyées à votre numéro de téléphone dans quelques minutes.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-gray-600">Gérez vos préférences simplement</p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-2 border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-orange-100 to-yellow-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Bell className="h-6 w-6" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Recevoir les notifications</div>
                  <p className="text-sm text-gray-600">Alertes pour vos commandes et messages</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                className="scale-125"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Volume2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-lg">Aide vocale</div>
                  <p className="text-sm text-gray-600">Assistant vocal pour vous guider</p>
                </div>
              </div>
              <Switch
                checked={settings.voiceHelp}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, voiceHelp: checked }))}
                className="scale-125"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-blue-100 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sun className="h-6 w-6" />
              Affichage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  {settings.darkMode ? (
                    <Moon className="h-6 w-6 text-gray-700" />
                  ) : (
                    <Sun className="h-6 w-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-lg">Mode sombre</div>
                  <p className="text-sm text-gray-600">Pour économiser la batterie</p>
                </div>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
                className="scale-125"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-green-100 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6" />
              Mon compte
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-16 text-lg justify-start gap-4 border-2"
              onClick={handleExportData}
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Télécharger mes données</div>
                <div className="text-sm text-gray-600 font-normal">Recevoir une copie par SMS</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-16 text-lg justify-start gap-4 border-2"
              onClick={handleLogout}
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <LogOut className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Se déconnecter</div>
                <div className="text-sm text-gray-600 font-normal">Quitter l'application</div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-16 text-lg justify-start gap-4 border-2 border-red-200 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-red-700">Supprimer mon compte</div>
                <div className="text-sm text-red-600 font-normal">Action définitive</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <Alert className="border-4 border-red-300 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="space-y-4">
              <div>
                <p className="font-bold text-red-900 text-lg mb-2">
                  Attention! Cette action est irréversible.
                </p>
                <p className="text-red-800">
                  Toutes vos données seront supprimées définitivement.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleDeleteAccount}
                  className="flex-1"
                >
                  Oui, supprimer
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Help Section */}
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 text-center space-y-3">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto">
                <Volume2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-900">
                Besoin d'aide?
              </h3>
              <p className="text-purple-800">
                Appelez le <strong className="text-2xl">1234</strong>
              </p>
              <p className="text-sm text-purple-700">
                Service gratuit disponible 7j/7
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auto-save notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pb-8">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Vos modifications sont enregistrées automatiquement
        </div>
      </div>
    </div>
  );
}
