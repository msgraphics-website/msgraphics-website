<?php
/**
 * Header and footer in the style of the main website.
 * They replace Astra's (and Elementor Header & Footer's) header and footer
 * when the boxes in Customize > M.S. Graphics Studio are ticked.
 */

defined( 'ABSPATH' ) || exit;

// template_redirect runs after Astra and Elementor Header & Footer have added their own header and footer.
add_action( 'template_redirect', function () {
	if ( msg_opt( 'use_header' ) ) {
		remove_all_actions( 'astra_header' );
		add_action( 'astra_header', 'msg_render_header' );
	}
	if ( msg_opt( 'use_footer' ) ) {
		remove_all_actions( 'astra_footer' );
		add_action( 'astra_footer', 'msg_render_footer' );
		add_action( 'wp_footer', 'msg_render_whatsapp', 5 );
	}
}, 999 );

function msg_nav_items() {
	$shop = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
	return array(
		array( msg_main( '/' ), 'Home', false ),
		array( msg_main( '/services/' ), 'Services', false ),
		array( msg_digital_url(), 'Digital', false ),
		array( $shop, 'Shop', function_exists( 'is_woocommerce' ) && ( is_woocommerce() || is_cart() || is_checkout() || is_account_page() ) ),
		array( msg_main( '/our-unit/' ), 'Our Unit', false ),
		array( msg_main( '/work/' ), 'Work', false ),
		array( msg_main( '/about/' ), 'About', false ),
		array( msg_main( '/contact/' ), 'Contact', false ),
	);
}

function msg_render_header() {
	$account = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : wp_login_url();
	$cart    = function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/cart/' );
	$count   = msg_cart_count();
	?>
	<aside class="msg-topbar" aria-label="Contact details">
		<div class="msg-container msg-topbar__in">
			<span class="msg-topbar__left">
				<a href="<?php echo esc_url( 'tel:' . msg_opt( 'phone' ) ); ?>"><?php echo msg_icon( 'phone' ); ?> <?php echo esc_html( msg_opt( 'phone_display' ) ); ?></a>
				<a href="<?php echo esc_url( 'mailto:' . msg_opt( 'email' ) ); ?>"><?php echo msg_icon( 'mail' ); ?> <?php echo esc_html( msg_opt( 'email' ) ); ?></a>
			</span>
			<span class="msg-topbar__right">
				<a href="<?php echo esc_url( msg_main( '/track/' ) ); ?>"><?php echo msg_icon( 'package-search' ); ?> Track your order</a>
				<span class="msg-topbar__hours"><?php echo msg_icon( 'clock' ); ?> <?php echo esc_html( msg_opt( 'hours' ) ); ?></span>
			</span>
		</div>
	</aside>
	<header class="msg-header" id="masthead">
		<div class="msg-container msg-header__in">
			<a href="<?php echo esc_url( msg_main( '/' ) ); ?>" class="msg-header__logo"><?php echo msg_logo(); ?></a>
			<nav class="msg-nav" id="msg-nav" aria-label="Main">
				<ul class="msg-nav__list">
					<?php foreach ( msg_nav_items() as $item ) : ?>
						<li><a href="<?php echo esc_url( $item[0] ); ?>"<?php echo $item[2] ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $item[1] ); ?></a></li>
					<?php endforeach; ?>
				</ul>
				<a href="<?php echo esc_url( msg_main( '/contact/' ) ); ?>" class="msg-btn msg-btn--primary msg-btn--sm msg-nav__cta">Get a Quote</a>
			</nav>
			<div class="msg-tools">
				<button type="button" class="msg-tool msg-search-toggle" aria-expanded="false" aria-controls="msg-search"><?php echo msg_icon( 'search' ); ?><span class="screen-reader-text">Search products</span></button>
				<a class="msg-tool" href="<?php echo esc_url( $account ); ?>"><?php echo msg_icon( 'user' ); ?><span class="screen-reader-text"><?php echo is_user_logged_in() ? 'My account' : 'Log in or create an account'; ?></span></a>
				<a class="msg-tool msg-cart" href="<?php echo esc_url( $cart ); ?>"><?php echo msg_icon( 'shopping-cart' ); ?><span class="screen-reader-text">Cart, </span><span class="msg-cart__count" data-count="<?php echo esc_attr( $count ); ?>"><?php echo esc_html( $count ); ?><span class="screen-reader-text"> items</span></span></a>
				<button class="msg-nav-toggle" type="button" aria-expanded="false" aria-controls="msg-nav">
					<span class="screen-reader-text">Menu</span><?php echo msg_icon( 'menu', '', 'msg-icon msg-nav-toggle__open' ); ?><?php echo msg_icon( 'x', '', 'msg-icon msg-nav-toggle__close' ); ?>
				</button>
			</div>
		</div>
		<div class="msg-search" id="msg-search" hidden>
			<form class="msg-container msg-search__form" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
				<label class="screen-reader-text" for="msg-search-input">Search products</label>
				<input id="msg-search-input" type="search" name="s" placeholder="Search visiting cards, flyers, stickers…" value="<?php echo esc_attr( get_search_query() ); ?>">
				<input type="hidden" name="post_type" value="product">
				<button type="submit" class="msg-btn msg-btn--primary">Search</button>
			</form>
		</div>
	</header>
	<?php
}

function msg_render_footer() {
	$year   = gmdate( 'Y' );
	$cats   = function_exists( 'wc_get_page_permalink' ) ? get_terms( array( 'taxonomy' => 'product_cat', 'parent' => 0, 'hide_empty' => true, 'number' => 6, 'orderby' => 'count', 'order' => 'DESC' ) ) : array();
	$cats   = is_wp_error( $cats ) ? array() : $cats;
	$social = array_filter( array( 'facebook' => msg_opt( 'facebook' ), 'instagram' => msg_opt( 'instagram' ), 'youtube' => msg_opt( 'youtube' ) ) );
	$names  = array( 'facebook' => 'Facebook', 'instagram' => 'Instagram', 'youtube' => 'YouTube' );
	?>
	<footer class="msg-footer">
		<div class="msg-container msg-footer__grid">
			<div class="msg-footer__about">
				<a href="<?php echo esc_url( msg_main( '/' ) ); ?>"><?php echo msg_logo( 'dark' ); ?></a>
				<p><?php echo esc_html( msg_opt( 'about' ) ); ?></p>
				<p class="msg-footer__tag"><?php echo msg_dots(); ?> <?php echo esc_html( msg_opt( 'tagline' ) ); ?></p>
				<ul class="msg-footer__regs">
					<li><?php echo msg_icon( 'badge-check' ); ?>GST Registered</li>
					<li><?php echo msg_icon( 'badge-check' ); ?>MSME Registered</li>
					<li><?php echo msg_icon( 'calendar-check' ); ?>Since <?php echo esc_html( msg_opt( 'founded' ) ); ?></li>
				</ul>
				<?php if ( $social ) : ?>
					<ul class="msg-footer__social">
						<?php foreach ( $social as $k => $url ) : ?>
							<li><a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener"><?php echo msg_icon( $k, $names[ $k ] ); ?></a></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
			</div>
			<nav class="msg-footer__nav" aria-label="Footer">
				<div>
					<h2 class="msg-footer__h">Shop</h2>
					<ul>
						<?php if ( function_exists( 'wc_get_page_permalink' ) ) : ?>
							<li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">All products</a></li>
						<?php endif; ?>
						<?php foreach ( $cats as $cat ) : ?>
							<li><a href="<?php echo esc_url( get_term_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a></li>
						<?php endforeach; ?>
					</ul>
				</div>
				<div>
					<h2 class="msg-footer__h">Your orders</h2>
					<ul>
						<?php if ( function_exists( 'wc_get_page_permalink' ) ) : ?>
							<li><a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>">My account</a></li>
							<li><a href="<?php echo esc_url( wc_get_cart_url() ); ?>">Cart</a></li>
						<?php endif; ?>
						<li><a href="<?php echo esc_url( msg_main( '/track/' ) ); ?>">Track your order</a></li>
						<li><a href="<?php echo esc_url( msg_wa_link( 'Hi M.S. Graphics Studio, I want to send artwork for printing.' ) ); ?>" target="_blank" rel="noopener">Send artwork on WhatsApp</a></li>
						<li><a href="<?php echo esc_url( msg_main( '/contact/' ) ); ?>">Bulk order quote</a></li>
					</ul>
				</div>
				<div>
					<h2 class="msg-footer__h">Company</h2>
					<ul>
						<li><a href="<?php echo esc_url( msg_main( '/' ) ); ?>">Main website</a></li>
						<li><a href="<?php echo esc_url( msg_main( '/services/' ) ); ?>">Services</a></li>
						<li><a href="<?php echo esc_url( msg_digital_url() ); ?>">Digital services</a></li>
						<li><a href="<?php echo esc_url( msg_main( '/our-unit/' ) ); ?>">Our printing unit</a></li>
						<li><a href="<?php echo esc_url( msg_main( '/about/' ) ); ?>">About us</a></li>
						<li><a href="<?php echo esc_url( msg_main( '/blog/' ) ); ?>">Blog &amp; guides</a></li>
					</ul>
				</div>
				<div class="msg-footer__contact">
					<h2 class="msg-footer__h">Contact</h2>
					<ul>
						<li><a href="<?php echo esc_url( 'tel:' . msg_opt( 'phone' ) ); ?>"><?php echo msg_icon( 'phone' ); ?><?php echo esc_html( msg_opt( 'phone_display' ) ); ?></a></li>
						<li><a href="<?php echo esc_url( msg_wa_link() ); ?>" target="_blank" rel="noopener"><?php echo msg_icon( 'whatsapp' ); ?>WhatsApp us</a></li>
						<?php if ( msg_opt( 'sales_email' ) ) : ?>
							<li><a href="<?php echo esc_url( 'mailto:' . msg_opt( 'sales_email' ) ); ?>"><?php echo msg_icon( 'mail' ); ?><?php echo esc_html( msg_opt( 'sales_email' ) ); ?></a></li>
						<?php endif; ?>
						<li><a href="<?php echo esc_url( 'mailto:' . msg_opt( 'email' ) ); ?>"><?php echo msg_icon( 'mail' ); ?><?php echo esc_html( msg_opt( 'email' ) ); ?></a></li>
						<li><span><?php echo msg_icon( 'map-pin' ); ?><?php echo esc_html( msg_opt( 'address' ) ); ?></span></li>
					</ul>
				</div>
			</nav>
		</div>
		<div class="msg-footer__bottom">
			<div class="msg-container msg-footer__bottom-in">
				<span>© <?php echo esc_html( $year ); ?> M.S. Graphics Studio. All rights reserved.</span>
				<a href="#masthead">Back to top</a>
			</div>
		</div>
	</footer>
	<?php
}

function msg_render_whatsapp() {
	echo '<aside class="msg-wa-wrap" aria-label="WhatsApp chat"><a class="msg-wa" href="' . esc_url( msg_wa_link() ) . '" target="_blank" rel="noopener">' . msg_icon( 'whatsapp' ) . '<span class="screen-reader-text">Chat on WhatsApp</span></a></aside>';
}
