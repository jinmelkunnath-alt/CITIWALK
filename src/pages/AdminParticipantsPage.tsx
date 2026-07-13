import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiDownload,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ParticipantDrawer } from "@/components/admin/ParticipantDrawer";
import { Seo } from "@/components/seo/Seo";
import {
  Dropdown,
  GlassCard,
  Input,
  Modal,
  OutlineButton,
  PrimaryButton,
  SearchableDropdown,
  StatusBadge,
  TableSkeleton,
  type SearchableOption,
} from "@/components/ui";
import { useUI } from "@/hooks/useUI";
import {
  fetchParticipantFilterOptions,
  fetchParticipants,
  getAdminServiceError,
  requestParticipantDeletion,
  requestParticipantExport,
  type AdminParticipant,
  type ParticipantFilters,
  type ParticipantListResult,
} from "@/services/adminService";
import { exportRowsToCsv, exportRowsToExcel } from "@/services/exportService";

const initialFilters: ParticipantFilters = {
  search: "",
  country: "",
  state: "",
  district: "",
  verificationStatus: "",
  dateFrom: "",
  dateTo: "",
  sort: "newest",
};

function exportRow(participant: AdminParticipant) {
  return {
    "Entry ID": participant.entryId,
    "Registration Date": participant.registrationDate
      ? new Date(participant.registrationDate).toLocaleString()
      : "",
    "Full Name": participant.fullName,
    "Phone Number": participant.mobileNumber,
    "Instagram ID": participant.instagramId,
    Country: participant.country,
    State: participant.state,
    District: participant.district,
    "Instagram Verified": participant.instagramVerified ? "Yes" : "No",
    "WhatsApp Verified": participant.whatsappVerified ? "Yes" : "No",
    Status: participant.status,
  };
}

export default function AdminParticipantsPage() {
  const { addToast } = useUI();
  const [filters, setFilters] = useState(initialFilters);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [tokens, setTokens] = useState<Array<string | null>>([null]);
  const [result, setResult] = useState<ParticipantListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminParticipant | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    countries: SearchableOption[];
    states: SearchableOption[];
    districts: SearchableOption[];
  }>({ countries: [], states: [], districts: [] });
  const currentToken = tokens[page] ?? null;

  const resetPagination = () => {
    setPage(0);
    setTokens([null]);
  };

  const updateFilter = <Key extends keyof ParticipantFilters>(
    key: Key,
    value: ParticipantFilters[Key],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
    resetPagination();
  };

  const loadParticipants = useCallback(async () => {
    setLoading(true);
    try {
      setResult(
        await fetchParticipants({
          ...filters,
          pageSize,
          pageToken: currentToken,
        }),
      );
    } catch (error: unknown) {
      const adminError = getAdminServiceError(error);
      addToast({ tone: "error", title: "Participants unavailable", message: adminError.message });
    } finally {
      setLoading(false);
    }
  }, [addToast, currentToken, filters, pageSize]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadParticipants(), 350);
    return () => window.clearTimeout(timeout);
  }, [loadParticipants]);

  useEffect(() => {
    void fetchParticipantFilterOptions()
      .then(setFilterOptions)
      .catch(() => undefined);
  }, []);

  const clearFilters = () => {
    setFilters(initialFilters);
    resetPagination();
  };

  const exportParticipants = async (format: "csv" | "excel") => {
    setExporting(format);
    try {
      const exported = await requestParticipantExport(filters);
      const rows = exported.participants.map(exportRow);
      if (format === "csv") {
        exportRowsToCsv(rows, "citiwalk-participants.csv");
      } else {
        await exportRowsToExcel(rows, "citiwalk-participants.xlsx", "Participants");
      }
      addToast({
        tone: "success",
        title: `${format.toUpperCase()} export ready`,
        message: `${rows.length.toLocaleString()} filtered participants exported${exported.truncated ? " (10,000 record limit)" : ""}.`,
      });
    } catch (error: unknown) {
      const adminError = getAdminServiceError(error);
      addToast({ tone: "error", title: "Export failed", message: adminError.message });
    } finally {
      setExporting(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteReason.trim().length < 5) return;
    setDeleting(true);
    try {
      await requestParticipantDeletion(deleteTarget.id, deleteReason.trim());
      addToast({
        tone: "success",
        title: "Participant deleted",
        message: `${deleteTarget.entryId} was removed and the action was logged.`,
      });
      setDeleteTarget(null);
      setDeleteReason("");
      await loadParticipants();
    } catch (error: unknown) {
      const adminError = getAdminServiceError(error);
      addToast({ tone: "error", title: "Deletion failed", message: adminError.message });
    } finally {
      setDeleting(false);
    }
  };

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([key, value]) => key !== "sort" && value).length,
    [filters],
  );

  return (
    <>
      <Seo title="Admin Participants" path="/dashboard/participants" noIndex />
      <AdminPageHeader
        eyebrow="Participant management"
        title="Participants"
        description="Search, filter, inspect, export, and securely remove participant records with complete audit logging."
        actions={
          <>
            <OutlineButton
              size="sm"
              leadingIcon={<FiDownload className="size-4" />}
              isLoading={exporting === "csv"}
              onClick={() => void exportParticipants("csv")}
            >
              CSV
            </OutlineButton>
            <PrimaryButton
              size="sm"
              leadingIcon={<FiDownload className="size-4" />}
              isLoading={exporting === "excel"}
              onClick={() => void exportParticipants("excel")}
            >
              Excel
            </PrimaryButton>
          </>
        }
      />

      <GlassCard className="mt-8 overflow-visible p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiFilter className="size-4 text-brand-300" />
            <h2 className="text-sm font-bold text-white">Filters</h2>
            {activeFilterCount > 0 && <StatusBadge variant="purple">{activeFilterCount} active</StatusBadge>}
          </div>
          <button type="button" onClick={clearFilters} className="text-xs font-semibold text-muted hover:text-white">Clear all</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Search"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Entry, name, phone, Instagram"
            leadingIcon={<FiSearch className="size-4" />}
          />
          <SearchableDropdown
            label="Country"
            value={filters.country}
            options={filterOptions.countries}
            onChange={(value) => updateFilter("country", value)}
            placeholder="All countries"
          />
          <SearchableDropdown
            label="State"
            value={filters.state}
            options={filterOptions.states}
            onChange={(value) => updateFilter("state", value)}
            placeholder="All states"
          />
          <SearchableDropdown
            label="District"
            value={filters.district}
            options={filterOptions.districts}
            onChange={(value) => updateFilter("district", value)}
            placeholder="All districts"
          />
          <Dropdown
            label="Verification Status"
            value={filters.verificationStatus}
            onChange={(event) => updateFilter("verificationStatus", event.target.value as ParticipantFilters["verificationStatus"])}
            options={[
              { value: "", label: "All statuses" },
              { value: "verified", label: "Fully verified" },
              { value: "pending", label: "Pending" },
            ]}
          />
          <Input label="Registration From" type="date" value={filters.dateFrom} onChange={(event) => updateFilter("dateFrom", event.target.value)} />
          <Input label="Registration To" type="date" value={filters.dateTo} onChange={(event) => updateFilter("dateTo", event.target.value)} />
          <Dropdown
            label="Sort Order"
            value={filters.sort}
            onChange={(event) => updateFilter("sort", event.target.value as ParticipantFilters["sort"])}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
          />
        </div>
      </GlassCard>

      <GlassCard className="mt-6 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="text-base font-bold text-white">Participant Registry</h2>
            <p className="mt-1 text-xs text-muted">
              {result?.totalParticipants.toLocaleString() ?? "—"} total records · Page {page + 1}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dropdown
              label=""
              aria-label="Rows per page"
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                resetPagination();
              }}
              options={[
                { value: "25", label: "25 rows" },
                { value: "50", label: "50 rows" },
                { value: "100", label: "100 rows" },
              ]}
              className="w-36 [&>label]:hidden"
            />
            <OutlineButton size="sm" leadingIcon={<FiRefreshCw className="size-4" />} onClick={() => void loadParticipants()}>
              Refresh
            </OutlineButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left">
            <thead className="bg-white/[0.025] text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
              <tr>
                {[
                  "Entry ID",
                  "Registration Date",
                  "Full Name",
                  "Phone Number",
                  "Instagram ID",
                  "Country",
                  "State",
                  "District",
                  "Verification",
                  "Actions",
                ].map((heading) => <th key={heading} className="px-4 py-4">{heading}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr><td colSpan={10}><TableSkeleton columns={6} rows={7} /></td></tr>
              ) : result?.participants.length ? (
                result.participants.map((participant) => {
                  const verified = participant.instagramVerified && participant.whatsappVerified;
                  return (
                    <tr key={participant.id} className="text-xs text-muted transition hover:bg-white/[0.025]">
                      <td className="whitespace-nowrap px-4 py-4 font-bold text-brand-200">{participant.entryId}</td>
                      <td className="whitespace-nowrap px-4 py-4">{participant.registrationDate ? new Date(participant.registrationDate).toLocaleString() : "—"}</td>
                      <td className="max-w-44 truncate px-4 py-4 font-semibold text-white">{participant.fullName}</td>
                      <td className="whitespace-nowrap px-4 py-4">{participant.mobileNumber}</td>
                      <td className="max-w-40 truncate px-4 py-4">{participant.instagramId}</td>
                      <td className="px-4 py-4">{participant.country}</td>
                      <td className="px-4 py-4">{participant.state}</td>
                      <td className="px-4 py-4">{participant.district}</td>
                      <td className="px-4 py-4">
                        <StatusBadge variant={verified ? "success" : "orange"} dot>{verified ? "Verified" : "Pending"}</StatusBadge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedParticipantId(participant.id)}
                            className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-muted hover:text-white"
                            aria-label={`View ${participant.fullName}`}
                          >
                            <FiEye className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(participant)}
                            className="grid size-9 place-items-center rounded-lg border border-red-300/15 bg-red-400/[0.06] text-red-300 hover:bg-red-400/10"
                            aria-label={`Delete ${participant.fullName}`}
                          >
                            <FiTrash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-8">
                    <AdminEmptyState
                      icon={FiUsers}
                      title={activeFilterCount ? "No search results" : "No participants yet"}
                      description={
                        activeFilterCount
                          ? "No participant records match the current search and filter combination."
                          : "Completed participant registrations will appear here automatically."
                      }
                      actionLabel={activeFilterCount ? "Clear Filters" : undefined}
                      onAction={activeFilterCount ? clearFilters : undefined}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] p-5">
          <OutlineButton size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
            Previous
          </OutlineButton>
          <span className="text-xs font-semibold text-muted">Page {page + 1}</span>
          <PrimaryButton
            size="sm"
            disabled={!result?.nextPageToken}
            onClick={() => {
              if (!result?.nextPageToken) return;
              setTokens((current) => [...current.slice(0, page + 1), result.nextPageToken]);
              setPage((current) => current + 1);
            }}
          >
            Next
          </PrimaryButton>
        </div>
      </GlassCard>

      <ParticipantDrawer
        participantId={selectedParticipantId}
        open={Boolean(selectedParticipantId)}
        onClose={() => setSelectedParticipantId(null)}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
            setDeleteReason("");
          }
        }}
        title="Delete Participant Entry"
        description="This removes the participant permanently. The assigned entry number remains unavailable forever."
        size="sm"
        dismissible={!deleting}
        footer={
          <>
            <OutlineButton disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</OutlineButton>
            <PrimaryButton
              isLoading={deleting}
              disabled={deleteReason.trim().length < 5}
              onClick={() => void confirmDelete()}
              className="bg-gradient-to-r from-red-500 to-red-700 shadow-[0_18px_50px_rgba(239,68,68,.2)]"
            >
              Delete Entry
            </PrimaryButton>
          </>
        }
      >
        <div className="rounded-card border border-red-300/15 bg-red-400/[0.055] p-4">
          <p className="text-sm font-bold text-white">{deleteTarget?.fullName}</p>
          <p className="mt-1 text-xs text-red-200">{deleteTarget?.entryId}</p>
        </div>
        <label className="mt-5 block text-sm font-semibold text-white" htmlFor="delete-reason">Deletion reason</label>
        <textarea
          id="delete-reason"
          value={deleteReason}
          onChange={(event) => setDeleteReason(event.target.value)}
          className="control-base mt-2 min-h-28 resize-y"
          placeholder="Provide the required audit reason..."
          maxLength={500}
        />
        <p className="mt-2 text-xs text-muted">Minimum 5 characters. Stored in the immutable audit log.</p>
      </Modal>
    </>
  );
}
