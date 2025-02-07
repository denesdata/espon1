import * as d3 from 'd3';

export function tidyData(rawData) {
  // Transform wide format to long format
  const tidyRows = [];
  
  rawData.forEach(row => {
    // Basic metadata for each region
    const regionMeta = {
      code: row.CODE,
      name: row.NAME,
      type: row.OBJECT,
      version: row.VERSION
    };

    // Process household income
    for (let year = 2011; year <= 2020; year++) {
      const value = row[`hhinc_disinc_pps_${year}`];
      if (value !== ':' && value !== '') {
        tidyRows.push({
          ...regionMeta,
          year: year,
          indicator: 'household_income',
          value: +value
        });
      }
    }

    // Process GDP
    for (let year = 2008; year <= 2022; year++) {
      const value = row[`gdp_ppi_${year}`];
      if (value !== ':' && value !== '') {
        tidyRows.push({
          ...regionMeta,
          year: year,
          indicator: 'gdp',
          value: +value
        });
      }
    }

    // Process employment rate
    for (let year = 2008; year <= 2023; year++) {
      const value = row[`lfst_r_lfe2emprt_${year}`];
      if (value !== ':' && value !== '') {
        tidyRows.push({
          ...regionMeta,
          year: year,
          indicator: 'employment_rate',
          value: +value
        });
      }
    }
  });

  return tidyRows;
}

export function getDescriptiveStats(tidyData) {
  // Group by indicator
  const groupedByIndicator = d3.group(tidyData, d => d.indicator);
  
  const stats = {};
  
  groupedByIndicator.forEach((values, indicator) => {
    const numericValues = values.map(d => d.value).filter(v => !isNaN(v));
    
    stats[indicator] = {
      count: numericValues.length,
      mean: d3.mean(numericValues),
      median: d3.median(numericValues),
      std: d3.deviation(numericValues),
      min: d3.min(numericValues),
      max: d3.max(numericValues),
      q1: d3.quantile(numericValues, 0.25),
      q3: d3.quantile(numericValues, 0.75)
    };
  });

  return stats;
}

export function getRegionalTrends(tidyData) {
  // Group by region and indicator
  const groupedByRegion = d3.group(tidyData, d => d.code, d => d.indicator);
  
  const trends = {};
  
  groupedByRegion.forEach((indicators, region) => {
    trends[region] = {};
    
    indicators.forEach((values, indicator) => {
      // Sort by year
      const sortedValues = values.sort((a, b) => a.year - b.year);
      
      // Calculate year-over-year change
      const changes = [];
      for (let i = 1; i < sortedValues.length; i++) {
        changes.push({
          year: sortedValues[i].year,
          change: ((sortedValues[i].value - sortedValues[i-1].value) / sortedValues[i-1].value) * 100
        });
      }
      
      trends[region][indicator] = {
        firstYear: sortedValues[0].year,
        lastYear: sortedValues[sortedValues.length - 1].year,
        totalChange: ((sortedValues[sortedValues.length - 1].value - sortedValues[0].value) / sortedValues[0].value) * 100,
        yearlyChanges: changes
      };
    });
  });

  return trends;
} 