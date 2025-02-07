import * as d3 from 'd3';

// Indicator metadata with base values and trends
const indicatorConfig = {
  'env_emissions': {
    baseRange: [4, 12],
    yearlyTrend: -0.02, // Decreasing trend
    volatility: 0.1,
    unit: 'tonnes/capita'
  },
  'renewable_energy': {
    baseRange: [10, 50],
    yearlyTrend: 0.05, // Increasing trend
    volatility: 0.15,
    unit: '%'
  },
  'healthcare_access': {
    baseRange: [70, 95],
    yearlyTrend: 0.01,
    volatility: 0.05,
    unit: '%'
  },
  'digital_connectivity': {
    baseRange: [50, 90],
    yearlyTrend: 0.03,
    volatility: 0.1,
    unit: '%'
  },
  'transport_access': {
    baseRange: [40, 85],
    yearlyTrend: 0.02,
    volatility: 0.08,
    unit: 'score'
  },
  'civic_participation': {
    baseRange: [40, 80],
    yearlyTrend: 0.01,
    volatility: 0.12,
    unit: '%'
  },
  'policy_effectiveness': {
    baseRange: [3, 9],
    yearlyTrend: 0.01,
    volatility: 0.06,
    unit: 'score'
  }
};

function generateSyntheticData(regions, startYear = 2008, endYear = 2022) {
  const syntheticData = {};
  const years = d3.range(startYear, endYear + 1);
  
  // Generate a base value for each region that will be consistent
  const regionBaseValues = {};
  regions.forEach(region => {
    regionBaseValues[region] = {};
    Object.keys(indicatorConfig).forEach(indicator => {
      const [min, max] = indicatorConfig[indicator].baseRange;
      // Use region code to generate consistent random value
      const hash = region.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const normalizedHash = (hash % 100) / 100;
      regionBaseValues[region][indicator] = min + (max - min) * normalizedHash;
    });
  });

  // Generate data for each year
  years.forEach(year => {
    syntheticData[year] = {};
    regions.forEach(region => {
      syntheticData[year][region] = {};
      
      Object.entries(indicatorConfig).forEach(([indicator, config]) => {
        const baseValue = regionBaseValues[region][indicator];
        const yearsSinceStart = year - startYear;
        
        // Apply trend and add some noise
        const trendEffect = baseValue * config.yearlyTrend * yearsSinceStart;
        const noise = (Math.sin(year * region.length) + 1) * config.volatility * baseValue;
        
        let value = baseValue + trendEffect + noise;
        
        // Ensure values stay within reasonable bounds
        const [min, max] = config.baseRange;
        value = Math.max(min * 0.8, Math.min(max * 1.2, value));
        
        syntheticData[year][region][indicator] = Number(value.toFixed(2));
      });
    });
  });

  return syntheticData;
}

export { generateSyntheticData, indicatorConfig }; 