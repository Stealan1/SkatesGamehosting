import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { VMLogEvent, Booking, VMStatus } from '../types';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: <T>(event: string, callback: (data: T) => void) => () => void;
  emit: (event: string, data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tokens, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!isAuthenticated || !tokens) {
      return;
    }

    const newSocket = io(WS_URL, {
      auth: {
        token: tokens.accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io client disconnect') {
        return;
      }

      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      reconnectAttemptsRef.current++;

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Attempting to reconnect (attempt ${reconnectAttemptsRef.current})...`);
        newSocket.connect();
      }, delay);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      if (error.message === 'Authentication error') {
        newSocket.disconnect();
      }
    });

    setSocket(newSocket);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      newSocket.disconnect();
    };
  }, [tokens, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && tokens) {
      const cleanup = connect();
      return cleanup;
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [isAuthenticated, tokens, connect, socket]);

  const subscribe = useCallback(
    <T,>(event: string, callback: (data: T) => void) => {
      if (!socket) {
        console.warn(`Cannot subscribe to ${event}: socket not connected`);
        return () => {};
      }

      socket.on(event, callback);

      return () => {
        socket.off(event, callback);
      };
    },
    [socket]
  );

  const emit = useCallback(
    (event: string, data: any) => {
      if (!socket || !isConnected) {
        console.warn(`Cannot emit ${event}: socket not connected`);
        return;
      }

      socket.emit(event, data);
    },
    [socket, isConnected]
  );

  const value: WebSocketContextType = {
    socket,
    isConnected,
    subscribe,
    emit,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const useBookingUpdates = (callback: (booking: Booking) => void) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribeStarted = subscribe<Booking>('booking:started', callback);
    const unsubscribeEnded = subscribe<Booking>('booking:ended', callback);
    const unsubscribeCancelled = subscribe<Booking>('booking:cancelled', callback);

    return () => {
      unsubscribeStarted();
      unsubscribeEnded();
      unsubscribeCancelled();
    };
  }, [subscribe, callback]);
};

export const useVMStatusUpdates = (callback: (vm: VMStatus) => void) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    return subscribe<VMStatus>('vm:status_changed', callback);
  }, [subscribe, callback]);
};

export const useVMLogs = (vmId: string, callback: (log: VMLogEvent) => void) => {
  const { subscribe, emit } = useWebSocket();

  useEffect(() => {
    emit('vm:subscribe_logs', { vmId });

    const unsubscribe = subscribe<VMLogEvent>('vm:log', (log) => {
      if (log.vmId === vmId) {
        callback(log);
      }
    });

    return () => {
      emit('vm:unsubscribe_logs', { vmId });
      unsubscribe();
    };
  }, [vmId, subscribe, emit, callback]);
};
