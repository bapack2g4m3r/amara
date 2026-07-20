import { Search, Heart, Star } from 'lucide-react';
import '../styles/Vendor.css';

const Vendor = () => {
  return (
    <div className="vendor-container">
      <header className="page-header">
        <h1>Vendor Manager</h1>
        <p className="subtitle">Find and compare your perfect vendors.</p>
      </header>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search venues, decorators, or photographers" className="search-input" />
        </div>
      </div>

      <div className="filter-pills">
        <span className="pill active">All Vendors</span>
        <span className="pill">Photographer</span>
        <span className="pill">Venue</span>
        <span className="pill">Catering</span>
      </div>

      <div className="vendor-list">
        {/* Vendor Card 1 */}
        <div className="card vendor-card">
          <div className="vendor-image" style={{backgroundColor: '#e2e8f0'}}>
            <span className="badge-premium">PREMIUM</span>
            <button className="btn-heart"><Heart size={18} /></button>
          </div>
          <div className="vendor-info">
            <div className="vendor-title-row">
              <h3>Lumina Studio</h3>
              <span className="rating"><Star size={14} fill="currentColor" /> 4.9</span>
            </div>
            <p className="vendor-desc">International award-winning wedding photographers specializing in cinematic storytelling.</p>
            <div className="vendor-price-row">
              <span className="price">Rp 45.000k <span className="price-unit">/ Package</span></span>
            </div>
            <div className="vendor-actions">
              <button className="btn-primary btn-full">BOOK NOW</button>
            </div>
          </div>
        </div>

        {/* Vendor Card 2 */}
        <div className="card vendor-card">
          <div className="vendor-image" style={{backgroundColor: '#cbd5e1'}}>
            <span className="badge-popular">POPULAR</span>
            <button className="btn-heart"><Heart size={18} /></button>
          </div>
          <div className="vendor-info">
            <div className="vendor-title-row">
              <h3>The Glass House</h3>
              <span className="rating"><Star size={14} fill="currentColor" /> 4.8</span>
            </div>
            <p className="vendor-desc">Modern architectural masterpiece surrounded by terraced rice fields in central Bali.</p>
            <div className="vendor-price-row">
              <span className="price">Rp 120jt <span className="price-unit">/ Day</span></span>
            </div>
            <div className="vendor-actions">
              <button className="btn-secondary btn-full">CHECK DATES</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendor;
