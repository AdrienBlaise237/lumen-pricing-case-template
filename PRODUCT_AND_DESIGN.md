# LUMEN Decision Cockpit — Product & Design Contract

This is the shared contract for every contributor. Read it before coding. If a proposed change conflicts with this document, raise it in the pull request rather than silently introducing a second pattern.

## 1. Product outcome

The application helps LUMEN leadership decide four connected questions:

1. **Price:** Which tested 330ml shelf price best balances acceptance and contribution?
2. **Channels:** Which launch-channel mix gives the fastest credible path to repeatable economics?
3. **Place and timing:** Which cities should be first and when should the launch begin?
4. **Trade-off:** What are we deliberately not optimising for in the recommended plan?

This is a decision tool, not a report. Every view must either help someone choose an input or explain the impact of that input.

### Primary user

Freya, Head of Growth, reviewing the CMO's premium-positioning ambition against the CFO's payback and runway constraints. The interface must be understandable without a technical or finance background.

### Recommendation language

All outputs are **estimates**, based on comparable-market LUMEN data, German research, and competitor benchmarks. Never present an estimate as an observed German LUMEN sales fact.

## 2. Required user journey

Navigation and page order are fixed:

1. **Overview** — the current recommendation, the central trade-off, and four decision inputs.
2. **Pricing** — price selection, acceptance, contribution and volume-versus-margin comparison.
3. **Channels** — channel economics, CAC/LTV/payback and a recommended launch mix.
4. **Market & timing** — city prioritisation, seasonality, competitor activity and launch-window risks.
5. **Recommendation** — a concise memo combining the selected scenario, positioning, channels, cities, timing and deliberate trade-off.

The selected price and scenario must persist while a user moves between pages. Do not create a second state source in a feature module.

## 3. Design direction: premium analytical

The visual character is calm, clear and evidence-led: editorial typography, generous whitespace, restrained surfaces and a sharp lime signal for recommendations or selected values.

### Tokens

Use CSS variables from `src/styles/tokens.css`; do not hardcode new global values in a feature.

| Token | Value | Use |
|---|---:|---|
| `--color-ink` | `#11221D` | Primary text, dark panels |
| `--color-ink-soft` | `#274038` | Secondary dark states |
| `--color-canvas` | `#F7F8F4` | Application background |
| `--color-surface` | `#FFFFFF` | Cards and inputs |
| `--color-line` | `#DFE5DF` | Borders and dividers |
| `--color-muted` | `#64716C` | Supporting copy |
| `--color-lime` | `#CDF45E` | Selection, recommendation and positive emphasis |
| `--color-lime-deep` | `#6F9000` | Accessible lime text |
| `--color-warm` | `#FF875F` | Downside/risk emphasis only |

| Token | Value |
|---|---:|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--radius-card` | 16px |
| `--radius-control` | 9px |

### Typography

- UI and body: **Manrope**, system sans-serif fallback.
- Editorial headings and selected monetary values: **Playfair Display**, Georgia fallback.
- Labels, dates and compact metrics: **DM Mono**, monospace fallback.
- Use sentence case. Avoid all-caps except compact metadata labels.
- Headings should be concise and decision-oriented, e.g. “Premium enough to signal quality.”

### Layout

- Desktop content max-width: `1240px`; horizontal padding: 28px.
- Mobile horizontal padding: 16px.
- Use 16px card gaps on desktop and mobile.
- Cards use white surfaces, one 1px line border and a restrained shadow.
- Never use a gradient, glass effect, animated background, or decorative stock imagery.

### Chart rules

- Prefer direct labels to legends when space allows.
- One lime series only: the recommended or selected value.
- Neutral comparison series: `--color-line` / muted green.
- Warm orange appears only for a negative outcome, risk or downside scenario.
- Include the source/exhibit and a one-sentence interpretation below every chart.
- No 3D charts, pie charts, or unlabeled axes.

## 4. Shared application structure

Workstream 1 will establish this structure after this document is approved:

```text
src/
  app/
    App.tsx
    routes.tsx
    AppShell.tsx
  components/
    ui/
      Card.tsx
      Metric.tsx
      SectionLabel.tsx
      SegmentedControl.tsx
      ChartFrame.tsx
      EmptyState.tsx
    navigation/
      TopBar.tsx
      PageNav.tsx
  features/
    pricing/
    channels/
    market-timing/
    recommendation/
  data/
    types.ts
    loadData.ts
    aggregates.ts
  state/
    decisionStore.ts
  styles/
    tokens.css
    globals.css
```

Feature owners may add files within their own `src/features/<feature>/` directory. Shared UI, state, data interfaces, dependencies, navigation, routes, global styles and the application shell belong to the integrator.

## 5. Shared data contract

The calculation layer owns all CSV parsing and cleaning. Feature modules must consume typed, aggregated interfaces—not parse raw files themselves.

```ts
type LaunchPrice = 1.79 | 2.19 | 2.59;
type Channel = 'DTC Online' | 'Retail/Grocery' | 'Gym & Office';
type Scenario = 'conservative' | 'balanced' | 'growth';

interface DecisionInputs {
  price: LaunchPrice;
  scenario: Scenario;
  channelWeights: Record<Channel, number>; // normalised to 1.0
}

interface PricingOutcome {
  price: LaunchPrice;
  acceptancePct: number;
  contributionByChannel: Record<Channel, number>;
  blendedContribution: number;
  blendedContributionMarginPct: number;
}

interface ChannelOutcome {
  channel: Channel;
  unitContribution: number;
  cac: number | null;
  ltv: number | null;
  ltvCac: number | null;
  paybackMonths: number | null;
}

interface CityPriority {
  city: string;
  marketSharePct: number;
  growthPct: number;
  priority: 'first-wave' | 'next-wave';
  rationale: string;
}

interface Recommendation {
  price: LaunchPrice;
  positioning: string;
  channels: Channel[];
  cities: string[];
  launchWindow: string;
  tradeOff: string;
  assumptions: string[];
}
```

### Data protection and quality

- Never load or expose `first_name`, `last_name`, or `email` from `customer_survey.csv`.
- Do not place raw respondent rows in browser state, logs, exports or chart tooltips.
- Document duplicate removal and unusual-value handling inside `src/data/aggregates.ts`.
- Every metric must identify the exhibit(s) used and safely handle missing data with an explanatory empty state.

## 6. Component contract

Use approved components before creating a new visual primitive:

| Component | Purpose |
|---|---|
| `Card` | Standard surface with padding variants |
| `Metric` | Label, value, context and optional trend/risk state |
| `SectionLabel` | Compact mono workstream/exhibit label |
| `SegmentedControl` | Price or scenario selection |
| `ChartFrame` | Chart title, source, interpretation and empty state |
| `EmptyState` | Missing, invalid or insufficient-data message |

New shared components require integrator approval in the PR description.

## 7. Contribution and review rules

1. Branch naming: `feature/<workstream>` (for example, `feature/pricing`).
2. Start from the latest `main`; do not build on another feature branch.
3. One workstream per PR. Do not modify another team member's feature directory.
4. Do not add a global font, color, dependency, route, global CSS rule or state library without integrator approval.
5. Do not push directly to `main`.
6. Include only your own prompt log with your PR.
7. The integrator reviews and merges PRs one at a time in this order: data → pricing → channels → market/timing → recommendation.

## 8. Definition of done

A feature is ready to merge only when:

- It works at 1440px and 390px widths without clipping, horizontal scrolling or hidden controls.
- It explains the business implication of its data—not only the metric.
- Its calculations have readable labels, source references and sensible empty/error states.
- It does not expose personal data.
- Its selected price and scenario update the final recommendation where relevant.
- Its pull request includes a short manual test note and contains no unrelated changes.

## 9. V1 decisions already made

- Local React + Vite application; deployment is optional.
- No external API or API keys in V1.
- Recommendation output is an estimate, not an automated decision.
- The recommended starting hypothesis to test is **€2.19, Gym & Office + DTC, Berlin/Munich, May**. It must remain adjustable and explain why a scenario could change it.
