import { useEffect } from 'react';

export function useSEO({ title, description, keywords, ogImage, canonicalUrl }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | NCC Digital Training Portal`;
    }

    const updateMeta = (name, property, content) => {
      if (!content) return;
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (name) el.setAttribute('name', name);
        if (property) el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', null, description);
    updateMeta('keywords', null, keywords);
    updateMeta(null, 'og:title', title);
    updateMeta(null, 'og:description', description);
    updateMeta(null, 'og:image', ogImage || '/ncc-logo.png');
    updateMeta(null, 'twitter:title', title);
    updateMeta(null, 'twitter:description', description);
    updateMeta(null, 'twitter:image', ogImage || '/ncc-logo.png');

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }
  }, [title, description, keywords, ogImage, canonicalUrl]);
}
