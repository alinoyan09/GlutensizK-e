/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import Papa from "papaparse";

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRUtsT7w6iVOZkr4x16Lv6cE5gLwxb8Bom9jlZrhW2DxarY9RpA18AIJxbiiS8s3VFD9fNHTAARLps6/pub?gid=1797973182&single=true&output=csv";
const OUT_DIR = path.join(process.cwd(), "public");
const OUT_FILE = path.join(OUT_DIR, "cafes-fallback.json");

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocodeNominatim(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "TurkeyGlutenFreeCafesMap/1.0 (alinoyin385@gmail.com; pre-build geocoder)"
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error(`Error geocoding ${query}:`, error);
  }
  return null;
}

async function run() {
  console.log("Fetching latest Google Sheet data for build-time static bundling...");
  try {
    const res = await fetch(CSV_URL);
    if (!res.ok) throw new Error(`HTTP error: ${res.statusText}`);
    const csvText = await res.text();
    
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    const rows = parsed.data as any[];
    const cafes: any[] = [];
    
    // Check if output dir exists
    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    console.log(`Mapping ${rows.length} rows...`);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = (row["Mekan Adı"] || "").trim();
      if (!name) continue;

      const district = (row["İlçe Adı"] || "").trim();
      const address = (row["Adres"] || "").trim();
      const phone = (row["Telefon"] || "").trim();
      const workingHours = (row["Çalışma Saatleri"] || "").trim();
      const serviceType = (row["Hizmet Seçeneği"] || "").trim();
      const featuredProducts = (row["Öne Çıkan Ürün(ler)"] || "").trim();
      const media = (row["Medya"] || "").trim();

      let lat = parseFloat(row["Enlem"]);
      let lng = parseFloat(row["Boylam"]);

      const hasValidCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

      if (!hasValidCoords) {
        const query = address ? address : `${name}, ${district}, Turkey`;
        await delay(1000); // Respect rate limiting
        const coord = await geocodeNominatim(query);
        if (coord) {
          lat = coord.lat;
          lng = coord.lng;
        } else {
          // Broad fallback
          await delay(1000);
          const fallbackCoord = await geocodeNominatim(`${district}, Turkey`);
          if (fallbackCoord) {
            lat = fallbackCoord.lat;
            lng = fallbackCoord.lng;
          } else {
            lat = 39.9334;
            lng = 32.8597;
          }
        }
      }

      cafes.push({
        id: `cafe_${i}_${name.replace(/\s+/g, '_').toLowerCase()}`,
        name,
        district,
        address,
        phone,
        workingHours,
        serviceType,
        featuredProducts,
        lat,
        lng,
        media
      });
      console.log(`Processed [${i + 1}/${rows.length}]: ${name} (${lat}, ${lng})`);
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(cafes, null, 2), "utf-8");
    console.log(`Successfully generated static list of ${cafes.length} cafes at "${OUT_FILE}".`);
    
    // Generate src/cafes-static.ts
    const staticTsFile = path.join(process.cwd(), "src", "cafes-static.ts");
    const staticContent = `/**\n * @license\n * SPDX-License-Identifier: Apache-2.0\n */\n\nimport { Cafe } from "./types";\n\nexport const STATIC_CAFES: Cafe[] = ${JSON.stringify(cafes, null, 2)};\n`;
    fs.writeFileSync(staticTsFile, staticContent, "utf-8");
    console.log(`Successfully generated static TypeScript file at "${staticTsFile}".`);
  } catch (error) {
    console.error("Failed to generate static cafes fallback file:", error);
    process.exit(1);
  }
}

run();
