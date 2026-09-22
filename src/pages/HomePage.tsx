import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { ProductGrid } from '../components/ProductGrid';
import { OneTouchFlow } from '../components/OneTouchFlow';
import { DigitalProfilePreviewCard } from '../components/DigitalProfilePreviewCard';
import { BusinessCategoryCard } from '../components/BusinessCategoryCard';
import { Advantages } from '../components/Advantages';
import { FAQSection } from '../components/FAQSection';
import { CTASection } from '../components/CTASection';
import { ContactForm } from '../components/ContactForm';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { PRODUCTS, BUSINESS_CATEGORIES } from '../data/mockData';
import { Product } from '../types';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenDemo: (slug?: string) => void;
}

export function HomePage({ onNavigate, onOpenDemo }: HomePageProps) {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedProductInterest, setSelectedProductInterest] = useState<string>('Tap Card');

  const handleOpenContact = (productInterest = 'Tap Card') => {
    setSelectedProductInterest(productInterest);
    setContactModalOpen(true);
  };

  const handleSelectProduct = (product: Product) => {
    handleOpenContact(product.name);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Dynamic SEO Tags */}
      <SEOHead
        title="TapRD | Soluciones NFC para negocios"
        description="Tarjetas NFC, placas NFC y perfiles digitales para conectar negocios con sus clientes en República Dominicana."
      />

      {/* Header / Navbar */}
      <Navbar
        currentPath="/"
        onNavigate={onNavigate}
        onOpenContact={() => handleOpenContact()}
      />

      <main className="flex-1">
        {/* 1. Hero */}
        <Hero
          onViewProducts={() => onNavigate('/productos')}
          onOpenQuote={() => handleOpenContact()}
          onOpenDemo={onOpenDemo}
        />

        {/* 2. ¿Cómo Funciona? */}
        <HowItWorks onSelectProduct={() => onNavigate('/productos')} />

        {/* 3. Nuestros Productos */}
        <ProductGrid
          products={PRODUCTS}
          onSelectProduct={handleSelectProduct}
          onViewDetails={(prod) => onNavigate(prod.route)}
        />

        {/* 4. Un Solo Toque */}
        <OneTouchFlow />

        {/* 5. Perfil Digital (Demo Barbería Wilson) */}
        <DigitalProfilePreviewCard onOpenFullDemo={onOpenDemo} />

        {/* 6. Para Todo Tipo de Negocio */}
        <BusinessCategoryCard
          categories={BUSINESS_CATEGORIES}
          onOpenDemo={onOpenDemo}
        />

        {/* 7. Ventajas */}
        <Advantages />

        {/* 8. Preguntas Frecuentes */}
        <FAQSection onContactSupport={() => handleOpenContact('Asesoría personalizada')} />

        {/* 9. Standalone Contact Form Section */}
        <ContactForm initialProductInterest={selectedProductInterest} />

        {/* 10. Call to Action Banner */}
        <CTASection onOpenContact={() => handleOpenContact()} />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={onNavigate}
        onOpenContact={() => handleOpenContact()}
      />

      {/* Modal Contact Form Triggered by Top Navbar or Buttons */}
      {contactModalOpen && (
        <ContactForm
          initialProductInterest={selectedProductInterest}
          isModal={true}
          onClose={() => setContactModalOpen(false)}
        />
      )}
    </div>
  );
}
