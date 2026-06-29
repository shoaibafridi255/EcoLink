import { motion } from "framer-motion";
import { UserPlus, Package, MessageSquare, Truck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register Your Business",
    description:
      "Create an account as a Lister or Seeker. Add your company details and location to connect with nearby businesses.",
    color: "bg-primary",
  },
  {
    icon: Package,
    title: "List or Browse Materials",
    description:
      "Listers post available byproducts with photos and details. Seekers search and filter by category, location, or price.",
    color: "bg-accent",
  },
  {
    icon: MessageSquare,
    title: "Connect & Negotiate",
    description:
      "Use our secure in-app messaging to discuss material quality, quantities, and pricing with interested parties.",
    color: "bg-secondary",
  },
  {
    icon: Truck,
    title: "Complete the Exchange",
    description:
      "Arrange local pickup or delivery. Finalize the deal and contribute to your local circular economy.",
    color: "bg-eco-earth",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          {/* <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How <span className="text-gradient-eco">EcoLink</span> Works
          </h2> */}
          <p className="text-muted-foreground text-lg">
            A simple four-step process to transform your waste into valuable
            resources for others.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="text-center">
                {/* Step Number */}
                <div className="relative inline-block mb-6">
                  <div
                    className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center shadow-eco mx-auto`}
                  >
                    <step.icon className="w-9 h-9 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-card border-2 border-border rounded-full flex items-center justify-center text-sm font-bold text-foreground shadow-sm">
                    {index + 1}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
