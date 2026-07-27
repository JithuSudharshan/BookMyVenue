/**
 * Geospatial utility functions for BookMyVenue location search.
 * Provides deterministic coordinate resolution for Kerala destinations
 * and Haversine distance calculation without database schema modifications.
 */

export const KERALA_CITY_COORDINATES = {
  // Cities & Districts
  'ernakulam': { lat: 9.9816, lng: 76.2999 },
  'kochi': { lat: 9.9312, lng: 76.2673 },
  'cochin': { lat: 9.9312, lng: 76.2673 },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
  'trivandrum': { lat: 8.5241, lng: 76.9366 },
  'kozhikode': { lat: 11.2588, lng: 75.7804 },
  'calicut': { lat: 11.2588, lng: 75.7804 },
  'thrissur': { lat: 10.5276, lng: 76.2144 },
  'trichur': { lat: 10.5276, lng: 76.2144 },
  'alappuzha': { lat: 9.4981, lng: 76.3388 },
  'alleppey': { lat: 9.4981, lng: 76.3388 },
  'kottayam': { lat: 9.5916, lng: 76.5222 },
  'palakkad': { lat: 10.7867, lng: 76.6548 },
  'palghat': { lat: 10.7867, lng: 76.6548 },
  'malappuram': { lat: 11.0510, lng: 76.0711 },
  'kannur': { lat: 11.8745, lng: 75.3704 },
  'cannanore': { lat: 11.8745, lng: 75.3704 },
  'kollam': { lat: 8.8932, lng: 76.6141 },
  'quilon': { lat: 8.8932, lng: 76.6141 },
  'idukki': { lat: 9.8500, lng: 76.9710 },
  'pathanamthitta': { lat: 9.2648, lng: 76.7870 },
  'kasaragod': { lat: 12.4996, lng: 74.9869 },
  'wayanad': { lat: 11.6854, lng: 76.1320 },
  'kalpetta': { lat: 11.6084, lng: 76.0827 },

  // Popular Tourist / Event Localities in Kerala (Kochi / Ernakulam suburbs & towns)
  'kumbalangi': { lat: 9.8781, lng: 76.2847 },
  'mattancherry': { lat: 9.9579, lng: 76.2575 },
  'fort kochi': { lat: 9.9658, lng: 76.2421 },
  'willingdon island': { lat: 9.9500, lng: 76.2700 },
  'marine drive': { lat: 9.9800, lng: 76.2750 },
  'kaloor': { lat: 9.9934, lng: 76.2917 },
  'vyttila': { lat: 9.9686, lng: 76.3188 },
  'kakkanad': { lat: 10.0150, lng: 76.3410 },
  'edappally': { lat: 10.0261, lng: 76.3125 },
  'kalamassery': { lat: 10.0526, lng: 76.3155 },
  'aluva': { lat: 10.1105, lng: 76.3550 },
  'angamaly': { lat: 10.1960, lng: 76.3860 },
  'tripunithura': { lat: 9.9483, lng: 76.3550 },
  'thrippunithura': { lat: 9.9483, lng: 76.3550 },
  'cherai': { lat: 10.1417, lng: 76.1783 },
  'paravur': { lat: 10.1416, lng: 76.2333 },
  'north paravur': { lat: 10.1416, lng: 76.2333 },
  'perumbavoor': { lat: 10.1130, lng: 76.4750 },
  'muvattupuzha': { lat: 9.9894, lng: 76.5790 },
  'kothamangalam': { lat: 10.0594, lng: 76.6231 },
  'piravom': { lat: 9.8733, lng: 76.4950 },
  'bolgatty': { lat: 9.9860, lng: 76.2680 },

  // Trivandrum / South localities
  'kovalam': { lat: 8.4004, lng: 76.9787 },
  'varkala': { lat: 8.7379, lng: 76.7163 },
  'kazhakkoottam': { lat: 8.5671, lng: 76.8741 },
  'attingal': { lat: 8.6946, lng: 76.8140 },
  'neyyattinkara': { lat: 8.3970, lng: 77.0850 },

  // Kozhikode / North localities
  'beypore': { lat: 11.1764, lng: 75.8117 },
  'mananchira': { lat: 11.2530, lng: 75.7766 },
  'kappad': { lat: 11.3850, lng: 75.7230 },
  'vadakara': { lat: 11.5986, lng: 75.5917 },
  'thalassery': { lat: 11.7480, lng: 75.4894 },
  'payyanur': { lat: 12.1000, lng: 75.2000 },

  // Central & Hills
  'guruvayur': { lat: 10.5950, lng: 76.0396 },
  'chalakudy': { lat: 10.3070, lng: 76.3331 },
  'kodungallur': { lat: 10.2223, lng: 76.1969 },
  'irinjalakuda': { lat: 10.3423, lng: 76.2086 },
  'kumarakom': { lat: 9.6175, lng: 76.4281 },
  'kuttanad': { lat: 9.3833, lng: 76.4000 },
  'changanassery': { lat: 9.4447, lng: 76.5358 },
  'pala': { lat: 9.7117, lng: 76.6833 },
  'vaikom': { lat: 9.7497, lng: 76.3942 },
  'chengannur': { lat: 9.3175, lng: 76.6117 },
  'kayamkulam': { lat: 9.1764, lng: 76.5028 },
  'tiruvalla': { lat: 9.3834, lng: 76.5741 },
  'adoor': { lat: 9.1522, lng: 76.7356 },
  'munnar': { lat: 10.0889, lng: 77.0595 },
  'thekkady': { lat: 9.6031, lng: 77.1615 },
  'vagamon': { lat: 9.6860, lng: 76.9056 },
  'sultan bathery': { lat: 11.6667, lng: 76.2667 },
  'mananthavady': { lat: 11.8028, lng: 76.0028 },
  'vythiri': { lat: 11.5544, lng: 76.0394 },

  // Default Kerala Center
  'kerala': { lat: 10.8505, lng: 76.2711 }
};

/**
 * Calculates the Haversine distance between two coordinate pairs in kilometers.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} distance in kilometers rounded to 1 decimal place
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
};

/**
 * Resolves coordinates for a location string (city/district/state).
 * @param {string} locationStr - City, district, or destination name
 * @returns {{ lat: number, lng: number } | null}
 */
export const getCityCoordinates = (locationStr) => {
  if (!locationStr || typeof locationStr !== 'string') return null;

  const lower = locationStr.toLowerCase().trim();

  // 1. Direct match on full string or before comma
  const beforeComma = lower.split(',')[0].trim();
  if (KERALA_CITY_COORDINATES[beforeComma]) {
    return KERALA_CITY_COORDINATES[beforeComma];
  }
  if (KERALA_CITY_COORDINATES[lower]) {
    return KERALA_CITY_COORDINATES[lower];
  }

  // 2. Substring search: sort keys by length descending so more specific names match first
  const sortedKeys = Object.keys(KERALA_CITY_COORDINATES).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key) || key.includes(lower)) {
      return KERALA_CITY_COORDINATES[key];
    }
  }

  return null;
};

/**
 * Returns all city/locality keys from KERALA_CITY_COORDINATES
 * whose distance from the target point is within maxRadiusKm.
 *
 * Used to build a MongoDB $in filter before the aggregation pipeline
 * so that only venues in nearby cities are loaded into memory.
 *
 * @param {number} targetLat
 * @param {number} targetLng
 * @param {number} maxRadiusKm
 * @returns {string[]} Array of matching city/locality name strings
 */
export const getCitiesWithinRadius = (targetLat, targetLng, maxRadiusKm) => {
  return Object.entries(KERALA_CITY_COORDINATES)
    .filter(([, coords]) => {
      const dist = calculateHaversineDistance(targetLat, targetLng, coords.lat, coords.lng);
      return dist !== null && dist <= maxRadiusKm;
    })
    .map(([cityName]) => cityName);
};

