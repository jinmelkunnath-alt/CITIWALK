import { Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase";
import { detectBrowser } from "./browserUtils";

function increment(map: Map<string, number>, key: string) {
  map.set(key || "Unknown", (map.get(key || "Unknown") || 0) + 1);
}

function toDistribution(map: Map<string, number>, limit = 12) {
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export async function getAdminAnalytics() {
  const [participantSnapshot, verificationSnapshot] = await Promise.all([
    db.collection("participants").orderBy("timestamp", "desc").limit(20_000).get(),
    db
      .collection("logs")
      .where("recordType", "==", "verification_attempt")
      .orderBy("timestamp", "desc")
      .limit(20_000)
      .get(),
  ]);

  const daily = new Map<string, number>();
  const hourly = new Map<string, number>();
  const countries = new Map<string, number>();
  const states = new Map<string, number>();
  const districts = new Map<string, number>();
  const devices = new Map<string, number>();
  const browsers = new Map<string, number>();

  for (const document of participantSnapshot.docs) {
    const data = document.data();
    const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : null;
    if (timestamp) {
      const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(timestamp);
      const hour = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        hour12: false,
      }).format(timestamp);
      increment(daily, date);
      increment(hourly, `${hour}:00`);
    }
    increment(countries, String(data.country || "Unknown"));
    increment(states, String(data.state || "Unknown"));
    increment(districts, String(data.district || "Unknown"));
    increment(devices, String(data.deviceType || "Unknown"));
    increment(browsers, detectBrowser(String(data.userAgent || "")));
  }

  let instagramAttempts = 0;
  let instagramSuccesses = 0;
  let whatsappAttempts = 0;
  let whatsappSuccesses = 0;
  for (const document of verificationSnapshot.docs) {
    const data = document.data();
    if (data.channel === "instagram") {
      instagramAttempts += 1;
      if (data.success === true) instagramSuccesses += 1;
    }
    if (data.channel === "whatsapp") {
      whatsappAttempts += 1;
      if (data.success === true) whatsappSuccesses += 1;
    }
  }

  const dailyRegistrations = [...daily.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  return {
    dailyRegistrations,
    trafficTrend: dailyRegistrations.slice(-14),
    hourlyParticipation: [...hourly.entries()]
      .map(([hour, value]) => ({ hour, value }))
      .sort((a, b) => a.hour.localeCompare(b.hour)),
    countryDistribution: toDistribution(countries),
    stateDistribution: toDistribution(states),
    districtDistribution: toDistribution(districts),
    deviceTypes: toDistribution(devices),
    browserTypes: toDistribution(browsers),
    verification: {
      instagramAttempts,
      instagramSuccesses,
      instagramSuccessRate:
        instagramAttempts > 0
          ? Math.round((instagramSuccesses / instagramAttempts) * 100)
          : 0,
      whatsappAttempts,
      whatsappSuccesses,
      whatsappSuccessRate:
        whatsappAttempts > 0
          ? Math.round((whatsappSuccesses / whatsappAttempts) * 100)
          : 0,
    },
    generatedAt: new Date().toISOString(),
  };
}
