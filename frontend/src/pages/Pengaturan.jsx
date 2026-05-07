import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3002';

const Pengaturan = ({ user, onLogout }) => {
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState(user?.username === 'admin' ? 'list' : 'account');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [priceDisplay, setPriceDisplay] = useState('');
    const [category, setCategory] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [message, setMessage] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [aboutContent, setAboutContent] = useState({
        excellence: { title: 'Excellence', description: '' },
        integrity: { title: 'Integrity', description: '' },
        innovation: { title: 'Innovation', description: '' }
    });
    const navigate = useNavigate();

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/products`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products", err);
            showTemporaryMessage("Error: Failed to fetch products");
        }
    }, []);

    const fetchAboutContent = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/about`);
            if (!res.ok) throw new Error('Failed to fetch about content');
            const data = await res.json();
            if (data && Object.keys(data).length > 0) {
                setAboutContent(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error("Failed to fetch about content", err);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.username === 'admin') {
            fetchProducts();
            fetchAboutContent();
        }
    }, [user, navigate, fetchProducts]);

    useEffect(() => {
        // Cleanup object URLs on unmount to prevent memory leaks
        return () => {
            imagePreviews.forEach(src => {
                if (src && src.startsWith('blob:')) {
                    URL.revokeObjectURL(src);
                }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showTemporaryMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 5000);
    };

    const formatRupiah = (num) => {
        if (!num) return '';
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const handlePriceChange = (e) => {
        const raw = e.target.value.replace(/\./g, '');
        if (raw === '' || /^\d+$/.test(raw)) {
            setPrice(raw);
            setPriceDisplay(formatRupiah(raw));
        }
    };

    const resetForm = () => {
        imagePreviews.forEach(src => {
            if (src && src.startsWith('blob:')) {
                URL.revokeObjectURL(src);
            }
        });
        setName('');
        setDescription('');
        setPrice('');
        setPriceDisplay('');
        setCategory('');
        setImageFiles([]);
        setImagePreviews([]);
        setEditingProduct(null);
    };

    const handleEdit = (product) => {
        resetForm();
        setEditingProduct(product);
        setName(product.name);
        setDescription(product.description || '');
        const productPrice = product.price.toString().replace('.00', '');
        setPrice(productPrice);
        setPriceDisplay(formatRupiah(productPrice));
        setCategory(product.category || '');
        setImageFiles([]);
        
        let previews = [];
        if (product.images && product.images.length > 0) {
            previews = product.images.map(img => `${API_BASE}${img}`);
        } else if (product.image) {
            previews = [`${API_BASE}${product.image}`];
        }
        setImagePreviews(previews);
        
        setActiveTab('add');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        
        imageFiles.forEach(file => formData.append('imageFiles', file));

        try {
            const url = editingProduct 
                ? `${API_BASE}/api/products/${editingProduct.id}`
                : `${API_BASE}/api/products`;
            const method = editingProduct ? 'PUT' : 'POST';

            const res = await fetch(url, { method, body: formData });

            if (res.ok) {
                showTemporaryMessage(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
                resetForm();
                fetchProducts();
                setActiveTab('list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const data = await res.json().catch(() => ({}));
                showTemporaryMessage(`Error: ${data.error || 'Operation failed'}`);
            }
        } catch (err) {
            showTemporaryMessage(`Error: ${err.message}`);
        }
    };

    const handleAboutSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/about`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aboutContent)
            });

            if (res.ok) {
                showTemporaryMessage('About content updated successfully!');
            } else {
                const data = await res.json().catch(() => ({}));
                showTemporaryMessage(`Error: ${data.error || 'Operation failed'}`);
            }
        } catch (err) {
            showTemporaryMessage(`Error: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });

            if (res.ok) {
                showTemporaryMessage('Product deleted successfully');
                fetchProducts();
            } else {
                const data = await res.json().catch(() => ({}));
                showTemporaryMessage(`Error: ${data.error || 'Failed to delete'}`);
            }
        } catch (err) {
            showTemporaryMessage(`Error: ${err.message}`);
        }
    };

    const handleFileChange = (e) => {
        if (!e.target.files) return;
        
        const newFiles = Array.from(e.target.files);
        const combinedFiles = [...imageFiles, ...newFiles].slice(0, 5);
        setImageFiles(combinedFiles);
        
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        const combinedPreviews = [...imagePreviews, ...newPreviews].slice(0, 5);
        setImagePreviews(combinedPreviews);
        
        e.target.value = '';
    };

    const removeImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        
        const srcToRemove = imagePreviews[index];
        if (srcToRemove && srcToRemove.startsWith('blob:')) {
            URL.revokeObjectURL(srcToRemove);
        }
        
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleLogoutClick = () => {
        onLogout();
        navigate('/');
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title">PENGATURAN</h1>
            
            <div className="admin-tabs">
                {user?.username === 'admin' && (
                    <>
                        <button 
                            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                            onClick={() => setActiveTab('list')}
                        >
                            DAFTAR PRODUK
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
                            onClick={() => { resetForm(); setActiveTab('add'); }}
                        >
                            {editingProduct ? 'EDIT PRODUK' : 'TAMBAH PRODUK'}
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                            onClick={() => setActiveTab('about')}
                        >
                            ABOUT PAGE
                        </button>
                    </>
                )}
                <button 
                    className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    AKUN
                </button>
            </div>

            {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
            
            {activeTab === 'account' && (
                <section className="admin-section fade-in text-center">
                    <div className="account-info" style={{ marginBottom: '3rem' }}>
                        <p style={{ letterSpacing: '0.1rem', color: '#666', marginBottom: '0.5rem' }}>LOGGED IN AS</p>
                        <h2 style={{ fontSize: '1.5rem', letterSpacing: '0.3rem' }}>{user?.username.toUpperCase()}</h2>
                        <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '0.5rem' }}>{user?.email}</p>
                    </div>
                    <button 
                        onClick={handleLogoutClick} 
                        className="admin-submit-btn" 
                        style={{ maxWidth: '300px', margin: '0 auto' }}
                    >
                        LOGOUT
                    </button>
                </section>
            )}

            {user?.username === 'admin' && activeTab === 'about' && (
                <section className="admin-section fade-in">
                    <form onSubmit={handleAboutSubmit} className="admin-form">
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Excellence Section</h3>
                            <div className="form-group">
                                <label>Title</label>
                                <input 
                                    type="text" 
                                    value={aboutContent.excellence?.title || ''} 
                                    onChange={(e) => setAboutContent({...aboutContent, excellence: {...aboutContent.excellence, title: e.target.value}})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    value={aboutContent.excellence?.description || ''} 
                                    onChange={(e) => setAboutContent({...aboutContent, excellence: {...aboutContent.excellence, description: e.target.value}})} 
                                    required 
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Integrity Section</h3>
                            <div className="form-group">
                                <label>Title</label>
                                <input 
                                    type="text" 
                                    value={aboutContent.integrity?.title || ''} 
                                    onChange={(e) => setAboutContent({...aboutContent, integrity: {...aboutContent.integrity, title: e.target.value}})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    value={aboutContent.integrity?.description || ''} 
                                    onChange={(e) => setAboutContent({...aboutContent, integrity: {...aboutContent.integrity, description: e.target.value}})} 
                                    required 
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Innovation Section</h3>
                            <div className="form-group">
                                <label>Title</label>
                                <input 
                                    type="text" 
                                    value={aboutContent.innovation?.title || ''} 
                                    onChange={(e) => setAboutContent({...aboutContent, innovation: {...aboutContent.innovation, title: e.target.value}})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    value={aboutContent.innovation?.description || ''} 
                                    onChange={(e) => setAboutContent({...aboutContent, innovation: {...aboutContent.innovation, description: e.target.value}})} 
                                    required 
                                    rows="3"
                                />
                            </div>
                        </div>

                        <button type="submit" className="admin-submit-btn">
                            Update About Content
                        </button>
                    </form>
                </section>
            )}

            {user?.username === 'admin' && activeTab === 'add' && (
                <section className="admin-section fade-in">
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                placeholder="Enter product name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                required 
                                placeholder="Enter product description"
                                rows="4"
                            />
                        </div>
                        <div className="form-group">
                            <label>Price (Rp)</label>
                            <input 
                                type="text" 
                                value={priceDisplay} 
                                onChange={handlePriceChange} 
                                required 
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)} 
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Shoes">Shoes</option>
                                <option value="Watches">Watches</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Product Images (Max 5)</label>
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                accept="image/*"
                                multiple
                            />
                            {imagePreviews.length > 0 && (
                                <div className="image-preview-grid">
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="preview-item">
                                            <img src={src} alt={`Preview ${index + 1}`} />
                                            <button 
                                                type="button" 
                                                className="preview-remove"
                                                onClick={() => removeImage(index)}
                                            >
                                                ✕
                                            </button>
                                            <span className="preview-label">{index + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="submit" className="admin-submit-btn">
                            {editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                        {editingProduct && (
                            <button type="button" className="admin-submit-btn" style={{ background: 'transparent', color: 'var(--primary-color)', marginTop: '0.5rem' }} onClick={() => { resetForm(); }}>
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </section>
            )}

            {user?.username === 'admin' && activeTab === 'list' && (
                <section className="admin-section fade-in">
                    <div className="admin-product-list">
                        {products.length === 0 ? (
                            <p className="text-center">No products found.</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <img 
                                                    src={product.image ? `${API_BASE}${product.image}` : 'https://via.placeholder.com/50'} 
                                                    alt={product.name} 
                                                    className="admin-list-img"
                                                />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>Rp {formatRupiah(product.price)}</td>
                                            <td>
                                                <button 
                                                    onClick={() => handleEdit(product)}
                                                    className="btn-edit"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product.id)}
                                                    className="btn-delete"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Pengaturan;
