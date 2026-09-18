import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { replaceWithFallbackImage } from '../utils/productImage';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { adminToken } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', price: '', discount_price: '', category_id: '', stock: '', is_featured: false
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`);
      if (res.ok) setCategories(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenModal = (p = null) => {
    if (p) {
      setEditingId(p.id);
      // We need category_id, not category name. Since the API returns category_name in GET /products, 
      // we need to find the category_id from our categories list
      const cat = categories.find(c => c.name === p.category);
      setFormData({
        name: p.title,
        slug: p.slug,
        description: p.description,
        price: p.rawPrice,
        discount_price: p.discountPrice ? parseFloat(p.discountPrice.replace('$','')) : '',
        category_id: cat ? cat.id : '',
        stock: p.stock,
        is_featured: p.isFeatured || false
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', slug: '', description: '', price: '', discount_price: '', category_id: '', stock: '', is_featured: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${editingId}` : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`;
      const method = editingId ? 'PUT' : 'POST';
      const payload = {
        ...formData,
        discount_price: formData.discount_price === '' ? null : formData.discount_price,
        category_id: formData.category_id === '' ? null : formData.category_id
      };
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) fetchProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  return (
    <AdminLayout title="Products Management">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#468165', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ padding: '15px 20px', fontWeight: '600' }}>Product</th>
                <th style={{ padding: '15px 20px', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '15px 20px', fontWeight: '600' }}>Price</th>
                <th style={{ padding: '15px 20px', fontWeight: '600' }}>Stock</th>
                <th style={{ padding: '15px 20px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '15px 20px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <img src={product.image} alt={product.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} onError={(e) => replaceWithFallbackImage(e, product.id)} />
                      <div>
                        <div style={{ fontWeight: '500' }}>{product.title}</div>
                        {product.isFeatured && <span style={{ fontSize: '0.75rem', padding: '2px 6px', backgroundColor: '#e6f3ed', color: '#468165', borderRadius: '4px' }}>Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px', color: '#666' }}>{product.category || 'Uncategorized'}</td>
                  <td style={{ padding: '15px 20px', color: '#666' }}>{product.price}</td>
                  <td style={{ padding: '15px 20px', color: '#666' }}>{product.stock}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ fontSize: '0.8rem', padding: '4px 8px', backgroundColor: product.stock > 0 ? '#e6f3ed' : '#f8d7da', color: product.stock > 0 ? '#468165' : '#721c24', borderRadius: '20px' }}>
                      {product.stock > 0 ? 'Active' : 'Out of Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenModal(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', marginRight: '10px' }}><Edit size={18} /></button>
                    <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e03a3a' }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label>Product Name</label>
                  <input required type="text" value={formData.name} onChange={e => {
                    setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })
                  }} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '5px' }} />
                </div>
                <div>
                  <label>Slug</label>
                  <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '5px' }} />
                </div>
              </div>

              <div>
                <label>Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '5px', minHeight: '100px' }}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label>Price ($)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '5px' }} />
                </div>
                <div>
                  <label>Discount Price ($)</label>
                  <input type="number" step="0.01" value={formData.discount_price} onChange={e => setFormData({...formData, discount_price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '5px' }} />
                </div>
                <div>
                  <label>Stock</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '5px' }} />
                </div>
              </div>

              <div>
                <label>Category</label>
                <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '5px' }}>
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
                  Mark as Featured Product (Shows in Home Slider)
                </label>
              </div>

              <button type="submit" style={{ padding: '12px', backgroundColor: '#468165', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Save Product</button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductsManager;
