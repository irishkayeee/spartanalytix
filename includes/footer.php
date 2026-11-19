<footer class="footer">&copy; <?php echo date('Y'); ?> SPARTANalytix. All rights reserved.</footer></div><script src="assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
<script src="assets/vendor/chartjs/chart.umd.min.js"></script>
<?php foreach (['cohort-filters', 'course-catalog', 'analytics', 'kpi-data', 'kpi-comparisons', 'portal'] as $script): ?>
<?php $path = 'assets/js/' . $script . '.js'; ?>
<script src="<?php echo $path; ?>?v=<?php echo filemtime(__DIR__ . '/../' . $path); ?>"></script>
<?php endforeach; ?>
<?php require __DIR__ . '/logout-modal.php'; ?>
<?php require __DIR__ . '/loading.php'; ?>
<?php require __DIR__ . '/welcome-modal.php'; ?>
<?php require __DIR__ . '/kpi-modal.php'; ?>
<?php require __DIR__ . '/chart-modal.php'; ?>
<script src="assets/js/chart-expansion.js?v=<?php echo filemtime(__DIR__ . '/../assets/js/chart-expansion.js'); ?>"></script>
<script src="assets/js/kpi-drilldown.js"></script><script src="assets/js/kpis.js"></script>
<script src="assets/js/logout.js"></script>
<script src="assets/js/reports.js"></script>
<script src="assets/js/filter-dropdowns.js"></script>
<script src="assets/js/sete-completion-model.js"></script><script src="assets/js/predictive-model.js"></script>
<script src="assets/js/tooltips.js"></script>
<script src="assets/js/welcome.js" data-autostart="<?php echo !empty($_SESSION['show_welcome_tip']) ? 'true' : 'false'; ?>"></script>
<?php unset($_SESSION['show_welcome_tip']); ?>
</body></html>
