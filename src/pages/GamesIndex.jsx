import { Link } from 'react-router-dom';
import { ArrowUpRight, Gamepad2 } from 'lucide-react';
import { PageHeader, TagChip } from '../components/Ui';
import { games } from '../lib/data';

export default function GamesIndex() {
  return (
    <div className="page container">
      <PageHeader
        eyebrow="游戏适配数据库"
        title="按游戏选择键盘"
        description="汇总各款游戏对键盘的需求特点、相关产品适配评分与职业赛场使用情况。"
      />
      <div className="game-grid">
        {games.map((game) => (
          <Link className="game-card" to={`/games/${game.id}`} key={game.id}>
            <div className="game-card-head">
              <span className="game-card-icon"><Gamepad2 size={19} /></span>
              <TagChip tone="orange">{game.category}</TagChip>
            </div>
            <h3>{game.name}</h3>
            <p>{game.description}</p>
            <div className="game-card-foot">
              <span>{game.related.length} 个适配产品</span>
              <span>均分 {game.avg ? game.avg.toFixed(1) : '—'}</span>
              <ArrowUpRight size={15} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
