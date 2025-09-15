import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import axios from 'axios';
import socket from '../socket';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { IoCall } from 'react-icons/io5';
import './VideoCall.css';

// Simple ringtone using WebAudio API (looping tone pairs)
const createRingtone = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.05;
  gainNode.connect(audioContext.destination);

  let isStopped = false;

  const playBurst = (durationMs) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    oscillator.connect(gainNode);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      oscillator.disconnect();
    }, durationMs);
  };

  const loop = () => {
    if (isStopped) return;
    // Two short bursts to mimic phone ring
    playBurst(400);
    setTimeout(() => {
      if (isStopped) return;
      playBurst(400);
    }, 600);
    setTimeout(loop, 2000);
  };

  loop();

  return {
    stop: () => {
      isStopped = true;
      try { audioContext.close(); } catch (err) { void err; }
    }
  };
};

const VideoCall = ({ user, receiverId }) => {
  const { baseURL } = useAppContext();
  const navigate = useNavigate();
  const [peerId, setPeerId] = useState('');
  const [callState, setCallState] = useState('ringing'); // ringing | connected | ended
  const [receiverInfo, setReceiverInfo] = useState(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const activeCallRef = useRef(null);
  const peerInstance = useRef(null);
  const ringtoneRef = useRef(null);

  // Fetch receiver details for UI
  useEffect(() => {
    const fetchReceiverInfo = async () => {
      if (!receiverId) return;
      try {
        const { data } = await axios.get(`${baseURL}api/user/${receiverId}`, { withCredentials: true });
        if (data?.user) {
          setReceiverInfo({ name: data.user.name, profilePic: data.user.profilePic });
        } else {
          setReceiverInfo({ name: 'Unknown User', profilePic: null });
        }
      } catch (err) {
        void err;
        setReceiverInfo({ name: 'Unknown User', profilePic: null });
      }
    };
    fetchReceiverInfo();
  }, [receiverId, baseURL]);

  // Initialize peer and start ringtone
  useEffect(() => {
    if (!user || !user._id) return;
    const peer = new Peer(undefined, { debug: 2 });
    peerInstance.current = peer;

    // Start ringtone while setting up
    ringtoneRef.current = createRingtone();

    peer.on('open', (id) => {
      setPeerId(id);
      socket.emit('register-peer', { userId: user._id, peerId: id });
    });

    peer.on('call', (call) => {
      activeCallRef.current = call;
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          call.answer(stream);

          call.on('stream', (remoteStream) => {
            if (ringtoneRef.current) {
              ringtoneRef.current.stop();
              ringtoneRef.current = null;
            }
            setCallState('connected');
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });

          call.on('close', handleEndCall);
          call.on('error', handleEndCall);
        })
        .catch((err) => {
          console.error('Failed to get local media stream', err);
          alert('Camera and microphone access is required for video call');
          handleEndCall();
        });
    });

    return () => {
      try { peer.destroy(); } catch (err) { void err; }
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
      cleanupMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Outgoing call flow
  useEffect(() => {
    if (!peerId || !receiverId) return;

    socket.emit('request-peer-id', { receiverId });

    const handleReceivePeerId = ({ peerId: targetPeerId }) => {
      if (!targetPeerId) {
        alert('User not available for video call');
        handleEndCall();
        return;
      }

      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          const call = peerInstance.current.call(targetPeerId, stream);
          activeCallRef.current = call;

          call.on('stream', (remoteStream) => {
            if (ringtoneRef.current) {
              ringtoneRef.current.stop();
              ringtoneRef.current = null;
            }
            setCallState('connected');
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });

          call.on('close', handleEndCall);
          call.on('error', handleEndCall);
        })
        .catch((err) => {
          console.error('Failed to get local media stream', err);
          alert('Camera and microphone access is required for video call');
          handleEndCall();
        });
    };

    socket.on('receive-peer-id', handleReceivePeerId);
    return () => {
      socket.off('receive-peer-id', handleReceivePeerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerId, receiverId]);

  const cleanupMedia = () => {
    try {
      if (activeCallRef.current) {
        try { activeCallRef.current.close(); } catch (err) { void err; }
        activeCallRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => {
          try { t.stop(); } catch (err) { void err; }
        });
        localStreamRef.current = null;
      }
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const local = localVideoRef.current.srcObject;
        if (local && local.getTracks) {
          local.getTracks().forEach((t) => { try { t.stop(); } catch (err) { void err; } });
        }
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        const remote = remoteVideoRef.current.srcObject;
        if (remote && remote.getTracks) {
          remote.getTracks().forEach((t) => { try { t.stop(); } catch (err) { void err; } });
        }
        remoteVideoRef.current.srcObject = null;
      }
    } catch (err) { void err; }
  };

  const handleEndCall = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
      ringtoneRef.current = null;
    }
    cleanupMedia();
    setCallState('ended');
    setTimeout(() => {
      navigate(-1);
    }, 50);
  };

  const statusText = callState === 'ringing' ? 'Ringing…' : callState === 'connected' ? 'Connected' : 'Call ended';

  return (
    <div className={`video-call-page ${callState}`}>
      <div className="video-call-container">
        {/* Remote video (main view) */}
        <div className="remote-video-container">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="remote-video"
            style={{ display: callState === 'connected' ? 'block' : 'none' }}
          />
          
          {/* Overlay when not connected */}
          {callState !== 'connected' && (
            <div className="video-overlay">
              <div className={`avatar ${callState === 'ringing' ? 'ringing' : ''}`}> 
                {receiverInfo?.profilePic ? (
                  <img src={receiverInfo.profilePic} alt={receiverInfo?.name || 'User'} />
                ) : (
                  <div className="avatar-fallback">{(receiverInfo?.name || 'U').charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="callee-info">
                <div className="callee-name">{receiverInfo?.name || 'Calling…'}</div>
                <div className={`call-status ${callState}`}>{statusText}</div>
              </div>
            </div>
          )}
        </div>

        {/* Local video (small preview) */}
        <div className="local-video-container">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="local-video"
            style={{ display: callState === 'connected' ? 'block' : 'none' }}
          />
        </div>

        {/* Call controls */}
        <div className="video-call-controls">
          <button className="end-call-btn" onClick={handleEndCall} aria-label="End call">
            <IoCall className="cut-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
