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
import { ScrollReveal } from '../components/ScrollReveal';
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
    <div className="relative min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200 overflow-x-clip">
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

      <main className="relative z-10 flex-1">
        {/* 1. Hero */}
        <div className="animate-hero-enter">
          <Hero
            onViewProducts={() => onNavigate('/productos')}
            onOpenQuote={() => handleOpenContact()}
            onOpenDemo={onOpenDemo}
          />
        </div>

        {/* 2. ¿Cómo Funciona? */}
        <ScrollReveal delayMs={40}>
          <HowItWorks onSelectProduct={() => onNavigate('/productos')} />
        </ScrollReveal>

        {/* 3. Nuestros Productos */}
        <ScrollReveal delayMs={60}>
          <ProductGrid
            products={PRODUCTS}
            onSelectProduct={handleSelectProduct}
            onViewDetails={(prod) => onNavigate(prod.route)}
          />
        </ScrollReveal>

        {/* 4. Un Solo Toque */}
        <ScrollReveal delayMs={60}>
          <OneTouchFlow />
        </ScrollReveal>

        {/* 5. Perfil Digital (Demo Barbería Wilson) */}
        <ScrollReveal delayMs={60}>
          <DigitalProfilePreviewCard onOpenFullDemo={onOpenDemo} />
        </ScrollReveal>

        {/* 6. Para Todo Tipo de Negocio */}
        <ScrollReveal delayMs={60}>
          <BusinessCategoryCard
            categories={BUSINESS_CATEGORIES}
            onOpenDemo={onOpenDemo}
          />
        </ScrollReveal>

        {/* 7. Ventajas */}
        <ScrollReveal delayMs={60}>
          <Advantages />
        </ScrollReveal>

        {/* 8. Preguntas Frecuentes */}
        <ScrollReveal delayMs={60}>
          <FAQSection onContactSupport={() => handleOpenContact('Asesoría personalizada')} />
        </ScrollReveal>

        {/* 9. Standalone Contact Form Section */}
        <ScrollReveal delayMs={60}>
          <ContactForm initialProductInterest={selectedProductInterest} />
        </ScrollReveal>

        {/* 10. Call to Action Banner */}
        <ScrollReveal delayMs={60}>
          <CTASection onOpenContact={() => handleOpenContact()} />
        </ScrollReveal>
      </main>

      {/* Footer */}
      <ScrollReveal once>
        <Footer
          onNavigate={onNavigate}
          onOpenContact={() => handleOpenContact()}
        />
      </ScrollReveal>

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
