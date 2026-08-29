'use client';

// ==============================================================================
// Eggstra - Inactivity Session Timeout Hook (Auto-Logout on 20 Minutes Idle)
// ==============================================================================

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/components/common/ToastContext';

const DEFAULT_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes = 1,200,000 ms

export const useIdleTimer = (timeoutMs: number = DEFAULT_TIMEOUT_MS) => {
  const { isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoutDueToInactivity = useCallback(async () => {
    if (!isAuthenticated) return;

    await logout();
    showToast(
      'Session Expired',
      'You have been automatically logged out due to 20 minutes of inactivity.',
      'warning',
      6000
    );
  }, [isAuthenticated, logout, showToast]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isAuthenticated) {
      timerRef.current = setTimeout(() => {
        handleLogoutDueToInactivity();
      }, timeoutMs);
    }
  }, [isAuthenticated, timeoutMs, handleLogoutDueToInactivity]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    // Interactive event listeners
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    // Throttle event listener calls
    let lastActivityTime = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle resets to at most once every 5 seconds to minimize timer allocations
      if (now - lastActivityTime > 5000) {
        lastActivityTime = now;
        resetTimer();
      }
    };

    resetTimer();

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
    };
  }, [isAuthenticated, resetTimer]);
};
