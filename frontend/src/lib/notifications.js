class NotificationManager {
  constructor() {
    this.isSupported = this.checkSupport();
    this.permission = this.isSupported ? Notification.permission : 'denied';
    this.isMobile = this.detectMobile();
    this.fallbackQueue = [];
    console.log('NotificationManager initialized:', { 
      permission: this.permission, 
      isSupported: this.isSupported,
      isMobile: this.isMobile 
    });
  }

  checkSupport() {
    if (typeof window === 'undefined') return false;
    
    // Check for Notification API support
    if (!('Notification' in window)) return false;
    
    // Check for ServiceWorker support (needed for mobile)
    if (!('serviceWorker' in navigator)) {
      console.warn('ServiceWorker not supported - notifications may not work on mobile');
    }
    
    return true;
  }

  detectMobile() {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check for mobile devices
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
  }

  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Browser notifications are not supported - using fallback methods');
      this.setupFallbacks();
      return false;
    }

    if (this.permission === 'granted') {
      console.log('Notification permission already granted');
      await this.setupServiceWorker();
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission denied - using fallback methods');
      this.setupFallbacks();
      return false;
    }

    try {
      console.log('Requesting notification permission...');
      
      // For mobile devices, we need to request permission in response to user interaction
      if (this.isMobile) {
        await this.requestMobilePermission();
      } else {
        const permission = await Notification.requestPermission();
        this.permission = permission;
      }
      
      console.log('Permission result:', this.permission);
      
      if (this.permission === 'granted') {
        await this.setupServiceWorker();
        return true;
      } else {
        this.setupFallbacks();
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      this.setupFallbacks();
      return false;
    }
  }

  async requestMobilePermission() {
    // Mobile browsers often require permission to be requested differently
    try {
      if (typeof Notification.requestPermission === 'function') {
        const permission = await Notification.requestPermission();
        this.permission = permission;
      } else {
        // Fallback for older mobile browsers
        const permission = Notification.requestPermission((result) => {
          this.permission = result;
        });
        if (permission) this.permission = permission;
      }
    } catch (error) {
      console.error('Mobile permission request failed:', error);
      this.permission = 'denied';
    }
  }

  async setupServiceWorker() {
    if ('serviceWorker' in navigator && this.isMobile) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registered:', registration);
      } catch (error) {
        console.warn('ServiceWorker registration failed:', error);
      }
    }
  }

  setupFallbacks() {
    // Setup visual and audio fallbacks for when notifications aren't available
    this.createFallbackContainer();
  }

  createFallbackContainer() {
    if (document.getElementById('notification-fallback')) return;
    
    const container = document.createElement('div');
    container.id = 'notification-fallback';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  async showNotification(title, options = {}) {
    console.log('Showing notification:', title, options);

    const defaultOptions = {
      icon: '/avatar.png',
      badge: '/avatar.png',
      requireInteraction: false,
      silent: false,
      ...options
    };

    // Try native notifications first
    if (this.isSupported && this.permission === 'granted') {
      try {
        let notification;
        
        // Use ServiceWorker for mobile devices when available
        if (this.isMobile && 'serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration.showNotification) {
            await registration.showNotification(title, defaultOptions);
            return { close: () => {} }; // Mock notification object
          }
        }
        
        // Fallback to regular Notification API
        notification = new Notification(title, defaultOptions);
        
        // Auto-close after 5 seconds (except for mobile)
        if (!this.isMobile || !defaultOptions.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

        return notification;
      } catch (error) {
        console.error('Error showing native notification:', error);
        // Fall through to fallback methods
      }
    }

    // Use fallback methods
    return this.showFallbackNotification(title, defaultOptions);
  }

  showFallbackNotification(title, options) {
    console.log('Using fallback notification method');
    
    // Play sound
    this.playNotificationSound();
    
    // Show visual notification
    this.showVisualFallback(title, options);
    
    // For mobile, try to use vibration
    if (this.isMobile && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    return { close: () => {} }; // Mock notification object
  }

  showVisualFallback(title, options) {
    const container = document.getElementById('notification-fallback');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      background: #333;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 300px;
      pointer-events: auto;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
      ${options.body ? `<div style="font-size: 14px; opacity: 0.9;">${options.body}</div>` : ''}
    `;
    
    // Add CSS animation
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
    
    // Remove on click
    notification.addEventListener('click', () => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
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
      // Try multiple audio methods for better browser compatibility
      
      // Method 1: Try HTML5 Audio with a notification sound file
      if (typeof Audio !== 'undefined') {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7bllHgg2jdXzzn0vBSF1xe/eizELElyx5+2qWBUIQ5zd8sFuIAUuhM/z2Ik2CBxqvfDknE4MDlOq5e24ZR4INozU8tGAMQUfcsXu34syDBFYrObtq1kUCECY2+/AciEELIHO8tiJOQgZaLvt559NEAxPqOPwtmMcBjiS2fPNeSsFJHfH8N2QQAoUXrTp66hVFAlFnt/yvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7bllHgg2jdXzzn0vBSJ0xe/eizELElyx5+2qWRQIQpzd8sFuIAUug8/z2Yk2CBxqvfDknE4MDlOq5e24ZR4INozU8tGAMQUfccXu34syDBFYrObtq1kUCECY2+/AciEELIHO8tiJOQgZaLvt559NEAxPqOPwtmMcBjiS2fPNeSsFJHfH8N2QQAoUXrTp66hVFAlFnt/yvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7bllHgg2jdXzzn0vBSJ0xe/eizELElyx5+2qWRQIQpzd8sFuIAUug8/z2Yk2CBxqvfDknE4MDlOq5e24ZR4INozU8tGAMQUfccXu34syDBFYrObtq1kUCECY2+/AciEELIHO8tiJOQgZaLvt559NEAxPqOPwtmMcBjiS2fPNeSsFJHfH8N2QQAoUXrTp66hVFAlFnt/yvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7bllHgg2jdXzzn0vBSJ0xe/eizELElyx5+2qWRQIQpzd8sFuIAUug8/z2Yk2CBxqvfDknE4MDlOq5e24ZR4INozU8tGAMQUfccXu34syDBFYrObtq1kUCECY2+/AciEELIHO8tiJOQgZaLvt559NEAxPqOPwtmMcBjiS2fPNeSsFJHfH8N2QQAoUXrTp66hVFAlFnt/yvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7bllHgg2jdXzzn0vBSJ0xe/eizELElyx5+2qWRQIQpzd8sFuIAUug8/z2Yk2CBxqvfDknE4MDlOq5e24ZR4INozU8tGAMQUfccXu34syDBFYrObtq1kUCECY2+/AciEE');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Fallback to Web Audio API if audio file fails
            this.playWebAudioSound();
          });
          return;
        } catch {
          // Continue to next method
        }
      }
      
      // Method 2: Web Audio API fallback
      this.playWebAudioSound();
      
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }
  
  playWebAudioSound() {
    try {
      // Check if Web Audio API is available
      if (typeof window === 'undefined' || (!window.AudioContext && !window.webkitAudioContext)) {
        console.warn('Web Audio API not supported');
        return;
      }

      // Create audio context with user gesture handling for mobile
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      
      // Resume context if suspended (required for mobile browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create a simple notification sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Web Audio API sound failed:', error);
    }
  }
}

export const notificationManager = new NotificationManager();
