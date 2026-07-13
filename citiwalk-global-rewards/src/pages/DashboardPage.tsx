import { FiGrid } from "react-icons/fi";
import { EmptyState } from "@/components/content/EmptyState";
import { Seo } from "@/components/seo/Seo";

export default function DashboardPage() {
  return (
    <>
      <Seo title="Dashboard" path="/dashboard" noIndex />
      <EmptyState
        icon={FiGrid}
        eyebrow="Workspace reserved"
        title="Dashboard foundation"
        description="The dashboard route is intentionally empty and ready for a future authorized application shell. No admin logic, data, or controls are present."
      />
    </>
  );
}
