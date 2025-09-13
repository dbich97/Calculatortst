import React, { useState, useEffect } from 'react';

// A simple hook to get window width
const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
};


const HeaderAdComponent: React.FC = () => {
  const width = useWindowWidth();
  const isMobile = width < 768; // Tailwind's 'md' breakpoint is 768px

  // Using a key on the outer container ensures that React remounts the component
  // when the ad type changes, which helps in triggering the ad script correctly.
  const adKey = isMobile ? 'mobile-ad' : 'desktop-ad';

  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error in HeaderAdComponent:', e);
    }
  }, [adKey]); // Rerun the effect when the ad key changes

  return (
    <section className="my-6 flex justify-center no-print" aria-label="Advertisement" key={adKey}>
      {isMobile ? (
        // Mobile Ad: 320x50
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '320px', height: '50px' }}
          data-ad-client="ca-pub-7009948592297613"
          data-ad-slot="3840026596"
        ></ins>
      ) : (
        // Desktop Ad: 728x90
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '728px', height: '90px' }}
          data-ad-client="ca-pub-7009948592297613"
          data-ad-slot="8264560218"
        ></ins>
      )}
    </section>
  );
};

export default HeaderAdComponent;
