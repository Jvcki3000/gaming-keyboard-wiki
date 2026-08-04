import { Link } from 'react-router-dom';
import { Star, StarHalf } from 'lucide-react';

export function StarRating({ score, size = 14 }) {
  const rounded = Math.round((score || 0) * 2) / 2;
  return (
    <span className="star-rating" aria-label={`${score || 0} 分`}>
      {[1, 2, 3, 4, 5].map((index) => {
        if (rounded >= index) {
          return <Star key={index} size={size} className="star filled" />;
        }
        if (rounded >= index - 0.5) {
          return <StarHalf key={index} size={size} className="star filled" />;
        }
        return <Star key={index} size={size} className="star" />;
      })}
      {score ? <span className="star-score">{score.toFixed(1)}</span> : null}
    </span>
  );
}

export function TagChip({ children, to, tone = 'neutral' }) {
  const className = `tag-chip tone-${tone}`;
  if (to) return <Link className={className} to={to}>{children}</Link>;
  return <span className={className}>{children}</span>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h1>{title}</h1>
      {description ? <p className="page-desc">{description}</p> : null}
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export function ScoreBar({ value, max = 5 }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="score-bar">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="score-bar-value">{value.toFixed(1)}</span>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-title">{title}</div>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function InfoRow({ label, value, wide }) {
  if (!value) return null;
  return (
    <div className={`info-row${wide ? ' is-wide' : ''}`}>
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}
