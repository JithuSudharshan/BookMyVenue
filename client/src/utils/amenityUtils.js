import React from 'react';
import { 
  Wifi, 
  ParkingCircle, 
  Wind, 
  Utensils, 
  Monitor, 
  Music2, 
  Zap, 
  ShieldCheck, 
  Droplets, 
  Accessibility, 
  Waves, 
  Leaf, 
  CheckCircle2,
  Tv,
  Coffee,
  Projector
} from 'lucide-react';

/**
 * Maps an amenity name to a relevant Lucide icon component.
 * 
 * @param {string} name - The name of the amenity
 * @returns {React.FC} The Lucide icon component
 */
export const getAmenityIcon = (name) => {
  if (!name || typeof name !== 'string') return CheckCircle2;
  
  const n = name.toLowerCase();
  
  if (n.includes('wifi') || n.includes('wi-fi') || n.includes('internet')) return Wifi;
  if (n.includes('park')) return ParkingCircle;
  if (n.includes('ac ') || n.includes('air condition') || n.includes('climate')) return Wind;
  if (n.includes('cater') || n.includes('food') || n.includes('kitchen') || n.includes('meal')) return Utensils;
  if (n.includes('projector')) return Projector;
  if (n.includes('screen') || n.includes('av ') || n.includes('a/v')) return Monitor;
  if (n.includes('tv') || n.includes('television')) return Tv;
  if (n.includes('sound') || n.includes('music') || n.includes('pa system') || n.includes('audio')) return Music2;
  if (n.includes('generator') || n.includes('power') || n.includes('backup')) return Zap;
  if (n.includes('security') || n.includes('cctv') || n.includes('guard')) return ShieldCheck;
  if (n.includes('restroom') || n.includes('toilet') || n.includes('washroom') || n.includes('bathroom')) return Droplets;
  if (n.includes('wheelchair') || n.includes('access')) return Accessibility;
  if (n.includes('pool') || n.includes('swimming')) return Waves;
  if (n.includes('garden') || n.includes('outdoor') || n.includes('lawn')) return Leaf;
  if (n.includes('coffee') || n.includes('tea') || n.includes('beverage')) return Coffee;
  
  return CheckCircle2;
};
