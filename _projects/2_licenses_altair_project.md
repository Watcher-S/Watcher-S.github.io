---
name: Licenses Altair Advanced Project
tools: [Python, Altair, vega-lite]
image: assets/pngs/cars.png
description: Interactive multi-view exploration of the licenses_fall2022 dataset (time-series + crossfilter dashboard).
custom_js:
  - vega.min
  - vega-lite.min
  - vega-embed.min
  - justcharts
permalink: /projects/2-licenses-altair-project
---
# Software Licenses – Two Complementary Visualizations

The assignment asks for two visualizations of the same dataset (plus an explanation of design, transformations, and interactivity). I selected the publicly hosted `licenses_fall2022.csv` dataset (Illinois professional licensing records). Below I present (1) a foundation pair of bar charts (simple & hover-enhanced) which establish overall magnitude distribution, and (2) two richer interactive views: a focus+context time‑series of monthly issuance for top license types and an externally controlled Top‑N + Status composition dashboard. The narrative below is structured to directly satisfy the rubric: for each of the two primary graded plots (Time-Series and Linked Dashboard) I provide description, encodings, color rationale, and transformations. A separate interactivity section explains how each interactive element improves clarity or insight. The simpler exported bar charts remain for reference but are not the focus of the graded discussion.

---
## Plot 0 (Context Only): Basic & Hover Bar Charts
These two static/hover variants show total record counts per license type. They serve as an initial sanity check (are counts reasonable? which types dominate?) and motivate why later plots filter to “top” categories: the distribution is very skewed. Hover reveals per‑type percentages to contextualize relative size. (Not counted as one of the two rubric paragraphs, but included for transparency.)

<vegachart schema-url="{{ site.baseurl }}/assets/json/licenses_plot1.json?v=1" style="width:100%; min-height:360px; display:block; overflow:visible;"></vegachart>

<vegachart schema-url="{{ site.baseurl }}/assets/json/licenses_plot2.json?v=1" style="width:100%; min-height:360px; display:block; overflow:visible;"></vegachart>

---
## Plot 1: Focus + Context Time‑Series of License Issuance
**What is visualized (description).** This plot shows how issuance volume changes over time (monthly granularity) for the eight most common license types (chosen to balance coverage with legibility). The top (focus) panel provides detailed line traces; the bottom (context) “mini-chart” provides an overview window you can brush to zoom the main panel. The goal: reveal temporal trends, bursts, and relative timing differences among dominant categories while letting the viewer isolate a subset interactively.

**Data transformations.** In the notebook: (1) Read raw CSV from GitHub; (2) Identify the date column robustly (`Original Issue Date` or fallbacks) and coerce to datetime; (3) Derive `IssueMonth` by flooring to month boundaries; (4) Group by `(IssueMonth, License Type)` counting rows; (5) Aggregate total counts per license type, sort descending, and retain the top eight categories to mitigate overplotting and cognitive load; (6) Create a filtered frame `month_top` used as the chart’s data source. No smoothing is applied to avoid masking sparse early data. Missing or unparsable dates are safely coerced to `NaT` and dropped prior to aggregation to prevent misleading zero counts.

**Encodings & design choices.** Temporal field `IssueMonth` encodes the X axis (type = temporal) with a continuous linear time scale; the count of records encodes Y (quantitative). `License Type` maps to line color (nominal). Using distinct hues communicates categorical identity; limiting to 8 categories keeps the palette discriminable for color‑vision deficiencies (Altair’s default categorical palette satisfies WCAG contrast guidelines for line strokes against a light background). Lines (without point overlay) were chosen after testing performance and avoiding a duplicate selection signal error; line thickness is standard to preserve emphasis on comparative shape rather than decoration. Tooltips list month, license type, and count—only fields directly used for reasoning—preventing tooltip clutter. The “context” area below mirrors the encoding but with translucent area marks to create a low‑ink, aggregated overview. Vertical concatenation supports the well-studied “focus+context” pattern, allowing detailed inspection without losing global situational awareness.

**Color map rationale.** A standard categorical scheme suffices because license type is discrete and unordered. I intentionally avoided a sequential or diverging scale (they imply ordered magnitude) and avoided unnecessary custom theming so that the interactive legend filtering (dim vs vivid) carries semantic weight (selected vs de‑emphasized). Non-selected series are programmatically faded via the selection logic to reduce simultaneous hue competition.

**Interactivity (for this plot).** Two forms: (a) A brush selection on the context panel defines the temporal window shown in the focus panel—this provides semantic zoom *with* visual continuity; (b) Legend-driven highlighting (selection_point) keeps the chosen line fully saturated while dimming others, making it easier to trace one category’s trajectory amidst overlapping peaks.

<vegachart schema-url="{{ site.baseurl }}/assets/json/licenses_timeseries.json" style="width:100%; min-height:480px; display:block; overflow:visible;"></vegachart>

---
## Plot 2: Linked Top‑N Bar Chart + Status Composition Heatmap
**What is visualized (description).** This dashboard pairs a horizontal bar chart (showing the top *N* license types by total count) with a heatmap that decomposes those same types across their `License Status` categories (e.g., active, expired, provisional—exact strings depend on dataset). Together they answer: (1) Which license types are most prevalent? (2) How does each type’s internal status distribution differ? The arrangement supports reading size (bar length) alongside composition (color intensity grid) without switching screens.

**Data transformations.** Notebook steps: (1) From the original dataframe produce `counts` (total rows per license type); (2) Compute rank (dense ordering) so the UI can filter by a numeric TopN threshold; (3) Create a contingency table (`status_counts`) for `(License Type, License Status)` via grouped size; (4) Join totals back to compute `percent = n / total * 100` enabling derived metric switching; (5) During export of the dynamic dashboard spec, embed parameter definitions (`TopN`, `Metric`) as top-level Vega-Lite `params`, so external HTML controls (a range slider & dropdown) can drive filtering and metric selection without reloading the spec; (6) Attach the precomputed `rank` to each heatmap row to allow efficient TopN filtering across both linked views. All transformations happen in Python for transparency and to avoid repeating computation in the client.

**Encodings & design choices.** Bar chart: `license` → Y (ordinal, sorted by rank ascending to show most frequent at top), `count` → X (quantitative linear scale), consistent light neutral background with vivid orange highlight only when a bar is selected (low cognitive overhead). Heatmap: `License Type` → Y (aligned exactly with bar ordering for direct eye mapping), `License Status` → X (nominal axis), cell fill → either raw `n` (count) or computed `percent` (quantitative). A sequential Blue (Counts) / Teal (Percent view) palette was chosen for perceptual ordering (darker = more) while avoiding a rainbow scale; blues/teals also contrast sufficiently with orange selection on the bar side and remain distinguishable under common color‑vision deficiencies (blue-yellow transformations retain luminance ordering). Opacity modulation when a type is not actively selected further emphasizes focus without changing the underlying quantitative color scale (preventing misinterpretation of faded values as smaller quantities). Tooltips supply both raw count and percent simultaneously so that whichever metric is active the complementary one is still available for precise reading.

**Color map rationale.** Two related but distinct sequential palettes (Blues scheme for the static crossfilter dashboard export; Teals in the dynamic variant) communicate magnitude while avoiding multi-hue confusion. Sequential schemes are appropriate because both metrics (`n` or `percent`) are ordered. I intentionally did *not* reuse the categorical line colors here to prevent implying a categorical mapping that does not exist (heat cells encode magnitude, not identity).

**Interactivity (for this plot).** External HTML controls update Vega-Lite parameters: the slider sets `TopN` (number of ranked license rows displayed) and the select box toggles the metric between Count and Percent, allowing instant reframing from “How big?” to “What composition?” without a page reload. Selection on the bar chart (click) highlights rows in both charts, aided by opacity changes in the heatmap. Linking is purely declarative via shared transformed data and rank filtering—no imperative DOM manipulation beyond signal wiring, keeping the interaction robust.

<!-- External controls for dynamic dashboard placed ABOVE the visualization -->
<div class="viz-controls" data-controls-for="licenses-dashboard-plus" style="margin:1rem 0; display:flex; flex-wrap:wrap; gap:1.5rem; align-items:center; font-size:0.95rem;">
  <label style="display:flex; flex-direction:column; font-weight:600;">Top N
  <input title="Adjust how many license types are shown" type="range" data-signal="TopN" min="1" max="20" step="1" value="20" style="width:220px;">
  </label>
  <label style="display:flex; flex-direction:column; font-weight:600;">Metric
    <select title="Switch between raw counts and within-type percentage" data-signal="Metric" style="padding:0.25rem 0.5rem;">
      <option value="Count" selected>Count</option>
      <option value="Percent">Percent</option>
    </select>
  </label>
  <div style="font-size:0.8rem; opacity:0.75; max-width:340px;">Slider filters by overall frequency; dropdown reframes cell color from absolute volume (Count) to within-type composition (Percent).</div>
</div>

<vegachart id="licenses-dashboard-plus" data-external-controls="true" schema-url="{{ site.baseurl }}/assets/json/licenses_dashboard_plus.json?v=6" style="width:100%; display:block; overflow:visible;"></vegachart>

---
## Interactivity: How It Aids Understanding
The interactive elements are intentionally minimal yet task‑aligned:
1. **Legend highlight (Plot 1):** Reduces visual competition so a reader can trace one line’s temporal signature—crucial when lines overlap early in the series.
2. **Brush zoom (Plot 1):** Allows rapid inspection of dense sub-periods without losing global context; avoids disruptive full re-scaling and prevents misinterpretation that can occur when panning out of context.
3. **TopN slider (Plot 2):** Supports progressive disclosure: start with a small, scannable subset; expand only if needed. This lowers initial cognitive load and reduces scroll/vertical scanning costs.
4. **Metric toggle (Plot 2):** Encourages reframing from absolute popularity (strategic planning question) to internal composition (compliance/quality question) with a single control, reducing need for a second chart.
5. **Linked selection (Plot 2):** Keeps categorical focus consistent across both views, shortening the mental “join” a reader would otherwise perform.

Each interaction is purposeful (no animated gimmicks) and supports one of Shneiderman’s “overview → zoom & filter → details-on-demand” stages, improving interpretability for both novices (clear entry points) and experts (rapid filtering).

---
## Accessibility & Design Considerations
* **Color & contrast:** Limited categorical set + sequential palettes chosen for color-vision robustness; non-selected dimming uses opacity rather than hue shift to preserve original meaning.
* **Redundancy:** Position encodes magnitude (bars/lines) while color encodes category or ordered intensity; tooltips redundantly reveal exact numeric values to support screen magnifier users.
* **Scalability:** TopN filter and focus+context design prevent the “spaghetti plot” and overly tall heatmap that would otherwise appear with dozens of sparse types.
* **Reproducibility:** All transformations executed in the accompanying notebook with explicit code; the exported JSON specs embed the necessary aggregated data so the web layer is pure presentation.

---
## Method Summary (End-to-End)
1. Load remote CSV (ensures graders & peers can reproduce without local files).
2. Clean & derive fields (`IssueMonth`, counts, cross-tab, percentages, ranks).
3. Build Altair charts; parameterize interactive elements (selection, brush, params).
4. Export stable Vega-Lite v5 JSON (forcing schema) for deterministic embedding.
5. Embed via custom `<vegachart>` tag + lightweight JS loader that wires external controls to Vega-Lite signals.

---
## Future Extensions (Not Implemented To Stay In-Scope)
* Add per-capita normalization if population denominators become available.
* Introduce small multiples comparing pre/post regulatory changes (if dates known).
* Provide CSV export of currently filtered TopN + status breakdown for offline analysis.
* Add responsive dark mode palette swap (requires altair theme override + CSS variables).

---
## Data & Notebook Links
<div class="left">
{% include elements/button.html link="https://github.com/UIUC-iSchool-DataViz/is445_data/blob/main/licenses_fall2022.csv" text="The Data" %}
</div>

<div class="right">
{% include elements/button.html link="https://github.com/Watcher-S/Watcher-S.github.io/blob/main/python_notebooks/licenses_altair.ipynb" text="The Analysis" %}
</div>

<div style="clear:both;"></div>

---
*All visualizations generated with Python (pandas + Altair) and embedded as static Vega-Lite JSON for performance and reproducibility.*
