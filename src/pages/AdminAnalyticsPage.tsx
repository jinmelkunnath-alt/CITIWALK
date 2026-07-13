import { useCallback, useEffect, useState, type ReactNode } from "react";
import { FiBarChart2, FiRefreshCw } from "react-icons/fi";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Seo } from "@/components/seo/Seo";
import { GlassCard, Loader, OutlineButton, StatusBadge } from "@/components/ui";
import { useUI } from "@/hooks/useUI";
import {
  fetchAdminAnalytics,
  getAdminServiceError,
  type AdminAnalytics,
  type DistributionItem,
} from "@/services/adminService";

const chartColors = ["#A779FF", "#FFA51F", "#7C2EF2", "#34D399", "#F472B6", "#60A5FA", "#FBBF24"];
const tooltipStyle = {
  background: "rgba(18,12,31,.96)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "12px",
};

function ChartCard({ title, description, children, className = "" }: { title: string; description: string; children: ReactNode; className?: string }) {
  return (
    <GlassCard className={`p-5 sm:p-6 ${className}`}>
      <h2 className="text-base font-bold text-white">{title}</h2>
      <p className="mt-1 text-xs text-muted">{description}</p>
      <div
        className="mt-6 h-72"
        role="img"
        aria-label={`${title}. ${description}`}
      >
        {children}
      </div>
    </GlassCard>
  );
}

function DistributionChart({ data }: { data: DistributionItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 12 }}>
        <CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#AEA7BF", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" width={92} tick={{ fill: "#AEA7BF", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,.03)" }} />
        <Bar dataKey="value" fill="#8F46FF" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AdminAnalyticsPage() {
  const { addToast } = useUI();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAnalytics(await fetchAdminAnalytics());
    } catch (error: unknown) {
      const adminError = getAdminServiceError(error);
      addToast({ tone: "error", title: "Analytics unavailable", message: adminError.message });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const verificationData = analytics
    ? [
        { name: "Instagram", success: analytics.verification.instagramSuccessRate, failed: 100 - analytics.verification.instagramSuccessRate },
        { name: "WhatsApp", success: analytics.verification.whatsappSuccessRate, failed: 100 - analytics.verification.whatsappSuccessRate },
      ]
    : [];
  const shareAttempts = analytics
    ? [
        { name: "Instagram", attempts: analytics.verification.instagramAttempts, successes: analytics.verification.instagramSuccesses },
        { name: "WhatsApp", attempts: analytics.verification.whatsappAttempts, successes: analytics.verification.whatsappSuccesses },
      ]
    : [];

  return (
    <>
      <Seo title="Admin Analytics" path="/dashboard/analytics" noIndex />
      <AdminPageHeader
        eyebrow="Campaign intelligence"
        title="Analytics"
        description="Interactive registration, geography, device, traffic, and verification performance analytics."
        actions={
          <>
            <StatusBadge variant="purple" dot>Server Aggregated</StatusBadge>
            <OutlineButton size="sm" leadingIcon={<FiRefreshCw className="size-4" />} isLoading={loading} onClick={() => void load()}>
              Refresh
            </OutlineButton>
          </>
        }
      />

      {loading && !analytics ? (
        <div className="grid min-h-[60vh] place-items-center"><Loader size="lg" /></div>
      ) : analytics && analytics.dailyRegistrations.length === 0 ? (
        <div className="mt-12">
          <AdminEmptyState
            icon={FiBarChart2}
            title="No analytics data yet"
            description="Registration, geography, device, and verification charts will populate as participant activity begins."
            actionLabel="Refresh Analytics"
            onAction={() => void load()}
          />
        </div>
      ) : analytics ? (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <ChartCard title="Daily Registrations" description="Registrations during the latest 30 active days">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyRegistrations}>
                <defs>
                  <linearGradient id="daily-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A779FF" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#A779FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#AEA7BF", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#AEA7BF", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="value" stroke="#A779FF" strokeWidth={2.5} fill="url(#daily-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Traffic Trend" description="Recent campaign registration momentum">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trafficTrend}>
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#AEA7BF", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#AEA7BF", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#FFA51F" strokeWidth={3} dot={{ fill: "#FFA51F", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Country Distribution" description="Top participant countries">
            <DistributionChart data={analytics.countryDistribution} />
          </ChartCard>
          <ChartCard title="State Distribution" description="Top participant states">
            <DistributionChart data={analytics.stateDistribution} />
          </ChartCard>
          <ChartCard title="District Distribution" description="Top participant districts">
            <DistributionChart data={analytics.districtDistribution} />
          </ChartCard>

          <ChartCard title="Hourly Participation" description="Registration activity by IST hour">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.hourlyParticipation}>
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: "#AEA7BF", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#AEA7BF", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#8F46FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Device Types" description="Desktop, mobile, and tablet participation">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.deviceTypes} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
                  {analytics.deviceTypes.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#AEA7BF" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Browser Types" description="Browser mix across participant devices">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.browserTypes} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
                  {analytics.browserTypes.map((entry, index) => <Cell key={entry.name} fill={chartColors[(index + 2) % chartColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#AEA7BF" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Verification Success Rate" description="Successful versus failed verification attempts">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verificationData}>
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#AEA7BF", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#AEA7BF", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="success" name="Success %" stackId="rate" fill="#34D399" radius={[0, 0, 6, 6]} />
                <Bar dataKey="failed" name="Failed %" stackId="rate" fill="#F87171" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Share Verification Attempts" description="Attempt volume and successful checks">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shareAttempts}>
                <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#AEA7BF", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#AEA7BF", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="attempts" fill="#8F46FF" radius={[5, 5, 0, 0]} />
                <Bar dataKey="successes" fill="#FFA51F" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      ) : null}
    </>
  );
}
