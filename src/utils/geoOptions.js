import { allCountries } from 'country-region-data'

/** @typedef {{ name: string, code: string }} CountryOpt */
/** @typedef {{ name: string, shortCode: string }} RegionOpt */

/** Paesi ordinati per nome (dati statici da country-region-data). */
export function getCountriesSorted() {
  return allCountries
    .map(([name, code]) => ({ name, code }))
    .sort((a, b) => a.name.localeCompare(b.name, 'it'))
}

/** Regioni / province per codice ISO paese (es. IT → Lombardia, …). */
export function getRegionsForCountry(countryCode) {
  if (!countryCode) return []
  const row = allCountries.find(([, code]) => code === countryCode)
  if (!row) return []
  const regions = row[2]
  return regions.map(([name, shortCode]) => ({ name, shortCode }))
}

/** Etichetta paese in italiano dove utile (lista dati in inglese). */
export function displayCountryName(code, englishName) {
  if (code === 'IT' || englishName === 'Italy') return 'Italia'
  return englishName
}
