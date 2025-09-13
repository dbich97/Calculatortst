import React, { useEffect } from 'react';

interface SideAdComponentProps {
  slotId: string;
  position: 'left' | 'right';
}

const SideAdComponent: React.FC<SideAdComponentProps> = ({ slotId, position }) => {
  useEffect(() => {
    try {
      // Push an ad request to the AdSense queue.
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error in SideAdComponent:', e);
    }
  }, [slotId]); // Re-run effect if slotId changes

  const positionClasses = position === 'left' ? 'left-4' : 'right-4';

  return (
    <div className={`hidden xl:block fixed top-24 ${positionClasses} z-10 no-print`} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '160px', height: '600px' }}
        data-ad-client="ca-pub-7009948592297613"
        data-ad-slot={slotId}
      ></ins>
    </div>
  );
};

export default SideAdComponent;
