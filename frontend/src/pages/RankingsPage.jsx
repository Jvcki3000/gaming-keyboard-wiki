import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Info } from 'lucide-react';
import { PageHeader, ScoreBar } from '../components/Ui';
import { formatHz, products, rankings } from '../lib/data';

const TABS = [
  { key: 'fps', label: 'FPS 键盘排行', desc: '基于 Competitive FPS 评分' },
  { key: 'moba', label: 'MOBA 键盘排行', desc: '基于 MOBA 维度评分' },
  { key: 'value', label: '性价比排行', desc: '基于 Value for Money 评分' },
  { key: 'polling', label: '回报率排行', desc: '基于产品回报率参数' },
];
const CATEGORIES = ['磁轴', '光轴', '机械', '混合'];

function dimensionScore(product, key) {
  if (key === 'polling') {
    return { score: product.meta.pollingHz || 0, label: '回报率' };
  }
  const labelMap = {
    fps: ['FPS', 'Competitive'],
    moba: ['MOBA'],
    value: ['Value', '性价比'],
  };
  const found = product.meta.ratings.find((rating) => labelMap[key].some((label) => rating.label.includes(label)));
  return { score: found ? found.score : product.meta.overall, label: found ? found.label : '综合' };
}

export default function RankingsPage() {
  const [tab, setTab] = useState('fps');
  const [category, setCategory] = useState('');
  const current = TABS.find((item) => item.key === tab);

  const list = useMemo(
    () =>
      products
        .filter((product) => !category || product.meta.category === category)
        .map((product) => ({
          id: product.id,
          title: product.title,
          brand: product.brand,
          category: product.meta.category,
          ...dimensionScore(product, tab),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12),
    [tab, category],
  );

  const maxScore = tab === 'polling' ? Math.max(1, ...list.map((item) => item.score)) : 5;

  return (
    <div className="page container">
      <PageHeader
        eyebrow="排行榜"
        title="键盘评分排行"
        description="排行基于产品页「用户评分」与规格参数实时计算，可按类别筛选并切换排行维度。"
      />
      <div className="ranking-tabs">
        {TABS.map((item) => (
          <button
            type="button"
            key={item.key}
            className={`ranking-tab${tab === item.key ? ' is-active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            <small>{item.desc}</small>
          </button>
        ))}
      </div>
      <div className="ranking-filters">
        <button type="button" className={category === '' ? 'is-active' : ''} onClick={() => setCategory('')}>
          全部
        </button>
        {CATEGORIES.map((item) => (
          <button type="button" key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="ranking-panel">
        <div className="ranking-head">
          <span>排名</span>
          <span>产品</span>
          <span>{tab === 'polling' ? '回报率' : '评分'}</span>
        </div>
        {list.map((item, index) => (
          <Link className="ranking-row" to={`/keyboards/${item.id}`} key={item.id}>
            <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
            <span className="ranking-product">
              <strong>{item.title}</strong>
              <small>{item.brand} · {item.category} · {item.label}</small>
            </span>
            {tab === 'polling' ? (
              <div className="score-bar">
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${(item.score / maxScore) * 100}%` }} />
                </div>
                <span className="score-bar-value">{formatHz(item.score)}</span>
              </div>
            ) : (
              <ScoreBar value={item.score} />
            )}
            <ArrowUpRight size={15} />
          </Link>
        ))}
        {list.length === 0 ? <p className="muted">该排行暂无数据。</p> : null}
      </div>
      <div className="ranking-note">
        <Info size={16} />
        <span>{rankings.note} 更新日期：{rankings.updated}</span>
      </div>
    </div>
  );
}
