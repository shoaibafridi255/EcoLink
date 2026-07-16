import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSignedMaterialUrl } from "@/lib/materialImage";

interface DBMaterial {
  id: string;
  title: string;
  category: string;
  quantity: string | null;
  location: string | null;
  price_type: string;
  price: number | null;
  images: string[] | null;
  image_url: string | null;
  created_at: string;
}

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ListingCard = ({ listing, index }: { listing: DBMaterial; index: number }) => {
  const rawImage = listing.images?.[0] || listing.image_url;
  const signed = useSignedMaterialUrl(rawImage);
  const image = signed || "/placeholder.svg";
  const pricingLabel = listing.price_type === "free" ? "Free" : listing.price_type === "fixed" ? `$${listing.price}` : "Negotiable";
  const catLabel = listing.category.charAt(0).toUpperCase() + listing.category.slice(1);
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
          src={image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge className={categoryColors[catLabel] || "bg-muted text-muted-foreground"}>
            {catLabel}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={pricingColors[listing.price_type === "free" ? "Free" : listing.price_type === "fixed" ? "Fixed" : "Negotiable"]}>
            {pricingLabel}
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
            <span>{listing.quantity || "—"}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{listing.location || "—"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{timeAgo(listing.created_at)}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary" asChild>
            <Link to={`/materials/${listing.id}`}>
            View Details
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedListings = ({ limit = 6, query, category, priceType }: { limit?: number; query?: string; category?: string; priceType?: string }) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<DBMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let q = supabase
        .from("materials")
        .select("id, title, category, quantity, location, price_type, price, images, image_url, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (query) q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`);
      if (category) q = q.eq("category", category);
      if (priceType) q = q.eq("price_type", priceType);

      const { data } = await q;
      setListings(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [limit, query, category, priceType]);

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

        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading materials…</p>
        ) : listings.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No materials found. Be the first to list one!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {listings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        )}

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
