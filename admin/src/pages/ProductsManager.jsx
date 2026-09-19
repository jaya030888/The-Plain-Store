import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, X, Check, Flame, Tag, AlertCircle } from 'lucide-react';
import { replaceWithFallbackImage } from '../utils/productImage';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { adminToken } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', price: '', discount_price: '', category_id: '', stock: '', is_featured: false, is_on_sale: false
  });

  // State to track inline stock editing and saved feedback
  const [stockEdits, setStockEdits] = useState({});
  const [savingStockId, setSavingStockId] = useState(null);
  const [savedStockId, setSavedStockId] = useState(null);

  // Quick sale modal/dialog state
  const [saleDialogProduct, setSaleDialogProduct] = useState(null);
  const [saleDiscountInput, setSaleDiscountInput] = useState('');

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
        // Initialize stock edits mapping
        const edits = {};
        data.forEach(p => {
          edits[p.id] = p.stock;
        });
        setStockEdits(edits);
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
      const cat = categories.find(c => c.name === p.category);
      setFormData({
        name: p.title,
        slug: p.slug,
        description: p.description,
        price: p.rawPrice,
        discount_price: p.rawDiscountPrice ?? (p.discountPrice ? parseFloat(p.discountPrice.replace('$', '')) : ''),
        category_id: cat ? cat.id : '',
        stock: p.stock,
        is_featured: p.isFeatured || false,
        is_on_sale: Boolean(p.isOnSale || p.is_on_sale)
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', slug: '', description: '', price: '', discount_price: '', category_id: '', stock: '', is_featured: false, is_on_sale: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${editingId}` 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`;
      const method = editingId ? 'PUT' : 'POST';
      const payload = {
        ...formData,
        discount_price: formData.discount_price === '' ? null : formData.discount_price,
        category_id: formData.category_id === '' ? null : formData.category_id,
        is_on_sale: Boolean(formData.is_on_sale)
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

  // Quick inline stock save
  const handleSaveStock = async (productId) => {
    const newStock = parseInt(stockEdits[productId], 10);
    if (isNaN(newStock) || newStock < 0) return;
    
    setSavingStockId(productId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${productId}/quick-update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
        setSavedStockId(productId);
        setTimeout(() => setSavedStockId(null), 2500);
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setSavingStockId(null);
    }
  };

  // Quick toggle on sale
  const handleToggleSale = (product) => {
    if (product.isOnSale) {
      // Toggle off directly
      executeQuickSaleUpdate(product.id, false, null);
    } else {
      // Open quick modal to set discount price
      const defaultDiscount = (product.rawPrice * 0.8).toFixed(2); // 20% off default
      setSaleDiscountInput(product.rawDiscountPrice || defaultDiscount);
      setSaleDialogProduct(product);
    }
  };

  const executeQuickSaleUpdate = async (productId, isOnSale, discountPrice) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${productId}/quick-update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          is_on_sale: isOnSale,
          discount_price: isOnSale ? (discountPrice ? parseFloat(discountPrice) : null) : null
        })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              isOnSale: isOnSale,
              is_on_sale: isOnSale,
              rawDiscountPrice: isOnSale ? parseFloat(discountPrice) : null,
              discountPrice: isOnSale && discountPrice ? `$${discountPrice}` : null
            };
          }
          return p;
        }));
        setSaleDialogProduct(null);
      }
    } catch (err) {
      console.error('Failed to update sale status:', err);
    }
  };

  return (
    <AdminLayout title="Products Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            Manage your store inventory, edit stock amounts directly inline, and toggle items on/off sale.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '10px 20px', 
            backgroundColor: '#468165', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontWeight: '600' 
          }}
        >
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
                <th style={{ padding: '15px 20px', fontWeight: '600' }}>Sale Status</th>
                <th style={{ padding: '15px 20px', fontWeight: '600', minWidth: '180px' }}>Stock in Inventory</th>
                <th style={{ padding: '15px 20px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '15px 20px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const currentStockVal = stockEdits[product.id] ?? product.stock;
                const isStockDirty = parseInt(currentStockVal, 10) !== product.stock;

                return (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                    {/* Product info */}
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }} 
                          onError={(e) => replaceWithFallbackImage(e, product.id)} 
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{product.title}</div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                            {product.isFeatured && (
                              <span style={{ fontSize: '0.7rem', padding: '1px 6px', backgroundColor: '#e6f3ed', color: '#468165', borderRadius: '4px', fontWeight: '500' }}>
                                Featured
                              </span>
                            )}
                            {product.isOnSale && (
                              <span style={{ fontSize: '0.7rem', padding: '1px 6px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                <Flame size={11} /> ON SALE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '15px 20px', color: '#64748b' }}>
                      {product.category || 'Uncategorized'}
                    </td>

                    {/* Price */}
                    <td style={{ padding: '15px 20px' }}>
                      {product.isOnSale && product.discountPrice ? (
                        <div>
                          <span style={{ fontWeight: '700', color: '#dc2626' }}>{product.discountPrice}</span>
                          <span style={{ marginLeft: '6px', fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {product.price}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: '600', color: '#334155' }}>{product.price}</span>
                      )}
                    </td>

                    {/* Sale Toggle Button */}
                    <td style={{ padding: '15px 20px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleSale(product)}
                        title={product.isOnSale ? 'Click to remove from sale' : 'Click to put on sale'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          backgroundColor: product.isOnSale ? '#fef2f2' : '#f1f5f9',
                          color: product.isOnSale ? '#dc2626' : '#64748b',
                          boxShadow: product.isOnSale ? '0 0 0 1px #fecaca' : '0 0 0 1px #e2e8f0'
                        }}
                      >
                        <Flame size={14} color={product.isOnSale ? '#dc2626' : '#94a3b8'} />
                        {product.isOnSale ? 'On Sale (Click to Stop)' : '+ Put On Sale'}
                      </button>
                    </td>

                    {/* Inline Stock Editor */}
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          min="0"
                          value={currentStockVal}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStockEdits(prev => ({ ...prev, [product.id]: val }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveStock(product.id);
                          }}
                          style={{
                            width: '80px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: isStockDirty ? '2px solid #468165' : '1px solid #cbd5e1',
                            backgroundColor: isStockDirty ? '#f0fdf4' : '#fff',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#1e293b'
                          }}
                        />

                        {/* Save Stock Button (shown when edited or saving) */}
                        {isStockDirty && (
                          <button
                            type="button"
                            onClick={() => handleSaveStock(product.id)}
                            disabled={savingStockId === product.id}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#468165',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Check size={14} /> Save
                          </button>
                        )}

                        {savedStockId === product.id && (
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Check size={14} /> Saved!
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td style={{ padding: '15px 20px' }}>
                      <span 
                        style={{ 
                          fontSize: '0.8rem', 
                          padding: '4px 10px', 
                          backgroundColor: product.stock > 0 ? '#e6f3ed' : '#fee2e2', 
                          color: product.stock > 0 ? '#468165' : '#b91c1c', 
                          borderRadius: '20px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}
                      >
                        {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleOpenModal(product)} 
                        title="Edit Full Details"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', marginRight: '10px' }}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)} 
                        title="Delete Product"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e03a3a' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Put on Sale Modal */}
      {saleDialogProduct && (
        <div 
          className="modal-overlay" 
          onClick={() => setSaleDialogProduct(null)} 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100, padding: '20px' }}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Put Item On Sale</h3>
              </div>
              <button onClick={() => setSaleDialogProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b' }}>
              Add a discount price for <strong>{saleDialogProduct.title}</strong> (Original: {saleDialogProduct.price}). This item will be highlighted on the storefront and in the seasonal sale banner.
            </p>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Sale Discount Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={saleDialogProduct.rawPrice}
                value={saleDiscountInput}
                onChange={e => setSaleDiscountInput(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: '600' }}
              />
              {saleDiscountInput && parseFloat(saleDiscountInput) < saleDialogProduct.rawPrice && (
                <span style={{ display: 'block', marginTop: '6px', fontSize: '0.8rem', color: '#16a34a', fontWeight: '600' }}>
                  {Math.round((1 - parseFloat(saleDiscountInput) / saleDialogProduct.rawPrice) * 100)}% Discount to shoppers!
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setSaleDialogProduct(null)}
                style={{ padding: '9px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeQuickSaleUpdate(saleDialogProduct.id, true, saleDiscountInput)}
                style={{ padding: '9px 18px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Flame size={16} /> Enable Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Full Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1e293b' }}>{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Product Name</label>
                  <input required type="text" value={formData.name} onChange={e => {
                    setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })
                  }} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px' }} />
                </div>
                <div>
                  <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Slug</label>
                  <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px', minHeight: '90px' }}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Regular Price ($)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px' }} />
                </div>
                <div>
                  <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Discount Price ($)</label>
                  <input type="number" step="0.01" value={formData.discount_price} onChange={e => setFormData({...formData, discount_price: e.target.value})} placeholder="Optional" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px' }} />
                </div>
                <div>
                  <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Stock Quantity</label>
                  <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: '500', fontSize: '0.85rem' }}>Category</label>
                <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px' }}>
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Checkbox Options */}
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500', color: '#1e293b' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.is_on_sale} 
                    onChange={e => setFormData({ ...formData, is_on_sale: e.target.checked })} 
                  />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Flame size={16} color="#dc2626" />
                    <strong>Put On Sale</strong> (Highlights product with SALE badge & includes in Sale Banners)
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500', color: '#1e293b' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.is_featured} 
                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} 
                  />
                  <span>Mark as Featured Product (Highlights in Hero & Featured carousel)</span>
                </label>
              </div>

              <button type="submit" style={{ padding: '12px', backgroundColor: '#468165', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '1rem' }}>
                {editingId ? 'Save Product Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductsManager;
