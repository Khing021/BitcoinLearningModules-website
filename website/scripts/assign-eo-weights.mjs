import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const unitsPath = path.resolve(__dirname, '../../delivery/releases/v1.0.0/catalog/units.json');

const weightsMap = {
  // Chapter 1: Money
  'opening-chapter': { EO1: 3 },
  'what-is-money': { EO1: 3 },
  'before-money': { EO1: 3 },
  'good-money-properties': { EO1: 3 },
  'better-money-emerges': { EO1: 3 },

  // Chapter 2: Fiat Money
  'currency-emergence': { EO1: 3 },
  'bimetallic-standard': { EO1: 3 },
  'unit-7': { EO1: 3 },
  'unit-8': { EO1: 3 },
  'unit-9': { EO1: 3 },
  'world-war-one-turning-point': { EO1: 3 },
  'unit-11': { EO1: 3 },
  'unit-12': { EO1: 3 },
  'unit-13': { EO1: 3 },
  'unit-14': { EO1: 3 },
  'unit-15': { EO1: 2, EO2: 1 },
  'unit-16': { EO1: 2, EO5: 1 },

  // Chapter 3: Bitcoin
  'decentralized-digital-currency': { EO2: 3 },
  'pre-bitcoin-experiments': { EO2: 3 },
  'bitcoin': { EO2: 3 },
  'public-perception-of-bitcoin': { EO1: 1, EO2: 2 },
  'other-crypto-and-why-not-bitcoin': { EO2: 3 },

  // Chapter 4: Bitcoin System Structure
  'bitcoin-network-and-node': { EO2: 3 },
  'blocks-mining-and-proof-of-work': { EO2: 3 },
  'developer-node-runner-miner-user': { EO2: 3 },

  // Chapter 5: Becoming a Bitcoin Owner
  'paths-to-get-bitcoin': { EO3: 3 },
  'buying-bitcoin-on-exchange': { EO3: 2, EO5: 1 },
  'buying-bitcoin-outside-exchange': { EO3: 3 },
  'getting-bitcoin-from-mining': { EO2: 1, EO3: 2 },
  'earning-bitcoin-as-income': { EO3: 3 },

  // Chapter 6: Using Bitcoin Safely
  'exchange-is-not-ownership': { EO3: 3 },
  'technical-ownership': { EO2: 1, EO3: 2 },
  'hd-wallet-seed-and-address': { EO3: 3 },
  'hardware-wallet': { EO3: 3 },
  'receiving-bitcoin': { EO3: 3 },
  'sending-bitcoin': { EO3: 3 },
  'seed-storage-and-basic-security': { EO3: 3 },
  'theft-examples-and-prevention': { EO3: 3 },

  // Chapter 7: Technology and Development
  'layer-1-development-path': { EO2: 3 },
  'layer-2-and-scalability': { EO2: 3 },
  'lightning-network': { EO2: 1, EO3: 2 },

  // Chapter 8: Adoption and Future Role
  'government-views': { EO1: 1, EO5: 2 },
  'traditional-finance-views': { EO4: 3 },
  'bitcoin-etf': { EO4: 3 },
  'bitcoin-treasury-company': { EO4: 3 },
  'bitcoin-price-models': { EO4: 3 },
  'famous-predictions': { EO1: 1, EO4: 2 },
  'chapter-close': { EO1: 1, EO4: 2 },

  // Chapter 9: Bitcoin in Thailand
  'thai-policy-stance': { EO5: 3 },
  'thai-regulation-and-rules': { EO5: 3 },
  'merchant-adoption-thailand': { EO3: 1, EO5: 2 }
};

const units = JSON.parse(fs.readFileSync(unitsPath, 'utf8'));

for (const unit of units) {
  const w = weightsMap[unit.unitId];
  if (!w) {
    console.error(`Missing weights for unit: ${unit.unitId}`);
    process.exit(1);
  }
  unit.eoWeights = w;
}

fs.writeFileSync(unitsPath, JSON.stringify(units, null, 2) + '\n', 'utf8');
console.log(`Successfully assigned EO weights to ${units.length} units in ${unitsPath}`);
