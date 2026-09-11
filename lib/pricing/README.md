# Pricing analysis module

This module is the pricing boundary for the future LUMEN management dashboard. It consumes parsed rows from the six pricing exhibits and returns reusable, channel-visible analysis for €1.79, €2.19 and €2.59.

priceTests deliberately stays as price × channel data. The module does not invent a German volume forecast or blend candidate-price results across channels. Any future dashboard may apply an explicit user-selected channel mix outside this module, with that assumption shown to the user.

Facts are sourced from the supplied exhibits. Acceptance and acceptable-range figures are estimates based on survey/test respondents. No customer names or emails are read.
