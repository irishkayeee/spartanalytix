SPARTANalytix � local PHP portal

Open http://localhost/spartanalytix/ with Apache running in XAMPP.

index.php                 Main dashboard
includes/header.php       Shared dashboard header
includes/footer.php       Shared footer and scripts
assets/css/portal.css     Reference layout and tooltip styles
assets/js/portal.js       Charts, filters, drill-down setup, and clock
assets/images/            Extracted reference logo
assets/vendor/            Bootstrap 5.3.3 and Chart.js 4.4.8 (local copies)

The original SPARTANalytix_Portal_With_Tooltips.html is preserved.
All figures and filters retain the reference's illustrative behavior.
Program Chair demonstration access uses PHP sessions. No university database is connected.

Questionnaire review: docs/dashboard-evaluation-review.md
Checks: node --test tests/dashboard-data.test.js tests/sete-completion-model.test.js
