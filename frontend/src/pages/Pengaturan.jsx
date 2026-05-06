import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.username === 'admin') {
            fetchProducts();
        }
    }, [user, navigate]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3002/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    const formatRupiah = (num) => {
        if (!num) return '';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handlePriceChange = (e) => {
        const raw = e.target.value.replace(/\./g, '');
        if (raw === '' || /^\d+$/.test(raw)) {
            setPrice(raw);
            setPriceDisplay(formatRupiah(raw));
        }
    };

    const resetForm = () => {
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
        setEditingProduct(product);
        setName(product.name);
        setDescription(product.description || '');
        setPrice(product.price.toString().replace('.00', ''));
        setPriceDisplay(formatRupiah(product.price.toString().replace('.00', '')));
        setCategory(product.category || '');
        setImageFiles([]);
        // Show existing images as previews
        if (product.images && product.images.length > 0) {
            setImagePreviews(product.images.map(img => `http://localhost:3002${img}`));
        } else if (product.image) {
            setImagePreviews([`http://localhost:3002${product.image}`]);
        } else {
            setImagePreviews([]);
        }
        setActiveTab('add');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        if (imageFiles && imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('imageFiles', imageFiles[i]);
            }
        }

        try {
            const url = editingProduct 
                ? `http://localhost:3002/api/products/${editingProduct.id}`
                : 'http://localhost:3002/api/products';
            const method = editingProduct ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                body: formData,
            });

            if (res.ok) {
                setMessage(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
                resetForm();
                fetchProducts();
                setActiveTab('list');
            } else {
                const data = await res.json();
                setMessage(`Error: ${data.error}`);
            }
        } catch (err) {
            setMessage(`Error: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`http://localhost:3002/api/products/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessage('Product deleted successfully');
                fetchProducts();
            } else {
                const data = await res.json();
                setMessage(`Error: ${data.error}`);
            }
        } catch (err) {
            setMessage(`Error: ${err.message}`);
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const combined = [...imageFiles, ...newFiles].slice(0, 5);
        setImageFiles(combined);
        
        // Generate previews for new files and combine with existing
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        const combinedPreviews = [...imagePreviews, ...newPreviews].slice(0, 5);
        setImagePreviews(combinedPreviews);
        
        // Reset input so user can select more files
        e.target.value = '';
    };

    const removeImage = (index) => {
        const newFiles = [...imageFiles];
        newFiles.splice(index, 1);
        setImageFiles(newFiles);
        URL.revokeObjectURL(imagePreviews[index]);
        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
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
                                                    src={product.image ? `http://localhost:3002${product.image}` : 'https://via.placeholder.com/50'} 
                                                    alt={product.name} 
                                                    className="admin-list-img"
                                                />
                                            </td>
                                            <td>{product.name}</td>
                                            <td>Rp {parseFloat(product.price).toLocaleString('id-ID')}</td>
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
