/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import Papa from "papaparse";
import { createServer as createViteServer } from "vite";
import { Cafe, CoordinatesCache } from "./src/types";

const PORT = 3000;
const CACHE_FILE_PATH = path.join(process.cwd(), "coordinates-cache.json");
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRUtsT7w6iVOZkr4x16Lv6cE5gLwxb8Bom9jlZrhW2DxarY9RpA18AIJxbiiS8s3VFD9fNHTAARLps6/pub?gid=1797973182&single=true&output=csv";

// Helper for rate limiting Nominatim requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Load coordinates cache from disk
function loadCache(): CoordinatesCache {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const data = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load coordinates cache:", error);
  }
  return {};
}

// Save coordinates cache to disk
function saveCache(cache: CoordinatesCache) {
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save coordinates cache:", error);
  }
}

// Query Nominatim API with polite rate-limiting & proper User-Agent
async function geocodeNominatim(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  try {
    console.log(`Geocoding with Nominatim: "${query}"`);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "TurkeyGlutenFreeCafesMap/1.0 (alinoyin385@gmail.com; interactive map)"
      }
    });

    if (!response.ok) {
      console.error(`Nominatim request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error(`Error querying Nominatim for "${query}":`, error);
  }
  return null;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Memory cache of parsed cafes to respond immediately to repeated calls
  let cachedCafes: Cafe[] | null = null;
  let lastFetchTime = 0;
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache for sheets data

  // API endpoint to fetch gluten-free cafes
  app.get("/api/cafes", async (req, res) => {
    try {
      const now = Date.now();
      // If we have in-memory cached cafes and TTL hasn't expired, return them
      if (cachedCafes && now - lastFetchTime < CACHE_TTL) {
        return res.json({ success: true, count: cachedCafes.length, cafes: cachedCafes });
      }

      console.log("Fetching latest cafe CSV data from Google Sheets...");
      const csvResponse = await fetch(CSV_URL);
      if (!csvResponse.ok) {
        throw new Error(`Failed to fetch CSV: ${csvResponse.statusText}`);
      }

      const csvText = await csvResponse.text();
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      });

      const rows = parsed.data as any[];
      const coordCache = loadCache();
      const cafes: Cafe[] = [];
      let cacheModified = false;

      // Map rows to clean Cafe objects and handle coordinates
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = (row["Mekan Adı"] || "").trim();
        if (!name) continue; // Skip empty rows

        const district = (row["İlçe Adı"] || "").trim();
        const address = (row["Adres"] || "").trim();
        const phone = (row["Telefon"] || "").trim();
        const workingHours = (row["Çalışma Saatleri"] || "").trim();
        const serviceType = (row["Hizmet Seçeneği"] || "").trim();
        const featuredProducts = (row["Öne Çıkan Ürün(ler)"] || "").trim();
        const media = (row["Medya"] || "").trim();

        // 1. Check if coordinates are directly supplied in CSV (Enlem & Boylam)
        let lat = parseFloat(row["Enlem"]);
        let lng = parseFloat(row["Boylam"]);

        const hasValidCsvCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

        if (!hasValidCsvCoords) {
          // 2. Check in-memory/file cache using Address as key
          const cacheKey = address || `${name}, ${district}, Turkey`;
          const cached = coordCache[cacheKey];

          if (cached) {
            lat = cached.lat;
            lng = cached.lng;
          } else {
            // 3. Not in cache and not in CSV -> fetch from Nominatim
            // Create a smart query for the specific district and region
            const query = address ? address : `${name}, ${district}, Turkey`;
            // Polite Nominatim geocoding with a 1-second delay (to obey terms of service limit: 1 request/sec)
            await delay(1000);
            const coord = await geocodeNominatim(query);

            if (coord) {
              lat = coord.lat;
              lng = coord.lng;
              coordCache[cacheKey] = {
                lat,
                lng,
                updatedAt: Date.now()
              };
              cacheModified = true;
            } else {
              // Try a broader fallback query (name and district and country)
              await delay(1000);
              const fallbackQuery = `${district ? district + ", " : ""}Turkey`;
              const fallbackCoord = await geocodeNominatim(fallbackQuery);
              if (fallbackCoord) {
                lat = fallbackCoord.lat;
                lng = fallbackCoord.lng;
                coordCache[cacheKey] = {
                  lat: fallbackCoord.lat,
                  lng: fallbackCoord.lng,
                  updatedAt: Date.now()
                };
                cacheModified = true;
              } else {
                // Last-resort fallback to Turkey center if Nominatim returns nothing
                lat = 39.9334;
                lng = 32.8597;
              }
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
      }

      if (cacheModified) {
        saveCache(coordCache);
      }

      // Update memory cache
      cachedCafes = cafes;
      lastFetchTime = Date.now();

      res.json({ success: true, count: cafes.length, cafes });
    } catch (error: any) {
      console.error("Error retrieving cafes data:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Serve static UI assets and handle SPA client routing
  if (process.env.NODE_ENV !== "production") {
    // Development server using Vite Dev Server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production serving of pre-built React build bundles
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
