import type { SearchableOption } from "@/components/ui";
import { fetchLocationOptions } from "@/services/participantService";

export function getCountryOptions(): Promise<SearchableOption[]> {
  return fetchLocationOptions({ scope: "countries" });
}

export function getStateOptions(countryCode: string): Promise<SearchableOption[]> {
  if (!countryCode) return Promise.resolve([]);
  return fetchLocationOptions({ scope: "states", countryCode });
}

export function getDistrictOptions(
  countryCode: string,
  stateCode: string,
): Promise<SearchableOption[]> {
  if (!countryCode || !stateCode) return Promise.resolve([]);
  return fetchLocationOptions({ scope: "districts", countryCode, stateCode });
}
