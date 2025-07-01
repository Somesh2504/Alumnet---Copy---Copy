import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import socket from '../socket';
import './Call.css';  // Import the CSS

const Call = ({ user, receiverId }) => {
  const [peerId, setPeerId] = useState('');
  const myAudio = useRef();
  const userAudio = useRef();
  const peerInstance = useRef(null);

  useEffect(() => {
    if (!user || !user._id) return; // Don't initialize if user is not loaded yet
    
    const peer = new Peer(undefined, { debug: 2 });
    peerInstance.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      socket.emit('register-peer', { userId: user._id, peerId: id });
    });

    peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          myAudio.current.srcObject = stream;
          call.answer(stream);

          call.on('stream', (remoteStream) => {
            userAudio.current.srcObject = remoteStream;
          });
        })
        .catch(err => {
          console.error("Failed to get local audio stream", err);
          alert("Microphone access is required for voice call");
        });
    });

    return () => peer.destroy();
  }, [user?._id]);

  useEffect(() => {
    if (peerId && receiverId) {
      socket.emit('request-peer-id', { receiverId });

      socket.on('receive-peer-id', ({ peerId: targetPeerId }) => {
        if (!targetPeerId) {
          alert('User not available for call');
          return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            myAudio.current.srcObject = stream;
            const call = peerInstance.current.call(targetPeerId, stream);

            call.on('stream', (remoteStream) => {
              userAudio.current.srcObject = remoteStream;
            });
          })
          .catch(err => {
            console.error("Failed to get local audio stream", err);
            alert("Microphone access is required for voice call");
          });
      });
    }

    return () => {
      socket.off('receive-peer-id');
    };
  }, [peerId, receiverId]);

  return (
    <div className="call-container">
      <div className="call-party">
        <p><strong>You</strong></p>
        <audio ref={myAudio} autoPlay muted controls className="audio-player" />
      </div>
      <div className="call-party">
        <p><strong>Caller</strong></p>
        <audio ref={userAudio} autoPlay controls className="audio-player" />
      </div>
    </div>
  );
};

export default Call;
