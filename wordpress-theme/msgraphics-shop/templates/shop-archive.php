<?php
/**
 * All products, categories, tags and product search, with the theme's product cards.
 * Loaded by inc/shop-home.php.
 */

defined( 'ABSPATH' ) || exit;

get_header( 'shop' );

do_action( 'woocommerce_before_main_content' );

woocommerce_output_all_notices();

wc_setup_loop();

if ( have_posts() ) :
	?>
	<div class="msg-grid-bar">
		<?php
		woocommerce_result_count();
		woocommerce_catalog_ordering();
		?>
	</div>
	<ul class="msg-grid">
		<?php
		while ( have_posts() ) {
			the_post();
			msg_render_product_card( wc_get_product( get_the_ID() ), 'h2' );
		}
		?>
	</ul>
	<?php
	woocommerce_pagination();
else :
	wc_no_products_found();
endif;

do_action( 'woocommerce_after_main_content' );

do_action( 'woocommerce_sidebar' );

get_footer( 'shop' );
