import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturedListings from "@/components/FeaturedListings";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const CATEGORIES = ["metals", "wood", "textiles", "plastics", "paper", "glass", "chemicals", "electronics", "organic", "other"];
const PRICE_TYPES = ["free", "negotiable", "fixed"];

const Browse = () => {
  usePageMeta({ title: 'Browse Materials — EcoLink', description: 'Browse metals, wood, textiles, plastics and more surplus materials listed by local businesses on EcoLink.', path: '/browse' });
  const [params] = useSearchParams();
  const q = params.get("q");
  const [search, setSearch] = useState(q ?? "");
  const [activeSearch, setActiveSearch] = useState(q ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<string>("");

  const handleSearch = () => {
    setActiveSearch(search.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <section className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Browse <span className="text-gradient-eco">Materials</span>
          </h1>
          <p className="text-muted-foreground">
            {activeSearch ? `Showing results for "${activeSearch}"` : "Discover available industrial byproducts from local businesses."}
          </p>

          {/* Search bar */}
          <div className="flex gap-2 mt-6 max-w-xl">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, location…"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="eco" onClick={handleSearch}><Search className="w-4 h-4 mr-2" /> Search</Button>
          </div>

          {/* Filters */}
          <div className="mt-6 space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === "" ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedCategory("")}
                >All</Badge>
                {CATEGORIES.map((c) => (
                  <Badge
                    key={c}
                    variant={selectedCategory === c ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setSelectedCategory(selectedCategory === c ? "" : c)}
                  >{c}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Price Type</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedPrice === "" ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedPrice("")}
                >All</Badge>
                {PRICE_TYPES.map((p) => (
                  <Badge
                    key={p}
                    variant={selectedPrice === p ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setSelectedPrice(selectedPrice === p ? "" : p)}
                  >{p}</Badge>
                ))}
              </div>
            </div>
          </div>
        </section>
        <FeaturedListings limit={50} query={activeSearch || undefined} category={selectedCategory || undefined} priceType={selectedPrice || undefined} />
      </main>
      <Footer />
    </div>
  );
};

export default Browse;