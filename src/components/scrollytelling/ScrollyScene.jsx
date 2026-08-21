import React from 'react';

const ScrollyScene = React.forwardRef(({ 
  desktop, 
  mobile, 
  alt = "Campanha Snack Store", 
  isFirst = false 
}, ref) => {
  return (
    <div className="scrolly-scene" ref={ref}>
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={mobile}
        />
        <img
          src={desktop}
          alt={alt}
          loading={isFirst ? "eager" : "lazy"}
          fetchPriority={isFirst ? "high" : "auto"}
          decoding={isFirst ? "sync" : "async"}
        />
      </picture>
      <div className="scrolly-overlay"></div>
    </div>
  );
});

ScrollyScene.displayName = 'ScrollyScene';

export default ScrollyScene;
