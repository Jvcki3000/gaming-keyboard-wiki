import { Link } from 'react-router-dom';
import { ArrowUpRight, Trophy } from 'lucide-react';
import { PageHeader } from '../components/Ui';
import { esports } from '../lib/data';

export default function EsportsPage() {
  return (
    <div className="page container">
      <PageHeader
        eyebrow="电竞数据库"
        title="职业选手与赛事装备记录"
        description="整理各品牌在职业赛事中的战队合作、选手使用与赛事赞助信息，数据以品牌档案中的公开资料为准。"
      />
      <div className="esports-note">
        <Trophy size={18} />
        <p>以下数据来自各品牌档案「赛事影响力」章节，均为可追溯的公开信息；职业选手个人装备数据将持续补充。</p>
      </div>
      <div className="esports-grid">
        {esports.map((entry) => (
          <section className="esports-card" key={entry.id}>
            <div className="esports-card-head">
              <div>
                <h2>{entry.name}</h2>
                {entry.chinese ? <div className="esports-chinese">{entry.chinese}</div> : null}
              </div>
              <Link className="text-link" to={`/brands/${entry.id}`}>
                品牌档案 <ArrowUpRight size={14} />
              </Link>
            </div>
            {entry.rows.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {entry.rows[0].map((cell, index) => <th key={index}>{cell}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {entry.rows.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">赛事数据整理中。</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
