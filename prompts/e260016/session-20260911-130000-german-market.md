## Entry 1 — 2026-09-11 13:00:00 Europe/Berlin

okay now do model 3 : Pull the latest changes from main before we start.

Read:
•⁠  ⁠README.md
•⁠  ⁠LUMEN\_Case\_Brief.md
•⁠  ⁠data/README\_data.md

The pricing analysis already exists.
Another teammate may be building channel economics.
My task is ONLY the GERMAN MARKET AND CITY PRIORITISATION MODULE.

BUSINESS QUESTION:
Where should LUMEN launch first in Germany?

Use:
•⁠  ⁠data/market\_context.csv
•⁠  ⁠data/customer\_survey.csv
•⁠  ⁠data/customer\_quotes.csv

First inspect all relevant columns and identify data-quality issues.

Build an explainable market/city prioritisation analysis using available evidence such as:
•⁠  ⁠market size;
•⁠  ⁠growth;
•⁠  ⁠region/city attractiveness;
•⁠  ⁠customer segment;
•⁠  ⁠spending behaviour;
•⁠  ⁠channel preference;
•⁠  ⁠brand awareness;
•⁠  ⁠purchase intent.

Create a transparent scoring methodology.

For every city/region score, show the main drivers.
Do not create a black-box ranking.

IMPORTANT:
There is no historical German LUMEN sales data.
Do not invent German sales numbers.
Clearly distinguish:
•⁠  ⁠German survey evidence;
•⁠  ⁠German market context;
•⁠  ⁠historical LUMEN evidence from existing markets;
•⁠  ⁠assumptions.

IMPORTANT PRIVACY:
customer\_survey.csv contains name/email-style fields.
Do NOT use or expose those fields in the product.
Use only aggregated or non-identifying information.

Also inspect customer\_quotes.csv.
If qualitative quotes and quantitative survey results disagree, preserve and explain the disagreement instead of forcing them to agree.

The module must expose a clean structured result that a future executive recommendation layer can consume.

At minimum return:
•⁠  ⁠city/region;
•⁠  ⁠score;
•⁠  ⁠score components;
•⁠  ⁠customer evidence;
•⁠  ⁠market evidence;
•⁠  ⁠uncertainties;
•⁠  ⁠assumptions.

Do NOT build the final dashboard.
Do NOT modify:
•⁠  ⁠pricing;
•⁠  ⁠channels;
•⁠  ⁠positioning;
•⁠  ⁠timing;
•⁠  ⁠main application page.

Create files only inside:
•⁠  ⁠components/market/
•⁠  ⁠lib/market/

unless absolutely necessary.

Make this module independently testable.

Work on a new branch:
feature/german-market

Do not push to main.
