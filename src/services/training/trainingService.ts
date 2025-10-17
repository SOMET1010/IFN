import { supabase } from '../supabase/supabaseClient';

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'ventes' | 'stocks' | 'paiements' | 'social' | 'marketplace' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  thumbnail_url?: string;
  order_index: number;
  is_active: boolean;
  prerequisites: string[];
  created_at: string;
  updated_at: string;
}

export interface TrainingVideo {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_url: string;
  subtitle_url?: string;
  duration_seconds: number;
  order_index: number;
  thumbnail_url?: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  video_id: string;
  completed: boolean;
  progress_percent: number;
  last_position_seconds: number;
  watch_time_seconds: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  module_id: string;
  certificate_number: string;
  completion_rate: number;
  issued_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: 'bronze' | 'silver' | 'gold' | 'expert';
  module_id?: string;
  earned_at: string;
}

export interface ModuleWithProgress extends TrainingModule {
  videos: TrainingVideo[];
  totalVideos: number;
  completedVideos: number;
  progressPercent: number;
  userBadges: Badge[];
  certificate?: Certificate;
}

class TrainingService {
  // ============================================
  // MODULES
  // ============================================

  async getModules(category?: string): Promise<TrainingModule[]> {
    try {
      let query = supabase
        .from('training_modules')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  async getModuleById(id: string): Promise<TrainingModule | null> {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  async getModuleWithProgress(moduleId: string, userId: string): Promise<ModuleWithProgress | null> {
    try {
      const module = await this.getModuleById(moduleId);
      if (!module) return null;

      const videos = await this.getModuleVideos(moduleId);
      const progress = await this.getModuleProgress(userId, moduleId);
      const badges = await this.getUserBadgesForModule(userId, moduleId);
      const certificate = await this.getUserCertificate(userId, moduleId);

      const completedVideos = videos.filter(video => {
        const videoProgress = progress.find(p => p.video_id === video.id);
        return videoProgress?.completed || false;
      }).length;

      const progressPercent = videos.length > 0 ? (completedVideos / videos.length) * 100 : 0;

      return {
        ...module,
        videos,
        totalVideos: videos.length,
        completedVideos,
        progressPercent: Math.round(progressPercent),
        userBadges: badges,
        certificate,
      };
    } catch (error) {
      console.error('Error fetching module with progress:', error);
      throw error;
    }
  }

  // ============================================
  // VIDÉOS
  // ============================================

  async getModuleVideos(moduleId: string): Promise<TrainingVideo[]> {
    try {
      const { data, error } = await supabase
        .from('training_videos')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  }

  async getVideoById(id: string): Promise<TrainingVideo | null> {
    try {
      const { data, error } = await supabase
        .from('training_videos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  }

  // ============================================
  // PROGRESSION
  // ============================================

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_training_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  async getModuleProgress(userId: string, moduleId: string): Promise<UserProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_training_progress')
        .select(`
          *,
          video:training_videos!inner(module_id)
        `)
        .eq('user_id', userId)
        .eq('video.module_id', moduleId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching module progress:', error);
      throw error;
    }
  }

  async getVideoProgress(userId: string, videoId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_training_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching video progress:', error);
      throw error;
    }
  }

  async updateVideoProgress(
    userId: string,
    videoId: string,
    progressPercent: number,
    lastPositionSeconds: number,
    watchTimeSeconds: number
  ): Promise<UserProgress> {
    try {
      const completed = progressPercent >= 90;

      const { data, error } = await supabase
        .from('user_training_progress')
        .upsert({
          user_id: userId,
          video_id: videoId,
          progress_percent: progressPercent,
          last_position_seconds: lastPositionSeconds,
          watch_time_seconds: watchTimeSeconds,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,video_id'
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after upsert');
      return data;
    } catch (error) {
      console.error('Error updating video progress:', error);
      throw error;
    }
  }

  async markVideoCompleted(userId: string, videoId: string): Promise<UserProgress> {
    try {
      const { data, error } = await supabase
        .from('user_training_progress')
        .upsert({
          user_id: userId,
          video_id: videoId,
          completed: true,
          progress_percent: 100,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,video_id'
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after upsert');
      return data;
    } catch (error) {
      console.error('Error marking video completed:', error);
      throw error;
    }
  }

  async getModuleCompletionRate(userId: string, moduleId: string): Promise<number> {
    try {
      const videos = await this.getModuleVideos(moduleId);
      if (videos.length === 0) return 0;

      const progress = await this.getModuleProgress(userId, moduleId);
      const completedCount = progress.filter(p => p.completed).length;

      return Math.round((completedCount / videos.length) * 100);
    } catch (error) {
      console.error('Error calculating completion rate:', error);
      return 0;
    }
  }

  // ============================================
  // CERTIFICATS
  // ============================================

  async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      const { data, error } = await supabase
        .from('training_certificates')
        .select('*')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  }

  async getUserCertificate(userId: string, moduleId: string): Promise<Certificate | null> {
    try {
      const { data, error } = await supabase
        .from('training_certificates')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      throw error;
    }
  }

  async getCertificateByNumber(certificateNumber: string): Promise<Certificate | null> {
    try {
      const { data, error } = await supabase
        .from('training_certificates')
        .select('*')
        .eq('certificate_number', certificateNumber)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching certificate by number:', error);
      throw error;
    }
  }

  // ============================================
  // BADGES
  // ============================================

  async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('training_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching badges:', error);
      throw error;
    }
  }

  async getUserBadgesForModule(userId: string, moduleId: string): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('training_badges')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching badges for module:', error);
      throw error;
    }
  }

  // ============================================
  // STATISTIQUES
  // ============================================

  async getUserStats(userId: string) {
    try {
      const [modules, progress, certificates, badges] = await Promise.all([
        this.getModules(),
        this.getUserProgress(userId),
        this.getUserCertificates(userId),
        this.getUserBadges(userId),
      ]);

      const completedVideos = progress.filter(p => p.completed).length;
      const totalWatchTime = progress.reduce((sum, p) => sum + p.watch_time_seconds, 0);

      return {
        totalModules: modules.length,
        completedModules: certificates.length,
        completedVideos,
        totalWatchTimeMinutes: Math.round(totalWatchTime / 60),
        certificates: certificates.length,
        badges: {
          bronze: badges.filter(b => b.badge_type === 'bronze').length,
          silver: badges.filter(b => b.badge_type === 'silver').length,
          gold: badges.filter(b => b.badge_type === 'gold').length,
          expert: badges.filter(b => b.badge_type === 'expert').length,
        },
        overallProgress: modules.length > 0
          ? Math.round((certificates.length / modules.length) * 100)
          : 0,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
}

export const trainingService = new TrainingService();
