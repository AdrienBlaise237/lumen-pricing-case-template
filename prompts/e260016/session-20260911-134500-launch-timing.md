## Entry 1 — 2026-09-11 13:45:00 Europe/Berlin

Pull the latest changes from main before we start.

Read:
•⁠  ⁠README.md
•⁠  ⁠LUMEN\_Case\_Brief.md
•⁠  ⁠data/README\_data.md

My task is ONLY the LAUNCH TIMING MODULE.

Do not rebuild pricing, channels, market prioritisation, or positioning.

BUSINESS QUESTION:
When is the most sensible window to launch LUMEN in Germany?

Use:
•⁠  ⁠data/seasonality\_and\_weather.csv
•⁠  ⁠data/competitor\_price\_history.csv

Optionally inspect historical\_sales\_weekly.csv for validation, but remember:
those sales are from NL/DK/SE, not Germany.

Analyse:
•⁠  ⁠monthly demand seasonality;
•⁠  ⁠temperature patterns;
•⁠  ⁠competitor pricing;
•⁠  ⁠competitor promotions;
•⁠  ⁠timing of competitor activity;
•⁠  ⁠any meaningful interactions between seasonality and competition.

Do not reduce the analysis to "summer is better".
Explain the actual evidence behind the recommended launch window.

Create a transparent timing score or framework.

The output should contain:
•⁠  ⁠preferred launch period;
•⁠  ⁠alternative period;
•⁠  ⁠seasonality evidence;
•⁠  ⁠competitor evidence;
•⁠  ⁠risks;
•⁠  ⁠assumptions;
•⁠  ⁠confidence/uncertainty.

Clearly distinguish observed data from assumptions.

Do NOT create the final executive recommendation.

Create files only inside:
•⁠  ⁠components/timing/
•⁠  ⁠lib/timing/

Do not modify:
•⁠  ⁠pricing;
•⁠  ⁠channels;
•⁠  ⁠market;
•⁠  ⁠positioning;
•⁠  ⁠main dashboard page.

Work on:
feature/launch-timing

Do not push directly to main.

Test the module independently.
