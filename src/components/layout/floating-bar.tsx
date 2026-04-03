'use client';

import { useState, useEffect, useRef } from 'react';

interface FloatingBarProps {
  children: React.ReactNode;
}

export function FloatingBar({ children }: FloatingBarProps) {
  const [visible, setVisible] = useState(true);
  const footerVisible = useRef(false);
  const scrolledPast = useRef(false);

  useEffect(() => {
    const footer = document.querySelector('.catalog-footer');
    if (!footer) return;

    const update = () => {
      setVisible(scrolledPast.current && !footerVisible.current);
    };

    const scrollHandler = () => {
      scrolledPast.current = window.scrollY > 200;
      update();
    };

    const footerObs = new IntersectionObserver(([e]) => {
      footerVisible.current = e.isIntersecting;
      update();
    }, { threshold: 0 });

    footerObs.observe(footer);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();

    return () => {
      footerObs.disconnect();
      window.removeEventListener('scroll', scrollHandler);
    };
  }, []);

  return (
    <div className={`floating-bar${visible ? ' visible' : ''}`}>
      <div className="floating-bar-inner">
        {children}
      </div>
    </div>
  );
}
