import { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js/react-native';

export const useMatchingWebSocket = (sessionId, onEvents = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!sessionId) return;

    let pusher = null;
    let channel = null;

    const initializeWebSocket = async () => {
      try {
        Pusher.logToConsole = __DEV__;

        pusher = new Pusher('fcb8b1c83278ac43036d', {
          cluster: 'sa1',
        });

        pusherRef.current = pusher;

        channel = pusher.subscribe(`matching-session-${sessionId}`);
        channelRef.current = channel;

        pusher.connection.bind('state_change', (states) => {
          console.log('Matching WebSocket state change:', states);
          setIsConnected(states.current === 'connected');
        });

        pusher.connection.bind('connected', () => {
          console.log('Matching WebSocket connected, socket id:', pusher.connection.socket_id);
          setIsConnected(true);
        });

        pusher.connection.bind('disconnected', () => {
          console.log('Matching WebSocket disconnected');
          setIsConnected(false);
        });

        pusher.connection.bind('error', (err) => {
          console.log('Matching WebSocket error:', err);
          setIsConnected(false);
        });

        const events = {
          'participant-joined': onEvents.onParticipantJoined,
          'participant-ready': onEvents.onParticipantReady,
          'matching-started': onEvents.onMatchingStarted,
          'votes-submitted': onEvents.onVotesSubmitted,
          'matching-complete': onEvents.onMatchingComplete,
          'session-ended': onEvents.onSessionEnded,
          'session-cleanup': onEvents.onSessionCleanup,
        };

        Object.entries(events).forEach(([eventName, handler]) => {
          if (handler) {
            channel.bind(eventName, (payload) => {
              if (!mountedRef.current) return;
              
              console.log(`Matching WebSocket event ${eventName}:`, payload);
              
              if (eventName === 'session-ended' || eventName === 'session-cleanup') {
                setTimeout(() => {
                  if (mountedRef.current) {
                    cleanup();
                  }
                }, 1000);
              }
              
              handler(payload);
            });
          }
        });

      } catch (error) {
        console.error('Failed to initialize matching WebSocket:', error);
      }
    };

    initializeWebSocket();

    const cleanup = () => {
      mountedRef.current = false;
      
      if (channel) {
        console.log(`Unsubscribing from matching-session-${sessionId}`);
        channel.unbind_all && channel.unbind_all();
      }
      
      if (pusher) {
        pusher.unsubscribe(`matching-session-${sessionId}`);
        pusher.disconnect();
      }
      
      setIsConnected(false);
    };

    return cleanup;
  }, [sessionId]);

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    isConnected,
    disconnect: () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    }
  };
};

export default useMatchingWebSocket;