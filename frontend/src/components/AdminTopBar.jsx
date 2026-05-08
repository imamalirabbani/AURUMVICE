import React, { useState, useEffect } from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { api } from '../services/api';

const AdminTopBar = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const fetchAdminNotifs = async () => {
      if (!user) return;
      try {
        // Assuming admin has user_id 1 based on backend logic
        const data = await api.getNotifications(user.id);
        setNotifications(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdminNotifs();
    const interval = setInterval(fetchAdminNotifs, 10000); // Admin polls every 10s
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="admin-topbar glass">
      <div className="topbar-left">
        <h2 className="admin-page-title">DASHBOARD MANAJEMEN</h2>
      </div>

      <div className="topbar-right">
        <div className="admin-notif-wrapper">
          <button className="topbar-icon-btn" onClick={() => setShowNotif(!showNotif)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotif && (
            <div className="admin-notif-dropdown glass">
              <div className="notif-header">
                <span>NOTIFIKASI PESANAN</span>
              </div>
              <div className="notif-list">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item ${n.is_read ? '' : 'unread'}`}>
                      <p>{n.message}</p>
                      <small>{new Date(n.created_at).toLocaleString()}</small>
                    </div>
                  ))
                ) : (
                  <div className="notif-empty">Tidak ada notifikasi</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="admin-user-mini">
          <span>{user?.username}</span>
          <User size={20} />
        </div>
      </div>

      <style>{`
        .admin-topbar {
          height: 70px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          border-bottom: 1px solid var(--border-color);
          background: white;
          width: 100%;
        }
        .admin-page-title {
          font-size: 1rem;
          letter-spacing: 2px;
          color: var(--primary-color);
          margin: 0;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .topbar-icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          color: var(--text-secondary);
        }
        .notif-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #e74c3c;
          color: white;
          font-size: 0.6rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .admin-notif-dropdown {
          position: absolute;
          top: 60px;
          right: 2rem;
          width: 320px;
          z-index: 1100;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .notif-header {
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
          font-weight: 700;
          font-size: 0.7rem;
          letter-spacing: 1px;
        }
        .notif-item {
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.3s;
        }
        .notif-item.unread {
          background: #f8f9fa;
        }
        .notif-item p {
          font-size: 0.8rem;
          margin: 0;
          color: var(--text-primary);
        }
        .notif-item small {
          font-size: 0.65rem;
          color: var(--text-secondary);
        }
        .admin-user-mini {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }
      `}</style>
    </header>
  );
};

export default AdminTopBar;
