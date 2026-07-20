import { useState } from 'react';
import { Search, Heart, Star, Plus, X, Trash2 } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import '../styles/Vendor.css';

const Vendor = () => {
  const { vendors, addVendor, deleteVendor } = useWeddingStore();
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Vendors');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [vendorForm, setVendorForm] = useState({
    name: '',
    category: 'Photographer',
    description: '',
    price: '',
    rating: 5,
    status: 'POPULAR'
  });

  const handleAddVendor = async (e) => {
    e.preventDefault();
    if (!vendorForm.name) return;
    
    await addVendor({
      name: vendorForm.name,
      category: vendorForm.category,
      description: vendorForm.description,
      price: Number(vendorForm.price),
      rating: Number(vendorForm.rating),
      status: vendorForm.status,
      is_favorite: false
    });
    
    setShowModal(false);
    setVendorForm({ name: '', category: 'Photographer', description: '', price: '', rating: 5, status: 'POPULAR' });
  };

  const filteredVendors = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'All Vendors' || v.category === activeFilter;
    return matchSearch && matchFilter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="vendor-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1>Vendor Manager</h1>
          <p className="subtitle">Find and compare your perfect vendors.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> ADD VENDOR
        </button>
      </header>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search vendors..." className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="filter-pills" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['All Vendors', 'Photographer', 'Venue', 'Catering', 'Decor'].map(filter => (
          <span 
            key={filter} 
            className={`pill ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </span>
        ))}
      </div>

      <div className="vendor-list">
        {filteredVendors.map(vendor => (
          <div className="card vendor-card" key={vendor.id} style={{ position: 'relative' }}>
            <button 
              onClick={() => deleteVendor(vendor.id)} 
              style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer', color: 'var(--color-danger)' }}
            >
              <Trash2 size={16} />
            </button>
            <div className="vendor-image" style={{backgroundColor: vendor.category === 'Venue' ? '#cbd5e1' : '#e2e8f0'}}>
              <span className={vendor.status === 'PREMIUM' ? 'badge-premium' : 'badge-popular'}>{vendor.status}</span>
              <button className="btn-heart" style={{ color: vendor.is_favorite ? 'var(--color-danger)' : 'inherit' }}><Heart size={18} fill={vendor.is_favorite ? 'currentColor' : 'none'} /></button>
            </div>
            <div className="vendor-info">
              <div className="vendor-title-row">
                <h3 style={{ paddingRight: '20px' }}>{vendor.name}</h3>
                <span className="rating"><Star size={14} fill="currentColor" /> {vendor.rating}</span>
              </div>
              <p className="vendor-desc">{vendor.description}</p>
              <div className="vendor-price-row">
                <span className="price">{formatCurrency(vendor.price)} <span className="price-unit">/ Pkg</span></span>
              </div>
              <div className="vendor-actions">
                <button className="btn-primary btn-full">BOOK NOW</button>
              </div>
            </div>
          </div>
        ))}
        {filteredVendors.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>No vendors found. Try adding one!</p>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '450px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '15px', top: '15px' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>Add New Vendor</h3>
            <form onSubmit={handleAddVendor} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Vendor Name</label>
                <input type="text" value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Category</label>
                <select value={vendorForm.category} onChange={e => setVendorForm({...vendorForm, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }}>
                  <option>Photographer</option>
                  <option>Venue</option>
                  <option>Catering</option>
                  <option>Decor</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Description</label>
                <textarea value={vendorForm.description} onChange={e => setVendorForm({...vendorForm, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)', minHeight: '80px' }}></textarea>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Estimated Price (Rp)</label>
                <input type="number" value={vendorForm.price} onChange={e => setVendorForm({...vendorForm, price: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Rating (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={vendorForm.rating} onChange={e => setVendorForm({...vendorForm, rating: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Status</label>
                  <select value={vendorForm.status} onChange={e => setVendorForm({...vendorForm, status: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }}>
                    <option>POPULAR</option>
                    <option>PREMIUM</option>
                    <option>NEW</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>Save Vendor</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendor;
