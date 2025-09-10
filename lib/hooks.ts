import { useEffect } from 'react';

const updateMetaTag = (selector: string, attribute: string, content: string) => {
    const element = document.querySelector(selector) as HTMLMetaElement | null;
    if (element) {
        element.setAttribute(attribute, content);
    }
};

export const usePageMetadata = (title?: string, description?: string, keywords?: string) => {
  useEffect(() => {
    if (title) {
      document.title = title;
      updateMetaTag('meta[property="og:title"]', 'content', title);
      updateMetaTag('meta[property="twitter:title"]', 'content', title);
    }
    if (description) {
      updateMetaTag('meta[name="description"]', 'content', description);
      updateMetaTag('meta[property="og:description"]', 'content', description);
      updateMetaTag('meta[property="twitter:description"]', 'content', description);
    }
    if (keywords) {
         updateMetaTag('meta[name="keywords"]', 'content', keywords);
    }
    // Always update the URL to the current page
    updateMetaTag('meta[property="og:url"]', 'content', window.location.href);
  }, [title, description, keywords]);
};
