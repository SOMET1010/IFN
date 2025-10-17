import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { trainingService, ModuleWithProgress, TrainingVideo } from '@/services/training/trainingService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Award,
  Lock,
  Download
} from 'lucide-react';

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

export default function ModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [module, setModule] = useState<ModuleWithProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId) return;
    loadModule();
  }, [moduleId, user]);

  const loadModule = async () => {
    if (!moduleId) return;

    try {
      setLoading(true);
      if (user) {
        const data = await trainingService.getModuleWithProgress(moduleId, user.id);
        setModule(data);
      } else {
        const baseModule = await trainingService.getModuleById(moduleId);
        if (!baseModule) return;

        const videos = await trainingService.getModuleVideos(moduleId);
        setModule({
          ...baseModule,
          videos,
          totalVideos: videos.length,
          completedVideos: 0,
          progressPercent: 0,
          userBadges: [],
        });
      }
    } catch (error) {
      console.error('Error loading module:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isVideoUnlocked = (video: TrainingVideo, index: number): boolean => {
    if (!user || index === 0) return true;

    if (!module) return false;

    const previousVideo = module.videos[index - 1];
    const previousProgress = module.videos.slice(0, index).every((v) => {
      return module.completedVideos >= index;
    });

    return previousProgress;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Module introuvable</h2>
          <p className="text-muted-foreground mb-4">Ce module de formation n'existe pas.</p>
          <Link to="/training">
            <Button>Retour aux modules</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/training">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour aux modules
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={difficultyColors[module.difficulty]}>
                  {difficultyLabels[module.difficulty]}
                </Badge>
                {module.certificate && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Certifié
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{module.title}</h1>
              <p className="text-lg text-gray-600">{module.description}</p>

              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <PlayCircle className="h-4 w-4" />
                  {module.totalVideos} vidéos
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {module.duration_minutes} minutes
                </span>
                {user && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {module.completedVideos} complétées
                  </span>
                )}
              </div>
            </div>

            {module.certificate && (
              <Button variant="outline" className="ml-4">
                <Download className="h-4 w-4 mr-2" />
                Télécharger le certificat
              </Button>
            )}
          </div>

          {user && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Progression du module</span>
                <span className="font-bold">{module.progressPercent}%</span>
              </div>
              <Progress value={module.progressPercent} className="h-2" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Contenu du module</CardTitle>
            <CardDescription>
              {user
                ? 'Cliquez sur une vidéo pour commencer la formation'
                : 'Connectez-vous pour suivre votre progression'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {module.videos.map((video, index) => {
                const isCompleted = user && index < module.completedVideos;
                const isUnlocked = isVideoUnlocked(video, index);

                return (
                  <div key={video.id}>
                    {index > 0 && <Separator className="my-2" />}
                    <button
                      onClick={() => {
                        if (isUnlocked) {
                          navigate(`/training/video/${video.id}`);
                        }
                      }}
                      disabled={!isUnlocked}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        isUnlocked
                          ? 'hover:bg-gray-50 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? 'bg-green-100 text-green-600'
                              : isUnlocked
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : isUnlocked ? (
                            <PlayCircle className="h-5 w-5" />
                          ) : (
                            <Lock className="h-5 w-5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">
                                {index + 1}. {video.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {video.description}
                              </p>
                            </div>
                            <span className="text-sm text-muted-foreground ml-4 flex-shrink-0">
                              {formatDuration(video.duration_seconds)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {module.prerequisites && module.prerequisites.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Prérequis</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {module.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
