"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocationOptions = getLocationOptions;
const country_state_city_1 = require("country-state-city");
const https_1 = require("firebase-functions/v2/https");
function cleanCode(value, field) {
    if (typeof value !== "string" || !/^[a-zA-Z0-9-]{1,8}$/.test(value)) {
        throw new https_1.HttpsError("invalid-argument", `A valid ${field} is required.`);
    }
    return value;
}
function getLocationOptions(input) {
    if (!input || typeof input !== "object") {
        throw new https_1.HttpsError("invalid-argument", "Location request is required.");
    }
    const data = input;
    const scope = data.scope;
    if (scope === "countries") {
        return country_state_city_1.Country.getAllCountries()
            .map((country) => ({ value: country.isoCode, label: country.name }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }
    const countryCode = cleanCode(data.countryCode, "country code");
    if (scope === "states") {
        return country_state_city_1.State.getStatesOfCountry(countryCode)
            .map((state) => ({ value: state.isoCode, label: state.name }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }
    if (scope === "districts") {
        const stateCode = cleanCode(data.stateCode, "state code");
        const seen = new Set();
        return country_state_city_1.City.getCitiesOfState(countryCode, stateCode)
            .filter((city) => {
            if (seen.has(city.name))
                return false;
            seen.add(city.name);
            return true;
        })
            .map((city) => ({ value: city.name, label: city.name }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }
    throw new https_1.HttpsError("invalid-argument", "A valid location scope is required.");
}
//# sourceMappingURL=locationService.js.map