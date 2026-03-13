import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = 'Infinity AI - The Next Evolution of Intelligence',
  description = 'Experience the future of AI with Infinity AI. Access powerful models, generate creative content, and solve complex problems with our intuitive interface.',
  canonical = 'https://infinity-ai-xi.vercel.app',
  ogType = 'website',
  ogImage = 'https://infinity-ai-xi.vercel.app/og-image.png'
}) => {
  const fullTitle = title === 'Infinity AI' ? title : `${title} | Infinity AI`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#1a1a1a" />
    </Helmet>
  );
};

export default SEO;
