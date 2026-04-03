'use client';

import { useState, useEffect, useRef } from 'react';

interface FloatingBarProps {
  children: React.ReactNode;
  alwaysVisible?: boolean;
  mobileOnly?: boolean;
}

export function FloatingBar({ children, alwaysVisible = false, mobileOnly = false }: FloatingBarProps) {
  const [visible, setVisible] = useState(alwaysVisible);
  const footerVisible = useRef(false);
  const scrolledPast = useRef(alwaysVisible);

  useEffect(() => {
    const footer = document.querySelector('.catalog-footer');
    if (!footer) return;

    const update = () => {
      setVisible(scrolledPast.current && !footerVisible.current);
    };

    const footerObs = new IntersectionObserver(([e]) => {
      footerVisible.current = e.isIntersecting;
      update();
    }, { threshold: 0 });

    footerObs.observe(footer);

    if (!alwaysVisible) {
      const scrollHandler = () => {
        scrolledPast.current = window.scrollY > 200;
        update();
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });
      scrollHandler();
      return () => {
        footerObs.disconnect();
        window.removeEventListener('scroll', scrollHandler);
      };
    }

    return () => { footerObs.disconnect(); };
  }, [alwaysVisible]);

  return (
    <div className={`floating-bar${visible ? ' visible' : ''}${mobileOnly ? ' mobile-only-bar' : ''}`}>
      <div className="floating-bar-inner">
        {children}
      </div>
    </div>
  );
}
