import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { trainingService, TrainingModule, ModuleWithProgress } from '@/services/training/trainingService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  PlayCircle,
  Award,
  TrendingUp,
  ShoppingCart,
  Package,
  CreditCard,
  Shield,
  Store,
  Clock,
  CheckCircle2,
  Trophy,
  Medal
} from 'lucide-react';

const categoryIcons = {
  ventes: ShoppingCart,
  stocks: Package,
  paiements: CreditCard,
  social: Shield,
  marketplace: Store,
  general: BookOpen,
};

const categoryColors = {
  ventes: 'bg-green-100 text-green-700',
  stocks: 'bg-blue-100 text-blue-700',
  paiements: 'bg-orange-100 text-orange-700',
  social: 'bg-purple-100 text-purple-700',
  marketplace: 'bg-pink-100 text-pink-700',
  general: 'bg-gray-100 text-gray-700',
};

const difficultyLabels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const badgeIcons = {
  bronze: Medal,
  silver: Medal,
  gold: Trophy,
  expert: Award,
};

const badgeColors = {
  bronze: 'text-orange-600',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  expert: 'text-purple-600',
};

export default function TrainingPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadModules();
    loadStats();
  }, [user]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const allModules = await trainingService.getModules();

      if (!user) {
        const modulesWithoutProgress = allModules.map(module => ({
          ...module,
          videos: [],
          totalVideos: 0,
          completedVideos: 0,
          progressPercent: 0,
          userBadges: [],
        }));
        setModules(modulesWithoutProgress);
        return;
      }

      const modulesWithProgress = await Promise.all(
        allModules.map(async (module) => {
          const moduleData = await trainingService.getModuleWithProgress(module.id, user.id);
          return moduleData || {
            ...module,
            videos: [],
            totalVideos: 0,
            completedVideos: 0,
            progressPercent: 0,
            userBadges: [],
          };
        })
      );

      setModules(modulesWithProgress);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const userStats = await trainingService.getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filteredModules = selectedCategory === 'all'
    ? modules
    : modules.filter(m => m.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'Tous', count: modules.length },
    { id: 'ventes', label: 'Ventes', count: modules.filter(m => m.category === 'ventes').length },
    { id: 'stocks', label: 'Stocks', count: modules.filter(m => m.category === 'stocks').length },
    { id: 'paiements', label: 'Paiements', count: modules.filter(m => m.category === 'paiements').length },
    { id: 'social', label: 'Social', count: modules.filter(m => m.category === 'social').length },
    { id: 'marketplace', label: 'Marketplace', count: modules.filter(m => m.category === 'marketplace').length },
  ].filter(cat => cat.count > 0 || cat.id === 'all');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Centre de Formation
              </h1>
              <p className="mt-2 text-gray-600">
                Apprenez à maîtriser toutes les fonctionnalités de la plateforme
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {user && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Modules Complétés</p>
                    <p className="text-2xl font-bold">{stats.completedModules}/{stats.totalModules}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={stats.overallProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vidéos Vues</p>
                    <p className="text-2xl font-bold">{stats.completedVideos}</p>
                  </div>
                  <PlayCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Temps de Formation</p>
                    <p className="text-2xl font-bold">{stats.totalWatchTimeMinutes}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Certificats</p>
                    <p className="text-2xl font-bold">{stats.certificates}</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="flex flex-wrap h-auto gap-2">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
                {cat.label}
                <Badge variant="secondary" className="ml-1">{cat.count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des modules...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module) => {
                const CategoryIcon = categoryIcons[module.category];
                const hasBadges = module.userBadges && module.userBadges.length > 0;

                return (
                  <Card key={module.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-lg ${categoryColors[module.category]}`}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                        <Badge className={difficultyColors[module.difficulty]}>
                          {difficultyLabels[module.difficulty]}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {module.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress */}
                      {user && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-semibold">{module.progressPercent}%</span>
                          </div>
                          <Progress value={module.progressPercent} />
                          <p className="text-xs text-muted-foreground">
                            {module.completedVideos}/{module.totalVideos} vidéos complétées
                          </p>
                        </div>
                      )}

                      {/* Badges */}
                      {hasBadges && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {module.userBadges.map((badge) => {
                            const BadgeIcon = badgeIcons[badge.badge_type];
                            return (
                              <div key={badge.id} className="flex items-center gap-1">
                                <BadgeIcon className={`h-5 w-5 ${badgeColors[badge.badge_type]}`} />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1">
                          <PlayCircle className="h-4 w-4" />
                          {module.totalVideos} vidéos
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {module.duration_minutes} min
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link to={`/training/module/${module.id}`}>
                        <Button className="w-full">
                          {module.progressPercent > 0 ? 'Continuer' : 'Commencer'}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredModules.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun module disponible</h3>
                <p className="text-muted-foreground">
                  Aucun module de formation dans cette catégorie pour le moment.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
