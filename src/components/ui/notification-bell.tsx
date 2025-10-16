import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { NotificationItem } from './notification-item';
import {
  Bell,
  BellRing,
  X,
  Settings,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { createPortal } from 'react-dom';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead, clearAllNotifications, loading } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateButtonPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateButtonPosition();
      
      // Ajouter un listener pour les redimensionnements et défilements
      window.addEventListener('resize', updateButtonPosition);
      window.addEventListener('scroll', updateButtonPosition);
      
      return () => {
        window.removeEventListener('resize', updateButtonPosition);
        window.removeEventListener('scroll', updateButtonPosition);
      };
    }
  }, [isOpen, updateButtonPosition]);

  if (!user) return null;

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const recentNotifications = notifications.slice(0, 10);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setIsOpen(false);
  };

  const notificationContent = isOpen && (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-black/20"
        onClick={() => setIsOpen(false)}
      />

      {/* Notification Panel */}
      <div
        className="fixed"
        style={{
          top: buttonPosition.top + 48, // 48px = button height + spacing
          right: Math.max(16, window.innerWidth - (buttonPosition.left + buttonPosition.width + 16)), // 16px = right margin
          width: 'min(calc(100vw - 2rem), 24rem)', // 24rem = 384px
          maxWidth: '24rem',
          zIndex: '[10000]'
        }}
      >
        <Card className="shadow-2xl border border-gray-200">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                    title="Marquer toutes comme lues"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={loading}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                    title="Effacer toutes les notifications"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                  title="Fermer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">Aucune notification</h4>
                  <p className="text-sm text-gray-500">
                    Vous serez notifié des mises à jour importantes.
                  </p>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={() => setIsOpen(false)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a href="/user/notifications">
                    <Settings className="h-4 w-4 mr-2" />
                    Voir toutes les notifications
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100"
        ref={buttonRef}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-gray-700" />
        ) : (
          <Bell className="h-5 w-5 text-gray-700" />
        )}
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Utiliser un portail pour rendre le contenu au niveau du body */}
      {typeof window !== 'undefined' && notificationContent && createPortal(
        notificationContent,
        document.body
      )}
    </div>
  );
};
