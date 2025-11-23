import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = "Marketing, který zaujme a drží. Tisk na míru pro živnostníky i korporace.",
  image = "https://i.imgur.com/YeFWk8H.png",
  url = "https://magnetify.cz",
  type = "website"
}) => {
  const fullTitle = `${title} | Magnetify.cz`;

  useEffect(() => {
    // Standard Metadata
    document.title = fullTitle;
    
    const setMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('description', description);
    
    // Open Graph
    setMeta('og:type', type, 'property');
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:url', url, 'property');

    // Twitter
    setMeta('twitter:card', 'summary_large_image', 'property');
    setMeta('twitter:title', fullTitle, 'property');
    setMeta('twitter:description', description, 'property');
    setMeta('twitter:image', image, 'property');

  }, [fullTitle, description, image, url, type]);

  return null;
};
