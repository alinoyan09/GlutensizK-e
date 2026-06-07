/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import LandingPage from "./components/LandingPage";
import MapPage from "./components/MapPage";
import { Cafe } from "./types";

export default function App() {
  const [view, setView] = useState<"landing" | "map">("landing");
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorOnLoad, setErrorOnLoad] = useState<string | null>(null);

  // Load standard cafes from high-sync database API
  const fetchCafes = async () => {
    setIsLoading(true);
    setErrorOnLoad(null);
    try {
      console.log("Fetching cafes from standard proxy API...");
      const response = await fetch("/api/cafes");
      if (!response.ok) {
        throw new Error(`Failed to load dataset: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.cafes)) {
        setCafes(data.cafes);
      } else {
        throw new Error(data.error || "Dataset parse failed");
      }
    } catch (err: any) {
      console.error("Failed to load gluten-free cafes:", err);
      setErrorOnLoad(err.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();
  }, []);

  return (
    <div className="h-screen w-screen bg-natural-bg font-sans" id="app-root-container">
      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
            id="viewport-landing"
          >
            <LandingPage 
              onExplore={() => setView("map")} 
              cafeCount={cafes.length} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
            id="viewport-map"
          >
            <MapPage 
              cafes={cafes} 
              isLoading={isLoading} 
              onBack={() => setView("landing")} 
              onRefresh={fetchCafes}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
