import { useCallback, useEffect, useState } from "react";
import { FiFileText, FiInbox, FiRefreshCw, FiSearch } from "react-icons/fi";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Seo } from "@/components/seo/Seo";
import {
  Dropdown,
  GlassCard,
  Input,
  Loader,
  OutlineButton,
  PrimaryButton,
  StatusBadge,
} from "@/components/ui";
import { useUI } from "@/hooks/useUI";
import {
  fetchSystemLogs,
  getAdminServiceError,
  type AdminLog,
} from "@/services/adminService";

const actionLabels: Record<string, string> = {
  ADMIN_LOGIN: "Admin Login",
  FAILED_LOGIN_ATTEMPT: "Failed Login Attempt",
  PARTICIPANT_DELETION: "Participant Deletion",
  WINNER_DRAW: "Winner Draw",
  SETTINGS_CHANGE: "Settings Change",
  PARTICIPANT_EXPORT: "Participant Export",
  WINNER_EXPORT: "Winner Export",
  SECURITY_RATE_LIMIT: "Rate Limit Triggered",
  ENTRY_PREPARATION_FAILED: "Entry Preparation Failed",
  REGISTRATION_FAILED: "Registration Failed",
  CLIENT_ERROR: "Client Error",
};

function logTone(action: string) {
  if (
    [
      "FAILED_LOGIN_ATTEMPT",
      "PARTICIPANT_DELETION",
      "SECURITY_RATE_LIMIT",
      "REGISTRATION_FAILED",
      "CLIENT_ERROR",
    ].includes(action)
  ) return "danger" as const;
  if (action === "WINNER_DRAW" || action === "SETTINGS_CHANGE") return "orange" as const;
  if (action === "ADMIN_LOGIN") return "success" as const;
  return "purple" as const;
}

export default function AdminLogsPage() {
  const { addToast } = useUI();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Array<string | null>>([null]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const currentToken = tokens[page] ?? null;

  const resetPage = () => {
    setPage(0);
    setTokens([null]);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchSystemLogs({
        search,
        action,
        dateFrom,
        dateTo,
        pageSize: 25,
        pageToken: currentToken,
      });
      setLogs(result.logs);
      setNextToken(result.nextPageToken);
    } catch (error: unknown) {
      const adminError = getAdminServiceError(error);
      addToast({ tone: "error", title: "System logs unavailable", message: adminError.message });
    } finally {
      setLoading(false);
    }
  }, [action, addToast, currentToken, dateFrom, dateTo, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 300);
    return () => window.clearTimeout(timeout);
  }, [load]);

  return (
    <>
      <Seo title="System Logs" path="/dashboard/logs" noIndex />
      <AdminPageHeader
        eyebrow="Immutable audit trail"
        title="System Logs"
        description="Review administrator logins, failed attempts, participant deletions, winner draws, settings updates, and exports."
        actions={
          <OutlineButton size="sm" leadingIcon={<FiRefreshCw className="size-4" />} isLoading={loading} onClick={() => void load()}>
            Refresh
          </OutlineButton>
        }
      />

      <GlassCard className="mt-8 overflow-visible p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Search Logs"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPage();
            }}
            placeholder="Admin, action, affected record"
            leadingIcon={<FiSearch className="size-4" />}
          />
          <Dropdown
            label="Action"
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              resetPage();
            }}
            options={[
              { value: "", label: "All admin actions" },
              ...Object.entries(actionLabels).map(([value, label]) => ({ value, label })),
            ]}
          />
          <Input label="From" type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); resetPage(); }} />
          <Input label="To" type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); resetPage(); }} />
        </div>
      </GlassCard>

      <GlassCard className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-brand-300/15 bg-brand-400/10 text-brand-200">
              <FiFileText className="size-4" />
            </span>
            <div><h2 className="text-base font-bold text-white">Audit Events</h2><p className="mt-1 text-xs text-muted">Page {page + 1} · Server timestamps</p></div>
          </div>
          <StatusBadge variant="purple" dot>Admin Only</StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-white/[0.025] text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
              <tr>{["Timestamp", "Action", "Admin", "Affected Record", "Details"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr><td colSpan={5} className="h-64 text-center"><Loader size="lg" /></td></tr>
              ) : logs.length ? (
                logs.map((log) => (
                  <tr key={log.id} className="text-xs text-muted hover:bg-white/[0.025]">
                    <td className="whitespace-nowrap px-5 py-4">{log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}</td>
                    <td className="px-5 py-4"><StatusBadge variant={logTone(log.action)}>{actionLabels[log.action] || log.action}</StatusBadge></td>
                    <td className="max-w-48 truncate px-5 py-4 text-white">{log.adminEmail || "Unauthenticated"}</td>
                    <td className="max-w-56 truncate px-5 py-4 font-mono text-[0.68rem] text-brand-200">{log.affectedRecord || "—"}</td>
                    <td className="max-w-80 px-5 py-4"><code className="line-clamp-2 break-all text-[0.65rem] text-muted">{JSON.stringify(log.metadata)}</code></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8">
                    <AdminEmptyState
                      icon={FiInbox}
                      title="No log events found"
                      description="Audit and security events matching these filters will appear here."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.07] p-5">
          <OutlineButton size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Previous</OutlineButton>
          <span className="text-xs text-muted">Page {page + 1}</span>
          <PrimaryButton
            size="sm"
            disabled={!nextToken}
            onClick={() => {
              if (!nextToken) return;
              setTokens((current) => [...current.slice(0, page + 1), nextToken]);
              setPage((current) => current + 1);
            }}
          >Next</PrimaryButton>
        </div>
      </GlassCard>
    </>
  );
}
