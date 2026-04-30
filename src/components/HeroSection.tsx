import { Button } from "@/components/ui/button";
import { ArrowRight, Recycle, TrendingUp, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Recycle className="w-4 h-4" />
              <span>Circular Economy Platform</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Turn Industrial{" "}
              <span className="text-gradient-eco">Waste</span> into{" "}
              <span className="text-gradient-eco">Resources</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Connect with local businesses to exchange industrial byproducts.
              Reduce disposal costs, find affordable materials, and build a
              sustainable local economy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate(user ? "/browse" : "/auth?mode=signup")}
              >
                Start Listing
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="hero-outline"
                size="xl"
                onClick={() => navigate("/browse")}
              >
                Browse Materials
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center sm:text-left"
              >
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  500+
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Listings
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center sm:text-left"
              >
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  120+
                </div>
                <div className="text-sm text-muted-foreground">
                  Local Businesses
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center sm:text-left"
              >
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  50 tons
                </div>
                <div className="text-sm text-muted-foreground">
                  Waste Diverted
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Content - Visual Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 gradient-eco rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">
                      Metal Scrap Available
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Posted 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="aspect-video rounded-xl bg-muted mb-4 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop"
                    alt="Metal scraps"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Industrial Zone A</span>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    200 kg
                  </span>
                </div>
              </div>

              {/* Floating Card 1 */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -left-8 top-1/4 bg-card rounded-xl shadow-hover p-4 border border-border animate-float"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Recycle className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Wood Offcuts
                    </div>
                    <div className="text-xs text-muted-foreground">Free</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 2 */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -right-4 bottom-1/4 bg-card rounded-xl shadow-hover p-4 border border-border"
                style={{ animationDelay: "2s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-warm rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      New Match!
                    </div>
                    <div className="text-xs text-muted-foreground">
                      3 seekers interested
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
