<?php
/** WooCommerce: page banner, category bar, trust points and cart count. */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

/* Our banner shows the title and breadcrumb, so WooCommerce's own are hidden. */
add_filter( 'woocommerce_show_page_title', '__return_false' );
add_action( 'template_redirect', function () {
	remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
} );
// Astra adds a second breadcrumb inside the product summary during wp_head.
add_action( 'wp_head', function () {
	remove_action( 'woocommerce_single_product_summary', 'woocommerce_breadcrumb', 2 );
}, 6 );

add_filter( 'woocommerce_breadcrumb_defaults', function ( $args ) {
	$args['delimiter']   = '<span class="msg-crumbs__sep" aria-hidden="true">/</span>';
	$args['wrap_before'] = '<nav class="msg-crumbs" aria-label="Breadcrumb">';
	$args['wrap_after']  = '</nav>';
	$args['home']        = 'Shop';
	return $args;
} );
add_filter( 'woocommerce_breadcrumb_home_url', function () {
	return wc_get_page_permalink( 'shop' );
} );

/** True on shop, category, tag, search, cart, checkout and account pages. */
function msg_is_shop_area() {
	return is_woocommerce() || is_cart() || is_checkout() || is_account_page();
}

add_action( 'astra_content_before', 'msg_render_shop_banner' );
function msg_render_shop_banner() {
	if ( ! msg_is_shop_area() ) {
		return;
	}
	$label = 'Shop';
	$title = '';
	$text  = '';
	$small = false;
	if ( is_shop() && ! is_search() ) {
		$title = msg_opt( 'shop_title' );
		$text  = msg_opt( 'shop_text' );
	} elseif ( is_search() ) {
		$title = sprintf( 'Results for “%s”', get_search_query() );
	} elseif ( is_product_taxonomy() ) {
		$term  = get_queried_object();
		$title = $term->name;
		$text  = wp_strip_all_tags( term_description( $term ) );
		$label = 'Category';
	} elseif ( is_product() ) {
		$small = true;
	} elseif ( is_cart() ) {
		$title = 'Your cart';
		$small = true;
	} elseif ( is_checkout() ) {
		$title = is_wc_endpoint_url( 'order-received' ) ? 'Thank you for your order' : 'Checkout';
		$small = true;
	} elseif ( is_account_page() ) {
		$title = is_user_logged_in() ? 'My account' : 'Log in or create an account';
		$small = true;
	}
	?>
	<section class="msg-hero<?php echo $small ? ' msg-hero--small' : ''; ?>" aria-label="Page title">
		<div class="msg-container">
			<?php
			if ( is_woocommerce() && ! ( is_shop() && ! is_search() ) ) {
				woocommerce_breadcrumb();
			}
			?>
			<?php if ( $title ) : ?>
				<?php if ( ! $small ) : ?><p class="msg-label msg-label--light"><?php echo msg_dots(); ?><?php echo esc_html( $label ); ?></p><?php endif; ?>
				<h1 class="msg-hero__title"><?php echo esc_html( $title ); ?></h1>
				<?php if ( $text ) : ?><p class="msg-hero__text"><?php echo esc_html( $text ); ?></p><?php endif; ?>
			<?php endif; ?>
		</div>
	</section>
	<?php
	if ( is_shop() || is_product_taxonomy() ) {
		msg_render_category_bar();
		msg_render_trust();
	}
}

function msg_render_category_bar() {
	$cats = get_terms( array( 'taxonomy' => 'product_cat', 'parent' => 0, 'hide_empty' => true ) );
	if ( is_wp_error( $cats ) || ! $cats ) {
		return;
	}
	$current = is_product_taxonomy() ? get_queried_object_id() : 0;
	$uncat   = (int) get_option( 'default_product_cat' );
	?>
	<nav class="msg-cats" aria-label="Product categories">
		<div class="msg-container">
			<ul class="msg-cats__list">
				<?php $msg_all_on = is_shop() && ! is_search() && function_exists( 'msg_is_shop_home' ) && ! msg_is_shop_home(); ?>
				<li><a href="<?php echo esc_url( function_exists( 'msg_all_products_url' ) ? msg_all_products_url() : wc_get_page_permalink( 'shop' ) ); ?>"<?php echo $msg_all_on ? ' aria-current="page"' : ''; ?>><?php echo msg_icon( 'layout-grid' ); ?>All products</a></li>
				<?php foreach ( $cats as $cat ) : ?>
					<?php
					if ( (int) $cat->term_id === $uncat ) {
						continue;
					}
					?>
					<li><a href="<?php echo esc_url( get_term_link( $cat ) ); ?>"<?php echo (int) $cat->term_id === $current ? ' aria-current="page"' : ''; ?>><?php echo msg_icon( function_exists( 'msg_cat_icon' ) ? msg_cat_icon( $cat->name ) : 'tag' ); ?><?php echo esc_html( $cat->name ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</div>
	</nav>
	<?php
}

function msg_trust_items() {
	return array(
		array( 'factory', 'Printed in our own unit', 'Since ' . msg_opt( 'founded' ) ),
		array( 'badge-check', 'GST & MSME registered', 'Registered business' ),
		array( 'truck', 'Delivered pan India', 'Shipped from Dwarka Mor, Delhi' ),
		array( 'whatsapp', 'Help on WhatsApp', 'Talk to our team' ),
	);
}

function msg_render_trust() {
	?>
	<section class="msg-trust" aria-label="Why order from us">
		<ul class="msg-container msg-trust__list">
			<?php foreach ( msg_trust_items() as $t ) : ?>
				<li><?php echo msg_icon( $t[0] ); ?><span><strong><?php echo esc_html( $t[1] ); ?></strong><?php echo esc_html( $t[2] ); ?></span></li>
			<?php endforeach; ?>
		</ul>
	</section>
	<?php
}

/* Help box under Add to cart on product pages. */
add_action( 'woocommerce_single_product_summary', function () {
	global $product;
	$name = $product ? $product->get_name() : '';
	?>
	<div class="msg-help">
		<p class="msg-help__title">Need a design, a custom size or a bulk price?</p>
		<p>Send your artwork or idea on WhatsApp and our team will help you.</p>
		<div class="msg-help__btns">
			<a class="msg-btn msg-btn--wa" href="<?php echo esc_url( msg_wa_link( 'Hi M.S. Graphics Studio, I have a question about ' . $name . '.' ) ); ?>" target="_blank" rel="noopener"><?php echo msg_icon( 'whatsapp' ); ?> WhatsApp us</a>
			<a class="msg-btn msg-btn--outline" href="<?php echo esc_url( msg_main( '/contact/' ) ); ?>">Get a bulk quote</a>
		</div>
		<ul class="msg-help__points">
			<?php foreach ( msg_trust_items() as $t ) : ?>
				<li><?php echo msg_icon( $t[0] ); ?><?php echo esc_html( $t[1] ); ?></li>
			<?php endforeach; ?>
		</ul>
	</div>
	<?php
}, 35 );

/* Keep the cart count in the header up to date after "Add to cart". */
add_filter( 'woocommerce_add_to_cart_fragments', function ( $fragments ) {
	$count = msg_cart_count();
	$fragments['span.msg-cart__count'] = '<span class="msg-cart__count" data-count="' . esc_attr( $count ) . '">' . esc_html( $count ) . '<span class="screen-reader-text"> items</span></span>';
	return $fragments;
} );

/* Four products per row on wide screens, twelve per page. */
add_filter( 'loop_shop_per_page', function () {
	return 12;
}, 20 );

/* Clearer button text. */
add_filter( 'woocommerce_product_add_to_cart_text', function ( $text, $product ) {
	if ( $product->is_type( 'variable' ) ) {
		return 'Choose options';
	}
	return $product->is_purchasable() && $product->is_in_stock() ? 'Add to cart' : $text;
}, 10, 2 );
