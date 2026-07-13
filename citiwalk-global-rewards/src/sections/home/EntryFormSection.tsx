import { motion } from "framer-motion";
import { useMemo, useState, type FormEvent } from "react";
import { FaInstagram } from "react-icons/fa6";
import { FiCheck, FiHash, FiPhone, FiUser } from "react-icons/fi";
import { Reveal } from "@/animations/Reveal";
import { Section } from "@/components/layout/Section";
import {
  GlassCard,
  Input,
  OutlineButton,
  PrimaryButton,
  SearchableDropdown,
  SectionTitle,
  StatusBadge,
} from "@/components/ui";
import {
  countryOptions,
  districtOptions,
  entryNumberOptions,
  stateOptions,
} from "@/constants/campaign";
import { useUI } from "@/hooks/useUI";
import { SuccessModal } from "@/sections/home/SuccessModal";
import { cn } from "@/utils/cn";

type EntryFields = {
  fullName: string;
  mobileNumber: string;
  instagramId: string;
  country: string;
  state: string;
  district: string;
};

type FieldName = keyof EntryFields;
type FieldErrors = Partial<Record<FieldName, string>>;

const initialFields: EntryFields = {
  fullName: "",
  mobileNumber: "",
  instagramId: "",
  country: "",
  state: "",
  district: "",
};

function validateField(field: FieldName, value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "This field is required.";
  if (field === "fullName" && trimmedValue.length < 2) return "Enter your full name.";
  if (field === "mobileNumber" && !/^[+\d][\d\s()-]{6,17}$/.test(trimmedValue)) {
    return "Enter a valid mobile number.";
  }
  if (field === "instagramId" && !/^@?[a-zA-Z0-9._]{2,30}$/.test(trimmedValue)) {
    return "Enter a valid Instagram ID.";
  }
  return undefined;
}

export function EntryFormSection() {
  const { addToast } = useUI();
  const [fields, setFields] = useState<EntryFields>(initialFields);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [successPreviewOpen, setSuccessPreviewOpen] = useState(false);

  const errors = useMemo<FieldErrors>(() => {
    const nextErrors: FieldErrors = {};
    (Object.keys(fields) as FieldName[]).forEach((field) => {
      const error = validateField(field, fields[field]);
      if (error) nextErrors[field] = error;
    });
    return nextErrors;
  }, [fields]);

  const updateField = (field: FieldName, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
  };

  const touchField = (field: FieldName) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const preventSubmission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const runUiValidation = () => {
    const allTouched = (Object.keys(fields) as FieldName[]).reduce(
      (result, field) => ({ ...result, [field]: true }),
      {} as Record<FieldName, boolean>,
    );
    setTouched(allTouched);

    if (Object.keys(errors).length) {
      addToast({
        tone: "warning",
        title: "A few details need attention",
        message: "This check is visual only. Nothing has been submitted.",
      });
      return;
    }

    addToast({
      tone: "success",
      title: "UI validation complete",
      message: "The details look ready, but no giveaway entry has been submitted or stored.",
    });
  };

  return (
    <Section id="entry" aria-labelledby="entry-title" className="border-t border-white/[0.05] bg-white/[0.018]">
      <Reveal>
        <SectionTitle
          eyebrow="Your entry"
          title={<span id="entry-title">Designed for clarity at every detail.</span>}
          description="Complete the frontend form preview and choose one of three entry numbers. Validation and selection remain entirely in your browser."
          align="center"
        />
      </Reveal>

      <Reveal preset="scale" className="mx-auto mt-12 max-w-5xl">
        <GlassCard className="overflow-visible p-5 sm:p-8 lg:p-10" accent="purple">
          <div className="flex flex-col justify-between gap-5 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-brand-300/20 bg-brand-400/10 text-brand-200">
                <FiUser className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-bold tracking-[-0.025em] text-white">Entry details</h3>
                <p className="mt-1 text-xs text-muted">Frontend validation only · No database connection</p>
              </div>
            </div>
            <StatusBadge variant="purple" dot>Secure UI Preview</StatusBadge>
          </div>

          <form className="mt-8" noValidate onSubmit={preventSubmission} aria-label="Giveaway entry details preview">
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                label="Full Name"
                value={fields.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                onBlur={() => touchField("fullName")}
                error={touched.fullName ? errors.fullName : undefined}
                placeholder="Enter your full name"
                autoComplete="name"
                leadingIcon={<FiUser className="size-4" />}
              />
              <Input
                label="Mobile Number"
                value={fields.mobileNumber}
                onChange={(event) => updateField("mobileNumber", event.target.value)}
                onBlur={() => touchField("mobileNumber")}
                error={touched.mobileNumber ? errors.mobileNumber : undefined}
                placeholder="Enter your mobile number"
                autoComplete="tel"
                inputMode="tel"
                leadingIcon={<FiPhone className="size-4" />}
              />
              <Input
                label="Instagram ID"
                value={fields.instagramId}
                onChange={(event) => updateField("instagramId", event.target.value)}
                onBlur={() => touchField("instagramId")}
                error={touched.instagramId ? errors.instagramId : undefined}
                placeholder="@your.instagram.id"
                autoComplete="off"
                leadingIcon={<FaInstagram className="size-4" />}
              />
              <SearchableDropdown
                label="Country"
                name="country"
                options={countryOptions}
                value={fields.country}
                onChange={(value) => updateField("country", value)}
                onBlur={() => touchField("country")}
                error={touched.country ? errors.country : undefined}
                placeholder="Search country"
              />
              <SearchableDropdown
                label="State"
                name="state"
                options={stateOptions}
                value={fields.state}
                onChange={(value) => updateField("state", value)}
                onBlur={() => touchField("state")}
                error={touched.state ? errors.state : undefined}
                placeholder="Search state"
              />
              <SearchableDropdown
                label="District"
                name="district"
                options={districtOptions}
                value={fields.district}
                onChange={(value) => updateField("district", value)}
                onBlur={() => touchField("district")}
                error={touched.district ? errors.district : undefined}
                placeholder="Search district"
              />
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center">
              <p className="max-w-md text-xs leading-5 text-muted">
                Checking details does not submit, verify, or store an entry.
              </p>
              <PrimaryButton type="button" onClick={runUiValidation} leadingIcon={<FiCheck className="size-4" aria-hidden="true" />}>
                Check Details
              </PrimaryButton>
            </div>
          </form>
        </GlassCard>
      </Reveal>

      <Reveal className="mx-auto mt-6 max-w-5xl">
        <GlassCard className="p-5 sm:p-8 lg:p-10" accent="orange">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-accent-300/20 bg-accent-400/10 text-accent-300">
                <FiHash className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-bold tracking-[-0.03em] text-white">Choose Your Entry Number</h3>
                <p className="mt-1 text-xs text-muted">Select one number · Frontend visual state only</p>
              </div>
            </div>
            <StatusBadge variant={selectedNumber ? "orange" : "neutral"} dot={Boolean(selectedNumber)}>
              {selectedNumber ? `Selected · ${selectedNumber}` : "Awaiting selection"}
            </StatusBadge>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Choose an entry number">
            {entryNumberOptions.map((number) => {
              const selected = selectedNumber === number;
              return (
                <motion.button
                  key={number}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={cn(
                    "relative min-h-32 overflow-hidden rounded-card border p-5 text-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/25",
                    selected
                      ? "border-accent-300/55 bg-gradient-to-br from-accent-400/15 to-brand-500/15 shadow-glow-orange"
                      : "border-white/[0.08] bg-white/[0.035] hover:border-brand-300/30 hover:bg-brand-400/[0.07]",
                  )}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => setSelectedNumber(number)}
                >
                  <span className="absolute inset-0 ambient-grid opacity-40" aria-hidden="true" />
                  <span className="relative block text-[0.62rem] font-bold uppercase tracking-[0.17em] text-muted">Entry number</span>
                  <span className="relative mt-3 block text-3xl font-extrabold tracking-[0.08em] text-white">{number}</span>
                  {selected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-accent-gradient text-white shadow-glow-orange"
                      aria-hidden="true"
                    >
                      <FiCheck className="size-3.5" />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center">
            <p className="max-w-lg text-xs leading-5 text-muted">
              Number selection is visual only. It does not reserve, confirm, or generate a lucky number.
            </p>
            <OutlineButton type="button" onClick={() => setSuccessPreviewOpen(true)}>
              Preview Success Modal
            </OutlineButton>
          </div>
        </GlassCard>
      </Reveal>

      <SuccessModal open={successPreviewOpen} onClose={() => setSuccessPreviewOpen(false)} />
    </Section>
  );
}
