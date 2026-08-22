import { useState, useMemo } from 'react'
import { BookOpen, Search, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { PageLayout, ModuleCard } from './PageLayout'

interface Term {
  term: string
  definition: string
  source: string
  sourceUrl: string
  example: string
  category: string
  relatedTerms?: string[]
}

const GLOSSARY_DATA: Record<string, Term[]> = {
  'Pricing & Benchmarks': [
    { term: 'WTI (West Texas Intermediate)', definition: 'A light, sweet crude oil benchmark sourced primarily from the Permian Basin in Texas. It is the primary pricing reference for US crude oil futures traded on the NYMEX (CME Group). WTI typically trades at a discount to Brent due to pipeline logistics and inland location.', source: 'CME Group / EIA', sourceUrl: 'https://www.eia.gov/petroleum/', example: 'WTI June 2026 futures closed at $62.45/bbl, down 1.2% on the session.', category: 'Pricing & Benchmarks', relatedTerms: ['Brent', 'Crack Spread', 'Contango', 'Backwardation'] },
    { term: 'Brent Crude', definition: 'A light, sweet crude oil benchmark extracted from the North Sea. It is the pricing reference for roughly two-thirds of globally traded crude. Brent prices influence the cost of crude exports from Europe, Africa, and the Middle East.', source: 'ICE / Platts', sourceUrl: 'https://www.ice.com/products/16/Brent-Futures', example: 'Brent crude traded at $66.10/bbl, maintaining a $3.65 premium over WTI.', category: 'Pricing & Benchmarks', relatedTerms: ['WTI', 'Dubai/Oman', 'Brent-WTI Spread'] },
    { term: 'Brent-WTI Spread', definition: 'The price difference between Brent and WTI crude oil. This spread reflects transportation costs, geopolitical risk premiums, and global supply/demand dynamics. A widening spread typically signals tighter Atlantic Basin supply or higher Middle East risk premiums.', source: 'CME Group', sourceUrl: 'https://www.cmegroup.com/', example: 'The Brent-WTI spread widened to $3.65 as Middle East tensions escalated.', category: 'Pricing & Benchmarks', relatedTerms: ['WTI', 'Brent', 'Arbitrage'] },
    { term: 'Dubai/Oman Crude', definition: 'A medium, sour crude benchmark used as the pricing reference for Asian crude imports. Dubai acts as the benchmark for roughly 12-15 million bbl/d of crude flowing to Asia. Platts publishes daily assessments.', source: 'Platts / DME', sourceUrl: 'https://www.platts.com/', example: 'Dubai crude for September loading was assessed at $64.80/bbl.', category: 'Pricing & Benchmarks', relatedTerms: ['WTI', 'Brent', 'Sour Crude'] },
    { term: 'Urals Crude', definition: 'Russia\'s primary export blend, a medium, sour crude transported via pipeline to Black Sea ports. It typically trades at a discount to Brent reflecting quality and sanctions risk. Since 2022, the Urals discount has widened significantly due to G7 price caps.', source: 'Platts / Reuters', sourceUrl: 'https://www.reuters.com/business/energy/', example: 'Urals traded at a $8.50 discount to Brent amid ongoing G7 enforcement.', category: 'Pricing & Benchmarks', relatedTerms: ['Brent', 'Sanctions', 'Price Cap'] },
    { term: 'Spot Price', definition: 'The current market price at which a commodity can be bought or sold for immediate delivery (typically within 2 working days). Spot prices are the foundation for futures pricing and physical trade contracts.', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'WTI spot price in Cushing, Oklahoma was $62.45/bbl on Friday.', category: 'Pricing & Benchmarks', relatedTerms: ['Futures', 'Forward Curve'] },
    { term: 'Futures Contract', definition: 'A standardized legal agreement to buy or sell a specific quantity of a commodity at a predetermined price on a specified future date. Oil futures trade on NYMEX (WTI) and ICE (Brent). A standard contract represents 1,000 barrels.', source: 'CME Group / ICE', sourceUrl: 'https://www.cmegroup.com/markets/energy/crude-oil/light-sweet-crude.html', example: 'Open interest in CL=F September contracts reached 2.1 million lots.', category: 'Pricing & Benchmarks', relatedTerms: ['Forward Curve', 'Contango', 'Backwardation', 'Open Interest'] },
    { term: 'Crack Spread', definition: 'The pricing difference between a barrel of crude oil and the refined products (gasoline, diesel, jet fuel) produced from it. A positive crack spread indicates profitable refining. It is calculated as: (Product price × conversion ratio) − crude cost.', source: 'EIA / CME Group', sourceUrl: 'https://www.eia.gov/', example: 'The 3-2-1 crack spread (gasoline + diesel vs. crude) was $28.50/bbl.', category: 'Pricing & Benchmarks', relatedTerms: ['Refinery', '3-2-1 Crack Spread', 'Margin'] },
  ],
  'Supply & Production': [
    { term: 'Organization of the Petroleum Exporting Countries (OPEC)', definition: 'An intergovernmental organization of 12 oil-producing nations founded in 1960. OPEC coordinates petroleum policies and stabilizes oil markets by adjusting production quotas. Members include Saudi Arabia, Iraq, Iran, UAE, Kuwait, Venezuela, Nigeria, Libya, Angola, Algeria, Gabon, and Equatorial Guinea.', source: 'OPEC', sourceUrl: 'https://www.opec.org/opec_web/en/', example: 'OPEC+ agreed to increase output by 548,000 bpd starting September.', category: 'Supply & Production', relatedTerms: ['OPEC+', 'Production Quota', 'Compliance'] },
    { term: 'OPEC+', definition: 'OPEC plus 10 additional non-OPEC oil producers, including Russia, Kazakhstan, Mexico, Oman, and others. Formally known as the Declaration of Cooperation (DoC), OPEC+ coordinates production adjustments to stabilize markets. Together, they account for approximately 55% of global oil supply.', source: 'OPEC Secretariat', sourceUrl: 'https://www.opec.org/opec_web/en/', example: 'OPEC+ is discussing extending the current production agreement through Q2 2027.', category: 'Supply & Production', relatedTerms: ['OPEC', 'JMMC', 'Ministerial Meeting'] },
    { term: 'Production Quota', definition: 'A binding limit on how much crude oil each OPEC+ member is allowed to produce. Quotas are set during ministerial meetings and are designed to manage global supply levels. Compliance is tracked monthly by the JMMC.', source: 'OPEC', sourceUrl: 'https://www.opec.org/opec_web/en/', example: 'Saudi Arabia\'s current OPEC+ quota stands at 10 million bpd.', category: 'Supply & Production', relatedTerms: ['OPEC+', 'Compliance', 'Overproduction'] },
    { term: 'Barrels Per Day (bpd)', definition: 'The standard unit of measurement for oil production, consumption, and trade flows. One barrel contains 42 US gallons (159 liters). Global oil production is approximately 102 million bpd (2026 estimate).', source: 'EIA / IEA', sourceUrl: 'https://www.iea.org/', example: 'US crude production averaged 12.9 million bpd in Q1 2026.', category: 'Supply & Production', relatedTerms: ['Mbbl', 'Kbbl', 'Mmbtu'] },
    { term: 'Brent Price Cap', definition: 'A G7-imposed maximum price ($60/bbl) at which Russian seaborne crude can be purchased and transported using Western insurance, financing, and shipping services. Enforced since December 2022, the cap aims to limit Russian oil revenues while keeping supply flowing.', source: 'OFAC / EU', sourceUrl: 'https://ofac.treasury.gov/', example: 'Urals crude traded below the $60 price cap at $52/bbl this week.', category: 'Supply & Production', relatedTerms: ['Sanctions', 'Dark Fleet', 'Urals'] },
    { term: 'Shale Oil', definition: 'Crude oil extracted from shale formations through hydraulic fracturing ("fracking") and horizontal drilling. The US Permian Basin, Eagle Ford, and Bakken are major shale plays. Shale production is characterized by shorter well life and faster decline rates compared to conventional wells.', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'US shale production from the Permian Basin reached 6.2 million bpd.', category: 'Supply & Production', relatedTerms: ['Fracking', 'Permian Basin', 'DUC Wells'] },
    { term: 'DUC Wells (Drilled but Uncompleted)', definition: 'Oil or gas wells that have been drilled to total depth but have not been completed with hydraulic fracturing and production equipment. DUC wells represent a form of inventory that can be brought online relatively quickly when prices justify completion.', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'The Permian Basin had approximately 1,200 DUC wells available for completion.', category: 'Supply & Production', relatedTerms: ['Shale Oil', 'Completion', 'Fracking'] },
    { term: 'Peak Oil', definition: 'The theoretical point at which global crude oil production reaches its maximum rate, after which production enters terminal decline. Debates around peak oil consider both supply-side constraints (resource depletion) and demand-side factors (energy transition, EVs).', source: 'IEA', sourceUrl: 'https://www.iea.org/', example: 'IEA projects peak oil demand by 2030 under current policy scenarios.', category: 'Supply & Production', relatedTerms: ['Energy Transition', 'Decline Rate'] },
    { term: 'Decline Rate', definition: 'The annual percentage decrease in production from an existing oil field without additional investment. Conventional fields typically decline 5-10% per year. Shale wells decline 60-70% in the first year, then stabilize at 15-20% annually.', source: 'IEA / Rystad Energy', sourceUrl: 'https://www.rystadenergy.com/', example: 'Ghawar field in Saudi Arabia has an estimated annual decline rate of 5-7%.', category: 'Supply & Production', relatedTerms: ['Peak Oil', 'Enhanced Oil Recovery'] },
  ],
  'Refining & Downstream': [
    { term: 'Refinery', definition: 'An industrial facility that processes crude oil into finished petroleum products such as gasoline, diesel, jet fuel, heating oil, and petrochemical feedstocks. A typical barrel of crude yields approximately 44% gasoline, 28% diesel, and 9% jet fuel.', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'US refinery utilization averaged 93.5% last week, processing 16.2 million bpd of crude.', category: 'Refining & Downstream', relatedTerms: ['Crack Spread', 'Utilization Rate', 'Nelson Complexity Index'] },
    { term: 'Nelson Complexity Index', definition: 'A measure of a refinery\'s ability to process heavy, sour crude oil into higher-value products. A higher index indicates more complex conversion capacity (cokers, hydrocrackers). Typical range: 5-15. Complex refineries earn wider margins.', source: 'OIL (Oil Institute Library)', sourceUrl: 'https://www.oilandgasfacilities.com/', example: 'Motiva Port Arthur has the highest Nelson Complexity Index at 15.3.', category: 'Refining & Downstream', relatedTerms: ['Refinery', 'Coking', 'Hydrocracking'] },
    { term: 'Utilization Rate', definition: 'The percentage of a refinery\'s operable capacity that is being used. EIA reports weekly US refinery utilization. Rates above 90% indicate tight capacity; rates below 80% may signal maintenance or weak demand.', source: 'EIA Weekly Petroleum Status Report', sourceUrl: 'https://www.eia.gov/petroleum/supply/weekly/', example: 'Gulf Coast (PADD 3) refinery utilization was 96.2%, near seasonal maximum.', category: 'Refining & Downstream', relatedTerms: ['Refinery', 'Turnaround', 'Planned Maintenance'] },
    { term: 'PADD (Petroleum Administration for Defense Districts)', definition: 'Five geographic regions used by the EIA to report US petroleum data: PADD 1 (East Coast), PADD 2 (Midwest), PADD 3 (Gulf Coast), PADD 4 (Rocky Mountain), PADD 5 (West Coast). PADD 3 contains over 50% of US refinery capacity.', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'PADD 3 (Gulf Coast) accounts for 9.8 million bpd of US refinery capacity.', category: 'Refining & Downstream', relatedTerms: ['Refinery', 'Cushing'] },
    { term: 'Turnaround', definition: 'A scheduled shutdown of a refinery unit or entire facility for maintenance, inspection, and repairs. Turnarounds typically last 2-6 weeks and reduce refinery throughput, often tightening local product supply and supporting crack spreads.', source: 'Industry', sourceUrl: '', example: 'ExxonMobil Baytown refinery began a 4-week turnaround on its fluid catalytic cracker.', category: 'Refining & Downstream', relatedTerms: ['Utilization Rate', 'Refinery'] },
    { term: '3-2-1 Crack Spread', definition: 'A common crack spread ratio that simulates refining 3 barrels of crude oil into 2 barrels of gasoline and 1 barrel of diesel. It is calculated as: (2 × gasoline price + 1 × diesel price) − (3 × crude price). Widely used as a benchmark for US refinery margins.', source: 'CME Group', sourceUrl: 'https://www.cmegroup.com/', example: 'The 3-2-1 crack spread averaged $28.50/bbl over the past 30 days.', category: 'Refining & Downstream', relatedTerms: ['Crack Spread', 'Refinery'] },
  ],
  'Storage & Logistics': [
    { term: 'Cushing, Oklahoma', definition: 'The delivery point for WTI crude oil futures contracts and the largest crude oil storage hub in the US, with approximately 90 million barrels of working storage capacity. Changes in Cushing inventory levels directly impact WTI pricing.', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'Cushing crude inventories fell 1.2 million barrels to 24.8 million bbl.', category: 'Storage & Logistics', relatedTerms: ['WTI', 'Storage', 'Working Capacity'] },
    { term: 'Strategic Petroleum Reserve (SPR)', definition: 'The US government\'s emergency stockpile of crude oil, currently held in underground salt caverns along the Gulf Coast. Maximum capacity is 714 million barrels. The SPR is managed by the DOE and can be released during supply emergencies.', source: 'EIA / DOE', sourceUrl: 'https://www.energy.gov/ceser/strategic-petroleum-reserve', example: 'US SPR levels stand at 372 million barrels, with ongoing refilling operations.', category: 'Storage & Logistics', relatedTerms: ['SPR Release', 'Cushing', 'Inventory'] },
    { term: 'Contango', definition: 'A market structure where futures prices are higher than the current spot price, creating an upward-sloping forward curve. Contango typically signals near-term oversupply and positive storage economics (it pays to store oil and sell later).', source: 'CME Group', sourceUrl: 'https://www.cmegroup.com/', example: 'WTI is in contango, with M3 contracts trading $1.20 above the front month.', category: 'Storage & Logistics', relatedTerms: ['Backwardation', 'Futures Curve', 'Storage'] },
    { term: 'Backwardation', definition: 'A market structure where futures prices are lower than the current spot price, creating a downward-sloping forward curve. Backwardation signals near-term supply tightness — buyers pay a premium for immediate delivery. It penalizes storage and is typically bullish for spot prices.', source: 'CME Group', sourceUrl: 'https://www.cmegroup.com/', example: 'Brent is in backwardation, reflecting tight North Sea supply and strong Asian demand.', category: 'Storage & Logistics', relatedTerms: ['Contango', 'Futures Curve', 'Convenience Yield'] },
    { term: 'Crude Oil Inventory', definition: 'The total volume of crude oil held in storage at commercial facilities, reported weekly by the EIA. Inventory builds suggest weaker demand or stronger supply; draws suggest tightening markets. Total US commercial crude stocks are approximately 420-440 million barrels.', source: 'EIA Weekly Petroleum Status Report', sourceUrl: 'https://www.eia.gov/petroleum/supply/weekly/', example: 'US commercial crude inventories drew by 3.2 million barrels last week.', category: 'Storage & Logistics', relatedTerms: ['SPR', 'Cushing', 'EIA Weekly'] },
    { term: 'Floating Storage', definition: 'Crude oil or refined products stored on tankers at sea, typically when onshore storage is full or when the contango is wide enough to cover charter costs. Floating storage is a key indicator of market oversupply.', source: 'Platts / Kpler', sourceUrl: 'https://www.platts.com/', example: 'Floating storage of crude oil reached 80 million barrels during the 2020 storage crisis.', category: 'Storage & Logistics', relatedTerms: ['Contango', 'Storage', 'VLCC'] },
  ],
  'Shipping & Freight': [
    { term: 'VLCC (Very Large Crude Carrier)', definition: 'The largest class of oil tanker, capable of carrying 2 million barrels (approximately 320,000 DWT). VLCCs are the workhorses of long-haul crude trade, particularly Middle East to Asia routes. A VLCC can transport approximately 270,000 tonnes of crude.', source: 'Baltic Exchange', sourceUrl: 'https://www.balticexchange.com/', example: 'TD3C VLCC rate from Persian Gulf to China rose to WS82, up 5 points.', category: 'Shipping & Freight', relatedTerms: ['Suezmax', 'Aframax', 'Baltic Dirty Tanker Index'] },
    { term: 'Suezmax', definition: 'A medium-sized oil tanker that can transit the Suez Canal fully loaded, typically carrying 1 million barrels (approximately 120,000-160,000 DWT). Common routes include West Africa to US East Coast and Middle East to Mediterranean.', source: 'Baltic Exchange', sourceUrl: 'https://www.balticexchange.com/', example: 'Suezmax rates on the TD20 route (Caribbean to USGC) were at WS105.', category: 'Shipping & Freight', relatedTerms: ['VLCC', 'Aframax', 'Baltic Dirty Tanker Index'] },
    { term: 'Aframax', definition: 'A medium-sized oil tanker (80,000-120,000 DWT) used for shorter-haul routes and regional trade. Named after the Average Freight Rate Assessment (AFRA) system. Common in North Sea, Caribbean, and Mediterranean trade.', source: 'Baltic Exchange', sourceUrl: 'https://www.balticexchange.com/', example: 'Aframax rates on the North Sea cross-Med route held steady at WS95.', category: 'Shipping & Freight', relatedTerms: ['VLCC', 'Suezmax', 'Handymax'] },
    { term: 'Baltic Dirty Tanker Index (BDTI)', definition: 'An index published by the Baltic Exchange that measures daily freight rates for dirty tanker routes (crude oil transport). It covers VLCC, Suezmax, and Aframax rates across 19 routes and is a key indicator of global oil shipping demand.', source: 'Baltic Exchange', sourceUrl: 'https://www.balticexchange.com/', example: 'The BDTI rose 18 points to 1,120 on strong Middle East demand.', category: 'Shipping & Freight', relatedTerms: ['Baltic Clean Tanker Index', 'WS Points'] },
    { term: 'Worldscale (WS) Points', definition: 'A standardized tariff system used to calculate flat rates for tanker chartering. WS 100 represents the breakeven rate for a specific route. WS above 100 indicates profitable rates; below 100 indicates below-breakeven conditions.', source: 'Baltic Exchange / Worldscale Association', sourceUrl: 'https://worldscale.com/', example: 'TD3C (PG to China VLCC) is currently assessed at WS82, or $42,000/day.', category: 'Shipping & Freight', relatedTerms: ['Baltic Dirty Tanker Index', 'TCE'] },
    { term: 'AIS (Automatic Identification System)', definition: 'A tracking system used on ships for identifying and locating vessels via transponder. Dark vessels are those that disable or spoof their AIS signals to avoid detection — often associated with sanctions evasion, illegal fishing, or ship-to-ship transfers.', source: 'IMO / Global Fishing Watch', sourceUrl: 'https://globalfishingwatch.org/', example: 'Three tankers near the Strait of Hormuz showed AIS gaps exceeding 48 hours.', category: 'Shipping & Freight', relatedTerms: ['Dark Fleet', 'Ship-to-Ship Transfer', 'Sanctions'] },
    { term: 'Dark Fleet', definition: 'A network of aging tankers that operate outside normal insurance and shipping channels, often used to transport sanctioned oil (Iran, Russia, Venezuela). These vessels frequently disable AIS transponders and engage in ship-to-ship transfers to obscure cargo origin.', source: 'Reuters / Kpler', sourceUrl: 'https://www.reuters.com/business/energy/', example: 'An estimated 400+ vessels now operate in the dark fleet for Russian and Iranian oil.', category: 'Shipping & Freight', relatedTerms: ['AIS', 'Ship-to-Ship Transfer', 'Sanctions'] },
  ],
  'Geopolitics & Policy': [
    { term: 'Strait of Hormuz', definition: 'A narrow waterway (21 miles wide at its narrowest) connecting the Persian Gulf to the Gulf of Oman and the open ocean. Approximately 21 million bbl/d of crude oil transit through Hormuz daily — roughly 21% of global supply. Any disruption would be catastrophic for energy markets.', source: 'EIA / IEA', sourceUrl: 'https://www.eia.gov/', example: 'Iranian naval forces conducted exercises near the Strait of Hormuz, raising tension.', category: 'Geopolitics & Policy', relatedTerms: ['Bab el-Mandeb', 'Suez Canal', 'Chokepoint'] },
    { term: 'Suez Canal', definition: 'An artificial waterway in Egypt connecting the Mediterranean Sea to the Red Sea, handling approximately 12% of global trade. Critical for Middle East crude exports to Europe. The 2021 Ever Given blockage disrupted $9.6 billion/day in trade.', source: 'Suez Canal Authority / EIA', sourceUrl: 'https://www.suezcanal.gov.eg/', example: 'Suez Canal transit revenue reached $9.4 billion in FY2025.', category: 'Geopolitics & Policy', relatedTerms: ['Strait of Hormuz', 'Bab el-Mandeb', 'SUMED Pipeline'] },
    { term: 'Sanctions', definition: 'Economic penalties imposed by governments or international bodies to restrict trade with targeted countries, entities, or individuals. Oil-related sanctions can restrict crude exports (Iran, Russia, Venezuela), limit technology transfer, and disrupt global supply chains. Key enforcement agencies include OFAC (US) and OFSI (UK).', source: 'OFAC / EU / OFSI', sourceUrl: 'https://ofac.treasury.gov/', example: 'OFAC designated three additional Russian oil entities under the price cap enforcement program.', category: 'Geopolitics & Policy', relatedTerms: ['OFAC', 'Price Cap', 'Dark Fleet'] },
    { term: 'OFAC (Office of Foreign Assets Control)', definition: 'A division of the US Treasury Department that administers and enforces economic sanctions programs against targeted countries, entities, and individuals. OFAC is the primary enforcement body for US oil-related sanctions on Iran, Russia, Venezuela, and others.', source: 'US Treasury', sourceUrl: 'https://ofac.treasury.gov/', example: 'OFAC issued new guidance on price cap compliance for Russian crude oil.', category: 'Geopolitics & Policy', relatedTerms: ['Sanctions', 'SDN List', 'Secondary Sanctions'] },
    { term: 'Geopolitical Risk Premium', definition: 'The additional cost embedded in oil prices due to the perceived risk of supply disruptions from geopolitical events (wars, sanctions, coups, piracy). Typically measured by comparing actual prices to models based purely on supply/demand fundamentals.', source: 'Research / EIA', sourceUrl: 'https://www.eia.gov/', example: 'Analysts estimate a $5-8/bbl geopolitical risk premium currently embedded in Brent prices.', category: 'Geopolitics & Policy', relatedTerms: ['VIX', 'Safe Haven', 'Risk-Off'] },
  ],
  'Quality & Grades': [
    { term: 'API Gravity', definition: 'A measure of how heavy or light a petroleum liquid is compared to water. If its API gravity is greater than 10, it is lighter and floats on water; if less than 10, it is heavier and sinks. Light crude (API > 31°) is easier and cheaper to refine into high-value products.', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'WTI has an API gravity of 39.6°, classifying it as light crude.', category: 'Quality & Grades', relatedTerms: ['Light Crude', 'Heavy Crude', 'Sweet Crude'] },
    { term: 'Sulfur Content', definition: 'The amount of sulfur in crude oil, measured in weight percentage. Sweet crude has less than 0.5% sulfur; sour crude has more than 0.5%. Higher sulfur requires additional refining steps (desulfurization) and increases processing costs.', source: 'EIA / Platts', sourceUrl: 'https://www.eia.gov/', example: 'Brent crude has a sulfur content of 0.37%, making it sweet crude.', category: 'Quality & Grades', relatedTerms: ['Sweet Crude', 'Sour Crude', 'Desulfurization'] },
    { term: 'Light Crude', definition: 'Crude oil with an API gravity above 31°. Light crude flows easily and yields a higher percentage of gasoline and diesel during refining, commanding a price premium over heavier grades. Examples include WTI (39.6°) and Brent (38.3°).', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'Light crude grades currently trade at a $3-5 premium over medium grades.', category: 'Quality & Grades', relatedTerms: ['Heavy Crude', 'API Gravity', 'Sweet Crude'] },
    { term: 'Heavy Crude', definition: 'Crude oil with an API gravity below 22°. Heavy crude is denser, more viscous, and contains more contaminants (sulfur, metals). It requires more complex refining processes but can be purchased at a discount. Examples: WCS (20.5°), Orinoco Belt (8°).', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'WCS trades at a $12.80 discount to WTI due to its heavy, sour quality.', category: 'Quality & Grades', relatedTerms: ['Light Crude', 'API Gravity', 'Dilbit'] },
    { term: 'Sweet Crude', definition: 'Crude oil with sulfur content below 0.5%. Sweet crude is easier and cheaper to refine, producing more high-value products with less processing. It commands a premium over sour crude. Examples: WTI (0.24% S), Bonny Light (0.16% S).', source: 'EIA / Platts', sourceUrl: 'https://www.eia.gov/', example: 'Light sweet crude typically trades $2-4 above comparable sour grades.', category: 'Quality & Grades', relatedTerms: ['Sour Crude', 'Light Crude', 'Sulfur Content'] },
    { term: 'Sour Crude', definition: 'Crude oil with sulfur content above 0.5%. Sour crude requires additional processing (hydrotreating) to remove sulfur before it can be refined into clean products. It trades at a discount to sweet crude, with the discount widening during periods of tight refinery capacity.', source: 'EIA / Platts', sourceUrl: 'https://www.eia.gov/', example: 'Mars (US Gulf sour) trades at a $4.20 discount to WTI.', category: 'Quality & Grades', relatedTerms: ['Sweet Crude', 'Desulfurization', 'Sulfur Content'] },
  ],
  'Financial & Trading': [
    { term: 'Open Interest', definition: 'The total number of outstanding (not yet settled) futures contracts for a particular commodity. Rising open interest alongside rising prices suggests new money entering the market (bullish). Falling open interest suggests positions are being closed.', source: 'CME Group', sourceUrl: 'https://www.cmegroup.com/', example: 'CL=F open interest increased by 15,000 contracts to 2.1 million.', category: 'Financial & Trading', relatedTerms: ['Volume', 'Futures Contract', 'Margin'] },
    { term: 'Brent-WTI Spread', definition: 'The price differential between Brent and WTI crude. Widened significantly post-2014 due to US pipeline constraints and later by OPEC+ production cuts and sanctions. The spread is a key indicator of Atlantic Basin supply dynamics.', source: 'CME Group / ICE', sourceUrl: 'https://www.cmegroup.com/', example: 'The spread widened to $3.65 as Middle East tensions lifted Brent premiums.', category: 'Financial & Trading', relatedTerms: ['WTI', 'Brent', 'Arbitrage'] },
    { term: 'Long Position', definition: 'A futures or options position that profits from rising prices. A trader who buys crude oil futures is "long" — they benefit if the price increases above their entry point. Commercial hedgers (refiners) typically take short positions.', source: 'CFTC', sourceUrl: 'https://www.cftc.gov/', example: 'Managed money increased net long positions in WTI by 18,000 contracts.', category: 'Financial & Trading', relatedTerms: ['Short Position', 'COT Report', 'Hedging'] },
    { term: 'Short Position', definition: 'A futures or options position that profits from falling prices. A trader who sells crude oil futures is "short" — they benefit if the price decreases. Producers (oil companies) typically take short positions to hedge their output.', source: 'CFTC', sourceUrl: 'https://www.cftc.gov/', example: 'Producers increased their net short hedges ahead of the OPEC meeting.', category: 'Financial & Trading', relatedTerms: ['Long Position', 'COT Report', 'Hedging'] },
    { term: 'Commitments of Traders (COT)', definition: 'A weekly report published by the CFTC that breaks down the open interest in futures markets by trader type: commercial (hedgers), non-commercial (speculators), and non-reportable (small traders). Used to gauge market sentiment and positioning.', source: 'CFTC', sourceUrl: 'https://www.cftc.gov/dea/futures/other_lf.htm', example: 'The COT report showed speculators holding a net long of 245,000 contracts in crude.', category: 'Financial & Trading', relatedTerms: ['Open Interest', 'Long Position', 'Short Position'] },
    { term: 'Implied Volatility', definition: 'A metric that captures the market\'s expectation of future price fluctuations, derived from options prices. Higher implied volatility indicates greater expected price swings. For crude oil, IV often spikes during geopolitical crises or OPEC meetings.', source: 'CME Group / OVX Index', sourceUrl: 'https://www.cmegroup.com/', example: 'CBOE Crude Oil Volatility Index (OVX) rose to 38%, indicating elevated uncertainty.', category: 'Financial & Trading', relatedTerms: ['VIX', 'Options', 'Gamma'] },
  ],
  'Satellite & Intelligence': [
    { term: 'NASA FIRMS (Fire Information for Resource Management System)', definition: 'A satellite-based fire monitoring system that provides near-real-time data on active fires globally using MODIS and VIIRS sensors. Oil facilities near FIRMS hotspots may indicate flaring, accidents, or attacks.', source: 'NASA', sourceUrl: 'https://firms.modaps.eosdis.nasa.gov/', example: 'NASA FIRMS detected 4 thermal anomalies within 50km of Ras Tanura terminal.', category: 'Satellite & Intelligence', relatedTerms: ['Thermal Anomaly', 'FRP', 'MODIS'] },
    { term: 'FRP (Fire Radiative Power)', definition: 'A measure of the radiant energy released by a fire, expressed in megawatts (MW). Higher FRP indicates more intense burning. Used to distinguish between small agricultural fires and large industrial incidents near oil infrastructure.', source: 'NASA FIRMS', sourceUrl: 'https://firms.modaps.eosdis.nasa.gov/', example: 'FRP readings near Jubail Industrial Zone exceeded 25 MW, suggesting industrial activity.', category: 'Satellite & Intelligence', relatedTerms: ['NASA FIRMS', 'Thermal Anomaly'] },
    { term: 'Geostationary Satellite', definition: 'A satellite positioned approximately 35,786 km above the equator that orbits in sync with Earth\'s rotation, providing continuous monitoring of the same region. Three geostationary satellites provide global oil infrastructure coverage: GOES (Americas), Meteosat (Europe/Africa/ME), Himawari (Asia-Pacific).', source: 'NOAA / EUMETSAT / JMA', sourceUrl: 'https://www.star.nesdis.noaa.gov/goes/', example: 'Meteosat-12 provides 15-minute scan intervals for Middle East oil regions.', category: 'Satellite & Intelligence', relatedTerms: ['GOES', 'Meteosat', 'Himawari'] },
    { term: 'Sea Surface Temperature (SST)', definition: 'The temperature of the ocean\'s surface layer. SST anomalies can affect oil production (hurricanes), shipping routes, and refinery cooling water. Elevated SST in the Persian Gulf can impair desalination and power generation.', source: 'NOAA / Open-Meteo', sourceUrl: 'https://coralreefwatch.noaa.gov/', example: 'Persian Gulf SST anomaly of +1.2°C above the August climatological mean.', category: 'Satellite & Intelligence', relatedTerms: ['El Niño', 'Hurricane Season'] },
    { term: 'Ship-to-Ship (STS) Transfer', definition: 'The transfer of cargo from one vessel to another at sea. While legal when properly documented, STS transfers are commonly used by dark fleet tankers to obscure the origin of sanctioned oil by relaying cargo through intermediary vessels.', source: 'Kpler / Global Fishing Watch', sourceUrl: 'https://globalfishingwatch.org/', example: 'Two STS transfers were detected near Fujairah involving tankers with AIS gaps.', category: 'Satellite & Intelligence', relatedTerms: ['Dark Fleet', 'AIS', 'Sanctions'] },
  ],
  'Fields & Reserves': [
    { term: 'Proved Reserves', definition: 'The estimated quantity of oil that geological and engineering data demonstrate with reasonable certainty to be recoverable from known reservoirs under existing economic and operating conditions. Updated annually by the EIA and USGS.', source: 'EIA / USGS', sourceUrl: 'https://www.eia.gov/', example: 'Global proved oil reserves stand at approximately 1.73 trillion barrels.', category: 'Fields & Reserves', relatedTerms: ['Reserve Life Index', 'Enhanced Oil Recovery'] },
    { term: 'Reserve-to-Production (R/P) Ratio', definition: 'The ratio of proved reserves to annual production, expressed in years. It indicates how many years current reserves would last at present production rates. Higher R/P ratios suggest longer field life but don\'t account for new discoveries.', source: 'BP Statistical Review / EIA', sourceUrl: 'https://www.eia.gov/', example: 'Saudi Arabia\'s R/P ratio is approximately 24.6 years at current production rates.', category: 'Fields & Reserves', relatedTerms: ['Proved Reserves', 'Decline Rate'] },
    { term: 'Breakeven Price', definition: 'The minimum oil price at which a project or field can cover its operating and capital costs. Breakeven prices vary widely: Saudi conventional fields ($8-10/bbl), US shale ($40-55/bbl), deepwater ($35-50/bbl).', source: 'Rystad Energy / Wood Mackenzie', sourceUrl: 'https://www.rystadenergy.com/', example: 'Permian Basin average breakeven is $48/bbl, while Ghawar breakeven is approximately $10/bbl.', category: 'Fields & Reserves', relatedTerms: ['Margin', 'Cost Curve'] },
    { term: 'Enhanced Oil Recovery (EOR)', definition: 'Advanced techniques used to extract additional crude from mature fields after primary and secondary recovery methods are exhausted. Methods include CO₂ injection, thermal recovery (steam flooding), and chemical flooding. Can increase recovery by 5-15%.', source: 'DOE / EIA', sourceUrl: 'https://www.eia.gov/', example: 'CO₂-EOR projects in the Permian Basin are producing an additional 300,000 bpd.', category: 'Fields & Reserves', relatedTerms: ['Decline Rate', 'Water Cut'] },
    { term: 'Water Cut', definition: 'The ratio of water produced compared to the total volume of liquids (oil + water) from a well. As fields mature, water cut typically increases, raising production costs. Ghawar, the world\'s largest field, has seen water cut rise significantly.', source: 'Industry', sourceUrl: '', example: 'Cantarell field in Mexico has a water cut exceeding 75%, indicating advanced maturity.', category: 'Fields & Reserves', relatedTerms: ['Decline Rate', 'Mature Field'] },
    { term: 'Mature Field', definition: 'An oil field that has passed its peak production and is in decline. Mature fields typically produce 60-70% water and require enhanced recovery techniques. Most of the world\'s large conventional fields (Ghawar, Burgan, Cantarell) are now mature.', source: 'IEA', sourceUrl: 'https://www.iea.org/', example: 'Over 55% of global oil production comes from mature fields discovered before 1980.', category: 'Fields & Reserves', relatedTerms: ['Decline Rate', 'Enhanced Oil Recovery', 'Water Cut'] },
  ],
  'Market Concepts': [
    { term: 'Basis', definition: 'The price difference between a local/regional crude oil price and the benchmark futures price (WTI or Brent). Basis reflects local supply/demand conditions, transportation costs, and quality differentials. Cushing basis is typically near zero for WTI.', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'Mars crude basis widened to WTI -$4.20 as Gulf Coast supply tightened.', category: 'Market Concepts', relatedTerms: ['Differential', 'Spread'] },
    { term: 'Differential', definition: 'The price gap between a specific crude grade and its benchmark. Differentials are influenced by quality (API gravity, sulfur), location, and supply/demand balance for that grade. Wide differentials signal oversupply of a particular grade.', source: 'Platts', sourceUrl: 'https://www.platts.com/', example: 'WCS differential to WTI widened to $12.80 due to pipeline congestion.', category: 'Market Concepts', relatedTerms: ['Basis', 'Spread', 'Quality Differential'] },
    { term: 'Curve Shape', definition: 'The shape of the futures forward curve: contango (upward sloping), backwardation (downward sloping), or flat. Shape indicates market expectations about near-term supply/demand balance and storage economics.', source: 'CME Group', sourceUrl: 'https://www.cmegroup.com/', example: 'The WTI curve shifted into backwardation, suggesting tightening near-term supply.', category: 'Market Concepts', relatedTerms: ['Contango', 'Backwardation', 'Futures Curve'] },
    { term: 'Congestion', definition: 'In pipeline logistics, when pipeline capacity is insufficient to move all available crude to market. Pipeline congestion forces producers to sell at wider discounts and can cause local inventory builds at storage hubs like Cushing.', source: 'EIA', sourceUrl: 'https://www.eia.gov/', example: 'Permian Basin pipeline congestion has narrowed as new capacity comes online.', category: 'Market Concepts', relatedTerms: ['Cushing', 'Pipeline', 'Basis'] },
    { term: 'Energy Transition', definition: 'The global shift from fossil fuel-based energy systems to renewable and low-carbon alternatives. The energy transition impacts long-term oil demand forecasts, investment decisions, and the valuation of oil assets.', source: 'IEA', sourceUrl: 'https://www.iea.org/', example: 'IEA projects oil demand may peak by 2030 under current policy scenarios.', category: 'Market Concepts', relatedTerms: ['Peak Oil', 'EV Adoption', 'Carbon Capture'] },
    { term: 'Flaring', definition: 'The burning of natural gas associated with oil production, typically when pipeline infrastructure is unavailable to capture and transport the gas. Flaring wastes resources, contributes to CO₂ emissions, and is subject to increasing regulation.', source: 'World Bank / EIA', sourceUrl: 'https://www.worldbank.org/en/topic/gasflaring', example: 'Global gas flaring declined to 139 billion cubic meters in 2024.', category: 'Market Concepts', relatedTerms: ['Emissions', 'Methane', 'ESG'] },
  ],
}

const CATEGORIES = Object.keys(GLOSSARY_DATA)

export function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)

  const allTerms = useMemo(() => {
    return Object.values(GLOSSARY_DATA).flat()
  }, [])

  const filteredTerms = useMemo(() => {
    let terms = allTerms
    if (selectedCategory) {
      terms = GLOSSARY_DATA[selectedCategory] || []
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      terms = terms.filter(t =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.example.toLowerCase().includes(q)
      )
    }
    return terms
  }, [allTerms, searchQuery, selectedCategory])

  const totalTerms = allTerms.length

  return (
    <PageLayout title="Glossary" subtitle={`Industry terminology · ${totalTerms} terms · Definitions, sources & examples`}>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search terminology..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#0d1117] border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-amber/30 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-[10px] font-mono rounded-md border transition-all ${
              !selectedCategory
                ? 'border-amber/30 bg-amber/10 text-amber'
                : 'border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
            }`}>
            All ({totalTerms})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 text-[10px] font-mono rounded-md border transition-all ${
                selectedCategory === cat
                  ? 'border-amber/30 bg-amber/10 text-amber'
                  : 'border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
              }`}>
              {cat} ({GLOSSARY_DATA[cat].length})
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="text-[10px] text-gray-500 font-mono">
          {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
        </div>

        {/* Terms */}
        <div className="space-y-1">
          {filteredTerms.map(term => {
            const isExpanded = expandedTerm === term.term
            return (
              <div key={term.term} className="border border-white/[0.06] rounded-lg overflow-hidden transition-all hover:border-white/[0.12]">
                <button
                  onClick={() => setExpandedTerm(isExpanded ? null : term.term)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  {isExpanded ? <ChevronDown size={12} className="text-gray-500 shrink-0" /> : <ChevronRight size={12} className="text-gray-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium">{term.term}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{term.category}</div>
                  </div>
                  {!isExpanded && (
                    <div className="text-[10px] text-gray-600 font-mono line-clamp-1 max-w-[400px] hidden md:block">
                      {term.definition.slice(0, 100)}...
                    </div>
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04] pt-3 ml-5">
                    <div>
                      <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">Definition</div>
                      <p className="text-sm text-gray-300 leading-relaxed">{term.definition}</p>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">Example</div>
                      <div className="bg-[#0d1117] border border-white/[0.06] rounded px-3 py-2 text-[11px] text-amber font-mono italic">
                        "{term.example}"
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Source:</div>
                        {term.sourceUrl ? (
                          <a href={term.sourceUrl} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] text-cyan font-mono flex items-center gap-1 hover:underline">
                            {term.source} <ExternalLink size={9} />
                          </a>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-mono">{term.source}</span>
                        )}
                      </div>
                    </div>
                    {term.relatedTerms && term.relatedTerms.length > 0 && (
                      <div>
                        <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase mb-1">Related</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {term.relatedTerms.map(rt => (
                            <span key={rt} className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] text-gray-400 border border-white/[0.06]">
                              {rt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filteredTerms.length === 0 && (
            <div className="text-center py-12">
              <BookOpen size={32} className="text-gray-600 mx-auto mb-3" />
              <div className="text-sm text-gray-500 font-mono">No terms found matching your search.</div>
              <div className="text-[10px] text-gray-600 font-mono mt-1">Try a different keyword or clear the filter.</div>
            </div>
          )}
        </div>

        <div className="text-center py-4">
          <div className="text-[10px] text-gray-600 tracking-[0.12em] uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            Sources: EIA · IEA · OPEC · CME Group · Platts · Baltic Exchange · NASA · NOAA · OFAC · CFTC
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
