import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Save, Info, Shield, Bell, Globe, Layout } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AdminSettings = ({ user }) => {
  const [aboutContent, setAboutContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getAbout();
      setAboutContent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAboutChange = (key, field, value) => {
    setAboutContent({
      ...aboutContent,
      [key]: { ...aboutContent[key], [field]: value }
    });
  };

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      await api.updateAbout(aboutContent);
      alert("Pengaturan konten 'About' berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan pengaturan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="admin-settings-page">
        <div className="admin-header glass" style={{ marginBottom: '2rem' }}>
          <h1>PENGATURAN TOKO</h1>
          <p>Konfigurasi konten dan sistem AURUMVICE</p>
        </div>

        <div className="settings-grid">
          <div className="settings-section glass">
            <div className="section-header">
              <Info size={20} color="#C5A059" />
              <h3>KONTEN 'OUR STORY'</h3>
            </div>
            <p className="section-desc">Atur teks yang muncul di halaman About Us.</p>
            
            {loading ? (
              <p>Memuat konten...</p>
            ) : (
              <div className="settings-form">
                {Object.entries(aboutContent).map(([key, data]) => (
                  <div key={key} className="settings-group">
                    <label>{key.toUpperCase()}</label>
                    <input 
                      type="text" 
                      placeholder="Judul Seksi" 
                      value={data.title} 
                      onChange={(e) => handleAboutChange(key, 'title', e.target.value)}
                    />
                    <textarea 
                      placeholder="Deskripsi Seksi" 
                      rows="3"
                      value={data.description}
                      onChange={(e) => handleAboutChange(key, 'description', e.target.value)}
                    ></textarea>
                  </div>
                ))}
                <button className="btn btn-primary" onClick={handleSaveAbout} disabled={saving}>
                  <Save size={18} /> {saving ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                </button>
              </div>
            )}
          </div>

          <div className="settings-section glass disabled">
            <div className="section-header">
              <Globe size={20} />
              <h3>SISTEM & DOMAIN</h3>
            </div>
            <div className="placeholder-content">
              <Layout size={40} opacity={0.2} />
              <p>Fitur konfigurasi sistem sedang dikembangkan.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-settings-page {
          max-width: 900px;
          margin: 0 auto;
        }
        .admin-header {
          text-align: center;
          padding: 3rem 2rem;
        }
        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .settings-section {
          padding: 2.5rem;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .section-header h3 {
          margin: 0;
          font-size: 1rem;
          letter-spacing: 2px;
          color: var(--primary-color);
        }
        .section-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          text-align: center;
        }
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .settings-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .settings-group label {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--accent-gold);
          letter-spacing: 1px;
        }
        .settings-group input, .settings-group textarea {
          padding: 12px 15px;
          border: 1px solid #f0f0f0;
          font-family: inherit;
          font-size: 0.9rem;
          background: #fafafa;
          border-radius: 4px;
        }
        .settings-group input:focus, .settings-group textarea:focus {
          border-color: var(--accent-gold);
          background: white;
          outline: none;
        }
        .disabled {
          opacity: 0.6;
          background: #fdfdfd;
        }
        .placeholder-content {
          height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: center;
          color: #bbb;
          font-size: 0.8rem;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminSettings;
