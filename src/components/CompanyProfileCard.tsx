import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  BadgeCheck,
  Briefcase,
  Users,
  Recycle,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Pencil,
  Plus,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Company = Tables<"company_profiles">;

const TYPE_LABELS: Record<string, string> = {
  private: "Private",
  government: "Government",
  semi_government: "Semi-Government",
  ngo: "NGO / Non-Profit",
  other: "Other",
};

const Row = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-2 border-b border-ink/5 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-cream flex items-center justify-center shrink-0 text-ink">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest font-bold text-ink/60">{label}</p>
      <div className="text-sm font-semibold text-ink-deep break-words">{value || "—"}</div>
    </div>
  </div>
);

const CompanyProfileCard = ({ userId }: { userId: string }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setCompany(data ?? null);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return null;

  if (!company) {
    return (
      <div className="rounded-3xl bg-white border border-ink/10 p-8 text-center">
        <Building2 className="w-10 h-10 mx-auto text-ink/30 mb-3" />
        <h3 className="font-display font-bold text-xl text-ink-deep">Complete your company profile</h3>
        <p className="text-sm text-ink mt-1 max-w-md mx-auto">
          Add your company type, industry, services, materials and location so EcoLink can connect you with
          the right partners.
        </p>
        <Button asChild className="mt-5 bg-ink-deep text-cream hover:bg-ink rounded-xl font-bold gap-2">
          <Link to="/company/register">
            <Plus className="w-4 h-4" /> Register Company
          </Link>
        </Button>
      </div>
    );
  }

  const tags = (items: string[] | null) =>
    items && items.length > 0 ? (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {items.map((s) => (
          <Badge key={s} variant="outline" className="border-ink/20 text-ink font-medium">
            {s}
          </Badge>
        ))}
      </div>
    ) : (
      "—"
    );

  return (
    <div className="rounded-3xl bg-white border border-ink/10 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cream border border-ink/10 overflow-hidden flex items-center justify-center">
            {company.logo_url ? (
              <img src={company.logo_url} alt={`${company.company_name} logo`} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-ink/40" />
            )}
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-ink-deep tracking-tight">
              {company.company_name}
            </h2>
            <p className="text-sm text-ink">
              {TYPE_LABELS[company.company_type] ?? company.company_type}
              {company.industry ? ` · ${company.industry}` : ""}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="border-ink/25 gap-2 rounded-xl font-bold">
          <Link to="/company/register">
            <Pencil className="w-4 h-4" /> Edit Company
          </Link>
        </Button>
      </div>

      {company.description && (
        <p className="text-sm text-ink mb-6 leading-relaxed">{company.description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
        <div>
          <h4 className="font-display font-bold text-ink-deep mb-1">Company &amp; Registration</h4>
          <Row
            icon={<BadgeCheck className="w-4 h-4" />}
            label="Registration"
            value={company.registration_status === "registered" ? "Registered" : "Not Registered"}
          />
          <Row icon={<ShieldCheck className="w-4 h-4" />} label="Registration No." value={company.registration_number} />
          <Row icon={<Briefcase className="w-4 h-4" />} label="Year Established" value={company.year_established} />
          <Row icon={<Users className="w-4 h-4" />} label="Employees" value={company.employee_range} />
          <Row icon={<Users className="w-4 h-4" />} label="Customers / Clients" value={company.customer_count} />
        </div>

        <div>
          <h4 className="font-display font-bold text-ink-deep mb-1">Industry, Services &amp; Materials</h4>
          <Row icon={<Briefcase className="w-4 h-4" />} label="Industry" value={company.industry} />
          <Row icon={<Briefcase className="w-4 h-4" />} label="Services" value={tags(company.services)} />
          <Row icon={<Recycle className="w-4 h-4" />} label="Materials / Resources" value={tags(company.materials_handled)} />
        </div>

        <div>
          <h4 className="font-display font-bold text-ink-deep mb-1">Location &amp; Contact</h4>
          <Row
            icon={<MapPin className="w-4 h-4" />}
            label="Location"
            value={[company.zone, company.city, company.country].filter(Boolean).join(", ")}
          />
          <Row
            icon={<MapPin className="w-4 h-4" />}
            label="Address"
            value={[company.address, company.postal_code].filter(Boolean).join(" · ")}
          />
          <Row icon={<Mail className="w-4 h-4" />} label="Email" value={company.company_email} />
          <Row icon={<Phone className="w-4 h-4" />} label="Phone" value={company.phone} />
          <Row
            icon={<Globe className="w-4 h-4" />}
            label="Website"
            value={
              company.website ? (
                <a href={company.website} target="_blank" rel="noreferrer" className="underline">
                  {company.website}
                </a>
              ) : null
            }
          />
          <Row
            icon={<ShieldCheck className="w-4 h-4" />}
            label="Verification"
            value={company.registration_doc_path ? "Document on file (private)" : "No document uploaded"}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileCard;
