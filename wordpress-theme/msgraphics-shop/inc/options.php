<?php
/**
 * Settings in Appearance > Customize > M.S. Graphics Studio.
 * The defaults match the main website. Change them there, not here.
 */

defined( 'ABSPATH' ) || exit;

function msg_defaults() {
	return array(
		'main_url'      => 'https://creative-haupia-719065.netlify.app',
		'digital_url'   => '',
		'phone'         => '+919716214982',
		'phone_display' => '+91 97162 14982',
		'whatsapp'      => '919716214982',
		'email'         => 'msgraphicsstudio@gmail.com',
		'sales_email'   => 'sales@msgraphicsstudio.com',
		'hours'         => 'Mon–Sat, 10:00 AM – 7:00 PM',
		'address'       => 'Plot No. B-32, Dwarka Mor, Patel Garden Extn., New Delhi – 110059',
		'founded'       => '2014',
		'about'         => 'Print, branding and events company with its own printing unit. We design, print, fabricate, install and set up events ourselves, under one roof.',
		'tagline'       => 'Design se setup tak, sab ek jagah.',
		'shop_title'    => 'Shop print products',
		'shop_text'     => 'Visiting cards, flyers, stickers, banners, standees and more. Printed in our own unit and delivered pan India.',
		'facebook'      => '',
		'instagram'     => '',
		'youtube'       => '',
		'use_header'    => true,
		'use_footer'    => true,
		'use_shop_layout' => true,
	);
}

function msg_opt( $key ) {
	$d = msg_defaults();
	$v = get_theme_mod( 'msg_' . $key, $d[ $key ] ?? '' );
	if ( is_string( $v ) ) {
		$v = trim( $v );
	}
	return ( '' === $v && 'digital_url' !== $key && isset( $d[ $key ] ) && ! in_array( $key, array( 'facebook', 'instagram', 'youtube' ), true ) ) ? $d[ $key ] : $v;
}

/** A link on the main website, e.g. msg_main( '/contact/' ). */
function msg_main( $path = '/' ) {
	return untrailingslashit( msg_opt( 'main_url' ) ) . $path;
}

function msg_digital_url() {
	$u = msg_opt( 'digital_url' );
	return $u ? $u : msg_main( '/services/website-app-digital-marketing/' );
}

add_action( 'customize_register', function ( WP_Customize_Manager $c ) {
	$c->add_section( 'msg_shop', array(
		'title'       => 'M.S. Graphics Studio',
		'priority'    => 1,
		'description' => 'Header, footer and contact details for the shop. Links in the menu go to the main website address below.',
	) );
	$fields = array(
		'main_url'      => array( 'Main website address', 'url', 'Menu links (Services, About, Contact…) go here. Change it when the new website moves to your domain.' ),
		'digital_url'   => array( 'Digital website address (optional)', 'url', 'For example https://digital.msgraphicsstudio.com. Leave empty to use the Digital page on the main website.' ),
		'phone'         => array( 'Phone (for the call link, with country code)', 'text', '' ),
		'phone_display' => array( 'Phone (as shown)', 'text', '' ),
		'whatsapp'      => array( 'WhatsApp number (digits only, with 91)', 'text', '' ),
		'email'         => array( 'Email', 'email', '' ),
		'sales_email'   => array( 'Sales email', 'email', '' ),
		'hours'         => array( 'Working hours', 'text', '' ),
		'address'       => array( 'Address', 'textarea', '' ),
		'founded'       => array( 'Year started', 'text', '' ),
		'about'         => array( 'Footer about text', 'textarea', '' ),
		'tagline'       => array( 'Footer tagline', 'text', '' ),
		'shop_title'    => array( 'Shop page heading', 'text', '' ),
		'shop_text'     => array( 'Shop page intro', 'textarea', '' ),
		'facebook'      => array( 'Facebook page URL', 'url', 'Leave empty to hide.' ),
		'instagram'     => array( 'Instagram URL', 'url', 'Leave empty to hide.' ),
		'youtube'       => array( 'YouTube URL', 'url', 'Leave empty to hide.' ),
	);
	$d = msg_defaults();
	foreach ( $fields as $key => $f ) {
		$sanitize = 'url' === $f[1] ? 'esc_url_raw' : ( 'email' === $f[1] ? 'sanitize_email' : ( 'textarea' === $f[1] ? 'sanitize_textarea_field' : 'sanitize_text_field' ) );
		$c->add_setting( 'msg_' . $key, array( 'default' => $d[ $key ], 'sanitize_callback' => $sanitize ) );
		$c->add_control( 'msg_' . $key, array( 'label' => $f[0], 'description' => $f[2], 'section' => 'msg_shop', 'type' => $f[1] ) );
	}
	foreach ( array( 'use_header' => 'Use the website-style header', 'use_footer' => 'Use the website-style footer', 'use_shop_layout' => 'Use the theme\'s shop pages (category rows and product cards). Untick to let Elementor or Woolementor show the shop.' ) as $key => $label ) {
		$c->add_setting( 'msg_' . $key, array( 'default' => true, 'sanitize_callback' => 'wp_validate_boolean' ) );
		$c->add_control( 'msg_' . $key, array( 'label' => $label, 'section' => 'msg_shop', 'type' => 'checkbox' ) );
	}
} );
