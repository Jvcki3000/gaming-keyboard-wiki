import { useEffect, useRef, useState } from 'react';

export default function ScrollRevealHero({ hero, children, className = '' }) {
  const [raised, setRaised] = useState(false);
  const raisedRef = useRef(false);
  const suppressRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      if (suppressRef.current) {
        suppressRef.current = false;
        return;
      }
      if (!raisedRef.current && y > vh * 0.42) {
        raisedRef.current = true;
        setRaised(true);
        suppressRef.current = true;
        window.scrollTo({ top: 0, behavior: 'instant' });
        window.setTimeout(() => {
          suppressRef.current = false;
        }, 80);
      } else if (raisedRef.current && y < vh * 0.02) {
        raisedRef.current = false;
        setRaised(false);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <div
        className={`reveal-hero${raised ? ' is-raised' : ''}${className ? ` ${className}` : ''}`}
        aria-hidden={raised || undefined}
      >
        {hero}
      </div>
      <div className={`reveal-content${raised ? ' is-revealed' : ''}`}>{children}</div>
    </>
  );
}
