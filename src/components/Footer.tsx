import { Link } from "react-router-dom";
import { Recycle, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 gradient-eco rounded-lg flex items-center justify-center">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-background">
                EcoLink
              </span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed mb-4">
              A hyper-local industrial waste-to-resource exchange platform
              fostering circular economy principles.
            </p>
            <div className="flex items-center gap-2 text-sm text-background/60">
              <MapPin className="w-4 h-4" />
              <span>Peshawar, Pakistan</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/browse"
                  className="text-background/60 hover:text-background transition-colors text-sm"
                >
                  Browse Materials
                </Link>
              </li>
              <li>
                <Link
                  to="/list"
                  className="text-background/60 hover:text-background transition-colors text-sm"
                >
                  Post a Listing
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-background/60 hover:text-background transition-colors text-sm"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-background/60 hover:text-background transition-colors text-sm"
                >
                  About EcoLink
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">
              Categories
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/browse?category=metals"
                  className="text-background/60 hover:text-background transition-colors text-sm"
                >
                  Metals & Scrap
                </Link>
              </li>
              <li>
                <Link
                  to="/browse?category=wood"
                  className="text-background/60 hover:text-background transition-colors text-sm"
                >
                  Wood & Timber
                </Link>
              </li>
              <li>
                <Link
                  to="/browse?category=textiles"
                  className="text-background/60 hover:text-background transition-colors text-sm"
                >
                  Textiles & Fabrics
                </Link>
              </li>
              <li>
                <Link
                  to="/browse?category=plastics"
                  className="text-background/60 hover:text-background transition-colors text-sm"
                >
                  Plastics
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@ecolink.pk"
                  className="flex items-center gap-2 text-background/60 hover:text-background transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  shoaibafridi150@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+923001234567"
                  className="flex items-center gap-2 text-background/60 hover:text-background transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  +92 313 9293487
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © 2024 EcoLink. All rights reserved By EcoLink.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
