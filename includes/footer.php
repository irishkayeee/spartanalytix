<footer class="footer">&copy; <?php echo date('Y'); ?> SPARTANalytix. All rights reserved.</footer></div><script src="assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
<script src="assets/vendor/chartjs/chart.umd.min.js"></script>
<script src="assets/js/cohort-filters.js"></script><script src="assets/js/course-catalog.js"></script><script src="assets/js/analytics.js"></script><script src="assets/js/kpi-data.js"></script><script src="assets/js/kpi-comparisons.js"></script>
<script src="assets/js/portal.js"></script>
<?php require __DIR__ . '/logout-modal.php'; ?>
<?php require __DIR__ . '/loading.php'; ?>
<?php require __DIR__ . '/welcome-modal.php'; ?>
<?php require __DIR__ . '/kpi-modal.php'; ?>
<?php require __DIR__ . '/chart-modal.php'; ?>
<script src="assets/js/chart-expansion.js"></script>
<script src="assets/js/kpi-drilldown.js"></script><script src="assets/js/kpis.js"></script>
<script src="assets/js/logout.js"></script>
<script src="assets/js/reports.js"></script>
<script src="assets/js/filter-dropdowns.js"></script>
<script src="assets/js/sete-completion-model.js"></script><script src="assets/js/predictive-model.js"></script>
<script src="assets/js/tooltips.js"></script>
<script src="assets/js/welcome.js" data-autostart="<?php echo !empty($_SESSION['show_welcome_tip']) ? 'true' : 'false'; ?>"></script>
<?php unset($_SESSION['show_welcome_tip']); ?>
</body></html>
