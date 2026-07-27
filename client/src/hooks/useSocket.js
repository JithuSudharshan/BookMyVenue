import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from './useAuth';
import { getAdminToken, getSavedAdmin } from '../services/httpService';

// Extract token from cookies string (if stored there) or localStorage. 
// Assuming the app stores it in a way we can access, or we might need to rely on httpOnly cookies 
// and pass auth via headers. Since Socket.IO requires token in handshake.auth, we need it.
const getAccessToken = () => {
  const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
  if (match) return match[2];
  return localStorage.getItem('accessToken') || null;
};

export const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications();
      if (res.success) {
        // Only keep unread notifications in the dropdown based on user preference
        const unreadOnly = (res.data.notifications || []).filter(n => !n.isRead);
        setNotifications(unreadOnly);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notification history:', err);
    }
  }, []);

  useEffect(() => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    
    // If neither a regular user nor an admin user is logged in for their respective routes, disconnect.
    const adminUser = getSavedAdmin();
    const activeUser = isAdminRoute ? adminUser : user;

    if (!activeUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = isAdminRoute ? getAdminToken() : getAccessToken();
    const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification socket');
      // Always fetch history on fresh connect/reconnect to prevent missed messages
      fetchHistory();
    });

    newSocket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast
      toast(notification.title, {
        description: notification.message,
        duration: 4000,
      });
    });

    newSocket.on('notification_read', ({ notificationId }) => {
      // Remove the notification from the modal entirely when marked as read
      setNotifications(prev => {
        const exists = prev.find(n => n._id === notificationId);
        if (exists) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n._id !== notificationId);
      });
    });

    newSocket.on('all_notifications_read', () => {
      setNotifications([]); // Clear all from modal
      setUnreadCount(0);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, fetchHistory]);

  const markAsRead = async (id) => {
    try {
      // Optimistically remove it to feel instant
      setNotifications(prev => {
        const exists = prev.find(n => n._id === id);
        if (exists) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n._id !== id);
      });
      await notificationApi.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark as read', err);
      // Re-fetch history if it fails to restore the UI state
      fetchHistory();
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchHistory
  };
};
