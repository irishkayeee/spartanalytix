# BAT 405 dashboard evaluation review

Reviewed against the supplied questionnaire on November 15, 2026.

The dashboard is a working demonstration for the BSIT Program Chair within CICS. This checklist records features and checks; it does not assign survey scores or claim that sample data proves real-world effectiveness.

| Survey area | Implemented evidence | How to demonstrate |
| --- | --- | --- |
| A1-A4: relevance and organization | Program Chair purpose statement; visible reporting semester and participation counts; sample-record badge; distinct Key Insights and experimental forecast section. Longer explanations are collapsed. | Open the overview, change the semester, and open **How to read these results**. |
| B1-B4: KPI design | Five cards: academic risk, average SETE rating, SETE response rate, core-course failure rate, overall SETE improvement. Targets, previous-period comparisons, calculations, and underlying records are available. | Click a KPI and inspect its source calculation and previous semester. |
| C1-C4: visualizations | Section response-rate bars with a 100% target; course-section failure heatmap with rate legend; academic-risk trend with a 10% threshold. Axes, units, periods, and larger chart views are available. | Inspect each chart, select a data item, and expand the heatmap. |
| D1-D4: interactivity | Academic year, semester, year level, specialization, and section filters; dependent section options; clickable chart inspection; KPI drill-down; tooltips on help controls; sample-data viewer. | Select Business Analytics and observe three section choices and updated charts. Click a heatmap cell in its expanded view and inspect its details. |
| E1-E4: alerts and decisions | Visible warning banner; grouped SETE pending counts; course failure, academic risk, low rating, and low improvement alerts; suggested reminders, advising, course support, and faculty-development review. | Filter to a section and inspect the warning, Alert Summary, and recommendations. |
| F1-F4: privacy and interpretation | Sample student references instead of personal names; anonymous evaluation items separate from participation records; response counts and periods; explicit bias context and prohibition on automatic personnel decisions. | Open the Average SETE Rating records and compare them with participation records. Review the interpretation notes and exported report. |

## Checks performed

- Ten automated tests passed with `node --test tests/dashboard-data.test.js tests/sete-completion-model.test.js`.
- Data reconciliation covers 520 valid filter combinations. Participation records, chart values, and KPIs agree; course heatmap counts reconcile; current and previous risk values match their KPIs.
- Five sections have 40 eligible evaluators each per semester with all year levels selected. Narrowing year level narrows that eligible subset. Combining academic years counts evaluation opportunities rather than unique students.
- Model tests cover chronological holdout separation, no validation-data leakage into fitting, CSV validation, probability behavior, undefined precision, and asynchronous training.
- Browser checks passed for custom filters, dependent section options, heatmap inspection, expanded details, KPI records, CSV with supporting records, dashboard and model print reports, training, scenario prediction, auto-filled rates, and collapsed technical explanations.
- Desktop and narrow layouts were checked for card alignment and page overflow. No browser errors occurred during those checks.

## Demonstration sequence

1. State the dashboard purpose and primary user. Point out the current reporting period and sample-data label.
2. Explain the five KPI values and targets. Open one KPI to show its calculation and records.
3. Compare the three charts and their questions. Explain that participation is different from teaching quality.
4. Change specialization and section filters; show the resulting changes in charts, counts, and warnings.
5. Open the heatmap in its larger view and select a cell. Its details appear inside the same window.
6. Explain the pending-evaluation warning and the suggested follow-up. Open the responsible-use notes.
7. Optionally load model example data, view the 30 sample records, train, and inspect the measured results. Earlier semesters supply 25 training rows; the latest supplies five test rows.
8. Use the separate forecast section and explain its estimate and reminder recommendation. Zero days remaining means deadline day. Print the evaluation report if needed.

## Limits that should be stated honestly

- Dashboard records and model examples are illustrative, not official university records. Semester date ranges are configured planning dates.
- Targets are configured benchmarks. They are not verified institutional policies.
- The risk KPI uses illustrative rule-based flags, not the SETE model's predictions. The model predicts section completion, not student academic risk or teaching effectiveness.
- Historical snapshots used for automatic scenario fields are sample records. Unsupported semesters show unavailable data and disable prediction.
- Model inputs exclude teaching ratings. Participation can be influenced by access issues, reminders, deadlines, and grade-viewing requirements. Rating interpretation also needs context such as course difficulty and unequal participation.
- Model metrics are measured on the example holdout, but five test records cannot establish reliable real-world performance. Real historical data, calibration, further validation, and institutional review remain necessary.
- Recommendations do not send reminders automatically or make personnel decisions. Forecast models and uploaded CSV data remain in the current browser tab and clear on reload.

## Responsive verification

The dashboard and login page were checked with browser device emulation at 320, 360, 390, 414, 768, 820, 844, 1024, 1440, and 1920 CSS pixels, including a short landscape viewport. No horizontal page overflow or clipped page containers was found.

On phones, chart sidebars and forecast cards stack. Tablet cards stack earlier for readable charts; larger screens retain aligned sidebars and wider cards. Heatmap course labels shorten to subject codes on narrow charts, while full names remain in Inspect Data. Semester labels wrap onto two lines. Touch controls are larger, and mobile form inputs use a readable font size.

Phone interaction checks covered forecast dropdown bounds, expanded heatmaps, sample-data tables, model training, and non-overlapping model cards. Screenshots of the phone heatmap and trained-model section were visually inspected. These are Chromium emulation checks, not a claim of testing every physical device or browser.
