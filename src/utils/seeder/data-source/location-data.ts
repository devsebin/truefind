export interface ISeederSuburbConfig {
  name: string;
  code: string;
  post_code: string;
  boundary: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface ISeederDistrictConfig {
  name: string;
  code: string;
  suburbs: ISeederSuburbConfig[];
}

export interface ISeederRegionConfig {
  name: string;
  code: string;
  districts: ISeederDistrictConfig[];
}

export interface ISeederCountryConfig {
  name: string;
  iso_code: string;
  iso_code_3: string;
  phone_code: string;
  currency: string;
  continent: string;
  timezone: string[];
  regions: ISeederRegionConfig[];
}

export const locationHierarchyData: ISeederCountryConfig[] = [
  // 1. New Zealand
  {
    name: "New Zealand",
    iso_code: "NZ",
    iso_code_3: "NZL",
    phone_code: "+64",
    currency: "NZD",
    continent: "Oceania",
    timezone: ["Pacific/Auckland", "Pacific/Chatham"],
    regions: [
      {
        name: "Auckland Region",
        code: "NZ-AUK",
        districts: [
          {
            name: "Auckland Central District",
            code: "NZ-AUK-CEN",
            suburbs: [
              {
                name: "Auckland CBD",
                code: "NZ-AKL-CBD",
                post_code: "1010",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.76, -36.85], [174.77, -36.85], [174.77, -36.84], [174.76, -36.84], [174.76, -36.85]]],
                },
              },
              {
                name: "Ponsonby",
                code: "NZ-AKL-PON",
                post_code: "1011",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.74, -36.85], [174.75, -36.85], [174.75, -36.84], [174.74, -36.84], [174.74, -36.85]]],
                },
              },
              {
                name: "Parnell",
                code: "NZ-AKL-PAR",
                post_code: "1052",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.78, -36.86], [174.79, -36.86], [174.79, -36.85], [174.78, -36.85], [174.78, -36.86]]],
                },
              },
              {
                name: "Newmarket",
                code: "NZ-AKL-NMK",
                post_code: "1023",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.77, -36.87], [174.78, -36.87], [174.78, -36.86], [174.77, -36.86], [174.77, -36.87]]],
                },
              },
            ],
          },
          {
            name: "North Shore District",
            code: "NZ-AUK-NSH",
            suburbs: [
              {
                name: "Takapuna",
                code: "NZ-AKL-TAK",
                post_code: "0622",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.77, -36.79], [174.78, -36.79], [174.78, -36.78], [174.77, -36.78], [174.77, -36.79]]],
                },
              },
              {
                name: "Albany",
                code: "NZ-AKL-ALB",
                post_code: "0632",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.70, -36.73], [174.71, -36.73], [174.71, -36.72], [174.70, -36.72], [174.70, -36.73]]],
                },
              },
              {
                name: "Devonport",
                code: "NZ-AKL-DEV",
                post_code: "0624",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.79, -36.83], [174.80, -36.83], [174.80, -36.82], [174.79, -36.82], [174.79, -36.83]]],
                },
              },
              {
                name: "Birkenhead",
                code: "NZ-AKL-BIR",
                post_code: "0626",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.72, -36.81], [174.73, -36.81], [174.73, -36.80], [174.72, -36.80], [174.72, -36.81]]],
                },
              },
            ],
          },
          {
            name: "Waitakere District",
            code: "NZ-AUK-WTK",
            suburbs: [
              {
                name: "Henderson",
                code: "NZ-AKL-HEN",
                post_code: "0612",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.63, -36.88], [174.64, -36.88], [174.64, -36.87], [174.63, -36.87], [174.63, -36.88]]],
                },
              },
              {
                name: "New Lynn",
                code: "NZ-AKL-NWL",
                post_code: "0600",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.68, -36.91], [174.69, -36.91], [174.69, -36.90], [174.68, -36.90], [174.68, -36.91]]],
                },
              },
              {
                name: "Te Atatu",
                code: "NZ-AKL-TEA",
                post_code: "0610",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.65, -36.84], [174.66, -36.84], [174.66, -36.83], [174.65, -36.83], [174.65, -36.84]]],
                },
              },
              {
                name: "Titirangi",
                code: "NZ-AKL-TIT",
                post_code: "0604",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.65, -36.94], [174.66, -36.94], [174.66, -36.93], [174.65, -36.93], [174.65, -36.94]]],
                },
              },
            ],
          },
          {
            name: "Manukau District",
            code: "NZ-AUK-MNK",
            suburbs: [
              {
                name: "Manukau Central",
                code: "NZ-AKL-MNC",
                post_code: "2104",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.88, -36.99], [174.89, -36.99], [174.89, -36.98], [174.88, -36.98], [174.88, -36.99]]],
                },
              },
              {
                name: "Botany Downs",
                code: "NZ-AKL-BOT",
                post_code: "2010",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.91, -36.93], [174.92, -36.93], [174.92, -36.92], [174.91, -36.92], [174.91, -36.93]]],
                },
              },
              {
                name: "Howick",
                code: "NZ-AKL-HOW",
                post_code: "2014",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.93, -36.89], [174.94, -36.89], [174.94, -36.88], [174.93, -36.88], [174.93, -36.89]]],
                },
              },
              {
                name: "Papatoetoe",
                code: "NZ-AKL-PAP",
                post_code: "2025",
                boundary: {
                  type: "Polygon",
                  coordinates: [[[174.85, -36.97], [174.86, -36.97], [174.86, -36.96], [174.85, -36.96], [174.85, -36.97]]],
                },
              },
            ],
          },
        ],
      },
      {
        name: "Waikato Region",
        code: "NZ-WKO",
        districts: [
          {
            name: "Hamilton District",
            code: "NZ-WKO-HAM",
            suburbs: [
              { name: "Hamilton Central", code: "NZ-HAM-CEN", post_code: "3204", boundary: { type: "Polygon", coordinates: [[[175.28, -37.78], [175.29, -37.78], [175.29, -37.77], [175.28, -37.77], [175.28, -37.78]]] } },
              { name: "Hamilton East", code: "NZ-HAM-EAS", post_code: "3216", boundary: { type: "Polygon", coordinates: [[[175.30, -37.79], [175.31, -37.79], [175.31, -37.78], [175.30, -37.78], [175.30, -37.79]]] } },
              { name: "Frankton", code: "NZ-HAM-FRA", post_code: "3204", boundary: { type: "Polygon", coordinates: [[[175.25, -37.78], [175.26, -37.78], [175.26, -37.77], [175.25, -37.77], [175.25, -37.78]]] } },
              { name: "Rototuna", code: "NZ-HAM-ROT", post_code: "3210", boundary: { type: "Polygon", coordinates: [[[175.27, -37.73], [175.28, -37.73], [175.28, -37.72], [175.27, -37.72], [175.27, -37.73]]] } },
            ],
          },
          {
            name: "Waipa District",
            code: "NZ-WKO-WPA",
            suburbs: [
              { name: "Cambridge", code: "NZ-WPA-CAM", post_code: "3434", boundary: { type: "Polygon", coordinates: [[[175.46, -37.89], [175.47, -37.89], [175.47, -37.88], [175.46, -37.88], [175.46, -37.89]]] } },
              { name: "Te Awamutu", code: "NZ-WPA-TAW", post_code: "3800", boundary: { type: "Polygon", coordinates: [[[175.32, -38.01], [175.33, -38.01], [175.33, -38.00], [175.32, -38.00], [175.32, -38.01]]] } },
              { name: "Leamington", code: "NZ-WPA-LEA", post_code: "3432", boundary: { type: "Polygon", coordinates: [[[175.47, -37.90], [175.48, -37.90], [175.48, -37.89], [175.47, -37.89], [175.47, -37.90]]] } },
              { name: "Kihikihi", code: "NZ-WPA-KIH", post_code: "3800", boundary: { type: "Polygon", coordinates: [[[175.35, -38.04], [175.36, -38.04], [175.36, -38.03], [175.35, -38.03], [175.35, -38.04]]] } },
            ],
          },
          {
            name: "Taupo District",
            code: "NZ-WKO-TPO",
            suburbs: [
              { name: "Taupo Central", code: "NZ-TPO-CEN", post_code: "3330", boundary: { type: "Polygon", coordinates: [[[176.07, -38.68], [176.08, -38.68], [176.08, -38.67], [176.07, -38.67], [176.07, -38.68]]] } },
              { name: "Richmond Heights", code: "NZ-TPO-RIC", post_code: "3330", boundary: { type: "Polygon", coordinates: [[[176.09, -38.71], [176.10, -38.71], [176.10, -38.70], [176.09, -38.70], [176.09, -38.71]]] } },
              { name: "Nukuhau", code: "NZ-TPO-NUK", post_code: "3330", boundary: { type: "Polygon", coordinates: [[[176.06, -38.67], [176.07, -38.67], [176.07, -38.66], [176.06, -38.66], [176.06, -38.67]]] } },
              { name: "Waipahihi", code: "NZ-TPO-WAI", post_code: "3330", boundary: { type: "Polygon", coordinates: [[[176.08, -38.72], [176.09, -38.72], [176.09, -38.71], [176.08, -38.71], [176.08, -38.72]]] } },
            ],
          },
          {
            name: "Matamata-Piako District",
            code: "NZ-WKO-MPK",
            suburbs: [
              { name: "Matamata Town", code: "NZ-MPK-MAT", post_code: "3400", boundary: { type: "Polygon", coordinates: [[[175.77, -37.81], [175.78, -37.81], [175.78, -37.80], [175.77, -37.80], [175.77, -37.81]]] } },
              { name: "Morrinsville", code: "NZ-MPK-MOR", post_code: "3300", boundary: { type: "Polygon", coordinates: [[[175.52, -37.65], [175.53, -37.65], [175.53, -37.64], [175.52, -37.64], [175.52, -37.65]]] } },
              { name: "Te Aroha", code: "NZ-MPK-TEA", post_code: "3320", boundary: { type: "Polygon", coordinates: [[[175.70, -37.53], [175.71, -37.53], [175.71, -37.52], [175.70, -37.52], [175.70, -37.53]]] } },
              { name: "Waharoa", code: "NZ-MPK-WAH", post_code: "3401", boundary: { type: "Polygon", coordinates: [[[175.75, -37.76], [175.76, -37.76], [175.76, -37.75], [175.75, -37.75], [175.75, -37.76]]] } },
            ],
          },
        ],
      },
      {
        name: "Wellington Region",
        code: "NZ-WGN",
        districts: [
          {
            name: "Wellington City District",
            code: "NZ-WGN-WCT",
            suburbs: [
              { name: "Te Aro", code: "NZ-WEL-TEA", post_code: "6011", boundary: { type: "Polygon", coordinates: [[[174.77, -41.29], [174.78, -41.29], [174.78, -41.28], [174.77, -41.28], [174.77, -41.29]]] } },
              { name: "Thorndon", code: "NZ-WEL-THO", post_code: "6011", boundary: { type: "Polygon", coordinates: [[[174.77, -41.27], [174.78, -41.27], [174.78, -41.26], [174.77, -41.26], [174.77, -41.27]]] } },
              { name: "Karori", code: "NZ-WEL-KAR", post_code: "6012", boundary: { type: "Polygon", coordinates: [[[174.73, -41.28], [174.74, -41.28], [174.74, -41.27], [174.73, -41.27], [174.73, -41.28]]] } },
              { name: "Newtown", code: "NZ-WEL-NEW", post_code: "6021", boundary: { type: "Polygon", coordinates: [[[174.78, -41.31], [174.79, -41.31], [174.79, -41.30], [174.78, -41.30], [174.78, -41.31]]] } },
            ],
          },
          {
            name: "Lower Hutt District",
            code: "NZ-WGN-LHT",
            suburbs: [
              { name: "Hutt Central", code: "NZ-LHT-CEN", post_code: "5010", boundary: { type: "Polygon", coordinates: [[[174.90, -41.21], [174.91, -41.21], [174.91, -41.20], [174.90, -41.20], [174.90, -41.21]]] } },
              { name: "Petone", code: "NZ-LHT-PET", post_code: "5012", boundary: { type: "Polygon", coordinates: [[[174.88, -41.22], [174.89, -41.22], [174.89, -41.21], [174.88, -41.21], [174.88, -41.22]]] } },
              { name: "Eastbourne", code: "NZ-LHT-EAS", post_code: "5013", boundary: { type: "Polygon", coordinates: [[[174.89, -41.29], [174.90, -41.29], [174.90, -41.28], [174.89, -41.28], [174.89, -41.29]]] } },
              { name: "Wainuiomata", code: "NZ-LHT-WAI", post_code: "5014", boundary: { type: "Polygon", coordinates: [[[174.95, -41.26], [174.96, -41.26], [174.96, -41.25], [174.95, -41.25], [174.95, -41.26]]] } },
            ],
          },
          {
            name: "Porirua District",
            code: "NZ-WGN-POR",
            suburbs: [
              { name: "Porirua City Centre", code: "NZ-POR-CEN", post_code: "5022", boundary: { type: "Polygon", coordinates: [[[174.83, -41.13], [174.84, -41.13], [174.84, -41.12], [174.83, -41.12], [174.83, -41.13]]] } },
              { name: "Titahi Bay", code: "NZ-POR-TIT", post_code: "5022", boundary: { type: "Polygon", coordinates: [[[174.82, -41.11], [174.83, -41.11], [174.83, -41.10], [174.82, -41.10], [174.82, -41.11]]] } },
              { name: "Whitby", code: "NZ-POR-WHI", post_code: "5024", boundary: { type: "Polygon", coordinates: [[[174.88, -41.12], [174.89, -41.12], [174.89, -41.11], [174.88, -41.11], [174.88, -41.12]]] } },
              { name: "Plimmerton", code: "NZ-POR-PLI", post_code: "5026", boundary: { type: "Polygon", coordinates: [[[174.86, -41.07], [174.87, -41.07], [174.87, -41.06], [174.86, -41.06], [174.86, -41.07]]] } },
            ],
          },
          {
            name: "Upper Hutt District",
            code: "NZ-WGN-UHT",
            suburbs: [
              { name: "Upper Hutt Central", code: "NZ-UHT-CEN", post_code: "5018", boundary: { type: "Polygon", coordinates: [[[175.06, -41.12], [175.07, -41.12], [175.07, -41.11], [175.06, -41.11], [175.06, -41.12]]] } },
              { name: "Silverstream", code: "NZ-UHT-SIL", post_code: "5019", boundary: { type: "Polygon", coordinates: [[[175.01, -41.15], [175.02, -41.15], [175.02, -41.14], [175.01, -41.14], [175.01, -41.15]]] } },
              { name: "Trentham", code: "NZ-UHT-TRE", post_code: "5018", boundary: { type: "Polygon", coordinates: [[[175.04, -41.13], [175.05, -41.13], [175.05, -41.12], [175.04, -41.12], [175.04, -41.13]]] } },
              { name: "Totara Park", code: "NZ-UHT-TOT", post_code: "5018", boundary: { type: "Polygon", coordinates: [[[175.08, -41.11], [175.09, -41.11], [175.09, -41.10], [175.08, -41.10], [175.08, -41.11]]] } },
            ],
          },
        ],
      },
      {
        name: "Canterbury Region",
        code: "NZ-CAN",
        districts: [
          {
            name: "Christchurch City District",
            code: "NZ-CAN-CHC",
            suburbs: [
              { name: "Christchurch Central", code: "NZ-CHC-CEN", post_code: "8011", boundary: { type: "Polygon", coordinates: [[[172.63, -43.53], [172.64, -43.53], [172.64, -43.52], [172.63, -43.52], [172.63, -43.53]]] } },
              { name: "Riccarton", code: "NZ-CHC-RIC", post_code: "8041", boundary: { type: "Polygon", coordinates: [[[172.59, -43.53], [172.60, -43.53], [172.60, -43.52], [172.59, -43.52], [172.59, -43.53]]] } },
              { name: "Fendalton", code: "NZ-CHC-FEN", post_code: "8052", boundary: { type: "Polygon", coordinates: [[[172.60, -43.51], [172.61, -43.51], [172.61, -43.50], [172.60, -43.50], [172.60, -43.51]]] } },
              { name: "Papanui", code: "NZ-CHC-PAP", post_code: "8053", boundary: { type: "Polygon", coordinates: [[[172.60, -43.49], [172.61, -43.49], [172.61, -43.48], [172.60, -43.48], [172.60, -43.49]]] } },
            ],
          },
          {
            name: "Selwyn District",
            code: "NZ-CAN-SEL",
            suburbs: [
              { name: "Rolleston", code: "NZ-SEL-ROL", post_code: "7614", boundary: { type: "Polygon", coordinates: [[[172.37, -43.59], [172.38, -43.59], [172.38, -43.58], [172.37, -43.58], [172.37, -43.59]]] } },
              { name: "Lincoln", code: "NZ-SEL-LIN", post_code: "7608", boundary: { type: "Polygon", coordinates: [[[172.48, -43.64], [172.49, -43.64], [172.49, -43.63], [172.48, -43.63], [172.48, -43.64]]] } },
              { name: "Darfield", code: "NZ-SEL-DAR", post_code: "7510", boundary: { type: "Polygon", coordinates: [[[172.01, -43.48], [172.02, -43.48], [172.02, -43.47], [172.01, -43.47], [172.01, -43.48]]] } },
              { name: "Leeston", code: "NZ-SEL-LEE", post_code: "7632", boundary: { type: "Polygon", coordinates: [[[172.30, -43.76], [172.31, -43.76], [172.31, -43.75], [172.30, -43.75], [172.30, -43.76]]] } },
            ],
          },
          {
            name: "Waimakariri District",
            code: "NZ-CAN-WAI",
            suburbs: [
              { name: "Rangiora", code: "NZ-WAI-RAN", post_code: "7400", boundary: { type: "Polygon", coordinates: [[[172.59, -43.30], [172.60, -43.30], [172.60, -43.29], [172.59, -43.29], [172.59, -43.30]]] } },
              { name: "Kaiapoi", code: "NZ-WAI-KAI", post_code: "7630", boundary: { type: "Polygon", coordinates: [[[172.65, -43.38], [172.66, -43.38], [172.66, -43.37], [172.65, -43.37], [172.65, -43.38]]] } },
              { name: "Pegasus", code: "NZ-WAI-PEG", post_code: "7612", boundary: { type: "Polygon", coordinates: [[[172.70, -43.31], [172.71, -43.31], [172.71, -43.30], [172.70, -43.30], [172.70, -43.31]]] } },
              { name: "Woodend", code: "NZ-WAI-WOO", post_code: "7610", boundary: { type: "Polygon", coordinates: [[[172.67, -43.32], [172.68, -43.32], [172.68, -43.31], [172.67, -43.31], [172.67, -43.32]]] } },
            ],
          },
          {
            name: "Ashburton District",
            code: "NZ-CAN-ASH",
            suburbs: [
              { name: "Ashburton Central", code: "NZ-ASH-CEN", post_code: "7700", boundary: { type: "Polygon", coordinates: [[[171.74, -43.90], [171.75, -43.90], [171.75, -43.89], [171.74, -43.89], [171.74, -43.90]]] } },
              { name: "Allenton", code: "NZ-ASH-ALL", post_code: "7700", boundary: { type: "Polygon", coordinates: [[[171.73, -43.88], [171.74, -43.88], [171.74, -43.87], [171.73, -43.87], [171.73, -43.88]]] } },
              { name: "Methven", code: "NZ-ASH-MET", post_code: "7730", boundary: { type: "Polygon", coordinates: [[[171.64, -43.63], [171.65, -43.63], [171.65, -43.62], [171.64, -43.62], [171.64, -43.63]]] } },
              { name: "Rakaia", code: "NZ-ASH-RAK", post_code: "7710", boundary: { type: "Polygon", coordinates: [[[172.01, -43.75], [172.02, -43.75], [172.02, -43.74], [172.01, -43.74], [172.01, -43.75]]] } },
            ],
          },
        ],
      },
    ],
  },

  // 2. Australia
  {
    name: "Australia",
    iso_code: "AU",
    iso_code_3: "AUS",
    phone_code: "+61",
    currency: "AUD",
    continent: "Oceania",
    timezone: ["Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Perth"],
    regions: [
      {
        name: "New South Wales",
        code: "AU-NSW",
        districts: [
          {
            name: "Sydney City District",
            code: "AU-NSW-SYD",
            suburbs: [
              { name: "Sydney CBD", code: "AU-SYD-CBD", post_code: "2000", boundary: { type: "Polygon", coordinates: [[[151.20, -33.86], [151.21, -33.86], [151.21, -33.85], [151.20, -33.85], [151.20, -33.86]]] } },
              { name: "Surry Hills", code: "AU-SYD-SUR", post_code: "2010", boundary: { type: "Polygon", coordinates: [[[151.21, -33.88], [151.22, -33.88], [151.22, -33.87], [151.21, -33.87], [151.21, -33.88]]] } },
              { name: "Paddington", code: "AU-SYD-PAD", post_code: "2021", boundary: { type: "Polygon", coordinates: [[[151.22, -33.88], [151.23, -33.88], [151.23, -33.87], [151.22, -33.87], [151.22, -33.88]]] } },
              { name: "Bondi", code: "AU-SYD-BON", post_code: "2026", boundary: { type: "Polygon", coordinates: [[[151.27, -33.89], [151.28, -33.89], [151.28, -33.88], [151.27, -33.88], [151.27, -33.89]]] } },
            ],
          },
          {
            name: "Parramatta District",
            code: "AU-NSW-PAR",
            suburbs: [
              { name: "Parramatta CBD", code: "AU-PAR-CBD", post_code: "2150", boundary: { type: "Polygon", coordinates: [[[151.00, -33.81], [151.01, -33.81], [151.01, -33.80], [151.00, -33.80], [151.00, -33.81]]] } },
              { name: "Westmead", code: "AU-PAR-WES", post_code: "2145", boundary: { type: "Polygon", coordinates: [[[150.98, -33.80], [150.99, -33.80], [150.99, -33.79], [150.98, -33.79], [150.98, -33.80]]] } },
              { name: "Harris Park", code: "AU-PAR-HAR", post_code: "2150", boundary: { type: "Polygon", coordinates: [[[151.01, -33.82], [151.02, -33.82], [151.02, -33.81], [151.01, -33.81], [151.01, -33.82]]] } },
              { name: "Rosehill", code: "AU-PAR-ROS", post_code: "2142", boundary: { type: "Polygon", coordinates: [[[151.03, -33.82], [151.04, -33.82], [151.04, -33.81], [151.03, -33.81], [151.03, -33.82]]] } },
            ],
          },
          {
            name: "Newcastle District",
            code: "AU-NSW-NEW",
            suburbs: [
              { name: "Newcastle CBD", code: "AU-NEW-CBD", post_code: "2300", boundary: { type: "Polygon", coordinates: [[[151.77, -32.92], [151.78, -32.92], [151.78, -32.91], [151.77, -32.91], [151.77, -32.92]]] } },
              { name: "Hamilton", code: "AU-NEW-HAM", post_code: "2303", boundary: { type: "Polygon", coordinates: [[[151.74, -32.92], [151.75, -32.92], [151.75, -32.91], [151.74, -32.91], [151.74, -32.92]]] } },
              { name: "Merewether", code: "AU-NEW-MER", post_code: "2291", boundary: { type: "Polygon", coordinates: [[[151.75, -32.95], [151.76, -32.95], [151.76, -32.94], [151.75, -32.94], [151.75, -32.95]]] } },
              { name: "Cooks Hill", code: "AU-NEW-COO", post_code: "2300", boundary: { type: "Polygon", coordinates: [[[151.76, -32.93], [151.77, -32.93], [151.77, -32.92], [151.76, -32.92], [151.76, -32.93]]] } },
            ],
          },
          {
            name: "Wollongong District",
            code: "AU-NSW-WOL",
            suburbs: [
              { name: "Wollongong CBD", code: "AU-WOL-CBD", post_code: "2500", boundary: { type: "Polygon", coordinates: [[[150.89, -34.42], [150.90, -34.42], [150.90, -34.41], [150.89, -34.41], [150.89, -34.42]]] } },
              { name: "North Wollongong", code: "AU-WOL-NTH", post_code: "2500", boundary: { type: "Polygon", coordinates: [[[150.89, -34.40], [150.90, -34.40], [150.90, -34.39], [150.89, -34.39], [150.89, -34.40]]] } },
              { name: "Fairy Meadow", code: "AU-WOL-FAI", post_code: "2519", boundary: { type: "Polygon", coordinates: [[[150.88, -34.39], [150.89, -34.39], [150.89, -34.38], [150.88, -34.38], [150.88, -34.39]]] } },
              { name: "Figtree", code: "AU-WOL-FIG", post_code: "2525", boundary: { type: "Polygon", coordinates: [[[150.85, -34.44], [150.86, -34.44], [150.86, -34.43], [150.85, -34.43], [150.85, -34.44]]] } },
            ],
          },
        ],
      },
      {
        name: "Victoria",
        code: "AU-VIC",
        districts: [
          {
            name: "Melbourne City District",
            code: "AU-VIC-MEL",
            suburbs: [
              { name: "Melbourne CBD", code: "AU-MEL-CBD", post_code: "3000", boundary: { type: "Polygon", coordinates: [[[144.96, -37.81], [144.97, -37.81], [144.97, -37.80], [144.96, -37.80], [144.96, -37.81]]] } },
              { name: "Southbank", code: "AU-MEL-SOU", post_code: "3006", boundary: { type: "Polygon", coordinates: [[[144.95, -37.82], [144.96, -37.82], [144.96, -37.81], [144.95, -37.81], [144.95, -37.82]]] } },
              { name: "Carlton", code: "AU-MEL-CAR", post_code: "3053", boundary: { type: "Polygon", coordinates: [[[144.96, -37.79], [144.97, -37.79], [144.97, -37.78], [144.96, -37.78], [144.96, -37.79]]] } },
              { name: "Docklands", code: "AU-MEL-DOC", post_code: "3008", boundary: { type: "Polygon", coordinates: [[[144.93, -37.81], [144.94, -37.81], [144.94, -37.80], [144.93, -37.80], [144.93, -37.81]]] } },
            ],
          },
          {
            name: "Yarra District",
            code: "AU-VIC-YAR",
            suburbs: [
              { name: "Richmond", code: "AU-YAR-RIC", post_code: "3121", boundary: { type: "Polygon", coordinates: [[[144.99, -37.82], [145.00, -37.82], [145.00, -37.81], [144.99, -37.81], [144.99, -37.82]]] } },
              { name: "Fitzroy", code: "AU-YAR-FIT", post_code: "3065", boundary: { type: "Polygon", coordinates: [[[144.97, -37.79], [144.98, -37.79], [144.98, -37.78], [144.97, -37.78], [144.97, -37.79]]] } },
              { name: "Collingwood", code: "AU-YAR-COL", post_code: "3066", boundary: { type: "Polygon", coordinates: [[[144.98, -37.80], [144.99, -37.80], [144.99, -37.79], [144.98, -37.79], [144.98, -37.80]]] } },
              { name: "Abbotsford", code: "AU-YAR-ABB", post_code: "3067", boundary: { type: "Polygon", coordinates: [[[145.00, -37.80], [145.01, -37.80], [145.01, -37.79], [145.00, -37.79], [145.00, -37.80]]] } },
            ],
          },
          {
            name: "Geelong District",
            code: "AU-VIC-GEE",
            suburbs: [
              { name: "Geelong Central", code: "AU-GEE-CEN", post_code: "3220", boundary: { type: "Polygon", coordinates: [[[144.35, -38.15], [144.36, -38.15], [144.36, -38.14], [144.35, -38.14], [144.35, -38.15]]] } },
              { name: "Newtown", code: "AU-GEE-NEW", post_code: "3220", boundary: { type: "Polygon", coordinates: [[[144.33, -38.15], [144.34, -38.15], [144.34, -38.14], [144.33, -38.14], [144.33, -38.15]]] } },
              { name: "Belmont", code: "AU-GEE-BEL", post_code: "3216", boundary: { type: "Polygon", coordinates: [[[144.34, -38.18], [144.35, -38.18], [144.35, -38.17], [144.34, -38.17], [144.34, -38.18]]] } },
              { name: "Geelong West", code: "AU-GEE-WES", post_code: "3218", boundary: { type: "Polygon", coordinates: [[[144.34, -38.14], [144.35, -38.14], [144.35, -38.13], [144.34, -38.13], [144.34, -38.14]]] } },
            ],
          },
          {
            name: "Ballarat District",
            code: "AU-VIC-BAL",
            suburbs: [
              { name: "Ballarat Central", code: "AU-BAL-CEN", post_code: "3350", boundary: { type: "Polygon", coordinates: [[[143.85, -37.56], [143.86, -37.56], [143.86, -37.55], [143.85, -37.55], [143.85, -37.56]]] } },
              { name: "Wendouree", code: "AU-BAL-WEN", post_code: "3355", boundary: { type: "Polygon", coordinates: [[[143.83, -37.53], [143.84, -37.53], [143.84, -37.52], [143.83, -37.52], [143.83, -37.53]]] } },
              { name: "Sebastopol", code: "AU-BAL-SEB", post_code: "3356", boundary: { type: "Polygon", coordinates: [[[143.84, -37.59], [143.85, -37.59], [143.85, -37.58], [143.84, -37.58], [143.84, -37.59]]] } },
              { name: "Alfredton", code: "AU-BAL-ALF", post_code: "3350", boundary: { type: "Polygon", coordinates: [[[143.80, -37.56], [143.81, -37.56], [143.81, -37.55], [143.80, -37.55], [143.80, -37.56]]] } },
            ],
          },
        ],
      },
      {
        name: "Queensland",
        code: "AU-QLD",
        districts: [
          {
            name: "Brisbane City District",
            code: "AU-QLD-BNE",
            suburbs: [
              { name: "Brisbane CBD", code: "AU-BNE-CBD", post_code: "4000", boundary: { type: "Polygon", coordinates: [[[153.02, -27.47], [153.03, -27.47], [153.03, -27.46], [153.02, -27.46], [153.02, -27.47]]] } },
              { name: "Fortitude Valley", code: "AU-BNE-FOR", post_code: "4006", boundary: { type: "Polygon", coordinates: [[[153.03, -27.45], [153.04, -27.45], [153.04, -27.44], [153.03, -27.44], [153.03, -27.45]]] } },
              { name: "South Brisbane", code: "AU-BNE-SOU", post_code: "4101", boundary: { type: "Polygon", coordinates: [[[153.01, -27.48], [153.02, -27.48], [153.02, -27.47], [153.01, -27.47], [153.01, -27.48]]] } },
              { name: "Paddington QLD", code: "AU-BNE-PAD", post_code: "4064", boundary: { type: "Polygon", coordinates: [[[152.99, -27.46], [153.00, -27.46], [153.00, -27.45], [152.99, -27.45], [152.99, -27.46]]] } },
            ],
          },
          {
            name: "Gold Coast District",
            code: "AU-QLD-GLD",
            suburbs: [
              { name: "Surfers Paradise", code: "AU-GLD-SUR", post_code: "4217", boundary: { type: "Polygon", coordinates: [[[153.42, -28.00], [153.43, -28.00], [153.43, -27.99], [153.42, -27.99], [153.42, -28.00]]] } },
              { name: "Broadbeach", code: "AU-GLD-BRO", post_code: "4218", boundary: { type: "Polygon", coordinates: [[[153.42, -28.03], [153.43, -28.03], [153.43, -28.02], [153.42, -28.02], [153.42, -28.03]]] } },
              { name: "Southport", code: "AU-GLD-SOU", post_code: "4215", boundary: { type: "Polygon", coordinates: [[[153.40, -27.97], [153.41, -27.97], [153.41, -27.96], [153.40, -27.96], [153.40, -27.97]]] } },
              { name: "Burleigh Heads", code: "AU-GLD-BUR", post_code: "4220", boundary: { type: "Polygon", coordinates: [[[153.44, -28.09], [153.45, -28.09], [153.45, -28.08], [153.44, -28.08], [153.44, -28.09]]] } },
            ],
          },
          {
            name: "Sunshine Coast District",
            code: "AU-QLD-SUN",
            suburbs: [
              { name: "Maroochydore", code: "AU-SUN-MAR", post_code: "4558", boundary: { type: "Polygon", coordinates: [[[153.08, -26.65], [153.09, -26.65], [153.09, -26.64], [153.08, -26.64], [153.08, -26.65]]] } },
              { name: "Caloundra", code: "AU-SUN-CAL", post_code: "4551", boundary: { type: "Polygon", coordinates: [[[153.12, -26.80], [153.13, -26.80], [153.13, -26.79], [153.12, -26.79], [153.12, -26.80]]] } },
              { name: "Noosa Heads", code: "AU-SUN-NOO", post_code: "4567", boundary: { type: "Polygon", coordinates: [[[153.09, -26.39], [153.10, -26.39], [153.10, -26.38], [153.09, -26.38], [153.09, -26.39]]] } },
              { name: "Mooloolaba", code: "AU-SUN-MOO", post_code: "4557", boundary: { type: "Polygon", coordinates: [[[153.11, -26.68], [153.12, -26.68], [153.12, -26.67], [153.11, -26.67], [153.11, -26.68]]] } },
            ],
          },
          {
            name: "Townsville District",
            code: "AU-QLD-TWN",
            suburbs: [
              { name: "Townsville CBD", code: "AU-TWN-CBD", post_code: "4810", boundary: { type: "Polygon", coordinates: [[[146.81, -19.26], [146.82, -19.26], [146.82, -19.25], [146.81, -19.25], [146.81, -19.26]]] } },
              { name: "North Ward", code: "AU-TWN-NOR", post_code: "4810", boundary: { type: "Polygon", coordinates: [[[146.81, -19.24], [146.82, -19.24], [146.82, -19.23], [146.81, -19.23], [146.81, -19.24]]] } },
              { name: "Belgian Gardens", code: "AU-TWN-BEL", post_code: "4810", boundary: { type: "Polygon", coordinates: [[[146.79, -19.24], [146.80, -19.24], [146.80, -19.23], [146.79, -19.23], [146.79, -19.24]]] } },
              { name: "Aitkenvale", code: "AU-TWN-AIT", post_code: "4814", boundary: { type: "Polygon", coordinates: [[[146.76, -19.30], [146.77, -19.30], [146.77, -19.29], [146.76, -19.29], [146.76, -19.30]]] } },
            ],
          },
        ],
      },
      {
        name: "Western Australia",
        code: "AU-WA",
        districts: [
          {
            name: "Perth City District",
            code: "AU-WA-PER",
            suburbs: [
              { name: "Perth CBD", code: "AU-PER-CBD", post_code: "6000", boundary: { type: "Polygon", coordinates: [[[115.85, -31.95], [115.86, -31.95], [115.86, -31.94], [115.85, -31.94], [115.85, -31.95]]] } },
              { name: "Northbridge", code: "AU-PER-NBR", post_code: "6003", boundary: { type: "Polygon", coordinates: [[[115.85, -31.94], [115.86, -31.94], [115.86, -31.93], [115.85, -31.93], [115.85, -31.94]]] } },
              { name: "East Perth", code: "AU-PER-EAS", post_code: "6004", boundary: { type: "Polygon", coordinates: [[[115.87, -31.95], [115.88, -31.95], [115.88, -31.94], [115.87, -31.94], [115.87, -31.95]]] } },
              { name: "West Perth", code: "AU-PER-WES", post_code: "6005", boundary: { type: "Polygon", coordinates: [[[115.84, -31.95], [115.85, -31.95], [115.85, -31.94], [115.84, -31.94], [115.84, -31.95]]] } },
            ],
          },
          {
            name: "Fremantle District",
            code: "AU-WA-FRE",
            suburbs: [
              { name: "Fremantle City", code: "AU-FRE-CIT", post_code: "6160", boundary: { type: "Polygon", coordinates: [[[115.74, -32.05], [115.75, -32.05], [115.75, -32.04], [115.74, -32.04], [115.74, -32.05]]] } },
              { name: "South Fremantle", code: "AU-FRE-SOU", post_code: "6162", boundary: { type: "Polygon", coordinates: [[[115.75, -32.07], [115.76, -32.07], [115.76, -32.06], [115.75, -32.06], [115.75, -32.07]]] } },
              { name: "East Fremantle", code: "AU-FRE-EAS", post_code: "6158", boundary: { type: "Polygon", coordinates: [[[115.76, -32.04], [115.77, -32.04], [115.77, -32.03], [115.76, -32.03], [115.76, -32.04]]] } },
              { name: "North Fremantle", code: "AU-FRE-NOR", post_code: "6159", boundary: { type: "Polygon", coordinates: [[[115.75, -32.03], [115.76, -32.03], [115.76, -32.02], [115.75, -32.02], [115.75, -32.03]]] } },
            ],
          },
          {
            name: "Joondalup District",
            code: "AU-WA-JOO",
            suburbs: [
              { name: "Joondalup Central", code: "AU-JOO-CEN", post_code: "6027", boundary: { type: "Polygon", coordinates: [[[115.76, -31.74], [115.77, -31.74], [115.77, -31.73], [115.76, -31.73], [115.76, -31.74]]] } },
              { name: "Hillarys", code: "AU-JOO-HIL", post_code: "6025", boundary: { type: "Polygon", coordinates: [[[115.74, -31.81], [115.75, -31.81], [115.75, -31.80], [115.74, -31.80], [115.74, -31.81]]] } },
              { name: "Ocean Reef", code: "AU-JOO-OCE", post_code: "6027", boundary: { type: "Polygon", coordinates: [[[115.73, -31.76], [115.74, -31.76], [115.74, -31.75], [115.73, -31.75], [115.73, -31.76]]] } },
              { name: "Currambine", code: "AU-JOO-CUR", post_code: "6028", boundary: { type: "Polygon", coordinates: [[[115.74, -31.72], [115.75, -31.72], [115.75, -31.71], [115.74, -31.71], [115.74, -31.72]]] } },
            ],
          },
          {
            name: "Stirling District",
            code: "AU-WA-STI",
            suburbs: [
              { name: "Scarborough", code: "AU-STI-SCA", post_code: "6019", boundary: { type: "Polygon", coordinates: [[[115.75, -31.89], [115.76, -31.89], [115.76, -31.88], [115.75, -31.88], [115.75, -31.89]]] } },
              { name: "Innaloo", code: "AU-STI-INN", post_code: "6018", boundary: { type: "Polygon", coordinates: [[[115.79, -31.89], [115.80, -31.89], [115.80, -31.88], [115.79, -31.88], [115.79, -31.89]]] } },
              { name: "Karrinyup", code: "AU-STI-KAR", post_code: "6018", boundary: { type: "Polygon", coordinates: [[[115.78, -31.87], [115.79, -31.87], [115.79, -31.86], [115.78, -31.86], [115.78, -31.87]]] } },
              { name: "Osborne Park", code: "AU-STI-OSB", post_code: "6017", boundary: { type: "Polygon", coordinates: [[[115.81, -31.89], [115.82, -31.89], [115.82, -31.88], [115.81, -31.88], [115.81, -31.89]]] } },
            ],
          },
        ],
      },
    ],
  },

  // 3. United Kingdom
  {
    name: "United Kingdom",
    iso_code: "GB",
    iso_code_3: "GBR",
    phone_code: "+44",
    currency: "GBP",
    continent: "Europe",
    timezone: ["Europe/London"],
    regions: [
      {
        name: "Greater London",
        code: "GB-LDN",
        districts: [
          {
            name: "City of Westminster",
            code: "GB-LDN-WSM",
            suburbs: [
              { name: "Soho", code: "GB-WSM-SOH", post_code: "W1D", boundary: { type: "Polygon", coordinates: [[[-0.14, 51.51], [-0.13, 51.51], [-0.13, 51.52], [-0.14, 51.52], [-0.14, 51.51]]] } },
              { name: "Mayfair", code: "GB-WSM-MAY", post_code: "W1J", boundary: { type: "Polygon", coordinates: [[[-0.15, 51.50], [-0.14, 51.50], [-0.14, 51.51], [-0.15, 51.51], [-0.15, 51.50]]] } },
              { name: "Marylebone", code: "GB-WSM-MAR", post_code: "W1U", boundary: { type: "Polygon", coordinates: [[[-0.16, 51.51], [-0.15, 51.51], [-0.15, 51.52], [-0.16, 51.52], [-0.16, 51.51]]] } },
              { name: "Paddington London", code: "GB-WSM-PAD", post_code: "W2", boundary: { type: "Polygon", coordinates: [[[-0.18, 51.51], [-0.17, 51.51], [-0.17, 51.52], [-0.18, 51.52], [-0.18, 51.51]]] } },
            ],
          },
          {
            name: "Camden",
            code: "GB-LDN-CMD",
            suburbs: [
              { name: "Camden Town", code: "GB-CMD-TWN", post_code: "NW1", boundary: { type: "Polygon", coordinates: [[[-0.14, 51.53], [-0.13, 51.53], [-0.13, 51.54], [-0.14, 51.54], [-0.14, 51.53]]] } },
              { name: "Hampstead", code: "GB-CMD-HAM", post_code: "NW3", boundary: { type: "Polygon", coordinates: [[[-0.18, 51.55], [-0.17, 51.55], [-0.17, 51.56], [-0.18, 51.56], [-0.18, 51.55]]] } },
              { name: "Holborn", code: "GB-CMD-HOL", post_code: "WC1", boundary: { type: "Polygon", coordinates: [[[-0.12, 51.51], [-0.11, 51.51], [-0.11, 51.52], [-0.12, 51.52], [-0.12, 51.51]]] } },
              { name: "Bloomsbury", code: "GB-CMD-BLO", post_code: "WC1B", boundary: { type: "Polygon", coordinates: [[[-0.13, 51.52], [-0.12, 51.52], [-0.12, 51.53], [-0.13, 51.53], [-0.13, 51.52]]] } },
            ],
          },
          {
            name: "Kensington and Chelsea",
            code: "GB-LDN-KEC",
            suburbs: [
              { name: "Chelsea", code: "GB-KEC-CHE", post_code: "SW3", boundary: { type: "Polygon", coordinates: [[[-0.17, 51.48], [-0.16, 51.48], [-0.16, 51.49], [-0.17, 51.49], [-0.17, 51.48]]] } },
              { name: "Kensington", code: "GB-KEC-KEN", post_code: "W8", boundary: { type: "Polygon", coordinates: [[[-0.20, 51.49], [-0.19, 51.49], [-0.19, 51.50], [-0.20, 51.50], [-0.20, 51.49]]] } },
              { name: "Notting Hill", code: "GB-KEC-NOT", post_code: "W11", boundary: { type: "Polygon", coordinates: [[[-0.21, 51.50], [-0.20, 51.50], [-0.20, 51.51], [-0.21, 51.51], [-0.21, 51.50]]] } },
              { name: "Knightsbridge", code: "GB-KEC-KNI", post_code: "SW1X", boundary: { type: "Polygon", coordinates: [[[-0.16, 51.49], [-0.15, 51.49], [-0.15, 51.50], [-0.16, 51.50], [-0.16, 51.49]]] } },
            ],
          },
          {
            name: "Islington",
            code: "GB-LDN-ISL",
            suburbs: [
              { name: "Angel", code: "GB-ISL-ANG", post_code: "N1", boundary: { type: "Polygon", coordinates: [[[-0.11, 51.53], [-0.10, 51.53], [-0.10, 51.54], [-0.11, 51.54], [-0.11, 51.53]]] } },
              { name: "Highbury", code: "GB-ISL-HIG", post_code: "N5", boundary: { type: "Polygon", coordinates: [[[-0.10, 51.54], [-0.09, 51.54], [-0.09, 51.55], [-0.10, 51.55], [-0.10, 51.54]]] } },
              { name: "Finsbury Park", code: "GB-ISL-FIN", post_code: "N4", boundary: { type: "Polygon", coordinates: [[[-0.11, 51.56], [-0.10, 51.56], [-0.10, 51.57], [-0.11, 51.57], [-0.11, 51.56]]] } },
              { name: "Clerkenwell", code: "GB-ISL-CLE", post_code: "EC1", boundary: { type: "Polygon", coordinates: [[[-0.11, 51.52], [-0.10, 51.52], [-0.10, 51.53], [-0.11, 51.53], [-0.11, 51.52]]] } },
            ],
          },
        ],
      },
      {
        name: "Greater Manchester",
        code: "GB-GMN",
        districts: [
          {
            name: "Manchester City Centre",
            code: "GB-GMN-MCC",
            suburbs: [
              { name: "Northern Quarter", code: "GB-MCC-NQT", post_code: "M1", boundary: { type: "Polygon", coordinates: [[[-2.24, 53.48], [-2.23, 53.48], [-2.23, 53.49], [-2.24, 53.49], [-2.24, 53.48]]] } },
              { name: "Ancoats", code: "GB-MCC-ANC", post_code: "M4", boundary: { type: "Polygon", coordinates: [[[-2.22, 53.48], [-2.21, 53.48], [-2.21, 53.49], [-2.22, 53.49], [-2.22, 53.48]]] } },
              { name: "Deansgate", code: "GB-MCC-DEA", post_code: "M3", boundary: { type: "Polygon", coordinates: [[[-2.25, 53.47], [-2.24, 53.47], [-2.24, 53.48], [-2.25, 53.48], [-2.25, 53.47]]] } },
              { name: "Castlefield", code: "GB-MCC-CAS", post_code: "M3", boundary: { type: "Polygon", coordinates: [[[-2.26, 53.47], [-2.25, 53.47], [-2.25, 53.48], [-2.26, 53.48], [-2.26, 53.47]]] } },
            ],
          },
          {
            name: "Salford District",
            code: "GB-GMN-SAL",
            suburbs: [
              { name: "MediaCityUK", code: "GB-SAL-MED", post_code: "M50", boundary: { type: "Polygon", coordinates: [[[-2.30, 53.47], [-2.29, 53.47], [-2.29, 53.48], [-2.30, 53.48], [-2.30, 53.47]]] } },
              { name: "Salford Quays", code: "GB-SAL-QYS", post_code: "M50", boundary: { type: "Polygon", coordinates: [[[-2.29, 53.47], [-2.28, 53.47], [-2.28, 53.48], [-2.29, 53.48], [-2.29, 53.47]]] } },
              { name: "Eccles", code: "GB-SAL-ECC", post_code: "M30", boundary: { type: "Polygon", coordinates: [[[-2.34, 53.48], [-2.33, 53.48], [-2.33, 53.49], [-2.34, 53.49], [-2.34, 53.48]]] } },
              { name: "Swinton", code: "GB-SAL-SWI", post_code: "M27", boundary: { type: "Polygon", coordinates: [[[-2.35, 53.51], [-2.34, 53.51], [-2.34, 53.52], [-2.35, 53.52], [-2.35, 53.51]]] } },
            ],
          },
          {
            name: "Trafford District",
            code: "GB-GMN-TRF",
            suburbs: [
              { name: "Altrincham", code: "GB-TRF-ALT", post_code: "WA14", boundary: { type: "Polygon", coordinates: [[[-2.36, 53.38], [-2.35, 53.38], [-2.35, 53.39], [-2.36, 53.39], [-2.36, 53.38]]] } },
              { name: "Sale", code: "GB-TRF-SAL", post_code: "M33", boundary: { type: "Polygon", coordinates: [[[-2.33, 53.42], [-2.32, 53.42], [-2.32, 53.43], [-2.33, 53.43], [-2.33, 53.42]]] } },
              { name: "Stretford", code: "GB-TRF-STR", post_code: "M32", boundary: { type: "Polygon", coordinates: [[[-2.32, 53.44], [-2.31, 53.44], [-2.31, 53.45], [-2.32, 53.45], [-2.32, 53.44]]] } },
              { name: "Urmston", code: "GB-TRF-URM", post_code: "M41", boundary: { type: "Polygon", coordinates: [[[-2.36, 53.44], [-2.35, 53.44], [-2.35, 53.45], [-2.36, 53.45], [-2.36, 53.44]]] } },
            ],
          },
          {
            name: "Stockport District",
            code: "GB-GMN-STK",
            suburbs: [
              { name: "Stockport Central", code: "GB-STK-CEN", post_code: "SK1", boundary: { type: "Polygon", coordinates: [[[-2.16, 53.40], [-2.15, 53.40], [-2.15, 53.41], [-2.16, 53.41], [-2.16, 53.40]]] } },
              { name: "Bramhall", code: "GB-STK-BRA", post_code: "SK7", boundary: { type: "Polygon", coordinates: [[[-2.17, 53.36], [-2.16, 53.36], [-2.16, 53.37], [-2.17, 53.37], [-2.17, 53.36]]] } },
              { name: "Cheadle", code: "GB-STK-CHE", post_code: "SK8", boundary: { type: "Polygon", coordinates: [[[-2.22, 53.39], [-2.21, 53.39], [-2.21, 53.40], [-2.22, 53.40], [-2.22, 53.39]]] } },
              { name: "Marple", code: "GB-STK-MAR", post_code: "SK6", boundary: { type: "Polygon", coordinates: [[[-2.07, 53.39], [-2.06, 53.39], [-2.06, 53.40], [-2.07, 53.40], [-2.07, 53.39]]] } },
            ],
          },
        ],
      },
      {
        name: "West Midlands",
        code: "GB-WMD",
        districts: [
          {
            name: "Birmingham City District",
            code: "GB-WMD-BIR",
            suburbs: [
              { name: "Birmingham City Centre", code: "GB-BIR-CEN", post_code: "B1", boundary: { type: "Polygon", coordinates: [[[-1.90, 52.48], [-1.89, 52.48], [-1.89, 52.49], [-1.90, 52.49], [-1.90, 52.48]]] } },
              { name: "Jewellery Quarter", code: "GB-BIR-JEW", post_code: "B18", boundary: { type: "Polygon", coordinates: [[[-1.92, 52.48], [-1.91, 52.48], [-1.91, 52.49], [-1.92, 52.49], [-1.92, 52.48]]] } },
              { name: "Edgbaston", code: "GB-BIR-EDG", post_code: "B15", boundary: { type: "Polygon", coordinates: [[[-1.93, 52.46], [-1.92, 52.46], [-1.92, 52.47], [-1.93, 52.47], [-1.93, 52.46]]] } },
              { name: "Moseley", code: "GB-BIR-MOS", post_code: "B13", boundary: { type: "Polygon", coordinates: [[[-1.89, 52.44], [-1.88, 52.44], [-1.88, 52.45], [-1.89, 52.45], [-1.89, 52.44]]] } },
            ],
          },
          {
            name: "Coventry District",
            code: "GB-WMD-COV",
            suburbs: [
              { name: "Coventry City Centre", code: "GB-COV-CEN", post_code: "CV1", boundary: { type: "Polygon", coordinates: [[[-1.52, 52.40], [-1.51, 52.40], [-1.51, 52.41], [-1.52, 52.41], [-1.52, 52.40]]] } },
              { name: "Earlsdon", code: "GB-COV-EAR", post_code: "CV5", boundary: { type: "Polygon", coordinates: [[[-1.54, 52.39], [-1.53, 52.39], [-1.53, 52.40], [-1.54, 52.40], [-1.54, 52.39]]] } },
              { name: "Finham", code: "GB-COV-FIN", post_code: "CV3", boundary: { type: "Polygon", coordinates: [[[-1.52, 52.37], [-1.51, 52.37], [-1.51, 52.38], [-1.52, 52.38], [-1.52, 52.37]]] } },
              { name: "Stivichall", code: "GB-COV-STI", post_code: "CV3", boundary: { type: "Polygon", coordinates: [[[-1.53, 52.38], [-1.52, 52.38], [-1.52, 52.39], [-1.53, 52.39], [-1.53, 52.38]]] } },
            ],
          },
          {
            name: "Solihull District",
            code: "GB-WMD-SOL",
            suburbs: [
              { name: "Solihull Town Centre", code: "GB-SOL-CEN", post_code: "B91", boundary: { type: "Polygon", coordinates: [[[-1.78, 52.41], [-1.77, 52.41], [-1.77, 52.42], [-1.78, 52.42], [-1.78, 52.41]]] } },
              { name: "Shirley", code: "GB-SOL-SHI", post_code: "B90", boundary: { type: "Polygon", coordinates: [[[-1.82, 52.41], [-1.81, 52.41], [-1.81, 52.42], [-1.82, 52.42], [-1.82, 52.41]]] } },
              { name: "Knowle", code: "GB-SOL-KNO", post_code: "B93", boundary: { type: "Polygon", coordinates: [[[-1.74, 52.39], [-1.73, 52.39], [-1.73, 52.40], [-1.74, 52.40], [-1.74, 52.39]]] } },
              { name: "Dorridge", code: "GB-SOL-DOR", post_code: "B93", boundary: { type: "Polygon", coordinates: [[[-1.75, 52.37], [-1.74, 52.37], [-1.74, 52.38], [-1.75, 52.38], [-1.75, 52.37]]] } },
            ],
          },
          {
            name: "Wolverhampton District",
            code: "GB-WMD-WOL",
            suburbs: [
              { name: "Wolverhampton Centre", code: "GB-WLV-CEN", post_code: "WV1", boundary: { type: "Polygon", coordinates: [[[-2.13, 52.58], [-2.12, 52.58], [-2.12, 52.59], [-2.13, 52.59], [-2.13, 52.58]]] } },
              { name: "Tettenhall", code: "GB-WLV-TET", post_code: "WV6", boundary: { type: "Polygon", coordinates: [[[-2.17, 52.59], [-2.16, 52.59], [-2.16, 52.60], [-2.17, 52.60], [-2.17, 52.59]]] } },
              { name: "Penn", code: "GB-WLV-PEN", post_code: "WV4", boundary: { type: "Polygon", coordinates: [[[-2.15, 52.56], [-2.14, 52.56], [-2.14, 52.57], [-2.15, 52.57], [-2.15, 52.56]]] } },
              { name: "Wednesfield", code: "GB-WLV-WED", post_code: "WV11", boundary: { type: "Polygon", coordinates: [[[-2.09, 52.60], [-2.08, 52.60], [-2.08, 52.61], [-2.09, 52.61], [-2.09, 52.60]]] } },
            ],
          },
        ],
      },
      {
        name: "Scotland (Region)",
        code: "GB-SCT",
        districts: [
          {
            name: "Edinburgh City District",
            code: "GB-SCT-EDI",
            suburbs: [
              { name: "Old Town Edinburgh", code: "GB-EDI-OLD", post_code: "EH1", boundary: { type: "Polygon", coordinates: [[[-3.19, 55.94], [-3.18, 55.94], [-3.18, 55.95], [-3.19, 55.95], [-3.19, 55.94]]] } },
              { name: "New Town Edinburgh", code: "GB-EDI-NEW", post_code: "EH2", boundary: { type: "Polygon", coordinates: [[[-3.20, 55.95], [-3.19, 55.95], [-3.19, 55.96], [-3.20, 55.96], [-3.20, 55.95]]] } },
              { name: "Leith", code: "GB-EDI-LEI", post_code: "EH6", boundary: { type: "Polygon", coordinates: [[[-3.18, 55.97], [-3.17, 55.97], [-3.17, 55.98], [-3.18, 55.98], [-3.18, 55.97]]] } },
              { name: "Stockbridge", code: "GB-EDI-STO", post_code: "EH4", boundary: { type: "Polygon", coordinates: [[[-3.21, 55.96], [-3.20, 55.96], [-3.20, 55.97], [-3.21, 55.97], [-3.21, 55.96]]] } },
            ],
          },
          {
            name: "Glasgow City District",
            code: "GB-SCT-GLA",
            suburbs: [
              { name: "Glasgow City Centre", code: "GB-GLA-CEN", post_code: "G1", boundary: { type: "Polygon", coordinates: [[[-4.26, 55.85], [-4.25, 55.85], [-4.25, 55.86], [-4.26, 55.86], [-4.26, 55.85]]] } },
              { name: "West End Glasgow", code: "GB-GLA-WES", post_code: "G12", boundary: { type: "Polygon", coordinates: [[[-4.30, 55.87], [-4.29, 55.87], [-4.29, 55.88], [-4.30, 55.88], [-4.30, 55.87]]] } },
              { name: "Merchant City", code: "GB-GLA-MER", post_code: "G1", boundary: { type: "Polygon", coordinates: [[[-4.25, 55.85], [-4.24, 55.85], [-4.24, 55.86], [-4.25, 55.86], [-4.25, 55.85]]] } },
              { name: "Shawlands", code: "GB-GLA-SHA", post_code: "G41", boundary: { type: "Polygon", coordinates: [[[-4.28, 55.82], [-4.27, 55.82], [-4.27, 55.83], [-4.28, 55.83], [-4.28, 55.82]]] } },
            ],
          },
          {
            name: "Aberdeen District",
            code: "GB-SCT-ABD",
            suburbs: [
              { name: "Aberdeen Centre", code: "GB-ABD-CEN", post_code: "AB10", boundary: { type: "Polygon", coordinates: [[[-2.11, 57.14], [-2.10, 57.14], [-2.10, 57.15], [-2.11, 57.15], [-2.11, 57.14]]] } },
              { name: "Old Aberdeen", code: "GB-ABD-OLD", post_code: "AB24", boundary: { type: "Polygon", coordinates: [[[-2.10, 57.16], [-2.09, 57.16], [-2.09, 57.17], [-2.10, 57.17], [-2.10, 57.16]]] } },
              { name: "Rosemount", code: "GB-ABD-ROS", post_code: "AB25", boundary: { type: "Polygon", coordinates: [[[-2.12, 57.15], [-2.11, 57.15], [-2.11, 57.16], [-2.12, 57.16], [-2.12, 57.15]]] } },
              { name: "Cults", code: "GB-ABD-CUL", post_code: "AB15", boundary: { type: "Polygon", coordinates: [[[-2.18, 57.12], [-2.17, 57.12], [-2.17, 57.13], [-2.18, 57.13], [-2.18, 57.12]]] } },
            ],
          },
          {
            name: "Dundee District",
            code: "GB-SCT-DND",
            suburbs: [
              { name: "Dundee City Centre", code: "GB-DND-CEN", post_code: "DD1", boundary: { type: "Polygon", coordinates: [[[-2.98, 56.46], [-2.97, 56.46], [-2.97, 56.47], [-2.98, 56.47], [-2.98, 56.46]]] } },
              { name: "Broughty Ferry", code: "GB-DND-BRO", post_code: "DD5", boundary: { type: "Polygon", coordinates: [[[-2.88, 56.47], [-2.87, 56.47], [-2.87, 56.48], [-2.88, 56.48], [-2.88, 56.47]]] } },
              { name: "West End Dundee", code: "GB-DND-WES", post_code: "DD2", boundary: { type: "Polygon", coordinates: [[[-3.01, 56.46], [-3.00, 56.46], [-3.00, 56.47], [-3.01, 56.47], [-3.01, 56.46]]] } },
              { name: "Lochee", code: "GB-DND-LOC", post_code: "DD2", boundary: { type: "Polygon", coordinates: [[[-3.02, 56.48], [-3.01, 56.48], [-3.01, 56.49], [-3.02, 56.49], [-3.02, 56.48]]] } },
            ],
          },
        ],
      },
    ],
  },

  // 4. United States
  {
    name: "United States",
    iso_code: "US",
    iso_code_3: "USA",
    phone_code: "+1",
    currency: "USD",
    continent: "North America",
    timezone: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles"],
    regions: [
      {
        name: "California",
        code: "US-CA",
        districts: [
          {
            name: "Los Angeles County District",
            code: "US-CA-LAC",
            suburbs: [
              { name: "Downtown Los Angeles", code: "US-LA-DTN", post_code: "90012", boundary: { type: "Polygon", coordinates: [[[-118.25, 34.05], [-118.24, 34.05], [-118.24, 34.06], [-118.25, 34.06], [-118.25, 34.05]]] } },
              { name: "Hollywood", code: "US-LA-HOL", post_code: "90028", boundary: { type: "Polygon", coordinates: [[[-118.33, 34.09], [-118.32, 34.09], [-118.32, 34.10], [-118.33, 34.10], [-118.33, 34.09]]] } },
              { name: "Santa Monica", code: "US-LA-SMO", post_code: "90401", boundary: { type: "Polygon", coordinates: [[[-118.50, 34.01], [-118.49, 34.01], [-118.49, 34.02], [-118.50, 34.02], [-118.50, 34.01]]] } },
              { name: "Venice", code: "US-LA-VEN", post_code: "90291", boundary: { type: "Polygon", coordinates: [[[-118.47, 33.98], [-118.46, 33.98], [-118.46, 33.99], [-118.47, 33.99], [-118.47, 33.98]]] } },
            ],
          },
          {
            name: "San Francisco County District",
            code: "US-CA-SFC",
            suburbs: [
              { name: "Financial District SF", code: "US-SF-FIN", post_code: "94104", boundary: { type: "Polygon", coordinates: [[[-122.40, 37.79], [-122.39, 37.79], [-122.39, 37.80], [-122.40, 37.80], [-122.40, 37.79]]] } },
              { name: "Mission District", code: "US-SF-MIS", post_code: "94110", boundary: { type: "Polygon", coordinates: [[[-122.42, 37.75], [-122.41, 37.75], [-122.41, 37.76], [-122.42, 37.76], [-122.42, 37.75]]] } },
              { name: "SOMA", code: "US-SF-SOM", post_code: "94103", boundary: { type: "Polygon", coordinates: [[[-122.41, 37.77], [-122.40, 37.77], [-122.40, 37.78], [-122.41, 37.78], [-122.41, 37.77]]] } },
              { name: "Marina District SF", code: "US-SF-MAR", post_code: "94123", boundary: { type: "Polygon", coordinates: [[[-122.44, 37.80], [-122.43, 37.80], [-122.43, 37.81], [-122.44, 37.81], [-122.44, 37.80]]] } },
            ],
          },
          {
            name: "San Diego County District",
            code: "US-CA-SDC",
            suburbs: [
              { name: "Gaslamp Quarter", code: "US-SD-GAS", post_code: "92101", boundary: { type: "Polygon", coordinates: [[[-117.16, 32.71], [-117.15, 32.71], [-117.15, 32.72], [-117.16, 32.72], [-117.16, 32.71]]] } },
              { name: "La Jolla", code: "US-SD-LAJ", post_code: "92037", boundary: { type: "Polygon", coordinates: [[[-117.28, 32.84], [-117.27, 32.84], [-117.27, 32.85], [-117.28, 32.85], [-117.28, 32.84]]] } },
              { name: "Pacific Beach", code: "US-SD-PAC", post_code: "92109", boundary: { type: "Polygon", coordinates: [[[-117.24, 32.80], [-117.23, 32.80], [-117.23, 32.81], [-117.24, 32.81], [-117.24, 32.80]]] } },
              { name: "North Park", code: "US-SD-NOR", post_code: "92104", boundary: { type: "Polygon", coordinates: [[[-117.13, 32.74], [-117.12, 32.74], [-117.12, 32.75], [-117.13, 32.75], [-117.13, 32.74]]] } },
            ],
          },
          {
            name: "Santa Clara County District",
            code: "US-CA-SCC",
            suburbs: [
              { name: "Downtown San Jose", code: "US-SJ-DTN", post_code: "95113", boundary: { type: "Polygon", coordinates: [[[-121.89, 37.33], [-121.88, 37.33], [-121.88, 37.34], [-121.89, 37.34], [-121.89, 37.33]]] } },
              { name: "Palo Alto", code: "US-SJ-PAL", post_code: "94301", boundary: { type: "Polygon", coordinates: [[[-122.16, 37.44], [-122.15, 37.44], [-122.15, 37.45], [-122.16, 37.45], [-122.16, 37.44]]] } },
              { name: "Mountain View", code: "US-SJ-MTN", post_code: "94040", boundary: { type: "Polygon", coordinates: [[[-122.09, 37.39], [-122.08, 37.39], [-122.08, 37.40], [-122.09, 37.40], [-122.09, 37.39]]] } },
              { name: "Sunnyvale", code: "US-SJ-SUN", post_code: "94086", boundary: { type: "Polygon", coordinates: [[[-122.04, 37.37], [-122.03, 37.37], [-122.03, 37.38], [-122.04, 37.38], [-122.04, 37.37]]] } },
            ],
          },
        ],
      },
      {
        name: "New York State",
        code: "US-NY",
        districts: [
          {
            name: "Manhattan District",
            code: "US-NY-MAN",
            suburbs: [
              { name: "Tribeca", code: "US-MAN-TRI", post_code: "10013", boundary: { type: "Polygon", coordinates: [[[-74.01, 40.71], [-74.00, 40.71], [-74.00, 40.72], [-74.01, 40.72], [-74.01, 40.71]]] } },
              { name: "Upper East Side", code: "US-MAN-UES", post_code: "10021", boundary: { type: "Polygon", coordinates: [[[-73.96, 40.77], [-73.95, 40.77], [-73.95, 40.78], [-73.96, 40.78], [-73.96, 40.77]]] } },
              { name: "Greenwich Village", code: "US-MAN-GRN", post_code: "10012", boundary: { type: "Polygon", coordinates: [[[-74.00, 40.73], [-73.99, 40.73], [-73.99, 40.74], [-74.00, 40.74], [-74.00, 40.73]]] } },
              { name: "Chelsea NYC", code: "US-MAN-CHE", post_code: "10011", boundary: { type: "Polygon", coordinates: [[[-74.01, 40.74], [-74.00, 40.74], [-74.00, 40.75], [-74.01, 40.75], [-74.01, 40.74]]] } },
            ],
          },
          {
            name: "Brooklyn District",
            code: "US-NY-BKN",
            suburbs: [
              { name: "Williamsburg", code: "US-BKN-WIL", post_code: "11211", boundary: { type: "Polygon", coordinates: [[[-73.96, 40.71], [-73.95, 40.71], [-73.95, 40.72], [-73.96, 40.72], [-73.96, 40.71]]] } },
              { name: "DUMBO", code: "US-BKN-DUM", post_code: "11201", boundary: { type: "Polygon", coordinates: [[[-73.99, 40.70], [-73.98, 40.70], [-73.98, 40.71], [-73.99, 40.71], [-73.99, 40.70]]] } },
              { name: "Park Slope", code: "US-BKN-PSK", post_code: "11215", boundary: { type: "Polygon", coordinates: [[[-73.98, 40.67], [-73.97, 40.67], [-73.97, 40.68], [-73.98, 40.68], [-73.98, 40.67]]] } },
              { name: "Bushwick", code: "US-BKN-BSH", post_code: "11221", boundary: { type: "Polygon", coordinates: [[[-73.93, 40.69], [-73.92, 40.69], [-73.92, 40.70], [-73.93, 40.70], [-73.93, 40.69]]] } },
            ],
          },
          {
            name: "Queens District",
            code: "US-NY-QNS",
            suburbs: [
              { name: "Astoria", code: "US-QNS-AST", post_code: "11102", boundary: { type: "Polygon", coordinates: [[[-73.92, 40.76], [-73.91, 40.76], [-73.91, 40.77], [-73.92, 40.77], [-73.92, 40.76]]] } },
              { name: "Long Island City", code: "US-QNS-LIC", post_code: "11101", boundary: { type: "Polygon", coordinates: [[[-73.95, 40.74], [-73.94, 40.74], [-73.94, 40.75], [-73.95, 40.75], [-73.95, 40.74]]] } },
              { name: "Flushing", code: "US-QNS-FLU", post_code: "11354", boundary: { type: "Polygon", coordinates: [[[-73.83, 40.76], [-73.82, 40.76], [-73.82, 40.77], [-73.83, 40.77], [-73.83, 40.76]]] } },
              { name: "Forest Hills", code: "US-QNS-FOR", post_code: "11375", boundary: { type: "Polygon", coordinates: [[[-73.85, 40.72], [-73.84, 40.72], [-73.84, 40.73], [-73.85, 40.73], [-73.85, 40.72]]] } },
            ],
          },
          {
            name: "Bronx District",
            code: "US-NY-BRX",
            suburbs: [
              { name: "Riverdale", code: "US-BRX-RIV", post_code: "10471", boundary: { type: "Polygon", coordinates: [[[-73.91, 40.89], [-73.90, 40.89], [-73.90, 40.90], [-73.91, 40.90], [-73.91, 40.89]]] } },
              { name: "Fordham", code: "US-BRX-FOR", post_code: "10458", boundary: { type: "Polygon", coordinates: [[[-73.90, 40.86], [-73.89, 40.86], [-73.89, 40.87], [-73.90, 40.87], [-73.90, 40.86]]] } },
              { name: "Pelham Bay", code: "US-BRX-PEL", post_code: "10461", boundary: { type: "Polygon", coordinates: [[[-73.83, 40.85], [-73.82, 40.85], [-73.82, 40.86], [-73.83, 40.86], [-73.83, 40.85]]] } },
              { name: "Mott Haven", code: "US-BRX-MOT", post_code: "10454", boundary: { type: "Polygon", coordinates: [[[-73.92, 40.81], [-73.91, 40.81], [-73.91, 40.82], [-73.92, 40.82], [-73.92, 40.81]]] } },
            ],
          },
        ],
      },
      {
        name: "Texas",
        code: "US-TX",
        districts: [
          {
            name: "Harris County (Houston)",
            code: "US-TX-HOU",
            suburbs: [
              { name: "Downtown Houston", code: "US-HOU-DTN", post_code: "77002", boundary: { type: "Polygon", coordinates: [[[-95.37, 29.75], [-95.36, 29.75], [-95.36, 29.76], [-95.37, 29.76], [-95.37, 29.75]]] } },
              { name: "Montrose", code: "US-HOU-MON", post_code: "77006", boundary: { type: "Polygon", coordinates: [[[-95.39, 29.74], [-95.38, 29.74], [-95.38, 29.75], [-95.39, 29.75], [-95.39, 29.74]]] } },
              { name: "The Heights", code: "US-HOU-HEI", post_code: "77008", boundary: { type: "Polygon", coordinates: [[[-95.40, 29.79], [-95.39, 29.79], [-95.39, 29.80], [-95.40, 29.80], [-95.40, 29.79]]] } },
              { name: "Midtown Houston", code: "US-HOU-MID", post_code: "77004", boundary: { type: "Polygon", coordinates: [[[-95.38, 29.74], [-95.37, 29.74], [-95.37, 29.75], [-95.38, 29.75], [-95.38, 29.74]]] } },
            ],
          },
          {
            name: "Dallas County District",
            code: "US-TX-DAL",
            suburbs: [
              { name: "Downtown Dallas", code: "US-DAL-DTN", post_code: "75201", boundary: { type: "Polygon", coordinates: [[[-96.80, 32.78], [-96.79, 32.78], [-96.79, 32.79], [-96.80, 32.79], [-96.80, 32.78]]] } },
              { name: "Uptown Dallas", code: "US-DAL-UPT", post_code: "75204", boundary: { type: "Polygon", coordinates: [[[-96.81, 32.79], [-96.80, 32.79], [-96.80, 32.80], [-96.81, 32.80], [-96.81, 32.79]]] } },
              { name: "Deep Ellum", code: "US-DAL-DEP", post_code: "75226", boundary: { type: "Polygon", coordinates: [[[-96.78, 32.78], [-96.77, 32.78], [-96.77, 32.79], [-96.78, 32.79], [-96.78, 32.78]]] } },
              { name: "Oak Lawn", code: "US-DAL-OAK", post_code: "75219", boundary: { type: "Polygon", coordinates: [[[-96.82, 32.81], [-96.81, 32.81], [-96.81, 32.82], [-96.82, 32.82], [-96.82, 32.81]]] } },
            ],
          },
          {
            name: "Travis County (Austin)",
            code: "US-TX-ATX",
            suburbs: [
              { name: "Downtown Austin", code: "US-ATX-DTN", post_code: "78701", boundary: { type: "Polygon", coordinates: [[[-97.75, 30.26], [-97.74, 30.26], [-97.74, 30.27], [-97.75, 30.27], [-97.75, 30.26]]] } },
              { name: "South Congress", code: "US-ATX-SOC", post_code: "78704", boundary: { type: "Polygon", coordinates: [[[-97.76, 30.24], [-97.75, 30.24], [-97.75, 30.25], [-97.76, 30.25], [-97.76, 30.24]]] } },
              { name: "East Austin", code: "US-ATX-EAS", post_code: "78702", boundary: { type: "Polygon", coordinates: [[[-97.72, 30.26], [-97.71, 30.26], [-97.71, 30.27], [-97.72, 30.27], [-97.72, 30.26]]] } },
              { name: "Zilker", code: "US-ATX-ZIL", post_code: "78704", boundary: { type: "Polygon", coordinates: [[[-97.78, 30.26], [-97.77, 30.26], [-97.77, 30.27], [-97.78, 30.27], [-97.78, 30.26]]] } },
            ],
          },
          {
            name: "Bexar County (San Antonio)",
            code: "US-TX-SAT",
            suburbs: [
              { name: "Downtown San Antonio", code: "US-SAT-DTN", post_code: "78205", boundary: { type: "Polygon", coordinates: [[[-98.50, 29.42], [-98.49, 29.42], [-98.49, 29.43], [-98.50, 29.43], [-98.50, 29.42]]] } },
              { name: "Pearl District", code: "US-SAT-PRL", post_code: "78215", boundary: { type: "Polygon", coordinates: [[[-98.48, 29.44], [-98.47, 29.44], [-98.47, 29.45], [-98.48, 29.45], [-98.48, 29.44]]] } },
              { name: "King William", code: "US-SAT-KNG", post_code: "78204", boundary: { type: "Polygon", coordinates: [[[-98.50, 29.41], [-98.49, 29.41], [-98.49, 29.42], [-98.50, 29.42], [-98.50, 29.41]]] } },
              { name: "Alamo Heights", code: "US-SAT-ALH", post_code: "78209", boundary: { type: "Polygon", coordinates: [[[-98.47, 29.48], [-98.46, 29.48], [-98.46, 29.49], [-98.47, 29.49], [-98.47, 29.48]]] } },
            ],
          },
        ],
      },
      {
        name: "Florida",
        code: "US-FL",
        districts: [
          {
            name: "Miami-Dade County District",
            code: "US-FL-MIA",
            suburbs: [
              { name: "Brickell", code: "US-MIA-BRI", post_code: "33131", boundary: { type: "Polygon", coordinates: [[[-80.20, 25.76], [-80.19, 25.76], [-80.19, 25.77], [-80.20, 25.77], [-80.20, 25.76]]] } },
              { name: "South Beach", code: "US-MIA-SOB", post_code: "33139", boundary: { type: "Polygon", coordinates: [[[-80.14, 25.78], [-80.13, 25.78], [-80.13, 25.79], [-80.14, 25.79], [-80.14, 25.78]]] } },
              { name: "Wynwood", code: "US-MIA-WYN", post_code: "33127", boundary: { type: "Polygon", coordinates: [[[-80.20, 25.80], [-80.19, 25.80], [-80.19, 25.81], [-80.20, 25.81], [-80.20, 25.80]]] } },
              { name: "Coral Gables", code: "US-MIA-COR", post_code: "33134", boundary: { type: "Polygon", coordinates: [[[-80.27, 25.75], [-80.26, 25.75], [-80.26, 25.76], [-80.27, 25.76], [-80.27, 25.75]]] } },
            ],
          },
          {
            name: "Orange County (Orlando)",
            code: "US-FL-ORL",
            suburbs: [
              { name: "Downtown Orlando", code: "US-ORL-DTN", post_code: "32801", boundary: { type: "Polygon", coordinates: [[[-81.38, 28.54], [-81.37, 28.54], [-81.37, 28.55], [-81.38, 28.55], [-81.38, 28.54]]] } },
              { name: "Winter Park", code: "US-ORL-WIN", post_code: "32789", boundary: { type: "Polygon", coordinates: [[[-81.35, 28.60], [-81.34, 28.60], [-81.34, 28.61], [-81.35, 28.61], [-81.35, 28.60]]] } },
              { name: "Lake Nona", code: "US-ORL-NON", post_code: "32827", boundary: { type: "Polygon", coordinates: [[[-81.27, 28.38], [-81.26, 28.38], [-81.26, 28.39], [-81.27, 28.39], [-81.27, 28.38]]] } },
              { name: "Thornton Park", code: "US-ORL-THO", post_code: "32801", boundary: { type: "Polygon", coordinates: [[[-81.37, 28.54], [-81.36, 28.54], [-81.36, 28.55], [-81.37, 28.55], [-81.37, 28.54]]] } },
            ],
          },
          {
            name: "Hillsborough County (Tampa)",
            code: "US-FL-TPA",
            suburbs: [
              { name: "Downtown Tampa", code: "US-TPA-DTN", post_code: "33602", boundary: { type: "Polygon", coordinates: [[[-82.46, 27.95], [-82.45, 27.95], [-82.45, 27.96], [-82.46, 27.96], [-82.46, 27.95]]] } },
              { name: "Ybor City", code: "US-TPA-YBO", post_code: "33605", boundary: { type: "Polygon", coordinates: [[[-82.44, 27.96], [-82.43, 27.96], [-82.43, 27.97], [-82.44, 27.97], [-82.44, 27.96]]] } },
              { name: "Hyde Park Tampa", code: "US-TPA-HYD", post_code: "33606", boundary: { type: "Polygon", coordinates: [[[-82.47, 27.94], [-82.46, 27.94], [-82.46, 27.95], [-82.47, 27.95], [-82.47, 27.94]]] } },
              { name: "Channel District", code: "US-TPA-CHN", post_code: "33602", boundary: { type: "Polygon", coordinates: [[[-82.45, 27.95], [-82.44, 27.95], [-82.44, 27.96], [-82.45, 27.96], [-82.45, 27.95]]] } },
            ],
          },
          {
            name: "Duval County (Jacksonville)",
            code: "US-FL-JAX",
            suburbs: [
              { name: "Downtown Jacksonville", code: "US-JAX-DTN", post_code: "32202", boundary: { type: "Polygon", coordinates: [[[-81.66, 30.33], [-81.65, 30.33], [-81.65, 30.34], [-81.66, 30.34], [-81.66, 30.33]]] } },
              { name: "San Marco", code: "US-JAX-SMA", post_code: "32207", boundary: { type: "Polygon", coordinates: [[[-81.65, 30.30], [-81.64, 30.30], [-81.64, 30.31], [-81.65, 30.31], [-81.65, 30.30]]] } },
              { name: "Riverside Jacksonville", code: "US-JAX-RIV", post_code: "32204", boundary: { type: "Polygon", coordinates: [[[-81.68, 30.31], [-81.67, 30.31], [-81.67, 30.32], [-81.68, 30.32], [-81.68, 30.31]]] } },
              { name: "Jacksonville Beach", code: "US-JAX-BCH", post_code: "32250", boundary: { type: "Polygon", coordinates: [[[-81.40, 30.29], [-81.39, 30.29], [-81.39, 30.30], [-81.40, 30.30], [-81.40, 30.29]]] } },
            ],
          },
        ],
      },
    ],
  },
];
