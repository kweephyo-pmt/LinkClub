// WebRTC Manager for handling video and audio calls

class WebRTCManager {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.socket = null;
    this.isInitiator = false;
    this.callType = 'video'; // 'video' or 'audio'
    this.targetUserId = null;
    
    // ICE servers for NAT traversal
    this.iceServers = {
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
          ]
        }
      ]
    };

    // Event handlers
    this.onRemoteStream = null;
    this.onCallReceived = null;
    this.onCallAccepted = null;
    this.onCallRejected = null;
    this.onCallEnded = null;
    this.onError = null;
  }

  // Initialize with socket connection
  init(socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    if (!this.socket) return;

    // Listen for incoming call offers
    this.socket.on('call-offer', async (data) => {
      console.log('Received call offer:', data);
      if (this.onCallReceived) {
        this.onCallReceived({
          ...data,
          callType: data.callType,
          fromUserId: data.fromUserId || data.targetUserId
        });
      }
    });

    // Listen for call answers
    this.socket.on('call-answer', async (data) => {
      console.log('WebRTC: ===== RECEIVED CALL ANSWER =====');
      console.log('WebRTC: Answer data:', data);
      try {
        if (this.peerConnection && this.peerConnection.signalingState !== 'closed') {
          console.log('WebRTC: Current signaling state:', this.peerConnection.signalingState);
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log('WebRTC: Remote description set successfully from answer');
          console.log('WebRTC: Connection state:', this.peerConnection.connectionState);
        } else {
          console.error('WebRTC: No peer connection or connection closed');
        }
        if (this.onCallAccepted) {
          this.onCallAccepted();
        }
      } catch (error) {
        console.error('WebRTC: Error setting remote description from answer:', error);
      }
    });


    // Listen for ICE candidates
    this.socket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate:', data);
      if (this.peerConnection && data.candidate) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('ICE candidate added successfully');
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    // Listen for call rejections
    this.socket.on('call-rejected', (data) => {
      console.log('Call rejected:', data);
      this.cleanup();
      if (this.onCallRejected) {
        this.onCallRejected();
      }
    });

    // Listen for call ended
    this.socket.on('call-ended', (data) => {
      console.log('Call ended:', data);
      this.cleanup();
      if (this.onCallEnded) {
        this.onCallEnded();
      }
    });
  }

  async startCall(targetUserId, callType = 'video') {
    try {
      console.log('WebRTC: Starting call to', targetUserId, 'type:', callType);
      this.callType = callType;
      this.isInitiator = true;
      this.targetUserId = targetUserId;
      
      // Get user media FIRST
      console.log('WebRTC: Getting user media for caller...');
      await this.getUserMedia(callType);
      
      // Create peer connection AFTER getting media
      console.log('WebRTC: Creating peer connection...');
      this.createPeerConnection();
      
      // Add local stream tracks to peer connection IMMEDIATELY
      if (this.localStream) {
        console.log('WebRTC: Adding caller tracks to peer connection:');
        this.localStream.getTracks().forEach(track => {
          console.log('WebRTC: - Adding track:', track.kind, 'enabled:', track.enabled, 'state:', track.readyState);
          const sender = this.peerConnection.addTrack(track, this.localStream);
          console.log('WebRTC: - Track sender:', sender);
        });
        console.log('WebRTC: Total senders:', this.peerConnection.getSenders().length);
      } else {
        console.error('WebRTC: No local stream available for caller!');
        throw new Error('Failed to get local media');
      }
      
      console.log('WebRTC: Creating offer with media constraints...');
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video'
      });
      
      console.log('WebRTC: Offer SDP:', offer.sdp.substring(0, 200) + '...');
      await this.peerConnection.setLocalDescription(offer);
      console.log('WebRTC: Local description set successfully');
      
      console.log('WebRTC: Sending call offer via socket');
      this.socket.emit('call-offer', {
        targetUserId,
        offer,
        callType
      });
      
      return true;
    } catch (error) {
      console.error('WebRTC: Error starting call:', error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }

  async acceptCall(callData) {
    try {
      this.callType = callData.type || callData.callType;
      this.isInitiator = false;
      this.targetUserId = callData.fromUserId;
      
      console.log('WebRTC: Accepting call with type:', this.callType);
      console.log('WebRTC: Offer SDP preview:', callData.offer.sdp.substring(0, 200) + '...');
      
      // Get recipient's media FIRST
      console.log('WebRTC: Getting recipient media...');
      await this.getUserMedia(this.callType);
      
      // Create peer connection AFTER getting media
      console.log('WebRTC: Creating peer connection for recipient...');
      this.createPeerConnection();
      
      // Add recipient's local tracks BEFORE setting remote description
      if (this.localStream) {
        console.log('WebRTC: Adding recipient tracks to peer connection:');
        this.localStream.getTracks().forEach(track => {
          console.log('WebRTC: - Adding track:', track.kind, 'enabled:', track.enabled, 'state:', track.readyState);
          const sender = this.peerConnection.addTrack(track, this.localStream);
          console.log('WebRTC: - Track sender:', sender);
        });
        console.log('WebRTC: Total senders:', this.peerConnection.getSenders().length);
      } else {
        console.error('WebRTC: No local stream available for recipient!');
      }
      
      // Set remote description from caller's offer
      console.log('WebRTC: Setting remote description from caller offer');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(callData.offer));
      console.log('WebRTC: Remote description set successfully');
      
      // Create answer
      console.log('WebRTC: Creating answer...');
      const answer = await this.peerConnection.createAnswer();
      console.log('WebRTC: Answer SDP:', answer.sdp.substring(0, 200) + '...');
      await this.peerConnection.setLocalDescription(answer);
      console.log('WebRTC: Answer set as local description');
      
      // Send answer through signaling server
      console.log('WebRTC: Sending answer to caller');
      this.socket.emit('call-answer', {
        targetUserId: callData.fromUserId,
        answer
      });
      
      return true;
    } catch (error) {
      console.error('WebRTC: Error accepting call:', error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }

  rejectCall(callData) {
    this.socket.emit('call-rejected', {
      targetUserId: callData.fromUserId
    });
    this.cleanup();
  }

  endCall(targetUserId) {
    this.socket.emit('call-ended', {
      targetUserId
    });
    this.cleanup();
  }

  async getUserMedia(callType) {
    try {
      console.log('WebRTC: getUserMedia called with callType:', callType);
      
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: callType === 'video' ? {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 }
        } : false
      };
      
      console.log('WebRTC: Requesting media with constraints:', constraints);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('WebRTC: ===== GOT USER MEDIA SUCCESSFULLY =====');
      console.log('WebRTC: Local stream ID:', this.localStream.id);
      console.log('WebRTC: Local stream tracks:', this.localStream.getTracks().map(t => `${t.kind}: enabled=${t.enabled}, state=${t.readyState}`));
      
      // Test that tracks are actually working
      this.localStream.getTracks().forEach(track => {
        console.log(`WebRTC: Track ${track.kind} - enabled: ${track.enabled}, muted: ${track.muted}, readyState: ${track.readyState}`);
      });
      
      return this.localStream;
    } catch (error) {
      console.error('WebRTC: Error getting user media:', error);
      
      // Fallback to audio only if video fails
      if (callType === 'video') {
        console.log('WebRTC: Falling back to audio only');
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          console.log('WebRTC: Fallback to audio successful');
          return this.localStream;
        } catch (audioError) {
          console.error('WebRTC: Audio fallback also failed:', audioError);
        }
      }
      
      throw error;
    }
  }

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.iceServers);
    
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('WebRTC: Sending ICE candidate');
        this.socket.emit('ice-candidate', {
          targetUserId: this.targetUserId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('WebRTC: Connection state:', this.peerConnection.connectionState);
      if (this.peerConnection.connectionState === 'failed') {
        this.cleanup();
        if (this.onError) {
          this.onError(new Error('Connection failed'));
        }
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('WebRTC: ICE connection state:', this.peerConnection.iceConnectionState);
    };

    // Handle remote stream - CRITICAL FIX for call recipient
    this.peerConnection.ontrack = (event) => {
      console.log('WebRTC: ===== RECEIVED REMOTE TRACK =====');
      console.log('WebRTC: Track kind:', event.track.kind);
      console.log('WebRTC: Track enabled:', event.track.enabled);
      console.log('WebRTC: Track readyState:', event.track.readyState);
      console.log('WebRTC: Event streams:', event.streams);
      console.log('WebRTC: onRemoteStream callback exists:', !!this.onRemoteStream);
      
      if (event.streams && event.streams.length > 0) {
        const stream = event.streams[0];
        console.log('WebRTC: Remote stream ID:', stream.id);
        console.log('WebRTC: Remote stream tracks:', stream.getTracks().map(t => `${t.kind}: enabled=${t.enabled}, state=${t.readyState}`));
        
        // Store the remote stream
        this.remoteStream = stream;
        
        // Force immediate callback execution
        setTimeout(() => {
          if (this.onRemoteStream) {
            console.log('WebRTC: ===== CALLING onRemoteStream CALLBACK =====');
            this.onRemoteStream(this.remoteStream);
          } else {
            console.error('WebRTC: onRemoteStream callback not set!');
          }
        }, 100);
        
      } else {
        console.warn('WebRTC: No streams in track event - constructing manually');
        
        // Handle individual tracks without streams (fallback)
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
          console.log('WebRTC: Created new MediaStream for remote');
        }
        
        this.remoteStream.addTrack(event.track);
        console.log('WebRTC: Added track to remote stream, total tracks:', this.remoteStream.getTracks().length);
        
        // Force callback after adding track
        setTimeout(() => {
          if (this.onRemoteStream) {
            console.log('WebRTC: Calling onRemoteStream with constructed stream');
            this.onRemoteStream(this.remoteStream);
          }
        }, 100);
      }
    };
  }

  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled;
      }
    }
    return false;
  }

  toggleCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled;
      }
    }
    return false;
  }

  cleanup() {
    console.log('WebRTC: Cleaning up...');
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.isInitiator = false;
    this.targetUserId = null;
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  isInCall() {
    return this.peerConnection && this.peerConnection.connectionState === 'connected';
  }
}

export const webrtcManager = new WebRTCManager();
