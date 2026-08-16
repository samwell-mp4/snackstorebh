import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SeoHead = ({ title, description, url, imageUrl, schemaType, productData, faqs }) => {
  const siteUrl = 'https://snackstorebh.com.br';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = imageUrl ? `${siteUrl}${imageUrl}` : `${siteUrl}/favicon.jpg`;

  let schemas = [];

  if (schemaType === 'Product' && productData) {
    schemas.push({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": productData.name,
      "image": `${siteUrl}${productData.image}`,
      "description": productData.description,
      "sku": productData.code,
      "brand": {
        "@type": "Brand",
        "name": productData.brand
      },
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

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={schemaType === 'Product' ? 'product' : 'website'} />
      
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
