'use client';

import { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    receiveFromApp?: (message: SuperAppMessage) => void;
  }
}

export type SuperAppMessageType =
  | 'NOTIFICATION'
  | 'LOGOUT'
  | 'NAVIGATE'
  | 'CLOSE'
  | 'REFRESH'
  | 'BRIDGE_READY';

export interface SuperAppMessage {
  type: SuperAppMessageType;
  payload?: Record<string, unknown>;
}

export interface BridgeMessage {
  type: 'USER_DATA' | 'THEME' | 'DEEP_LINK' | 'LOGOUT';
  payload?: Record<string, unknown>;
}

interface UseSuperAppBridgeOptions {
  onMessage?: (message: BridgeMessage) => void;
}

export function useSuperAppBridge(options: UseSuperAppBridgeOptions = {}) {
  const [isInWebView, setIsInWebView] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const sendToSuperApp = useCallback((message: SuperAppMessage) => {
    if (typeof window !== 'undefined' && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  }, []);

  const sendNotification = useCallback((title: string, message: string) => {
    sendToSuperApp({
      type: 'NOTIFICATION',
      payload: { title, message },
    });
  }, [sendToSuperApp]);

  const requestClose = useCallback(() => {
    sendToSuperApp({ type: 'CLOSE' });
  }, [sendToSuperApp]);

  const notifyLogout = useCallback(() => {
    sendToSuperApp({ type: 'LOGOUT' });
  }, [sendToSuperApp]);

  const navigateInSuperApp = useCallback((path: string) => {
    sendToSuperApp({
      type: 'NAVIGATE',
      payload: { path },
    });
  }, [sendToSuperApp]);

  const requestRefresh = useCallback(() => {
    sendToSuperApp({ type: 'REFRESH' });
  }, [sendToSuperApp]);

  useEffect(() => {
    const inWebView = typeof window !== 'undefined' && !!window.ReactNativeWebView;
    setIsInWebView(inWebView);

    if (inWebView) {
      // Register listener for messages from super app
      window.receiveFromApp = (message: BridgeMessage) => {
        options.onMessage?.(message);
      };

      // Notify super app that bridge is ready
      sendToSuperApp({ type: 'BRIDGE_READY' });
      setIsReady(true);

      return () => {
        delete window.receiveFromApp;
      };
    } else {
      setIsReady(true);
    }
  }, [options.onMessage, sendToSuperApp]);

  return {
    isInWebView,
    isReady,
    sendToSuperApp,
    sendNotification,
    requestClose,
    notifyLogout,
    navigateInSuperApp,
    requestRefresh,
  };
}
