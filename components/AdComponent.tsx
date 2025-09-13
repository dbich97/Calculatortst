import React, { useEffect } from 'react';

const AdComponent: React.FC = () => {
  useEffect(() => {
    try {
      // Ensure adsbygoogle is defined on window, and if not, initialize it.
      const adsbygoogle = (window as any).adsbygoogle || [];
      // Push an ad request to the queue.
      adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <section className="my-8 flex justify-center no-print" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '300px', height: '250px' }}
        data-ad-client="ca-pub-7009948592297613"
        data-ad-slot="2338052368"
      ></ins>
    </section>
  );
};

export default AdComponent;
