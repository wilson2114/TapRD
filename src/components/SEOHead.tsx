import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
}

export function SEOHead({
  title = 'TapRD | Soluciones NFC para negocios',
  description = 'Tarjetas NFC, placas NFC y perfiles digitales para conectar negocios con sus clientes en República Dominicana.'
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update OpenGraph Title & Desc
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}
