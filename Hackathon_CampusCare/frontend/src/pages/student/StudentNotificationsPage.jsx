import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Info, ShieldAlert, ArrowRight, RefreshCw, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationAsRead } from '../../services/complaintService';

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setErrorNotice(null);
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      setErrorNotice(err.response?.data?.message || 'Unable to retrieve notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      // Ignore or notify
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f1c34]">
            Dispatch Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding your service requests and campus maintenance notices from MySQL.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchNotifications}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
          <span className="text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded">
            {unreadCount} Unread
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-5 flex items-start gap-4 transition-colors ${notif.isRead ? 'bg-white' : 'bg-teal-50/20'}`}
            >
              <div className={`p-2 rounded-full shrink-0 ${notif.isRead ? 'bg-slate-100 text-slate-500' : 'bg-teal-100 text-teal-700'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#0f1c34]">Campus Maintenance Dispatch Notice</h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                {!notif.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 mt-2"
                  >
                    <Check className="w-3 h-3" />
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center space-y-3">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No Notifications in Queue</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Automated notifications generated during complaint dispatch and technician progress will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
