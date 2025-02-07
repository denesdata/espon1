import { generateSyntheticData } from '../src/utils/generateSyntheticData.js';
import fs from 'fs';

// Read region codes from your data file
const data = JSON.parse(fs.readFileSync('data/data_sample.json', 'utf8'));
const regions = [...new Set(data.map(d => d.CODE))];

// Generate synthetic data
const syntheticData = generateSyntheticData(regions);

// Save to file
fs.writeFileSync(
  'data/synthetic_data.json',
  JSON.stringify(syntheticData, null, 2)
); 