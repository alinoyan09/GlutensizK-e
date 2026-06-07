/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Cafe {
  id: string;
  name: string;             // Mekan Adı
  district: string;         // İlçe Adı
  address: string;          // Adres
  phone: string;            // Telefon
  workingHours: string;     // Çalışma Saatleri
  serviceType: string;      // Hizmet Seçeneği
  featuredProducts: string; // Öne Çıkan Ürün(ler)
  lat: number;              // Enlem
  lng: number;              // Boylam
  media: string;            // Medya (Base64 image or image URL)
}

export interface CoordinatesCache {
  [address: string]: {
    lat: number;
    lng: number;
    updatedAt: number;
  };
}
