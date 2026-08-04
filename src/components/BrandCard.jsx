import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { TagChip } from './Ui';

export default function BrandCard({ brand }) {
  const initial = (brand.name || '?').charAt(0).toUpperCase();
  return (
    <article className="brand-card">
      <Link className="brand-card-main" to={`/brands/${brand.id}`}>
        <div className="brand-mark">
          <span>{initial}</span>
          <i className="brand-mark-ring" />
        </div>
        <div className="brand-card-copy">
          <div className="brand-card-title">{brand.name}</div>
          {brand.chinese ? <div className="brand-card-chinese">{brand.chinese}</div> : null}
          <div className="brand-card-sub">
            {brand.info.country ? (
              <span className="brand-country">
                <MapPin size={13} /> {brand.info.country}
              </span>
            ) : null}
            <span>{brand.productCount} 个产品</span>
          </div>
        </div>
        <ArrowUpRight className="brand-card-arrow" size={18} />
      </Link>
      <div className="brand-card-tech">
        {brand.coreTech.slice(0, 3).map((tech) => (
          <TagChip key={tech} tone="orange">{tech.replace(/^\d+\.\d+\s*/, '')}</TagChip>
        ))}
      </div>
    </article>
  );
}
