const API_BASE_URL = 'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets';
const PARKING_METERS_ENDPOINT = `${API_BASE_URL}/parking-meters/records`;
const DEFAULT_LIMIT = 1000;

async function fetchParkingMeters(params = {}) {
  try {
    const url = new URL(PARKING_METERS_ENDPOINT);
    
    url.searchParams.append('limit', params.limit || DEFAULT_LIMIT);
    
    if (params.offset) {
      url.searchParams.append('offset', params.offset);
    }
    
    if (params.where) {
      url.searchParams.append('where', params.where);
    }
    
    if (params.refine) {
      Object.entries(params.refine).forEach(([key, value]) => {
        url.searchParams.append(`refine.${key}`, value);
      });
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch parking meters:', error);
    return [];
  }
}

function parseParkingData(results) {
  if (!results || !Array.isArray(results)) return [];
  
  return results.map(meter => {
    return {
      id: meter.meterid || '',
      meterType: meter.meterhead || '',
      coordinates: meter.geom?.geometry?.coordinates || [0, 0],
      rates: {
        weekdayDay: meter.r_mf_9a_6p || '',
        weekdayEvening: meter.r_mf_6p_10 || '',
        saturdayDay: meter.r_sa_9a_6p || '',
        saturdayEvening: meter.r_sa_6p_10 || '',
        sundayDay: meter.r_su_9a_6p || '',
        sundayEvening: meter.r_su_6p_10 || ''
      },
      timeRestrictions: {
        weekdayDay: meter.t_mf_9a_6p || '',
        weekdayEvening: meter.t_mf_6p_10 || '',
        saturdayDay: meter.t_sa_9a_6p || '',
        saturdayEvening: meter.t_sa_6p_10 || '',
        sundayDay: meter.t_su_9a_6p || '',
        sundayEvening: meter.t_su_6p_10 || ''
      },
      timeInEffect: meter.timeineffe || '',
      acceptsCreditCard: meter.creditcard === 'Yes',
      payPhoneNumber: meter.pay_phone || '',
      location: meter.geo_local_area || '',
      lat: meter.geo_point_2d?.lat || 0,
      lon: meter.geo_point_2d?.lon || 0
    };
  });
}

async function searchParkingByLocation(lat, lng, radius = 500, params = {}) {
  try {
    const url = new URL(PARKING_METERS_ENDPOINT);
    url.searchParams.append('limit', params.limit || 100);
    
    const geoFilter = `geofilter.distance=${lat},${lng},${radius}`;
    url.searchParams.append('geofilter.distance', `${lat},${lng},${radius}`);
    
    if (params.refine) {
      Object.entries(params.refine).forEach(([key, value]) => {
        url.searchParams.append(`refine.${key}`, value);
      });
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return parseParkingData(data.results || []);
  } catch (error) {
    console.error('Failed to search parking by location:', error);
    return [];
  }
}

function filterParkingByPrice(parkingData, maxPrice) {
  if (!maxPrice || !parkingData) return parkingData;
  
  const price = parseFloat(maxPrice.replace('$', ''));
  
  return parkingData.filter(meter => {
    const weekdayRate = parseFloat(meter.rates.weekdayDay.replace('$', '')) || 0;
    return weekdayRate <= price;
  });
}

function filterParkingByType(parkingData, meterType) {
  if (!meterType || !parkingData) return parkingData;
  
  return parkingData.filter(meter => 
    meter.meterType.toLowerCase().includes(meterType.toLowerCase())
  );
}

function filterParkingByTime(parkingData, timeOfDay, dayType) {
  if (!timeOfDay || !dayType || !parkingData) return parkingData;
  
  const isEvening = timeOfDay.toLowerCase().includes('evening');
  const isDayTime = !isEvening;
  
  const isWeekday = dayType.toLowerCase().includes('weekday');
  const isSaturday = dayType.toLowerCase().includes('saturday');
  const isSunday = dayType.toLowerCase().includes('sunday');
  
  return parkingData.filter(meter => {
    let restriction = '';
    
    if (isWeekday && isDayTime) restriction = meter.timeRestrictions.weekdayDay;
    else if (isWeekday && isEvening) restriction = meter.timeRestrictions.weekdayEvening;
    else if (isSaturday && isDayTime) restriction = meter.timeRestrictions.saturdayDay;
    else if (isSaturday && isEvening) restriction = meter.timeRestrictions.saturdayEvening;
    else if (isSunday && isDayTime) restriction = meter.timeRestrictions.sundayDay;
    else if (isSunday && isEvening) restriction = meter.timeRestrictions.sundayEvening;
    
    return restriction !== '';
  });
}

export {
  fetchParkingMeters,
  parseParkingData,
  searchParkingByLocation,
  filterParkingByPrice,
  filterParkingByType,
  filterParkingByTime
}; 