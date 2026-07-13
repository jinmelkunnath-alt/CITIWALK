import { useCallback, useEffect, useState } from "react";
import { FiSave, FiSettings, FiShield } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Seo } from "@/components/seo/Seo";
import { GlassCard, Input, Loader, PrimaryButton, StatusBadge } from "@/components/ui";
import { useUI } from "@/hooks/useUI";
import {
  fetchAdminSettings,
  getAdminServiceError,
  saveAdminSettings,
  type AdminSettings,
} from "@/services/adminService";

function toDateTimeLocal(value: string) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return match?.[1] || "";
}

export default function AdminSettingsPage() {
  const { addToast } = useUI();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAdminSettings();
      setSettings({ ...result, countdownTarget: toDateTimeLocal(result.countdownTarget) });
    } catch (error: unknown) {
      const adminError = getAdminServiceError(error);
      addToast({ tone: "error", title: "Settings unavailable", message: adminError.message });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = <Key extends keyof AdminSettings>(key: Key, value: AdminSettings[Key]) => {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const payload = {
        ...settings,
        countdownTarget: settings.countdownTarget.length === 16
          ? `${settings.countdownTarget}:00+05:30`
          : settings.countdownTarget,
      };
      const result = await saveAdminSettings(payload);
      setSettings({ ...result, countdownTarget: toDateTimeLocal(result.countdownTarget) });
      addToast({
        tone: "success",
        title: "Settings saved",
        message: `${result.changedFields.length} field${result.changedFields.length === 1 ? "" : "s"} updated and logged.`,
      });
    } catch (error: unknown) {
      const adminError = getAdminServiceError(error);
      addToast({ tone: "error", title: "Settings update failed", message: adminError.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Seo title="Admin Settings" path="/dashboard/settings" noIndex />
      <AdminPageHeader
        eyebrow="Campaign configuration"
        title="Settings"
        description="Manage public campaign identity, announcement timing, participation links, policy URLs, and support placeholders."
        actions={
          <PrimaryButton
            size="sm"
            leadingIcon={<FiSave className="size-4" />}
            isLoading={saving}
            disabled={!settings}
            onClick={() => void save()}
          >
            Save Changes
          </PrimaryButton>
        }
      />

      {loading ? (
        <div className="grid min-h-[60vh] place-items-center"><Loader size="lg" /></div>
      ) : settings ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_.36fr]">
          <div className="space-y-6">
            <GlassCard className="overflow-visible p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-white/[0.07] pb-5">
                <FiSettings className="size-5 text-brand-300" />
                <div><h2 className="text-lg font-bold text-white">Campaign Identity</h2><p className="mt-1 text-xs text-muted">Public names and announcement schedule</p></div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Input label="Giveaway Name" value={settings.giveawayName} onChange={(event) => update("giveawayName", event.target.value)} />
                <Input label="Company Name" value={settings.companyName} onChange={(event) => update("companyName", event.target.value)} />
                <Input label="Announcement Date" type="date" value={settings.announcementDate} onChange={(event) => update("announcementDate", event.target.value)} />
                <Input label="Countdown Target (IST)" type="datetime-local" value={settings.countdownTarget} onChange={(event) => update("countdownTarget", event.target.value)} />
              </div>
            </GlassCard>

            <GlassCard className="overflow-visible p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white">Participation & Contact</h2>
              <p className="mt-1 text-xs text-muted">External campaign destinations and support placeholders</p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input label="Instagram URL" type="url" value={settings.instagramUrl} onChange={(event) => update("instagramUrl", event.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="whatsapp-message" className="block text-sm font-semibold text-white">WhatsApp Share Message</label>
                  <textarea
                    id="whatsapp-message"
                    className="control-base mt-2 min-h-36 resize-y"
                    value={settings.whatsappShareMessage}
                    onChange={(event) => update("whatsappShareMessage", event.target.value)}
                    maxLength={2000}
                  />
                  <p className="mt-2 text-xs text-muted">Use {"{URL}"} where the public campaign link should appear.</p>
                </div>
                <Input label="Support Email" type="email" value={settings.supportEmail} onChange={(event) => update("supportEmail", event.target.value)} placeholder="support@citiwalk.com" />
                <Input label="Support Phone" type="tel" value={settings.supportPhone} onChange={(event) => update("supportPhone", event.target.value)} placeholder="+91..." />
              </div>
            </GlassCard>

            <GlassCard className="overflow-visible p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white">Policy Destinations</h2>
              <p className="mt-1 text-xs text-muted">Secure URLs or internal site paths</p>
              <div className="mt-6 grid gap-6">
                <Input label="Terms URL" value={settings.termsUrl} onChange={(event) => update("termsUrl", event.target.value)} />
                <Input label="Privacy URL" value={settings.privacyUrl} onChange={(event) => update("privacyUrl", event.target.value)} />
                <Input label="Official Rules URL" value={settings.officialRulesUrl} onChange={(event) => update("officialRulesUrl", event.target.value)} />
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6" accent="purple">
              <FiShield className="size-6 text-brand-300" />
              <h2 className="mt-5 text-lg font-bold text-white">Audit Protected</h2>
              <p className="mt-3 text-sm leading-7 text-muted">Every settings update records the admin UID, changed field names, affected document, and server timestamp.</p>
            </GlassCard>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm font-bold text-white">Registration</p><p className="mt-1 text-xs text-muted">Public entry availability</p></div>
                <StatusBadge variant={settings.registrationOpen ? "success" : "orange"} dot>{settings.registrationOpen ? "Open" : "Closed"}</StatusBadge>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.registrationOpen}
                onClick={() => update("registrationOpen", !settings.registrationOpen)}
                className={`relative mt-5 h-7 w-14 rounded-full transition ${settings.registrationOpen ? "bg-brand-500" : "bg-white/15"}`}
              >
                <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${settings.registrationOpen ? "left-8" : "left-1"}`} />
                <span className="sr-only">Toggle participant registration</span>
              </button>
            </GlassCard>
            <GlassCard className="p-6" accent={settings.maintenanceMode ? "orange" : "none"}>
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm font-bold text-white">Maintenance Mode</p><p className="mt-1 text-xs text-muted">Pause the public experience safely</p></div>
                <StatusBadge variant={settings.maintenanceMode ? "orange" : "neutral"} dot={settings.maintenanceMode}>{settings.maintenanceMode ? "Active" : "Off"}</StatusBadge>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.maintenanceMode}
                onClick={() => update("maintenanceMode", !settings.maintenanceMode)}
                className={`relative mt-5 h-7 w-14 rounded-full transition ${settings.maintenanceMode ? "bg-accent-500" : "bg-white/15"}`}
              >
                <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${settings.maintenanceMode ? "left-8" : "left-1"}`} />
                <span className="sr-only">Toggle public maintenance mode</span>
              </button>
            </GlassCard>
          </div>
        </div>
      ) : null}
    </>
  );
}
