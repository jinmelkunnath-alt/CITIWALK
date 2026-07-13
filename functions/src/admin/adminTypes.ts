export type ParticipantFilters = {
  search: string;
  country: string;
  state: string;
  district: string;
  verificationStatus: "" | "verified" | "pending";
  dateFrom: string;
  dateTo: string;
  sort: "newest" | "oldest";
};

export type PublicParticipant = {
  id: string;
  entryId: string;
  registrationDate: string | null;
  fullName: string;
  mobileNumber: string;
  instagramId: string;
  country: string;
  state: string;
  district: string;
  instagramVerified: boolean;
  whatsappVerified: boolean;
  status: string;
  selectedEntryNumber: string;
  deviceType?: string;
  userAgent?: string;
  ipHash?: string;
  browserFingerprint?: string;
  createdDate?: string;
  ownerUid?: string;
};
