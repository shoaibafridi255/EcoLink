import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const listerSteps = [
  "Sign up as a Lister and verify your business",
  "Photograph and describe your industrial byproducts",
  "Set quantity, location, and pricing (or list for free)",
  "Receive inquiries from nearby Seekers",
  "Negotiate, arrange pickup, and complete the exchange",
];

const seekerSteps = [
  "Sign up as a Seeker and tell us what you're looking for",
  "Browse listings filtered by category, distance, and price",
  "Message Listers directly to ask questions",
  "Reserve materials and coordinate pickup or delivery",
  "Track your sourcing impact in your dashboard",
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <section className="container mx-auto px-4 py-12 text-center max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold mb-6"
          >
            How <span className="text-gradient-eco">EcoLink</span> Works
          </motion.h1>
          <p className="text-muted-foreground text-lg">
            A transparent, four-step process designed for both businesses with
            surplus materials and those seeking affordable resources.
          </p>
        </section>

        <HowItWorks />

        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold mb-6">
                For Listers
              </h2>
              <ul className="space-y-4">
                {listerSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ul>
              <Button variant="eco" className="mt-6 w-full" asChild>
                <Link to="/auth?mode=signup">
                  Become a Lister <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold mb-6">
                For Seekers
              </h2>
              <ul className="space-y-4">
                {seekerSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ul>
              <Button variant="eco" className="mt-6 w-full" asChild>
                <Link to="/auth?mode=signup">
                  Become a Seeker <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
