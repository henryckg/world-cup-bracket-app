// Display helpers for team names → short codes (used in compact UI).
const CODES: Record<string, string> = {
  Mexico: "MEX",
  México: "MEX",
  "South Korea": "KOR",
  "South Africa": "RSA",
  Czechia: "CZE",
  Canada: "CAN",
  "Bosnia and Herzegovina": "BIH",
  Qatar: "QAT",
  Switzerland: "SUI",
  Brazil: "BRA",
  Morocco: "MAR",
  Haiti: "HAI",
  Scotland: "SCO",
  USA: "USA",
  Paraguay: "PAR",
  Australia: "AUS",
  Türkiye: "TUR",
  Germany: "GER",
  "Côte d'Ivoire": "CIV",
  Ecuador: "ECU",
  Curaçao: "CUW",
  Netherlands: "NED",
  Japan: "JPN",
  Sweden: "SWE",
  Tunisia: "TUN",
  Belgium: "BEL",
  Egypt: "EGY",
  Iran: "IRN",
  "New Zealand": "NZL",
  Spain: "ESP",
  Uruguay: "URU",
  "Saudi Arabia": "KSA",
  "Cabo Verde": "CPV",
  France: "FRA",
  Senegal: "SEN",
  Norway: "NOR",
  Iraq: "IRQ",
  Argentina: "ARG",
  Algeria: "ALG",
  Austria: "AUT",
  Jordan: "JOR",
  Portugal: "POR",
  Colombia: "COL",
  Uzbekistan: "UZB",
  "DR Congo": "COD",
  England: "ENG",
  Croatia: "CRO",
  Ghana: "GHA",
  Panama: "PAN",
}

export function teamCode(name: string): string {
  return CODES[name] ?? name.slice(0, 3).toUpperCase()
}

export function normalizeTeam(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}
