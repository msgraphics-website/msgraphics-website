<?php
/**
 * Main Shop page: one row of products per category.
 * Loaded by inc/shop-home.php.
 */

defined( 'ABSPATH' ) || exit;

get_header( 'shop' );

do_action( 'woocommerce_before_main_content' );

woocommerce_output_all_notices();

$msg_cats = msg_shop_categories();
foreach ( $msg_cats as $msg_cat ) {
	msg_render_category_row( $msg_cat );
}
?>
<div class="msg-shop-all">
	<a class="msg-btn msg-btn--outline" href="<?php echo esc_url( msg_all_products_url() ); ?>"><?php echo msg_icon( 'layout-grid' ); ?> Browse all products</a>
</div>
<?php
do_action( 'woocommerce_after_main_content' );

do_action( 'woocommerce_sidebar' );

get_footer( 'shop' );
