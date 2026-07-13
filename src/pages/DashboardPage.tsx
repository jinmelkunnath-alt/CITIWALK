import { useCallback, useEffect, useState } from "react";
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiHash,
  FiInstagram,
  FiRefreshCw,
  FiShare2,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MetricCard } from "@/components/admin/MetricCard";
import { Seo } from "@/components/seo/Seo";
import { GlassCard, OutlineButton, Skeleton, StatusBadge } from "@/components/ui";
import { useUI } from "@/hooks/useUI";
import {
  fetchAdminOverview,
  getAdminServiceError,
  type AdminOverview,
} from "@/services/adminService";

function relativeTime(value: string | null) {
  if (!value) return "Recently";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1_000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function DashboardPage() {
  const { addToast } = useUI();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadOverview = useCallback(
    async (silent = false) => {
      if (!silent) setRefreshing(true);
      try {
        setOverview(await fetchAdminOverview());
      } catch (error: unknown) {
        const adminError = getAdminServiceError(error);
        addToast({ tone: "error", title: "Dashboard data unavailable", message: adminError.message });
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [addToast],
  );

  useEffect(() => {
    void loadOverview();
    const interval = window.setInterval(() => void loadOverview(true), 30_000);
    return () => window.clearInterval(interval);
  }, [loadOverview]);

  const stats = overview?.stats;
  const metrics = [
    { label: "Total Participants", value: stats?.totalParticipants ?? 0, icon: FiUsers, tone: "purple" as const },
    { label: "Today's Participants", value: stats?.todayParticipants ?? 0, icon: FiActivity, tone: "orange" as const },
    { label: "Completed Entries", value: stats?.completedEntries ?? 0, icon: FiCheckCircle, tone: "green" as const },
    { label: "Pending Entries", value: stats?.pendingEntries ?? 0, icon: FiClock, tone: "neutral" as const },
    { label: "Instagram Verified", value: stats?.instagramVerified ?? 0, icon: FiInstagram, tone: "purple" as const },
    { label: "WhatsApp Verified", value: stats?.whatsappVerified ?? 0, icon: FiShare2, tone: "green" as const },
    { label: "Available Entry Numbers", value: stats?.availableEntryNumbers ?? 0, icon: FiHash, tone: "purple" as const },
    { label: "Reserved Entry Numbers", value: stats?.reservedEntryNumbers ?? 0, icon: FiUserCheck, tone: "orange" as const },
  ];

  return (
    <>
      <Seo title="Admin Dashboard" path="/dashboard" noIndex />
      <AdminPageHeader
        eyebrow="Live overview"
        title="Dashboard"
        description="Monitor participant growth, verification completion, entry-number capacity, and recent registrations."
        actions={
          <>
            <StatusBadge variant="success" dot>Auto-refresh · 30s</StatusBadge>
            <OutlineButton
              size="sm"
              leadingIcon={<FiRefreshCw className="size-4" />}
              isLoading={refreshing}
              onClick={() => void loadOverview()}
            >
              Refresh
            </OutlineButton>
          </>
        }
      />

      {!overview && refreshing ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Loading dashboard statistics">
          {Array.from({ length: 8 }, (_, index) => (
            <GlassCard key={index} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1"><Skeleton className="h-2.5 w-28" /><Skeleton className="mt-4 h-8 w-24" /></div>
                <Skeleton className="size-11 rounded-xl" />
              </div>
            </GlassCard>
          ))}
          <span className="sr-only">Loading dashboard</span>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
            <GlassCard className="p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold tracking-[-0.025em] text-white">Live Activity</h2>
                  <p className="mt-1 text-xs text-muted">Latest participant registrations</p>
                </div>
                <StatusBadge variant="purple" dot>Live feed</StatusBadge>
              </div>
              <div className="mt-6 divide-y divide-white/[0.07]">
                {overview?.recentActivity.length ? (
                  overview.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-brand-300/15 bg-brand-400/10 text-brand-200">
                        <FiUserCheck className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{activity.fullName} registered.</p>
                        <p className="mt-1 truncate text-xs text-muted">Entry {activity.entryId} · {activity.country || "Unknown location"}</p>
                      </div>
                      <span className="shrink-0 text-[0.65rem] text-muted">{relativeTime(activity.timestamp)}</span>
                    </div>
                  ))
                ) : (
                  <p className="py-12 text-center text-sm text-muted">No registrations yet.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard className="relative overflow-hidden p-6 sm:p-7" accent="orange">
              <div className="absolute -right-16 -top-16 size-44 rounded-full bg-accent-400/10 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-300">System status</p>
                <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-white">Operational</h2>
                <p className="mt-3 text-sm leading-7 text-muted">Secure participant functions, transaction reservations, analytics, and admin APIs are connected.</p>
                <div className="mt-7 space-y-3">
                  {["Participant registration", "Entry number reservation", "Admin API boundary", "Audit logging"].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                      <span className="text-xs font-semibold text-muted">{item}</span>
                      <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.7)]" />
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </>
  );
}
