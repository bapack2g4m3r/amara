import React from 'react';
import { Eye } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import useLanguageStore from '../store/useLanguageStore';
import '../styles/ReadOnlyBanner.css';

export default function ReadOnlyBanner() {
  const { userRole } = useWeddingStore();
  const { language } = useLanguageStore();

  if (userRole !== 'viewer') return null;

  return (
    <div className="readonly-banner">
      <Eye size={16} />
      <span>
        {language === 'id'
          ? 'Mode Lihat-Saja (Viewer): Anda dapat melihat seluruh persiapan tanpa dapat mengubah data.'
          : 'View-Only Mode: You can view all preparations without modifying items.'}
      </span>
    </div>
  );
}
