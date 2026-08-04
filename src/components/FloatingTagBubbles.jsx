import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function FloatingTagBubbles({ tags = [], height = 300 }) {
  const containerRef = useRef(null);
  const bubbleRefs = useRef([]);
  const stateRef = useRef(null);
  const hoverRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.getBoundingClientRect().width || 600;

    const bubbles = tags.map((tag, index) => {
      const baseRadius = Math.max(34, Math.min(54, width / 14)) * (0.82 + (index % 3) * 0.1);
      return {
        tag,
        x: baseRadius + Math.random() * Math.max(width - baseRadius * 2, 20),
        y: baseRadius + Math.random() * Math.max(height - baseRadius * 2, 20),
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        baseRadius,
        radius: baseRadius * 0.55,
      };
    });

    stateRef.current = { bubbles, width, height };

    let raf = 0;
    const tick = () => {
      const state = stateRef.current;
      if (!state) return;
      const { bubbles } = state;
      const hoveredTag = hoverRef.current;

      for (const bubble of bubbles) {
        const hovered = bubble.tag === hoveredTag;
        const targetRadius = hovered ? bubble.baseRadius * 1.5 : bubble.baseRadius;
        bubble.radius += (targetRadius - bubble.radius) * 0.18;

        if (hovered) {
          bubble.vx *= 0.85;
          bubble.vy *= 0.85;
          if (Math.abs(bubble.vx) < 0.05) bubble.vx = 0;
          if (Math.abs(bubble.vy) < 0.05) bubble.vy = 0;
        } else {
          bubble.vx = Math.max(-1.6, Math.min(1.6, bubble.vx + (Math.random() - 0.5) * 0.04));
          bubble.vy = Math.max(-1.6, Math.min(1.6, bubble.vy + (Math.random() - 0.5) * 0.04));
        }
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;

        if (bubble.x - bubble.radius < 0) {
          bubble.x = bubble.radius;
          bubble.vx = Math.abs(bubble.vx);
        }
        if (bubble.x + bubble.radius > state.width) {
          bubble.x = state.width - bubble.radius;
          bubble.vx = -Math.abs(bubble.vx);
        }
        if (bubble.y - bubble.radius < 0) {
          bubble.y = bubble.radius;
          bubble.vy = Math.abs(bubble.vy);
        }
        if (bubble.y + bubble.radius > state.height) {
          bubble.y = state.height - bubble.radius;
          bubble.vy = -Math.abs(bubble.vy);
        }
      }

      for (let i = 0; i < bubbles.length; i += 1) {
        for (let j = i + 1; j < bubbles.length; j += 1) {
          const a = bubbles[i];
          const b = bubbles[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = a.radius + b.radius;
          if (dist > 0 && dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            const total = a.radius + b.radius;
            const pushA = overlap * (b.radius / total);
            const pushB = overlap * (a.radius / total);
            a.x -= nx * pushA;
            a.y -= ny * pushA;
            b.x += nx * pushB;
            b.y += ny * pushB;
            a.vx -= nx * 0.05;
            a.vy -= ny * 0.05;
            b.vx += nx * 0.05;
            b.vy += ny * 0.05;
          }
        }
      }

      bubbles.forEach((bubble, index) => {
        const el = bubbleRefs.current[index];
        if (!el) return;
        el.style.transform = `translate3d(${bubble.x - bubble.radius}px, ${bubble.y - bubble.radius}px, 0)`;
        el.style.width = `${bubble.radius * 2}px`;
        el.style.height = `${bubble.radius * 2}px`;
        el.style.fontSize = `${Math.max(11, bubble.radius * 0.36)}px`;
        el.style.zIndex = bubble.tag === hoveredTag ? 8 : 1;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const onResize = () => {
      const state = stateRef.current;
      if (!state) return;
      state.width = container.getBoundingClientRect().width || state.width;
      for (const bubble of state.bubbles) {
        bubble.x = Math.max(bubble.radius, Math.min(bubble.x, state.width - bubble.radius));
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [tags, height]);

  return (
    <div className="tag-bubble-field" ref={containerRef} style={{ height }} aria-label="热门标签气泡">
      {tags.map((tag, index) => (
        <Link
          key={tag}
          className="tag-bubble"
          to={`/search?q=${encodeURIComponent(tag)}`}
          ref={(el) => {
            bubbleRefs.current[index] = el;
          }}
          onMouseEnter={() => {
            hoverRef.current = tag;
          }}
          onMouseLeave={() => {
            if (hoverRef.current === tag) hoverRef.current = null;
          }}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
