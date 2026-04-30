import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Recycle, Search, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const goToBrowse = (q?: string) => {
    setSearchOpen(false);
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 gradient-eco rounded-lg flex items-center justify-center shadow-eco group-hover:shadow-hover transition-shadow duration-300">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Eco<span className="text-gradient-eco">Link</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/browse"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Browse Materials
            </Link>
            <Link
              to="/how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link
              to="/about"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              About
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="w-5 h-5" />
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card">
                  <DropdownMenuLabel className="truncate max-w-[200px]">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/auth")}>Sign In</Button>
                <Button variant="eco" onClick={() => navigate("/auth?mode=signup")}>Get Started</Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-up">
            <div className="flex flex-col gap-4">
              <Link
                to="/browse"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                Browse Materials
              </Link>
              <Link
                to="/how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="/about"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <Button variant="outline" className="w-full" onClick={() => { setIsOpen(false); handleSignOut(); }}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => { setIsOpen(false); navigate("/auth"); }}>
                      Sign In
                    </Button>
                    <Button variant="eco" className="w-full" onClick={() => { setIsOpen(false); navigate("/auth?mode=signup"); }}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search materials, categories, locations..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value;
              if (value.trim()) goToBrowse(value.trim());
            }
          }}
        />
        <CommandList>
          <CommandEmpty>No results found. Press Enter to search browse.</CommandEmpty>
          <CommandGroup heading="Categories">
            <CommandItem onSelect={() => goToBrowse("metals")}>Metals & Scrap</CommandItem>
            <CommandItem onSelect={() => goToBrowse("wood")}>Wood & Timber</CommandItem>
            <CommandItem onSelect={() => goToBrowse("textiles")}>Textiles & Fabrics</CommandItem>
            <CommandItem onSelect={() => goToBrowse("plastics")}>Plastics</CommandItem>
            <CommandItem onSelect={() => goToBrowse("paper")}>Paper & Cardboard</CommandItem>
            <CommandItem onSelect={() => goToBrowse("glass")}>Glass</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Quick Links">
            <CommandItem onSelect={() => { setSearchOpen(false); navigate("/how-it-works"); }}>How It Works</CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); navigate("/about"); }}>About EcoLink</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </nav>
  );
};

export default Navbar;
