import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { trainingService, TrainingVideo, UserProgress } from '@/services/training/trainingService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipForward,
  RotateCcw
} from 'lucide-react';

export default function VideoPlayerPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const [video, setVideo] = useState<TrainingVideo | null>(null);
  const [moduleVideos, setModuleVideos] = useState<TrainingVideo[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!videoId) return;
    loadVideo();

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [videoId, user]);

  useEffect(() => {
    if (video && progress) {
      if (videoRef.current && progress.last_position_seconds > 0) {
        videoRef.current.currentTime = progress.last_position_seconds;
      }
    }
  }, [video, progress]);

  const loadVideo = async () => {
    if (!videoId) return;

    try {
      setLoading(true);
      const videoData = await trainingService.getVideoById(videoId);
      if (!videoData) {
        toast({
          title: 'Erreur',
          description: 'Vidéo introuvable',
          variant: 'destructive',
        });
        return;
      }

      setVideo(videoData);

      const videos = await trainingService.getModuleVideos(videoData.module_id);
      setModuleVideos(videos);

      if (user) {
        const progressData = await trainingService.getVideoProgress(user.id, videoId);
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la vidéo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startProgressTracking = () => {
    if (!user || !video) return;

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(async () => {
      if (!videoRef.current || !user || !video) return;

      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progressPercent = (currentTime / duration) * 100;

      try {
        await trainingService.updateVideoProgress(
          user.id,
          video.id,
          progressPercent,
          currentTime,
          5
        );
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }, 5000);
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      startProgressTracking();
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoEnd = async () => {
    if (user && video) {
      try {
        await trainingService.markVideoCompleted(user.id, video.id);
        toast({
          title: 'Vidéo complétée!',
          description: 'Votre progression a été enregistrée',
        });
      } catch (error) {
        console.error('Error marking video completed:', error);
      }
    }
  };

  const goToNextVideo = () => {
    if (!video || !moduleVideos.length) return;

    const currentIndex = moduleVideos.findIndex((v) => v.id === video.id);
    if (currentIndex < moduleVideos.length - 1) {
      const nextVideo = moduleVideos[currentIndex + 1];
      navigate(`/training/video/${nextVideo.id}`);
    } else {
      navigate(`/training/module/${video.module_id}`);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement de la vidéo...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <PlayCircle className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Vidéo introuvable</h2>
          <p className="text-gray-400 mb-4">Cette vidéo n'existe pas.</p>
          <Link to="/training">
            <Button variant="outline">Retour aux modules</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="p-4">
          <Link to={`/training/module/${video.module_id}`}>
            <Button variant="ghost" className="text-white hover:bg-gray-800 mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour au module
            </Button>
          </Link>
        </div>

        <div className="aspect-video bg-black relative group">
          <video
            ref={videoRef}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={video.video_url} type="video/mp4" />
            {video.subtitle_url && <track kind="subtitles" src={video.subtitle_url} srcLang="fr" label="Français" />}
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mb-4"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={isPlaying ? handlePause : handlePlay}
                  >
                    {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={goToNextVideo}
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                  >
                    <Maximize className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                  <p className="text-muted-foreground">{video.description}</p>
                </div>
                {progress?.completed && (
                  <div className="flex items-center gap-2 text-green-600 ml-4">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Complétée</span>
                  </div>
                )}
              </div>

              {user && progress && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Votre progression</span>
                    <span className="font-semibold">{Math.round(progress.progress_percent)}%</span>
                  </div>
                  <Progress value={progress.progress_percent} />
                </div>
              )}

              {moduleVideos.length > 1 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Autres vidéos du module</h3>
                  <div className="space-y-2">
                    {moduleVideos
                      .filter((v) => v.id !== video.id)
                      .slice(0, 3)
                      .map((v) => (
                        <button
                          key={v.id}
                          onClick={() => navigate(`/training/video/${v.id}`)}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="flex-1 font-medium">{v.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatTime(v.duration_seconds)}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
