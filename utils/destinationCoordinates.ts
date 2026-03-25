// Destination coordinates mapping
export const destinationCoordinates: { [key: string]: { lat: number; lng: number } } = {
  "Northern Lights": { lat: 69.64920000, lng: 18.95530000 },
  "Maldives Paradise Island": { lat: 3.20280000, lng: 73.22070000 },
  "Santorini, Greece": { lat: 36.39320000, lng: 25.46150000 },
  "Norwegian Fjords": { lat: 60.39130000, lng: 5.32210000 },
  "Swiss Alps - Interlaken": { lat: 46.68630000, lng: 7.86330000 },
  "Dolomites, Italy": { lat: 46.41920000, lng: 11.86980000 },
  "Paris, France": { lat: 48.85660000, lng: 2.35220000 },
  "Tokyo, Japan": { lat: 35.67620000, lng: 139.65030000 },
  "Machu Picchu, Peru": { lat: -13.16310000, lng: -72.54500000 },
  "Petra, Jordan": { lat: 30.32850000, lng: 35.44440000 },
  "Iceland - Golden Circle": { lat: 64.96310000, lng: -19.02080000 },
  "Costa Rica Rainforest": { lat: 10.30070000, lng: -84.81680000 },
  "Bali, Indonesia": { lat: -8.34050000, lng: 115.09200000 },
  "Phuket, Thailand": { lat: 7.88040000, lng: 98.39230000 },
  "Maui, Hawaii": { lat: 20.79840000, lng: -156.33190000 },
  "Rocky Mountains - Colorado": { lat: 40.34280000, lng: -105.68360000 },
  "Himalayas - Nepal": { lat: 27.98810000, lng: 86.92500000 },
  "New York City, USA": { lat: 40.71280000, lng: -74.00600000 },
  "London, England": { lat: 51.50740000, lng: -0.12780000 },
  "Dubai, UAE": { lat: 25.20480000, lng: 55.27080000 },
  "Rome, Italy": { lat: 41.90280000, lng: 12.49640000 },
  "Cairo, Egypt": { lat: 30.04440000, lng: 31.23570000 },
  "Athens, Greece": { lat: 37.98380000, lng: 23.72750000 },
  "Grand Canyon, Arizona": { lat: 36.10690000, lng: -112.11290000 },
  "Amazon Rainforest, Brazil": { lat: -3.46530000, lng: -62.21590000 },
  "Safari - Serengeti, Tanzania": { lat: -2.33330000, lng: 34.83330000 },
  "Santorini": { lat: 36.39320000, lng: 25.46150000 },
  "Bali": { lat: -8.34050000, lng: 115.09200000 },
  "Phuket": { lat: 7.88040000, lng: 98.39230000 },
  "Maui": { lat: 20.79840000, lng: -156.33190000 },
  "Bora Bora": { lat: -16.50040000, lng: -151.74140000 },
  "Cancun": { lat: 21.16190000, lng: -86.85150000 },
  "Myrtle Beach": { lat: 33.68910000, lng: -78.88670000 },
  "Gold Coast": { lat: -28.01670000, lng: 153.40000000 },
  "Ibiza": { lat: 38.90670000, lng: 1.42060000 },
  "Swiss Alps": { lat: 46.68630000, lng: 7.86330000 },
  "Dolomites": { lat: 46.41920000, lng: 11.86980000 },
  "Rocky Mountains": { lat: 40.34280000, lng: -105.68360000 },
  "Himalayas": { lat: 27.98810000, lng: 86.92500000 },
  "Andes": { lat: -13.16310000, lng: -72.54500000 },
  "Alps": { lat: 45.92370000, lng: 6.86940000 },
  "Sierra Nevada": { lat: 37.86510000, lng: -119.53830000 },
  "Paris": { lat: 48.85660000, lng: 2.35220000 },
  "Tokyo": { lat: 35.67620000, lng: 139.65030000 },
  "Great Barrier Reef": { lat: -16.91860000, lng: 145.77810000 },
  "New York City": { lat: 40.71280000, lng: -74.00600000 },
  "London": { lat: 51.50740000, lng: -0.12780000 },
  "Dubai": { lat: 25.20480000, lng: 55.27080000 },
  "Singapore": { lat: 1.35210000, lng: 103.81980000 },
  "Hong Kong": { lat: 22.31930000, lng: 114.16940000 },
  "Sydney": { lat: -33.86880000, lng: 151.20930000 },
  "Barcelona": { lat: 41.38510000, lng: 2.17340000 },
  "Amsterdam": { lat: 52.36760000, lng: 4.90410000 },
  "Rome": { lat: 41.90280000, lng: 12.49640000 },
  "Machu Picchu": { lat: -13.16310000, lng: -72.54500000 },
  "Petra": { lat: 30.32850000, lng: 35.44440000 },
  "Cairo": { lat: 30.04440000, lng: 31.23570000 },
  "Athens": { lat: 37.98380000, lng: 23.72750000 },
  "Angkor Wat": { lat: 13.41250000, lng: 103.86700000 },
  "Taj Mahal": { lat: 27.17510000, lng: 78.04210000 },
  "Great Wall of China": { lat: 40.43190000, lng: 116.57040000 },
  "Colosseum": { lat: 41.89020000, lng: 12.49220000 },
  "Iceland": { lat: 64.96310000, lng: -19.02080000 },
  "Costa Rica": { lat: 10.30070000, lng: -84.81680000 },
  "Grand Canyon": { lat: 36.10690000, lng: -112.11290000 },
  "Amazon": { lat: -3.46530000, lng: -62.21590000 },
  "Safari": { lat: -2.33330000, lng: 34.83330000 },
  "Yellowstone": { lat: 44.42800000, lng: -110.58850000 },
  "Patagonia": { lat: -50.34130000, lng: -72.98680000 },
  "Sahara": { lat: 31.62950000, lng: -7.98110000 },
  "Galapagos": { lat: -0.73930000, lng: -90.35180000 },
  "Antarctica": { lat: -77.84120000, lng: 166.68630000 },
  "Niagara Falls": { lat: 43.09620000, lng: -79.03770000 },
  "Victoria Falls": { lat: -17.92430000, lng: 25.85720000 },
  "Mount Everest": { lat: 27.71180000, lng: 86.71270000 },
  "Death Valley": { lat: 36.53230000, lng: -116.93250000 },
  "Machu Picchu Trek": { lat: -13.16310000, lng: -72.54500000 },
  "Kruger Park": { lat: -23.97980000, lng: 31.60320000 },
  "Banff Park": { lat: 51.49680000, lng: -115.98810000 },
  "Zion Park": { lat: 37.29820000, lng: -113.02630000 },
  "Yosemite Valley": { lat: 37.74560000, lng: -119.59370000 },
  "Swiss Alps Jungfrau": { lat: 46.68630000, lng: 7.86330000 },
  "Kenya Safari": { lat: -1.29210000, lng: 36.82190000 },
  "Borneo Rainforest": { lat: 5.98040000, lng: 116.07530000 }
}

// Helper function to get coordinates for a destination
export function getDestinationCoordinates(destinationName: string): { lat: number; lng: number } | null {
  // Try exact match first
  if (destinationCoordinates[destinationName]) {
    return destinationCoordinates[destinationName]
  }
  
  // Try partial match (for cases like "Tokyo, Japan" vs "Tokyo")
  const nameParts = destinationName.split(',')[0].trim()
  if (destinationCoordinates[nameParts]) {
    return destinationCoordinates[nameParts]
  }
  
  return null
}
