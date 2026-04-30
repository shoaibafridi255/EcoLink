import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Leaf, Globe2, Users, TrendingUp } from "lucide-react";

const values = [
  { icon: Leaf, title: "Sustainability First", text: "Every transaction diverts waste from landfill and reduces virgin resource extraction." },
  { icon: Globe2, title: "Local Impact", text: "We prioritize hyper-local exchanges to minimize transport emissions." },
  { icon: Users, title: "Community Driven", text: "Our network grows through trust between businesses, makers, and recyclers." },
  { icon: TrendingUp, title: "Economic Resilience", text: "Turning costs into revenue strengthens local industrial ecosystems." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <section className="container mx-auto px-4 py-12 max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold mb-6"
          >
            About <span className="text-gradient-eco">EcoLink</span>
          </motion.h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            EcoLink is a circular-economy marketplace that connects businesses producing industrial
            byproducts with the makers, manufacturers, and recyclers who can put them to use.
            We believe waste is a design flaw — and that local exchange is the fastest route to a
            sustainable industrial future.
          </p>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-card"
              >
                <div className="w-12 h-12 gradient-eco rounded-xl flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{v.title}</h3>
                <p className="text-muted-foreground">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              By 2030, we aim to enable one million tons of industrial byproducts to find a second
              life through local exchange. Every connection on EcoLink is a small step toward
              decoupling economic growth from resource extraction.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div>
                <div className="font-display text-3xl font-bold text-primary">50t</div>
                <div className="text-sm text-muted-foreground">Diverted to date</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-primary">120+</div>
                <div className="text-sm text-muted-foreground">Businesses</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Listings</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;