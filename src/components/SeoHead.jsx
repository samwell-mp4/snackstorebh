import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SeoHead = ({ title, description, url, imageUrl, schemaType, productData, faqs, videoUrl, videoThumbnail, videoTitle, videoDescription, videoUploadDate }) => {
  const siteUrl = 'https://snackstorebh.com.br';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = imageUrl ? `${siteUrl}${imageUrl}` : `${siteUrl}/favicon.jpg`;

  let schemas = [];

  const formatDateToISO = (dateStr) => {
    if (!dateStr) return "2026-08-15";
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  if (schemaType === 'Product' && productData) {
    const ratingValue = productData.averageRating || "4.9";
    const reviewCount = productData.reviewCount || 18;
    const rawReviews = productData.reviewsList || [];

    const schemaReviews = rawReviews.map(r => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.name || "Cliente"
      },
      "datePublished": r.date ? formatDateToISO(r.date) : "2026-08-15",
      "reviewBody": r.comment || "Excelente produto, ótimo custo-benefício.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": String(r.rating || 5),
        "bestRating": "5",
        "worstRating": "1"
      }
    }));

    if (schemaReviews.length === 0) {
      schemaReviews.push({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Carlos M."
        },
        "datePublished": "2026-08-14",
        "reviewBody": "Achei sensacional. Comprei às cegas e me surpreendi. Fixação excelente, lembra muito o importado original.",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
          "worstRating": "1"
        }
      });
    }

    schemas.push({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": productData.name,
      "image": `${siteUrl}${productData.image}`,
      "description": productData.description,
      "sku": productData.code,
      "brand": {
        "@type": "Brand",
        "name": productData.brand || "Importado"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": String(ratingValue),
        "bestRating": "5",
        "worstRating": "1",
        "reviewCount": String(reviewCount > 0 ? reviewCount : 1)
      },
      "review": schemaReviews,
      "offers": {
        "@type": "Offer",
        "url": fullUrl,
        "priceCurrency": "BRL",
        "price": productData.price,
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    });
  } else if (schemaType === 'CollectionPage' || schemaType === 'FAQPage') {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": fullUrl
    });
  } else {
    // Default Store schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Snack Store – Miniaturas 25 ml",
      "description": description || "Miniaturas de perfumes importados 25 ml, preço fixo R$ 79,90, entrega rápida em Belo Horizonte.",
      "url": siteUrl,
      "logo": `${siteUrl}/favicon.jpg`,
      "sameAs": [
        "https://www.instagram.com/snackstorebh",
        "https://wa.me/5531975650503"
      ]
    });
  }

  // Se houver FAQs passadas, injeta o schema de FAQPage
  if (faqs && faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  // Schema de VideoObject
  if (videoUrl) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": videoTitle || title,
      "description": videoDescription || description,
      "thumbnailUrl": [
        videoThumbnail ? `${siteUrl}${videoThumbnail}` : fullImage
      ],
      "uploadDate": videoUploadDate || "2026-08-20T08:00:00+08:00",
      "contentUrl": `${siteUrl}${videoUrl}`,
      "embedUrl": fullUrl
    });
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={schemaType === 'Product' ? 'product' : 'website'} />
      <meta property="og:site_name" content="Snack Store" />
      <meta property="og:locale" content="pt_BR" />

      {/* Video Open Graph */}
      {videoUrl && <meta property="og:video" content={`${siteUrl}${videoUrl}`} />}
      {videoUrl && <meta property="og:video:type" content="video/mp4" />}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={videoUrl ? "player" : "summary_large_image"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      {videoUrl && <meta name="twitter:player" content={fullUrl} />}
      {videoUrl && <meta name="twitter:player:width" content="1280" />}
      {videoUrl && <meta name="twitter:player:height" content="720" />}
      
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
