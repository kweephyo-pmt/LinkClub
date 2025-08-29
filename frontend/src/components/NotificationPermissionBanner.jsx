import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { notificationManager } from '../lib/notifications';

const NotificationPermissionBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if we should show the permission banner
    const checkPermissionStatus = () => {
      if (!notificationManager.isSupported) return;
      
      const permission = Notification.permission;
      const hasAskedBefore = localStorage.getItem('notification-permission-asked');
      
      // Show banner if permission is default (not asked) or if user hasn't been asked recently
      if (permission === 'default' && !hasAskedBefore) {
        setShowBanner(true);
      }
    };

    // Delay check to ensure DOM is ready
    setTimeout(checkPermissionStatus, 1000);
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const granted = await notificationManager.requestPermission();
      
      if (granted) {
        setShowBanner(false);
        // Show success message briefly
        setTimeout(() => {
          notificationManager.showNotification('Notifications enabled!', {
            body: 'You\'ll now receive notifications for new messages and friend requests.',
            icon: '/avatar.png'
          });
        }, 500);
      }
      
      // Mark that we've asked for permission
      localStorage.setItem('notification-permission-asked', Date.now().toString());
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember that user dismissed the banner
    localStorage.setItem('notification-permission-asked', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-content shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell size={20} />
            <div>
              <p className="font-medium text-sm">
                Enable notifications to stay connected
              </p>
              <p className="text-xs opacity-90">
                Get notified about new messages and friend requests
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="btn btn-sm bg-primary-content text-primary hover:bg-primary-content/90 border-0"
            >
              {isRequesting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  <Check size={16} />
                  Enable
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              className="btn btn-sm btn-ghost text-primary-content hover:bg-primary-content/10"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
