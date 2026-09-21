import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, X, Check, Tag, RotateCcw, PackageCheck, Award, AlertCircle, Search } from 'lucide-react';
import { replaceWithFallbackImage } from '../utils/productImage';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { adminToken } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', price: '', discount_price: '', category_id: '', stock: '', is_featured: false, is_on_sale: false,
    is_returnable: true, return_window_days: 7, is_open_box_delivery: false, badge: ''
  });

  // State to track inline stock editing and saved feedback
  const [stockEdits, setStockEdits] = useState({});
  const [savingStockId, setSavingStockId] = useState(null);
  const [savedStockId, setSavedStockId] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Quick sale modal/dialog state
  const [saleDialogProduct, setSaleDialogProduct] = useState(null);
  const [saleDiscountInput, setSaleDiscountInput] = useState('');

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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

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
        is_on_sale: Boolean(p.isOnSale || p.is_on_sale),
        is_returnable: p.is_returnable !== undefined ? Boolean(p.is_returnable) : (p.isReturnable !== undefined ? Boolean(p.isReturnable) : true),
        return_window_days: p.return_window_days ?? (p.returnWindowDays ?? 7),
        is_open_box_delivery: Boolean(p.is_open_box_delivery || p.isOpenBoxDelivery),
        badge: p.badge || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', slug: '', description: '', price: '', discount_price: '', category_id: '', stock: '', is_featured: false, is_on_sale: false,
        is_returnable: true, return_window_days: 7, is_open_box_delivery: false, badge: ''
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
      const isReturnableBool = Boolean(formData.is_returnable);
      const windowDays = parseInt(formData.return_window_days, 10) || 7;
      const payload = {
        ...formData,
        discount_price: formData.discount_price === '' ? null : formData.discount_price,
        category_id: formData.category_id === '' ? null : formData.category_id,
        is_on_sale: Boolean(formData.is_on_sale),
        is_returnable: isReturnableBool,
        return_window_days: windowDays,
        return_policy_type: isReturnableBool ? `${windowDays} Days Returnable` : 'Non-Returnable',
        is_open_box_delivery: Boolean(formData.is_open_box_delivery),
        badge: formData.badge ? formData.badge.trim() : null
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
      {/* Header & Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Catalog & Inventory</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            {products.length} total products &bull; {products.filter(p => p.isOnSale).length} currently on sale
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '9px 18px', 
            backgroundColor: '#468165', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontWeight: '600',
            fontSize: '0.9rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        background: '#fff',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
          {/* Search box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search products by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              color: '#334155',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Quick count chips */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
          <span style={{ background: '#f8fafc', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            Showing: <strong>{products.filter(p => {
              const mSearch = !searchQuery.trim() || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase());
              const mCat = categoryFilter === 'all' || p.category === categoryFilter;
              return mSearch && mCat;
            }).length}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading products...</div>
      ) : (
        <div className="admin-table-container" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: '600', fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: '600', fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price & Sale</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: '600', fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock Inventory</th>
                <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: '600', fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Return Policy</th>
                <th style={{ padding: '12px 18px', textAlign: 'right', fontWeight: '600', fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter(product => {
                  const mSearch = !searchQuery.trim() || product.title?.toLowerCase().includes(searchQuery.toLowerCase()) || product.category?.toLowerCase().includes(searchQuery.toLowerCase());
                  const mCat = categoryFilter === 'all' || product.category === categoryFilter;
                  return mSearch && mCat;
                })
                .map(product => {
                  const currentStockVal = stockEdits[product.id] ?? product.stock;
                  const isStockDirty = parseInt(currentStockVal, 10) !== product.stock;

                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}>
                      {/* Product details */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0', flexShrink: 0 }} 
                            onError={(e) => replaceWithFallbackImage(e, product.id)} 
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.9rem', lineHeight: '1.3' }}>
                              {product.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {product.category || 'Uncategorized'}
                              </span>
                              {product.isFeatured && (
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', backgroundColor: '#e6f3ed', color: '#2b7a4b', borderRadius: '4px', fontWeight: '600' }}>
                                  Featured
                                </span>
                              )}
                              {product.badge && (
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '4px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                  <Award size={10} /> {product.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price & Sale Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {product.isOnSale && product.discountPrice ? (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#c2410c' }}>{product.discountPrice}</span>
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>{product.price}</span>
                            </div>
                          ) : (
                            <span style={{ fontWeight: '600', fontSize: '0.92rem', color: '#1e293b' }}>{product.price}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleSale(product)}
                            title={product.isOnSale ? 'Click to remove from sale' : 'Click to put on sale'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              width: 'fit-content',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: product.isOnSale ? '#fff1f2' : '#f1f5f9',
                              color: product.isOnSale ? '#be123c' : '#64748b'
                            }}
                          >
                            <Tag size={10} /> {product.isOnSale ? 'On Sale' : '+ Put On Sale'}
                          </button>
                        </div>
                      </td>

                      {/* Stock Inventory */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                                width: '64px',
                                padding: '4px 8px',
                                borderRadius: '5px',
                                border: isStockDirty ? '2px solid #468165' : '1px solid #cbd5e1',
                                backgroundColor: isStockDirty ? '#f0fdf4' : '#fff',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#1e293b'
                              }}
                            />
                            {isStockDirty && (
                              <button
                                type="button"
                                onClick={() => handleSaveStock(product.id)}
                                disabled={savingStockId === product.id}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#468165',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.72rem',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                              >
                                <Check size={12} /> Save
                              </button>
                            )}
                            {savedStockId === product.id && (
                              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Check size={12} /> Saved
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {product.stock > 0 ? (
                              <span style={{ color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                                In Stock
                              </span>
                            ) : (
                              <span style={{ color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Return Policy */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {product.isReturnable === false || product.is_returnable === false ? (
                            <span style={{ fontSize: '0.75rem', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                              <AlertCircle size={12} /> Non-Returnable
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#2b7a4b', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                              <RotateCcw size={12} /> {product.returnWindowDays || product.return_window_days || 7}d Returnable
                            </span>
                          )}
                          {(product.isOpenBoxDelivery || product.is_open_box_delivery) && (
                            <span style={{ fontSize: '0.72rem', color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <PackageCheck size={12} /> Open Box Delivery
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            onClick={() => handleOpenModal(product)} 
                            title="Edit Product"
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '6px', 
                              border: '1px solid #e2e8f0', 
                              background: '#fff', 
                              cursor: 'pointer', 
                              color: '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            title="Delete Product"
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '6px', 
                              border: '1px solid #fee2e2', 
                              background: '#fff5f5', 
                              cursor: 'pointer', 
                              color: '#dc2626',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
                <Tag size={18} color="#8F422E" />
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
                style={{ padding: '9px 18px', backgroundColor: '#8F422E', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Tag size={15} /> Enable Sale
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

              {/* Merchandising & Policy Settings */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '5px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  {/* Badge Selection */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500', fontSize: '0.85rem', marginBottom: '5px', color: '#1e293b' }}>
                      <Award size={15} color="#8F422E" /> Storefront Badge
                    </label>
                    <select
                      value={['', 'Best Seller', 'New Arrival', 'Trending', 'Top Rated', 'Handmade', 'Limited Edition'].includes(formData.badge || '') ? (formData.badge || '') : '__custom__'}
                      onChange={e => {
                        if (e.target.value === '__custom__') {
                          setFormData({ ...formData, badge: formData.badge || 'Staff Pick' });
                        } else {
                          setFormData({ ...formData, badge: e.target.value });
                        }
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#fff' }}
                    >
                      <option value="">None (No Badge)</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="New Arrival">New Arrival</option>
                      <option value="Trending">Trending</option>
                      <option value="Top Rated">Top Rated</option>
                      <option value="Handmade">Handmade</option>
                      <option value="Limited Edition">Limited Edition</option>
                      <option value="__custom__">Custom Badge Text...</option>
                    </select>
                    {!['', 'Best Seller', 'New Arrival', 'Trending', 'Top Rated', 'Handmade', 'Limited Edition'].includes(formData.badge || '') && (
                      <input
                        type="text"
                        placeholder="Enter custom badge text"
                        value={formData.badge || ''}
                        onChange={e => setFormData({ ...formData, badge: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginTop: '6px' }}
                      />
                    )}
                  </div>

                  {/* Return Policy Selection */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500', fontSize: '0.85rem', marginBottom: '5px', color: '#1e293b' }}>
                      <RotateCcw size={15} color="#468165" /> Return & Refund Policy
                    </label>
                    <select
                      value={!formData.is_returnable ? '0' : ([7, 10, 14, 30].includes(Number(formData.return_window_days)) ? String(formData.return_window_days) : '__custom__')}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '0') {
                          setFormData({ ...formData, is_returnable: false });
                        } else if (val === '__custom__') {
                          setFormData({ ...formData, is_returnable: true, return_window_days: formData.return_window_days || 15 });
                        } else {
                          setFormData({ ...formData, is_returnable: true, return_window_days: Number(val) });
                        }
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#fff' }}
                    >
                      <option value="7">Returnable (7 Days Standard)</option>
                      <option value="10">Returnable (10 Days)</option>
                      <option value="14">Returnable (14 Days)</option>
                      <option value="30">Returnable (30 Days)</option>
                      <option value="__custom__">Custom Return Days...</option>
                      <option value="0">Non-Returnable (Final Sale)</option>
                    </select>
                    {formData.is_returnable && ![7, 10, 14, 30].includes(Number(formData.return_window_days)) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={formData.return_window_days || ''}
                          onChange={e => setFormData({ ...formData, return_window_days: e.target.value })}
                          placeholder="Days"
                          style={{ width: '80px', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>days return window</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modern Compact Feature Toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: formData.is_on_sale ? '1.5px solid #8F422E' : '1px solid #e2e8f0',
                    backgroundColor: formData.is_on_sale ? '#fff7f5' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.is_on_sale)}
                      onChange={e => setFormData({ ...formData, is_on_sale: e.target.checked })}
                      style={{ marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={13} color="#8F422E" /> Put On Sale
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>Include in sale section</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: formData.is_featured ? '1.5px solid #468165' : '1px solid #e2e8f0',
                    backgroundColor: formData.is_featured ? '#f0fdf4' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.is_featured)}
                      onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                      style={{ marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1e293b' }}>Featured Product</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>Showcase on homepage</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: formData.is_open_box_delivery ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                    backgroundColor: formData.is_open_box_delivery ? '#f0f9ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.is_open_box_delivery)}
                      onChange={e => setFormData({ ...formData, is_open_box_delivery: e.target.checked })}
                      style={{ marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PackageCheck size={13} color="#0284c7" /> Open Box
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>Customer inspects on delivery</div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 18px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', backgroundColor: '#468165', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {editingId ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductsManager;
