import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { slugify } from '../lib/data';

function InternalLink({ href, children }) {
  if (href === '#brand-index') {
    return <Link to="/keyboards">{children}</Link>;
  }
  if (href.startsWith('#')) {
    return <span className="muted">{children}</span>;
  }
  if (href.startsWith('/')) {
    return <Link to={href}>{children}</Link>;
  }
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function Heading({ node, children, level }) {
  const text = node?.children?.map((child) => child.value || '').join('') || '';
  const id = slugify(text);
  const Tag = `h${Math.min(Math.max(level, 2), 6)}`;
  return <Tag id={id}>{children}</Tag>;
}

function Table({ children }) {
  return (
    <div className="table-scroll">
      <table>{children}</table>
    </div>
  );
}

export default function Markdown({ children }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: InternalLink,
          h1: (props) => <Heading {...props} level={1} />,
          h2: (props) => <Heading {...props} level={2} />,
          h3: (props) => <Heading {...props} level={3} />,
          h4: (props) => <Heading {...props} level={4} />,
          h5: (props) => <Heading {...props} level={5} />,
          h6: (props) => <Heading {...props} level={6} />,
          table: Table,
          pre: ({ children }) => <pre>{children}</pre>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
