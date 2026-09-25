import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Layers,
  MapPin,
  Phone,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImagePlus,
  FileText,
  X,
  Plus,
} from "lucide-react";

/* ─────────────────────────── options ─────────────────────────── */

const COMPANY_TYPES = [
  { value: "private", label: "Private" },
  { value: "government", label: "Government" },
  { value: "semi_government", label: "Semi-Government" },
  { value: "ngo", label: "NGO / Non-Profit" },
  { value: "other", label: "Other" },
];

const REGISTRATION_STATUS = [
  { value: "registered", label: "Registered" },
  { value: "not_registered", label: "Not Registered" },
];

const EMPLOYEE_RANGES = ["1–10", "11–50", "51–100", "101–500", "500+"];

const INDUSTRIES = [
  "Manufacturing",
  "Construction",
  "Agriculture",
  "Textile",
  "Food & Beverage",
  "Recycling",
  "Electronics",
  "Healthcare",
  "Retail",
  "Other",
];

const SERVICE_OPTIONS = [
  "Waste Collection",
  "Recycling",
  "Material Supply",
  "Material Processing",
  "Logistics & Transport",
  "Consulting",
  "Manufacturing",
  "Refurbishment",
  "Composting",
  "Testing & Certification",
];

const MATERIAL_OPTIONS = [
  "Metals",
  "Wood",
  "Textiles",
  "Plastics",
  "Paper",
  "Glass",
  "Chemicals",
  "Electronics",
  "Organic Waste",
  "Rubber",
  "Construction Debris",
];

const COUNTRIES = [
  "Pakistan", "India", "Bangladesh", "China", "United Arab Emirates", "Saudi Arabia",
  "Turkey", "United Kingdom", "United States", "Canada", "Germany", "France",
  "Netherlands", "Spain", "Italy", "Australia", "Malaysia", "Indonesia",
  "South Africa", "Kenya", "Egypt", "Other",
];

const STEPS = [
  { title: "Company Information", icon: Building2 },
  { title: "Company Details", icon: Layers },
  { title: "Location", icon: MapPin },
  { title: "Contact & Verification", icon: Phone },
  { title: "Review", icon: CheckCircle2 },
];

/* ─────────────────────────── helpers ─────────────────────────── */

const urlRe = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;
const phoneRe = /^[+]?[\d\s()-]{7,20}$/;

type FormState = {
  company_name: string;
  company_type: string;
  registration_status: string;
  registration_number: string;
  year_established: string;
  employee_range: string;
  customer_count: string;
  industry: string;
  services: string[];
  materials_handled: string[];
  description: string;
  country: string;
  city: string;
  zone: string;
  address: string;
  postal_code: string;
  company_email: string;
  phone: string;
  website: string;
  logo_url: string;
  registration_doc_path: string;
};

const emptyForm: FormState = {
  company_name: "",
  company_type: "",
  registration_status: "",
  registration_number: "",
  year_established: "",
  employee_range: "",
  customer_count: "",
  industry: "",
  services: [],
  materials_handled: [],
  description: "",
  country: "",
  city: "",
  zone: "",
  address: "",
  postal_code: "",
  company_email: "",
  phone: "",
  website: "",
  logo_url: "",
  registration_doc_path: "",
};

/* Searchable dropdown (country) */
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );
  return (
    <div className="relative">
      <Input
        value={open ? query : value}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-cream/50 border-transparent focus-visible:border-ink text-sm"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-30 mt-1 w-full max-h-52 overflow-auto rounded-xl border border-ink/15 bg-white shadow-lg">
          {filtered.map((o) => (
            <button
              key={o}
              type="button"
              onMouseDown={() => {
                onChange(o);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-cream text-ink-deep"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* Tag multi-select with custom entries */
const TagSelect = ({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) => {
  const [custom, setCustom] = useState("");
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    if (!selected.includes(v)) onChange([...selected, v]);
    setCustom("");
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => toggle(o)}>
            <Badge
              variant={selected.includes(o) ? "default" : "outline"}
              className={
                selected.includes(o)
                  ? "bg-ink-deep text-cream hover:bg-ink cursor-pointer"
                  : "border-ink/25 text-ink hover:bg-cream cursor-pointer"
              }
            >
              {o}
            </Badge>
          </button>
        ))}
      </div>
      {selected.filter((s) => !options.includes(s)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected
            .filter((s) => !options.includes(s))
            .map((s) => (
              <Badge key={s} className="bg-gold text-ink-deep gap-1">
                {s}
                <button type="button" onClick={() => toggle(s)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={custom}
          placeholder={placeholder}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          className="bg-cream/50 border-transparent focus-visible:border-ink text-sm"
        />
        <Button type="button" variant="outline" onClick={addCustom} className="shrink-0 border-ink/25">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const Field = ({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-bold uppercase tracking-wider text-ink">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
    {hint && !error && <p className="text-[11px] text-ink/60">{hint}</p>}
    {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
  </div>
);

/* ─────────────────────────── page ─────────────────────────── */

const CompanyRegister = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isExisting, setIsExisting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [docName, setDocName] = useState("");
  const [docUploading, setDocUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: company } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      const { data: profile } = await supabase
        .from("profiles")
        .select("company, location")
        .eq("id", user.id)
        .maybeSingle();

      if (company) {
        setIsExisting(true);
        setForm({
          ...emptyForm,
          ...Object.fromEntries(
            Object.entries(company).map(([k, v]) => [
              k,
              Array.isArray(v) ? v : v === null || v === undefined ? "" : String(v),
            ])
          ),
          services: company.services ?? [],
          materials_handled: company.materials_handled ?? [],
        } as FormState);
        setLogoPreview(company.logo_url ?? "");
        setDocName(company.registration_doc_path ? "Document on file" : "");
      } else {
        // Carry over existing simple profile data so nothing is lost.
        set({
          company_name: profile?.company ?? "",
          city: profile?.location ?? "",
          company_email: user.email ?? "",
        });
      }
      setFetching(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ── validation ── */
  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.company_name.trim()) e.company_name = "Company name is required.";
      if (!form.company_type) e.company_type = "Please select a company type.";
      if (!form.registration_status) e.registration_status = "Please select a registration status.";
      if (form.year_established) {
        const y = Number(form.year_established);
        if (!Number.isInteger(y) || y < 1800 || y > new Date().getFullYear())
          e.year_established = "Enter a valid year.";
      }
    }
    if (s === 1) {
      if (!form.employee_range) e.employee_range = "Please select the number of employees.";
      if (!form.industry) e.industry = "Please select an industry.";
      if (form.services.length === 0) e.services = "Select at least one service.";
      if (form.customer_count && Number(form.customer_count) < 0)
        e.customer_count = "Enter a valid number of customers.";
    }
    if (s === 2) {
      if (!form.country.trim()) e.country = "Country is required.";
      if (!form.city.trim()) e.city = "City is required.";
      if (!form.zone.trim()) e.zone = "Zone / area is required.";
      if (!form.address.trim()) e.address = "Complete address is required.";
    }
    if (s === 3) {
      if (!z.string().email().safeParse(form.company_email.trim()).success)
        e.company_email = "Please enter a valid email address.";
      if (!phoneRe.test(form.phone.trim())) e.phone = "Please enter a valid phone number.";
      if (form.website.trim() && !urlRe.test(form.website.trim()))
        e.website = "Please enter a valid URL (https://example.com).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  /* ── uploads ── */
  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Logo must be under 5 MB.");
    setLogoPreview(URL.createObjectURL(file));
    setLogoUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${user.id}/logo-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("company-assets").upload(path, file);
    if (error) {
      setLogoUploading(false);
      return toast.error("Logo upload failed.");
    }
    const { data: signed } = await supabase.storage
      .from("company-assets")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    setLogoUploading(false);
    if (signed?.signedUrl) {
      set({ logo_url: signed.signedUrl });
      setLogoPreview(signed.signedUrl);
      toast.success("Logo uploaded.");
    }
  };

  const uploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("Document must be under 10 MB.");
    setDocUploading(true);
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${user.id}/registration-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("company-assets").upload(path, file);
    setDocUploading(false);
    if (error) return toast.error("Document upload failed.");
    set({ registration_doc_path: path });
    setDocName(file.name);
    toast.success("Document uploaded securely.");
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!user) return;
    for (let s = 0; s < 4; s++) {
      if (!validateStep(s)) {
        setStep(s);
        toast.error("Please complete all required fields.");
        return;
      }
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      company_name: form.company_name.trim(),
      company_type: form.company_type,
      registration_status: form.registration_status,
      registration_number:
        form.registration_status === "registered" ? form.registration_number.trim() || null : null,
      year_established: form.year_established ? Number(form.year_established) : null,
      employee_range: form.employee_range,
      customer_count: form.customer_count ? Number(form.customer_count) : null,
      industry: form.industry,
      services: form.services,
      materials_handled: form.materials_handled,
      description: form.description.trim() || null,
      country: form.country.trim(),
      city: form.city.trim(),
      zone: form.zone.trim(),
      address: form.address.trim(),
      postal_code: form.postal_code.trim() || null,
      company_email: form.company_email.trim(),
      phone: form.phone.trim(),
      website: form.website.trim() || null,
      logo_url: form.logo_url || null,
      registration_doc_path: form.registration_doc_path || null,
    };
    const { error } = await supabase.from("company_profiles").upsert(payload, { onConflict: "user_id" });
    if (!error) {
      // Keep the legacy profile fields in sync so existing features keep working.
      await supabase
        .from("profiles")
        .update({ company: payload.company_name, location: `${payload.city}, ${payload.country}` })
        .eq("id", user.id);
    }
    setSaving(false);
    if (error) {
      toast.error(error.message || "Could not save company profile.");
      return;
    }
    toast.success(isExisting ? "Company profile updated!" : "Company account created successfully!");
    navigate("/profile");
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-6 h-6 animate-spin text-ink" />
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-24 pb-10 md:pt-28">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-ink-deep tracking-tight">
            {isExisting ? "Company Profile" : "Company Registration"}
          </h1>
          <p className="text-ink text-sm mt-1">
            Tell us about your company so EcoLink can match you with the right materials and partners.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="hidden md:flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      i <= step ? "bg-ink-deep text-cream" : "bg-ink/10 text-ink"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-bold ${i === step ? "text-ink-deep" : "text-ink/60"}`}
                  >
                    {s.title}
                  </span>
                  {i < STEPS.length - 1 && <div className="h-px flex-1 bg-ink/15 mx-2" />}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2 bg-ink/10" />
          <p className="md:hidden text-xs font-bold text-ink-deep mt-2">
            Step {step + 1} of {STEPS.length} — {STEPS[step].title}
          </p>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-ink/10 shadow-sm p-6 md:p-8"
        >
          {/* STEP 1 */}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Field label="Company Name" required error={errors.company_name}>
                  <Input
                    value={form.company_name}
                    onChange={(e) => set({ company_name: e.target.value })}
                    placeholder="e.g. GreenCycle Industries"
                    className="bg-cream/50 border-transparent focus-visible:border-ink"
                  />
                </Field>
              </div>
              <Field label="Company Type" required error={errors.company_type}>
                <Select value={form.company_type} onValueChange={(v) => set({ company_type: v })}>
                  <SelectTrigger className="bg-cream/50 border-transparent">
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Registration Status" required error={errors.registration_status}>
                <Select
                  value={form.registration_status}
                  onValueChange={(v) => set({ registration_status: v })}
                >
                  <SelectTrigger className="bg-cream/50 border-transparent">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGISTRATION_STATUS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {form.registration_status === "registered" && (
                <Field label="Registration Number" hint="Optional — as issued by your authority">
                  <Input
                    value={form.registration_number}
                    onChange={(e) => set({ registration_number: e.target.value })}
                    placeholder="e.g. REG-2021-004512"
                    className="bg-cream/50 border-transparent focus-visible:border-ink"
                  />
                </Field>
              )}
              <Field label="Year Established" error={errors.year_established} hint="Optional">
                <Input
                  type="number"
                  value={form.year_established}
                  onChange={(e) => set({ year_established: e.target.value })}
                  placeholder="e.g. 2015"
                  className="bg-cream/50 border-transparent focus-visible:border-ink"
                />
              </Field>
            </div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Number of Employees" required error={errors.employee_range}>
                <Select value={form.employee_range} onValueChange={(v) => set({ employee_range: v })}>
                  <SelectTrigger className="bg-cream/50 border-transparent">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_RANGES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Number of Customers / Clients" error={errors.customer_count} hint="Optional">
                <Input
                  type="number"
                  min={0}
                  value={form.customer_count}
                  onChange={(e) => set({ customer_count: e.target.value })}
                  placeholder="e.g. 120"
                  className="bg-cream/50 border-transparent focus-visible:border-ink"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Industry / Business Category" required error={errors.industry}>
                  <Select value={form.industry} onValueChange={(v) => set({ industry: v })}>
                    <SelectTrigger className="bg-cream/50 border-transparent">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => (
                        <SelectItem key={i} value={i}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field
                  label="Services Provided"
                  required
                  error={errors.services}
                  hint="Pick all that apply, or type your own and press Enter."
                >
                  <TagSelect
                    options={SERVICE_OPTIONS}
                    selected={form.services}
                    onChange={(v) => set({ services: v })}
                    placeholder="Add a custom service…"
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field
                  label="Materials / Resources Produced or Used"
                  hint="Helps EcoLink match you with the right listings."
                >
                  <TagSelect
                    options={MATERIAL_OPTIONS}
                    selected={form.materials_handled}
                    onChange={(v) => set({ materials_handled: v })}
                    placeholder="Add a custom material…"
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Company Description" hint="Optional — a short summary of what you do.">
                  <Textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                    placeholder="We recover and process industrial textile offcuts…"
                    className="bg-cream/50 border-transparent focus-visible:border-ink"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Country" required error={errors.country}>
                <SearchableSelect
                  value={form.country}
                  onChange={(v) => set({ country: v })}
                  options={COUNTRIES}
                  placeholder="Search country…"
                />
              </Field>
              <Field label="City" required error={errors.city}>
                <Input
                  value={form.city}
                  onChange={(e) => set({ city: e.target.value })}
                  placeholder="e.g. Peshawar"
                  className="bg-cream/50 border-transparent focus-visible:border-ink"
                />
              </Field>
              <Field label="Zone / Area" required error={errors.zone}>
                <Input
                  value={form.zone}
                  onChange={(e) => set({ zone: e.target.value })}
                  placeholder="e.g. Industrial Estate, Hayatabad"
                  className="bg-cream/50 border-transparent focus-visible:border-ink"
                />
              </Field>
              <Field label="Postal Code" hint="Optional">
                <Input
                  value={form.postal_code}
                  onChange={(e) => set({ postal_code: e.target.value })}
                  placeholder="e.g. 25000"
                  className="bg-cream/50 border-transparent focus-visible:border-ink"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Complete Address" required error={errors.address}>
                  <Textarea
                    rows={3}
                    value={form.address}
                    onChange={(e) => set({ address: e.target.value })}
                    placeholder="Street, building, landmark…"
                    className="bg-cream/50 border-transparent focus-visible:border-ink"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Company Email" required error={errors.company_email}>
                <Input
                  type="email"
                  value={form.company_email}
                  onChange={(e) => set({ company_email: e.target.value })}
                  placeholder="info@company.com"
                  className="bg-cream/50 border-transparent focus-visible:border-ink"
                />
              </Field>
              <Field label="Phone Number" required error={errors.phone}>
                <Input
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  className="bg-cream/50 border-transparent focus-visible:border-ink"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Website" error={errors.website} hint="Optional">
                  <Input
                    value={form.website}
                    onChange={(e) => set({ website: e.target.value })}
                    placeholder="https://company.com"
                    className="bg-cream/50 border-transparent focus-visible:border-ink"
                  />
                </Field>
              </div>

              <Field label="Company Logo" hint="Optional — shown on your public profile.">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-cream border border-ink/10 overflow-hidden flex items-center justify-center shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-ink/40" />
                    )}
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={logoUploading}
                    onClick={() => logoRef.current?.click()}
                    className="border-ink/25 gap-2"
                  >
                    {logoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    {logoUploading ? "Uploading…" : logoPreview ? "Change logo" : "Upload logo"}
                  </Button>
                </div>
              </Field>

              <Field
                label="Business Registration Document"
                hint="Optional — stored privately, never shown publicly."
              >
                <div className="flex items-center gap-3">
                  <input
                    ref={docRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="hidden"
                    onChange={uploadDoc}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={docUploading}
                    onClick={() => docRef.current?.click()}
                    className="border-ink/25 gap-2"
                  >
                    {docUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    {docUploading ? "Uploading…" : docName ? "Replace document" : "Upload document"}
                  </Button>
                  {docName && <span className="text-xs text-ink truncate">{docName}</span>}
                </div>
              </Field>
            </div>
          )}

          {/* STEP 5 — review */}
          {step === 4 && (
            <div className="space-y-6">
              <ReviewBlock
                title="Company Information"
                rows={[
                  ["Company Name", form.company_name],
                  ["Company Type", COMPANY_TYPES.find((t) => t.value === form.company_type)?.label ?? ""],
                  [
                    "Registration",
                    REGISTRATION_STATUS.find((t) => t.value === form.registration_status)?.label ?? "",
                  ],
                  ["Registration Number", form.registration_number],
                  ["Year Established", form.year_established],
                ]}
              />
              <ReviewBlock
                title="Company Details"
                rows={[
                  ["Employees", form.employee_range],
                  ["Customers / Clients", form.customer_count],
                  ["Industry", form.industry],
                  ["Services", form.services.join(", ")],
                  ["Materials / Resources", form.materials_handled.join(", ")],
                  ["Description", form.description],
                ]}
              />
              <ReviewBlock
                title="Location"
                rows={[
                  ["Country", form.country],
                  ["City", form.city],
                  ["Zone / Area", form.zone],
                  ["Address", form.address],
                  ["Postal Code", form.postal_code],
                ]}
              />
              <ReviewBlock
                title="Contact & Verification"
                rows={[
                  ["Email", form.company_email],
                  ["Phone", form.phone],
                  ["Website", form.website],
                  ["Logo", form.logo_url ? "Uploaded" : "—"],
                  ["Registration Document", form.registration_doc_path ? "Uploaded (private)" : "—"],
                ]}
              />
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between mt-8 pt-6 border-t border-ink/10">
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              disabled={step === 0}
              className="text-ink hover:bg-cream gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={next}
                className="bg-ink-deep text-cream hover:bg-ink rounded-xl font-bold gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="bg-gold text-ink-deep hover:brightness-110 rounded-xl font-bold gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isExisting ? "Save Company Profile" : "Create Company Account"}
              </Button>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

const ReviewBlock = ({ title, rows }: { title: string; rows: [string, string][] }) => (
  <div className="rounded-2xl border border-ink/10 bg-cream/40 p-5">
    <h3 className="font-display font-bold text-ink-deep mb-3">{title}</h3>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 text-sm border-b border-ink/5 py-1">
          <dt className="text-ink/70 font-medium">{k}</dt>
          <dd className="text-ink-deep font-semibold text-right break-words">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  </div>
);

export default CompanyRegister;
