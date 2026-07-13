import { City, Country, State } from "country-state-city";
import { HttpsError } from "firebase-functions/v2/https";

export type LocationOption = {
  value: string;
  label: string;
};

export type LocationRequest = {
  scope: "countries" | "states" | "districts";
  countryCode?: string;
  stateCode?: string;
};

function cleanCode(value: unknown, field: string) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9-]{1,8}$/.test(value)) {
    throw new HttpsError("invalid-argument", `A valid ${field} is required.`);
  }
  return value;
}

export function getLocationOptions(input: unknown): LocationOption[] {
  if (!input || typeof input !== "object") {
    throw new HttpsError("invalid-argument", "Location request is required.");
  }
  const data = input as Record<string, unknown>;
  const scope = data.scope;

  if (scope === "countries") {
    return Country.getAllCountries()
      .map((country) => ({ value: country.isoCode, label: country.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  const countryCode = cleanCode(data.countryCode, "country code");
  if (scope === "states") {
    return State.getStatesOfCountry(countryCode)
      .map((state) => ({ value: state.isoCode, label: state.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  if (scope === "districts") {
    const stateCode = cleanCode(data.stateCode, "state code");
    const seen = new Set<string>();
    return City.getCitiesOfState(countryCode, stateCode)
      .filter((city) => {
        if (seen.has(city.name)) return false;
        seen.add(city.name);
        return true;
      })
      .map((city) => ({ value: city.name, label: city.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  throw new HttpsError("invalid-argument", "A valid location scope is required.");
}
