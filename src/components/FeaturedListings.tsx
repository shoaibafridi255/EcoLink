import { motion } from "framer-motion";
import { MapPin, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Listing {
  id: string;
  title: string;
  category: string;
  quantity: string;
  unit: string;
  location: string;
  postedAt: string;
  pricingModel: "Free" | "Negotiable" | "Fixed";
  price?: number;
  image: string;
}

const mockListings: Listing[] = [
  {
    id: "1",
    title: "Aluminum Scrap Metal",
    category: "Metals",
    quantity: "150",
    unit: "kg",
    location: "Industrial Zone B",
    postedAt: "3 hours ago",
    pricingModel: "Negotiable",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "Hardwood Offcuts",
    category: "Wood",
    quantity: "50",
    unit: "pieces",
    location: "Furniture District",
    postedAt: "5 hours ago",
    pricingModel: "Free",
    image:
      "https://images.unsplash.com/photo-1520052203542-d3095f1b6cf0?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "Fabric Remnants - Cotton",
    category: "Textiles",
    quantity: "30",
    unit: "kg",
    location: "Textile Park",
    postedAt: "1 day ago",
    pricingModel: "Fixed",
    price: 25,
    image:
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    title: "Plastic Shavings - HDPE",
    category: "Plastics",
    quantity: "200",
    unit: "kg",
    location: "Manufacturing Hub",
    postedAt: "2 days ago",
    pricingModel: "Negotiable",
    image:
      "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    title: "Cardboard Boxes - Clean",
    category: "Paper",
    quantity: "100",
    unit: "pieces",
    location: "Logistics Center",
    postedAt: "6 hours ago",
    pricingModel: "Free",
    image:
      "https://images.unsplash.com/photo-1607166452427-7e4477e6ae75?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    title: "Glass Cullet - Clear",
    category: "Glass",
    quantity: "80",
    unit: "kg",
    location: "Industrial Zone A",
    postedAt: "4 hours ago",
    pricingModel: "Fixed",
    price: 15,
    image:
      "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&h=300&fit=crop",
  },
];

const categoryColors: Record<string, string> = {
  Metals: "bg-eco-sky/20 text-eco-sky border-eco-sky/30",
  Wood: "bg-eco-earth/20 text-eco-earth border-eco-earth/30",
  Textiles: "bg-secondary/50 text-secondary-foreground border-secondary",
  Plastics: "bg-accent/20 text-accent border-accent/30",
  Paper: "bg-muted text-muted-foreground border-border",
  Glass: "bg-primary/10 text-primary border-primary/30",
};

const pricingColors: Record<string, string> = {
  Free: "bg-primary text-primary-foreground",
  Negotiable: "bg-secondary text-secondary-foreground",
  Fixed: "bg-accent text-accent-foreground",
};

const ListingCard = ({ listing, index }: { listing: Listing; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge className={categoryColors[listing.category] || ""}>
            {listing.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={pricingColors[listing.pricingModel]}>
            {listing.pricingModel === "Fixed"
              ? `$${listing.price}`
              : listing.pricingModel}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            <span>
              {listing.quantity} {listing.unit}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{listing.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{listing.postedAt}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedListings = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured <span className="text-gradient-eco">Materials</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover available industrial byproducts from local businesses ready
            for exchange.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {mockListings.map((listing, index) => (
            <ListingCard key={listing.id} listing={listing} index={index} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="eco" size="lg" onClick={() => navigate("/browse")}>
            View All Listings
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
