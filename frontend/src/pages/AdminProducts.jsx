import React, { useState, useEffect } from 'react';
import { api, getImgUrl } from '../services/api';
import { Plus, Edit, Trash2, Search, Package, Image as ImageIcon, X } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AdminProducts = ({ user, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category', formData.category);
      
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => submitData.append('imageFiles', file));
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, submitData);
      } else {
        await api.createProduct(submitData);
      }
      
      setShowModal(false);
      setImageFiles([]);
      fetchProducts();
    } catch (err) {
      alert("Gagal simpan produk: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus produk ini?")) {
      try {
        await api.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert("Gagal hapus produk: " + err.message);
      }
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock || 100,
        image: product.image
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', stock: '100', image: '' });
    }
    setShowModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  return (
    <AdminLayout user={user} onLogout={onLogout}>
      <div className="admin-products-page">
        <div className="admin-header glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>MANAJEMEN PRODUK</h1>
            <p>Kelola koleksi AURUMVICE Anda</p>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> TAMBAH PRODUK
          </button>
        </div>

        <div className="products-table-container glass">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="product-cell">
                      <img src={getImgUrl(p.image)} alt={p.name} className="product-thumb" />
                      <div className="product-info-mini">
                        <strong>{p.name}</strong>
                        <span className="p-id">ID: #{p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge-category">{p.category}</span></td>
                  <td>{formatPrice(p.price)}</td>
                  <td>{p.stock || 100}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => openModal(p)}><Edit size={16} /></button>
                      <button className="btn-icon danger" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content glass">
              <div className="modal-header">
                <h3>{editingProduct ? 'EDIT PRODUK' : 'TAMBAH PRODUK BARU'}</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="product-form">
                <div className="input-group">
                  <label>Nama Produk</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Kategori</label>
                    <input type="text" name="category" value={formData.category} onChange={handleInputChange} required />
                  </div>
                  <div className="input-group">
                    <label>Harga (IDR)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Deskripsi</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" required></textarea>
                </div>
                <div className="input-group">
                  <label>Gambar Produk (max 5 file)</label>
                  <label className="file-input-wrapper">
                    <ImageIcon size={24} color="#C5A059" style={{ marginBottom: '8px' }} />
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>
                      {imageFiles.length > 0 ? `${imageFiles.length} file dipilih` : 'Klik atau seret gambar ke sini'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      style={{ display: 'none' }}
                      onChange={(e) => setImageFiles(Array.from(e.target.files).slice(0, 5))} 
                    />
                  </label>
                </div>
                <button type="submit" className="submit-btn-premium">
                  {editingProduct ? 'PERBARUI PRODUK' : 'SIMPAN PRODUK BARU'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .product-cell { display: flex; align-items: center; gap: 1rem; }
        .product-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; }
        .product-info-mini { display: flex; flex-direction: column; }
        .p-id { font-size: 0.6rem; color: #999; }
        .badge-category { background: #f0f0f0; padding: 4px 10px; font-size: 0.7rem; border-radius: 20px; text-transform: uppercase; }
        
        .modal-overlay { 
          position: fixed; 
          inset: 0; 
          background: rgba(0,0,0,0.8); 
          backdrop-filter: blur(8px);
          display: flex; 
          justify-content: center; 
          align-items: center; 
          z-index: 2000; 
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content { 
          width: 90%; 
          max-width: 600px; 
          padding: 3rem; 
          background: white; 
          position: relative;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 2.5rem; 
          border-bottom: 2px solid #C5A059;
          padding-bottom: 1rem;
        }

        .modal-header h3 {
          font-size: 1.25rem;
          letter-spacing: 4px;
          font-weight: 800;
          color: #111;
          margin: 0;
        }

        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #999;
          transition: color 0.3s;
        }

        .close-btn:hover {
          color: #111;
        }

        .product-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 0.65rem;
          font-weight: 800;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .input-group input, .input-group textarea {
          padding: 12px 0;
          border: none;
          border-bottom: 1px solid #ddd;
          font-family: inherit;
          font-size: 0.95rem;
          background: transparent;
          transition: all 0.3s;
        }

        .input-group input:focus, .input-group textarea:focus {
          outline: none;
          border-bottom-color: #C5A059;
        }

        .form-row { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 2rem; 
        }

        .submit-btn-premium {
          margin-top: 1rem;
          padding: 1.2rem;
          background: #111;
          color: white;
          border: none;
          font-weight: 700;
          letter-spacing: 3px;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
        }

        .submit-btn-premium:hover {
          background: #C5A059;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(197, 160, 89, 0.3);
        }

        .file-input-wrapper {
          padding: 20px;
          border: 2px dashed #eee;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .file-input-wrapper:hover {
          border-color: #C5A059;
          background: #fcfcfc;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminProducts;
