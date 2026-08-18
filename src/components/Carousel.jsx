import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Simple horizontal carousel using CSS scroll‑snap.
 * Props:
 *   children – React nodes (product cards) to display.
 *   showArrows – optional boolean to render navigation arrows (default true).
 *   autoPlayInterval – optional number (ms) for auto‑scroll. Set to 0 to disable.
 */
export default function Carousel({ children, showArrows = true, autoPlayInterval = 0 }) {
  const containerRef = useRef(null);

  const scrollBy = (offset) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Auto‑play effect (if interval provided)
  React.useEffect(() => {
    if (autoPlayInterval > 0) {
      const timer = setInterval(() => {
        if (containerRef.current) {
          const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;
          const maxScroll = scrollWidth - clientWidth;
          // Loop back to start when reaching the end
          if (scrollLeft >= maxScroll - 1) {
            containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollBy(clientWidth * 0.8); // scroll by 80% of visible width
          }
        }
      }, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [autoPlayInterval]);

  return (
    <div style={{ position: 'relative' }}>
      {showArrows && (
        <>
          <button
            onClick={() => scrollBy(-200)}
            style={arrowStyle('left')}
            aria-label="Previous"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => scrollBy(200)}
            style={arrowStyle('right')}
            aria-label="Next"
          >
            <ArrowRight size={20} />
          </button>
        </>
      )}
      <div
        ref={containerRef}
        style={containerStyle}
      >
        {React.Children.map(children, (child) => (
          <div style={itemStyle}>{child}</div>
        ))}
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  gap: '16px',
  paddingBottom: '8px',
  // Hide native scrollbar while keeping scrollability
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
};

const itemStyle = {
  scrollSnapAlign: 'start',
  flex: '0 0 auto',
  minWidth: '200px',
};

function arrowStyle(position) {
  return {
    position: 'absolute',
    top: '50%',
    [position]: '8px',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.4)',
    border: 'none',
    borderRadius: '50%',
    color: '#fff',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };
}
