import { usePageMeta } from "@/hooks/usePageMeta";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedListings from "@/components/FeaturedListings";
import RecommendedSection from "@/components/RecommendedSection";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  usePageMeta({ title: 'EcoLink — Waste-to-Resource Marketplace', description: 'Turn industrial byproducts into valuable resources. List, discover and trade waste materials with nearby businesses on EcoLink.', path: '/' });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <RecommendedSection />
      <FeaturedListings />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
