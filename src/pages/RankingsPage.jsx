import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Info } from 'lucide-react';
import { PageHeader, ScoreBar } from '../components/Ui';
import { rankings } from '../lib/data';

const TABS = [
  { key: 'fps', label: 'FPS 键盘排行', desc: '基于 Competitive FPS 评分' },
  { key: 'moba', label: 'MOBA 键盘排行', desc: '基于 MOBA 维度评分' },
  { key: 'value', label: '性价比排行', desc: '基于 Value for Money 评分' },
];

export default function RankingsPage() {
  const [tab, setTab] = useState('fps');
  const current = TABS.find((item) => item.key === tab);
  const list = rankings[tab] || [];

  return (
    <div className="page container">
      <PageHeader
        eyebrow="排行榜"
        title="键盘评分排行"
        description="排行基于产品页「用户评分」表格中的公开评分汇总，用于快速比较不同定位的产品表现。"
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
      <div className="ranking-panel">
        <div className="ranking-head">
          <span>排名</span>
          <span>产品</span>
          <span>评分</span>
        </div>
        {list.map((item, index) => (
          <Link className="ranking-row" to={`/keyboards/${item.id}`} key={item.id}>
            <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
            <span className="ranking-product">
              <strong>{item.title}</strong>
              <small>{item.brand} · {item.label}</small>
            </span>
            <ScoreBar value={item.score} />
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
