class NotificationManager {
  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    console.log('NotificationManager initialized:', { permission: this.permission, isSupported: this.isSupported });
  }

  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Browser notifications are not supported');
      return false;
    }

    if (this.permission === 'granted') {
      console.log('Notification permission already granted');
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      this.permission = permission;
      console.log('Permission result:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.log('Notification not supported or permission not granted:', this.isSupported, this.permission);
      return null;
    }

    console.log('Showing notification:', title, options);

    const defaultOptions = {
      icon: '/avatar.png',
      badge: '/avatar.png',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  showMessageNotification(senderName, messageText, senderAvatar) {
    return this.showNotification(`New message from ${senderName}`, {
      body: messageText || 'Sent an image',
      icon: senderAvatar || '/avatar.png',
      tag: `message-${senderName}`, // Replace previous notifications from same sender
      data: {
        type: 'message',
        sender: senderName
      }
    });
  }

  showFriendRequestNotification(senderName, senderAvatar) {
    return this.showNotification(`Friend request from ${senderName}`, {
      body: `${senderName} wants to be your friend`,
      icon: senderAvatar || '/avatar.png',
      tag: 'friend-request',
      requireInteraction: true, // Keep visible until user interacts
      data: {
        type: 'friend-request',
        sender: senderName
      }
    });
  }

  showFriendAcceptedNotification(friendName, friendAvatar) {
    return this.showNotification(`${friendName} accepted your friend request`, {
      body: `You are now friends with ${friendName}`,
      icon: friendAvatar || '/avatar.png',
      tag: 'friend-accepted',
      data: {
        type: 'friend-accepted',
        friend: friendName
      }
    });
  }

  playNotificationSound() {
    try {
      // Check if Web Audio API is available
      if (typeof window === 'undefined' || (!window.AudioContext && !window.webkitAudioContext)) {
        console.warn('Web Audio API not supported');
        return;
      }

      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }
}

export const notificationManager = new NotificationManager();
