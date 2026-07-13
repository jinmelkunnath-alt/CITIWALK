export const ADMIN_LOG_ACTIONS = {
  login: "ADMIN_LOGIN",
  failedLogin: "FAILED_LOGIN_ATTEMPT",
  participantDeletion: "PARTICIPANT_DELETION",
  winnerDraw: "WINNER_DRAW",
  settingsChange: "SETTINGS_CHANGE",
  participantExport: "PARTICIPANT_EXPORT",
  winnerExport: "WINNER_EXPORT",
} as const;

export const winnerPrizes = [
  { rank: "Grand Prize", name: "MacBook Pro M5" },
  { rank: "2nd Prize", name: "iPhone 17" },
  { rank: "3rd Prize", name: "iPhone 15" },
  { rank: "4th Prize", name: "Sony PlayStation 5 Slim Digital Edition" },
  { rank: "5th Prize", name: "Sony WH-1000XM5 Wireless Headphones" },
  { rank: "6th Prize", name: "Samsung Galaxy Watch 7 LTE (44mm)" },
  { rank: "7th Prize", name: "₹15,000 Cash" },
  { rank: "8th Prize", name: "₹8,000 Cash" },
  { rank: "9th Prize", name: "₹3,000 Cash" },
  { rank: "10th Prize", name: "₹1,000 Cash" },
] as const;

export const ENTRY_NUMBER_SPACE_SIZE = 999_000;
