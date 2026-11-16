<?php
/** Small helpers used by the header, footer and shop templates. */

defined( 'ABSPATH' ) || exit;

/**
 * Prints an inline SVG icon. Decorative unless a label is given.
 */
function msg_icon( $name, $label = '', $class = 'msg-icon' ) {
	static $icons = null;
	if ( null === $icons ) {
		$icons = require MSG_SHOP_DIR . '/inc/icons.php';
	}
	$a11y = $label ? 'role="img" aria-label="' . esc_attr( $label ) . '"' : 'aria-hidden="true" focusable="false"';
	if ( 'whatsapp' === $name ) {
		return '<svg class="' . esc_attr( $class ) . '" ' . $a11y . ' viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.46 9.48-9.46a9.4 9.4 0 0 1 6.7 2.78 9.4 9.4 0 0 1 2.77 6.69c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.32 11.32 0 0 0 12.04.64C5.76.64.65 5.75.65 12.03c0 2.01.52 3.97 1.52 5.7L.55 23.64l6.05-1.59a11.37 11.37 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.34-8.06z"/></svg>';
	}
	if ( empty( $icons[ $name ] ) ) {
		return '';
	}
	return '<svg class="' . esc_attr( $class ) . '" ' . $a11y . ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' . $icons[ $name ] . '</svg>';
}

function msg_wa_link( $text = 'Hi M.S. Graphics Studio, I have a question about an order.' ) {
	return 'https://wa.me/' . rawurlencode( preg_replace( '/\D/', '', msg_opt( 'whatsapp' ) ) ) . '?text=' . rawurlencode( $text );
}

/** The brand logo, same as the main website. $variant: light (navy text) or dark (white text). */
function msg_logo( $variant = 'light' ) {
	$text     = 'dark' === $variant ? '#FFFFFF' : '#14213D';
	$mark     = $text;
	$mark_txt = 'dark' === $variant ? '#14213D' : '#FFFFFF';
	return '<svg class="msg-logo" viewBox="0 0 286 56" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="M.S. Graphics Studio">'
		. '<rect x="0" y="2" width="52" height="52" rx="10" fill="' . $mark . '"/>'
		. '<text x="26" y="31" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="21" fill="' . $mark_txt . '" letter-spacing="0.5">MS</text>'
		. '<circle cx="14.5" cy="42" r="3" fill="#00A0E3"/><circle cx="22.2" cy="42" r="3" fill="#E6007E"/><circle cx="29.8" cy="42" r="3" fill="#FFC20E"/><circle cx="37.5" cy="42" r="3" fill="' . $mark_txt . '"/>'
		. '<text x="64" y="24" font-family="Poppins, Arial, sans-serif" font-size="19" fill="' . $text . '" letter-spacing="0.4"><tspan font-weight="700">MS GRAPHICS</tspan><tspan font-weight="300" dx="6">STUDIO</tspan></text>'
		. '<text x="64" y="44" font-family="Poppins, Arial, sans-serif" font-size="10" font-weight="600" fill="#E6007E" letter-spacing="1.6">PRINT · BRANDING · EVENTS</text>'
		. '</svg>';
}

function msg_dots() {
	return '<span class="msg-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
}

function msg_cart_count() {
	return function_exists( 'WC' ) && WC()->cart ? (int) WC()->cart->get_cart_contents_count() : 0;
}
