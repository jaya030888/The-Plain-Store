import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', phone: '', house_flat: '', street: '', area: '', city: '', state: '', pincode: '', is_default: false
  });
  const [loading, setLoading] = useState(true);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileError, setProfileError] = useState('');

  // Sync profileData when user loads
  useEffect(() => {
    if (user) setProfileData({ name: user.name || '', email: user.email || '' });
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data);
        setIsEditingProfile(false);
      } else {
        setProfileError(data.message || 'Error updating profile');
      }
    } catch (err) {
      setProfileError('Failed to update profile');
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/addresses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ full_name: '', phone: '', house_flat: '', street: '', area: '', city: '', state: '', pincode: '', is_default: false });
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error adding address', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAddresses();
    } catch (error) {
      console.error('Error deleting address', error);
    }
  };

  if (loading) return <div className="page-container" style={{paddingTop: '100px'}}><p>Loading...</p></div>;

  return (
    <div className="page-container" style={{paddingTop: '100px'}}>
      <div className="profile-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ marginBottom: '30px' }}>My Account</h1>
        <div style={{ marginBottom: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '8px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ margin: 0 }}>Profile Details</h3>
            <button onClick={() => {
              setIsEditingProfile(!isEditingProfile);
              setProfileError('');
              setProfileData({ name: user?.name || '', email: user?.email || '' });
            }} style={{ background: 'none', border: 'none', color: '#468165', cursor: 'pointer', textDecoration: 'underline' }}>
              {isEditingProfile ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          {profileError && <p style={{ color: '#e03a3a', fontSize: '0.9rem', marginTop: '10px' }}>{profileError}</p>}
          
          {isEditingProfile ? (
            <form onSubmit={handleProfileUpdate} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Name</label>
                <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="auth-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Email</label>
                <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="auth-input" required />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
            </form>
          ) : (
            <div style={{ marginTop: '15px' }}>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>My Addresses</h3>
          <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add New Address'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', background: '#f5f1e7', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required className="auth-input" />
              <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="auth-input" />
            </div>
            <input type="text" name="house_flat" placeholder="House/Flat/Block No." value={formData.house_flat} onChange={handleChange} required className="auth-input" />
            <input type="text" name="street" placeholder="Street/Road Name" value={formData.street} onChange={handleChange} required className="auth-input" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="text" name="area" placeholder="Area" value={formData.area} onChange={handleChange} required className="auth-input" />
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required className="auth-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required className="auth-input" />
              <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required className="auth-input" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleChange} />
              Set as Default Address
            </label>
            <button type="submit" className="btn-primary">Save Address</button>
          </form>
        )}

        <div className="addresses-list" style={{ display: 'grid', gap: '20px' }}>
          {addresses.length === 0 && !showAddForm ? (
            <p>You have no saved addresses.</p>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', position: 'relative' }}>
                {addr.is_default && <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#468165', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Default</span>}
                <h4>{addr.full_name}</h4>
                <p>{addr.phone}</p>
                <p>{addr.house_flat}, {addr.street}</p>
                <p>{addr.area}, {addr.city}, {addr.state} - {addr.pincode}</p>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleDelete(addr.id)} style={{ color: '#e03a3a', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
