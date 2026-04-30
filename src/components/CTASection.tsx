import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, TrendingDown, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const benefits = [
  {
    icon: TrendingDown,
    title: "Reduce Disposal Costs",
    description: "Turn waste expenses into revenue streams",
  },
  {
    icon: Users,
    title: "Build Local Networks",
    description: "Connect with nearby businesses and artisans",
  },
  {
    icon: Leaf,
    title: "Sustainable Impact",
    description: "Lower carbon footprint through local exchange",
  },
];

const CTASection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-95" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Join the{" "}
              <span className="text-secondary">Circular Economy</span>?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg">
              Whether you're looking to reduce waste disposal costs or find
              affordable raw materials, EcoLink connects you with local
              opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="xl"
                onClick={() => navigate(user ? "/browse" : "/auth?mode=signup")}
                className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
              >
                List Your Materials
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => navigate("/browse")}
                className="border-2 border-white text-white bg-transparent hover:bg-white/10"
              >
                Find Resources
              </Button>
            </div>
          </motion.div>

          {/* Right Content - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-lg mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 text-sm">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
