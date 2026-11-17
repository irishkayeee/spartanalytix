<?php
$kpiDefinitions = [
    ['Students at Academic Risk', '8.6%', '10% or lower',
        'Identify students needing assistance. Formula: (Students meeting approved risk criteria ÷ students assessed) × 100. Target: 10% or lower. Action: Review flagged cases with authorized advisers; coordinate academic advising and appropriate support.'],
    ['Average SETE Rating', '4.32/5', '4.0/5 or higher',
        'Summarize student perceptions of instruction. Formula: Sum of valid SETE rating scores ÷ number of valid rated items. Target: 4.0/5 or higher, if using a five-point scale. Action: Review overall feedback alongside other evidence.'],
    ['SETE Response Rate', '82.5%', '100%',
        'Assess representativeness of feedback. Formula: (Valid SETE respondents ÷ eligible student evaluators) × 100. Target: 100%. Action: Improve communication and evaluation access.'],
    ['Core Course Failure Rate', '7.8%', '10% or lower',
        'Monitor academic difficulty in foundational courses that affect progression. Formula: (Number of students who failed a core/prerequisite course ÷ number of students enrolled in it) × 100. Target: 10% or lower. Action: Review high-failure courses and provide academic support.'],
    ['Overall SETE Rating Improvement', '+3.8%', '+3% or higher',
        'Compare overall SETE means across semesters. Formula: (Current overall mean minus previous overall mean) divided by previous overall mean times 100. Target: +3% or higher each semester. No teaching dimensions are assumed. A zero or missing previous mean cannot produce a valid improvement rate.'],
];
$kpiIconPaths = [
    '<path d="m2 8 10-5 10 5-10 5L2 8Z"/><path d="M6 10v7c4 3 8 3 12 0v-7M3 9v9"/>',
    '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="4" width="3" height="14"/>',
    '<circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3"/><path d="M5 5a3 3 0 0 0 0 6M19 5a3 3 0 0 1 0 6M2 19v-2a4 4 0 0 1 3-4m17 6v-2a4 4 0 0 0-3-4"/>',
    '<path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v5h5M8 12h8M8 16h5"/>',
    '<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
];
$kpiTargetLabels = ['≤ 10%', '≥ 4.0/5', '100%', '≤ 10%', '≥ +3%'];
?>
<div class="kpis" id="kpis" aria-label="Five key performance indicators from sample records">
  <?php foreach ($kpiDefinitions as $index => [$label, $value, $target, $explanation]): ?>
    <div class="kpi">
      <button type="button" class="kpi-open" data-kpi-index="<?php echo $index; ?>" aria-label="View details for <?php echo htmlspecialchars($label, ENT_QUOTES, 'UTF-8'); ?>" aria-haspopup="dialog"><span class="visually-hidden">View details</span></button>
      <div class="kpi-card-heading">
        <small><?php echo htmlspecialchars($label, ENT_QUOTES, 'UTF-8'); ?></small>
        <button type="button" class="tip-trigger" aria-label="Information about <?php echo htmlspecialchars($label, ENT_QUOTES, 'UTF-8'); ?>" data-tip="<?php echo htmlspecialchars($explanation, ENT_QUOTES, 'UTF-8'); ?>">?</button>
      </div>
      <strong id="k<?php echo $index + 1; ?>"><?php echo $value; ?></strong>
      <span class="kpi-dimension-slot"></span>
      <em class="kpi-target-pill"><span>Target: <?php echo htmlspecialchars($kpiTargetLabels[$index], ENT_QUOTES, 'UTF-8'); ?></span><span class="kpi-target-symbol" aria-hidden="true"></span></em>
      <span class="kpi-track-status" id="kpiStatus<?php echo $index; ?>"></span>
      <span class="kpi-change" id="kpiChange<?php echo $index; ?>" tabindex="0"></span>
      <span class="kpi-details-hint" aria-hidden="true">View details &rarr;</span>
    </div>
  <?php endforeach; ?>
</div>
<script type="application/json" id="kpiDefinitions"><?php echo json_encode($kpiDefinitions, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?></script>
