<?php
/**
 * M.S. Graphics Studio Shop: Astra child theme.
 *
 * Gives the WooCommerce shop the same header, footer, colours and fonts as the
 * main website. All text and links can be changed in
 * Appearance > Customize > M.S. Graphics Studio.
 */

defined( 'ABSPATH' ) || exit;

define( 'MSG_SHOP_VERSION', '1.2.0' );
define( 'MSG_SHOP_DIR', get_stylesheet_directory() );
define( 'MSG_SHOP_URI', get_stylesheet_directory_uri() );

require MSG_SHOP_DIR . '/inc/options.php';
require MSG_SHOP_DIR . '/inc/template-tags.php';
require MSG_SHOP_DIR . '/inc/layout.php';
require MSG_SHOP_DIR . '/inc/woocommerce.php';
require MSG_SHOP_DIR . '/inc/shop-home.php';

/* ---------- styles and scripts ---------- */
add_action( 'wp_enqueue_scripts', function () {
	$deps = array( 'astra-theme-css' );
	if ( wp_style_is( 'woocommerce-general', 'registered' ) ) {
		$deps[] = 'woocommerce-general';
	}
	wp_enqueue_style( 'msg-shop', MSG_SHOP_URI . '/assets/css/msg.css', $deps, MSG_SHOP_VERSION );
	wp_add_inline_style( 'msg-shop', msg_font_face_css() );
	wp_enqueue_script( 'msg-shop', MSG_SHOP_URI . '/assets/js/msg.js', array(), MSG_SHOP_VERSION, array( 'in_footer' => true, 'strategy' => 'defer' ) );
}, 20 );

/** Poppins is bundled with the theme, so no request goes to Google Fonts. */
function msg_font_face_css() {
	$css = '';
	foreach ( array( 300, 400, 500, 600, 700 ) as $w ) {
		$url  = esc_url( MSG_SHOP_URI . "/assets/fonts/poppins-latin-{$w}-normal.woff2" );
		$css .= "@font-face{font-family:'Poppins';font-style:normal;font-weight:{$w};font-display:swap;src:url('{$url}') format('woff2');}";
	}
	return $css;
}

add_action( 'wp_head', function () {
	$url = esc_url( MSG_SHOP_URI . '/assets/fonts/poppins-latin-400-normal.woff2' );
	echo "<link rel=\"preload\" href=\"{$url}\" as=\"font\" type=\"font/woff2\" crossorigin>\n";
	echo "<meta name=\"theme-color\" content=\"#14213D\">\n";
}, 1 );

add_filter( 'body_class', function ( $classes ) {
	$classes[] = 'msg-theme';
	return $classes;
} );
