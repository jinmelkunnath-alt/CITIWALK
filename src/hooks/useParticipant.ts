import { useContext } from "react";
import { ParticipantContext } from "@/context/participant-context";

export function useParticipant() {
  const context = useContext(ParticipantContext);
  if (!context) {
    throw new Error("useParticipant must be used inside ParticipantProvider");
  }
  return context;
}
