import { FiLock } from "react-icons/fi";
import { EmptyState } from "@/components/content/EmptyState";
import { Seo } from "@/components/seo/Seo";

export default function AdminLoginPage() {
  return (
    <>
      <Seo title="Admin Login" path="/admin/login" noIndex />
      <EmptyState
        icon={FiLock}
        eyebrow="Restricted surface"
        title="Admin access"
        description="This route is reserved for a future secure authentication phase. No form, credentials, Firebase connection, or authentication behavior is included."
      />
    </>
  );
}
