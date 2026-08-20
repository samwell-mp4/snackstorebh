import React, { useState, useRef } from 'react';

/**
 * Horizontal scroll carousel with clickable pagination dots.
 * Props:
 *   children – product cards to display.
 *   itemWidth – width in px of each item wrapper (default 250).
 *   gap – gap in px between items (default 16).
 *   pageSize – how many items each dot represents (default 4).
 *   containerRef – optional ref to the scroll container (for external arrows).
 *   showDots – whether to render the dots (default true).
 */
export default function ScrollCarousel({ children, itemWidth = 250, gap = 16, pageSize = 4, containerRef, showDots = true }) {
  const items = React.Children.toArray(children);
  const totalDots = Math.max(1, Math.ceil(items.length / pageSize));
  const [page, setPage] = useState(0);
  const internalRef = useRef(null);
  const ref = containerRef || internalRef;
  const step = itemWidth + gap;

  const onScroll = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollLeft / (step * pageSize));
    setPage(Math.min(totalDots - 1, Math.max(0, idx)));
  };

  const jump = (index) => {
    if (ref.current) {
      ref.current.scrollTo({ left: index * step * pageSize, behavior: 'smooth' });
      setPage(index);
    }
  };

  return (
    <div>
      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          display: 'flex', gap: `${gap}px`, overflowX: 'auto', padding: '4px 4px 12px 4px',
          scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch'
        }}
      >
        {items.map((child, i) => (
          <div key={i} style={{ flex: '0 0 auto', width: `${itemWidth}px`, scrollSnapAlign: 'start' }}>{child}</div>
        ))}
      </div>

      {showDots && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => jump(i)}
              aria-label={`Ir para página ${i + 1}`}
              style={{
                width: i === page ? '26px' : '8px', height: '8px', borderRadius: '99px', border: 'none',
                cursor: 'pointer', padding: 0,
                backgroundColor: i === page ? '#000000' : '#d0d0d0', transition: 'all 0.2s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}