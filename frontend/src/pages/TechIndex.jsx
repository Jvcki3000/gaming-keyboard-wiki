import { Link } from 'react-router-dom';
import { ArrowUpRight, Cpu } from 'lucide-react';
import { PageHeader, TagChip } from '../components/Ui';
import { techTerms } from '../lib/data';

const PRIORITIES = ['P0', 'P1', 'P2'];

export default function TechIndex() {
  return (
    <div className="page container">
      <PageHeader
        eyebrow="技术百科"
        title="键盘技术词条"
        description="从轴体技术、输入技术到结构设计与性能参数，用结构化词条解释游戏键盘的核心概念。"
      />
      {PRIORITIES.map((priority) => {
        const terms = techTerms.filter((term) => term.priority === priority);
        if (terms.length === 0) return null;
        return (
          <section className="page-section" key={priority}>
            <div className="section-head">
              <div>
                <div className="section-eyebrow">优先级 {priority}</div>
                <h2>{priority === 'P0' ? '核心词条' : priority === 'P1' ? '重要词条' : '扩展词条'}</h2>
              </div>
            </div>
            <div className="tech-grid">
              {terms.map((term) => (
                <Link className="tech-card" to={`/tech/${term.id}`} key={term.id}>
                  <div className="tech-card-head">
                    <span className="tech-card-icon"><Cpu size={18} /></span>
                    <TagChip tone="orange">{term.category}</TagChip>
                  </div>
                  <h3>{term.name}</h3>
                  <p>{term.description}</p>
                  <div className="tech-card-foot">
                    <span>{term.related.length} 个关联产品</span>
                    <ArrowUpRight size={15} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
