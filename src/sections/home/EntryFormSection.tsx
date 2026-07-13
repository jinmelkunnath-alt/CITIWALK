import { motion } from "framer-motion";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FaInstagram } from "react-icons/fa6";
import { FiCheck, FiClock, FiHash, FiLock, FiPhone, FiRefreshCw, FiShield, FiUser } from "react-icons/fi";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
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
  type SearchableOption,
} from "@/components/ui";
import { useParticipant } from "@/hooks/useParticipant";
import { createBrowserFingerprint } from "@/services/fingerprintService";
import {
  getCountryOptions,
  getDistrictOptions,
  getStateOptions,
} from "@/services/locationService";
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

function validateField(field: FieldName, value: string, countryCode: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "This field is required.";
  if (field === "fullName" && trimmedValue.length < 2) return "Enter your full name.";
  if (field === "mobileNumber") {
    if (!/^\+[1-9]\d{7,14}$/.test(trimmedValue)) {
      return "Use country code and digits only, for example +919876543210.";
    }
    const parsedNumber = parsePhoneNumberFromString(trimmedValue);
    if (!parsedNumber?.isValid()) return "Enter a valid mobile number.";
    if (countryCode && parsedNumber.country && parsedNumber.country !== countryCode) {
      return "The mobile country code does not match the selected country.";
    }
  }
  if (field === "instagramId" && !/^@?[a-zA-Z0-9._]{2,30}$/.test(trimmedValue)) {
    return "Enter a valid Instagram ID.";
  }
  return undefined;
}

const notApplicableOption: SearchableOption[] = [
  { value: "N/A", label: "Not applicable" },
];

export function EntryFormSection() {
  const {
    backendStatus,
    settings,
    participationComplete,
    entryCandidates,
    entryCandidatesExpiresAt,
    preparingEntryNumbers,
    confirmingRegistration,
    registrationResult,
    prepareEntryNumbers,
    confirmRegistration,
  } = useParticipant();
  const [fields, setFields] = useState<EntryFields>(initialFields);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [countryOptions, setCountryOptions] = useState<SearchableOption[]>([]);
  const [stateOptions, setStateOptions] = useState<SearchableOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<SearchableOption[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [numberStepVisible, setNumberStepVisible] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!participationComplete || countryOptions.length) return;
    let active = true;
    setLocationsLoading(true);
    void getCountryOptions()
      .then((options) => {
        if (active) setCountryOptions(options);
      })
      .finally(() => {
        if (active) setLocationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [countryOptions.length, participationComplete]);

  useEffect(() => {
    if (!fields.country) {
      setStateOptions([]);
      return;
    }
    let active = true;
    setLocationsLoading(true);
    void getStateOptions(fields.country)
      .then((options) => {
        if (active) setStateOptions(options.length ? options : notApplicableOption);
      })
      .finally(() => {
        if (active) setLocationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fields.country]);

  useEffect(() => {
    if (!fields.country || !fields.state) {
      setDistrictOptions([]);
      return;
    }
    if (fields.state === "N/A") {
      setDistrictOptions(notApplicableOption);
      return;
    }
    let active = true;
    setLocationsLoading(true);
    void getDistrictOptions(fields.country, fields.state)
      .then((options) => {
        if (active) setDistrictOptions(options.length ? options : notApplicableOption);
      })
      .finally(() => {
        if (active) setLocationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fields.country, fields.state]);

  useEffect(() => {
    setSelectedNumber(null);
  }, [entryCandidates]);

  const errors = useMemo<FieldErrors>(() => {
    const nextErrors: FieldErrors = {};
    (Object.keys(fields) as FieldName[]).forEach((field) => {
      const error = validateField(field, fields[field], fields.country);
      if (error) nextErrors[field] = error;
    });
    return nextErrors;
  }, [fields]);

  const updateField = (field: FieldName, value: string) => {
    setFields((current) => {
      const next = { ...current, [field]: value };
      if (field === "country") {
        next.state = "";
        next.district = "";
      }
      if (field === "state") next.district = "";
      return next;
    });
    setNumberStepVisible(false);
    setSelectedNumber(null);
  };

  const touchField = (field: FieldName) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const preventSubmission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const runValidationAndPrepareNumbers = async () => {
    const allTouched = (Object.keys(fields) as FieldName[]).reduce(
      (result, field) => ({ ...result, [field]: true }),
      {} as Record<FieldName, boolean>,
    );
    setTouched(allTouched);
    if (Object.keys(errors).length) return;

    const prepared = await prepareEntryNumbers({
      mobileNumber: fields.mobileNumber.trim(),
      countryCode: fields.country,
    });
    if (prepared) {
      setNumberStepVisible(true);
      window.requestAnimationFrame(() => {
        document.getElementById("entry-number-selection")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  };

  const findLabel = (options: SearchableOption[], value: string) =>
    options.find((option) => option.value === value)?.label ?? value;

  const confirmSelectedEntry = async () => {
    if (!selectedNumber) return;
    const browserFingerprint = await createBrowserFingerprint();
    const completed = await confirmRegistration({
      fullName: fields.fullName.trim(),
      mobileNumber: fields.mobileNumber.trim(),
      instagramId: fields.instagramId.trim(),
      countryCode: fields.country,
      country: findLabel(countryOptions, fields.country),
      state: findLabel(stateOptions, fields.state),
      district: findLabel(districtOptions, fields.district),
      selectedEntryNumber: selectedNumber,
      browserFingerprint,
    });
    if (completed) setSuccessOpen(true);
  };

  const backHome = () => {
    setSuccessOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Section id="entry" aria-labelledby="entry-title" className="border-t border-white/[0.05] bg-white/[0.018]">
      <Reveal>
        <SectionTitle
          eyebrow="Your entry"
          title={<span id="entry-title">Designed for clarity at every detail.</span>}
          description="Complete the secure form, choose an available number, and confirm your CITIWALK Global Rewards entry."
          align="center"
        />
      </Reveal>

      {!settings.registrationOpen && !registrationResult ? (
        <Reveal preset="scale" className="mx-auto mt-12 max-w-3xl">
          <GlassCard className="p-8 text-center sm:p-12" accent="orange">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-accent-300/20 bg-accent-400/10 text-accent-300 shadow-glow-orange">
              <FiClock className="size-7" aria-hidden="true" />
            </div>
            <StatusBadge variant="orange" dot className="mt-6">Registration Closed</StatusBadge>
            <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
              Participant registration is currently closed.
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              Follow official CITIWALK updates for registration and winner announcement information.
            </p>
          </GlassCard>
        </Reveal>
      ) : !participationComplete && !registrationResult ? (
        <Reveal preset="scale" className="mx-auto mt-12 max-w-3xl">
          <GlassCard className="p-8 text-center sm:p-12" accent="purple">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-brand-300/20 bg-brand-400/10 text-brand-200 shadow-glow-purple">
              <FiLock className="size-7" aria-hidden="true" />
            </div>
            <StatusBadge variant="orange" dot className="mt-6">Entry Form Locked</StatusBadge>
            <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
              Complete all participation steps to unlock the entry form.
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              Instagram verification and all eight successful WhatsApp shares are required before registration.
            </p>
            <a href="#participation" className="button-outline mt-7">Return to participation</a>
          </GlassCard>
        </Reveal>
      ) : registrationResult ? (
        <Reveal preset="scale" className="mx-auto mt-12 max-w-3xl">
          <GlassCard className="p-8 text-center sm:p-12" accent="orange">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
              <FiShield className="size-7" aria-hidden="true" />
            </div>
            <StatusBadge variant="success" dot className="mt-6">Registration Confirmed</StatusBadge>
            <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">{registrationResult.entryId}</h3>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted">Your participant registration is securely stored. Keep your Entry ID for the winner announcement.</p>
            <PrimaryButton className="mt-7" onClick={() => setSuccessOpen(true)}>View Confirmation</PrimaryButton>
          </GlassCard>
        </Reveal>
      ) : (
        <>
          <Reveal preset="scale" className="mx-auto mt-12 max-w-5xl">
            <GlassCard className="overflow-visible p-5 sm:p-8 lg:p-10" accent="purple">
              <div className="flex flex-col justify-between gap-5 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-brand-300/20 bg-brand-400/10 text-brand-200">
                    <FiUser className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold tracking-[-0.025em] text-white">Entry details</h3>
                    <p className="mt-1 text-xs text-muted">Secure Firebase registration · Required fields only</p>
                  </div>
                </div>
                <StatusBadge variant={backendStatus === "ready" ? "success" : "orange"} dot>
                  {backendStatus === "ready" ? "Secure Service Ready" : "Connecting"}
                </StatusBadge>
              </div>

              <form className="mt-8" noValidate onSubmit={preventSubmission} aria-label="Giveaway entry details">
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
                    placeholder="+919876543210"
                    description="Include country code. Digits only after the + symbol."
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
                    placeholder={locationsLoading ? "Loading countries..." : "Search country"}
                    disabled={locationsLoading && !countryOptions.length}
                  />
                  <SearchableDropdown
                    label="State"
                    name="state"
                    options={stateOptions}
                    value={fields.state}
                    onChange={(value) => updateField("state", value)}
                    onBlur={() => touchField("state")}
                    error={touched.state ? errors.state : undefined}
                    placeholder={fields.country ? "Search state" : "Select country first"}
                    disabled={!fields.country || !stateOptions.length}
                  />
                  <SearchableDropdown
                    label="District"
                    name="district"
                    options={districtOptions}
                    value={fields.district}
                    onChange={(value) => updateField("district", value)}
                    onBlur={() => touchField("district")}
                    error={touched.district ? errors.district : undefined}
                    placeholder={fields.state ? "Search district" : "Select state first"}
                    disabled={!fields.state || !districtOptions.length}
                  />
                </div>

                <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center">
                  <p className="max-w-md text-xs leading-5 text-muted">
                    Your participant document is created only after you select and confirm an available entry number.
                  </p>
                  <PrimaryButton
                    type="button"
                    onClick={() => void runValidationAndPrepareNumbers()}
                    leadingIcon={<FiCheck className="size-4" aria-hidden="true" />}
                    isLoading={preparingEntryNumbers}
                    disabled={backendStatus !== "ready"}
                  >
                    Choose Entry Number
                  </PrimaryButton>
                </div>
              </form>
            </GlassCard>
          </Reveal>

          {numberStepVisible && (
            <Reveal id="entry-number-selection" className="mx-auto mt-6 max-w-5xl">
              <GlassCard className="p-5 sm:p-8 lg:p-10" accent="orange">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-accent-300/20 bg-accent-400/10 text-accent-300">
                      <FiHash className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold tracking-[-0.03em] text-white">Choose Your Entry Number</h3>
                      <p className="mt-1 text-xs text-muted">Three available numbers · Reserved only when confirmed</p>
                    </div>
                  </div>
                  <StatusBadge variant={selectedNumber ? "orange" : "neutral"} dot={Boolean(selectedNumber)}>
                    {selectedNumber ? `Selected · ${String(Number(selectedNumber))}` : "Awaiting selection"}
                  </StatusBadge>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Choose an entry number">
                  {entryCandidates.map((candidate) => {
                    const selected = selectedNumber === candidate.canonical;
                    return (
                      <motion.button
                        key={candidate.canonical}
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
                        onClick={() => setSelectedNumber(candidate.canonical)}
                      >
                        <span className="absolute inset-0 ambient-grid opacity-40" aria-hidden="true" />
                        <span className="relative block text-[0.62rem] font-bold uppercase tracking-[0.17em] text-muted">Entry number</span>
                        <span className="relative mt-3 block text-3xl font-extrabold tracking-[0.08em] text-white">{candidate.value}</span>
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
                  <div className="max-w-lg text-xs leading-5 text-muted">
                    <p>Confirmation uses an atomic Firestore transaction. Assigned numbers can never be reused.</p>
                    {entryCandidatesExpiresAt && (
                      <p className="mt-1">Options expire at {new Date(entryCandidatesExpiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.</p>
                    )}
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <OutlineButton
                      type="button"
                      onClick={() => void runValidationAndPrepareNumbers()}
                      leadingIcon={<FiRefreshCw className="size-4" aria-hidden="true" />}
                      isLoading={preparingEntryNumbers}
                    >
                      New Numbers
                    </OutlineButton>
                    <PrimaryButton
                      type="button"
                      onClick={() => void confirmSelectedEntry()}
                      disabled={!selectedNumber}
                      isLoading={confirmingRegistration}
                      leadingIcon={<FiShield className="size-4" aria-hidden="true" />}
                    >
                      Confirm Entry
                    </PrimaryButton>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          )}
        </>
      )}

      <SuccessModal
        open={successOpen}
        result={registrationResult}
        onBackHome={backHome}
      />
    </Section>
  );
}
