import { Link } from 'react-router-dom';
import { ArrowLeft, Keyboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page container">
      <div className="not-found">
        <Keyboard size={36} />
        <h1>404</h1>
        <p>这个页面不存在，或者还没有被收录。</p>
        <Link className="btn btn-primary" to="/"><ArrowLeft size={15} /> 返回首页</Link>
      </div>
    </div>
  );
}
