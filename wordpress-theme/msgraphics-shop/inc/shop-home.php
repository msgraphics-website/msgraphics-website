<?php
/**
 * Shop home: the main Shop page shows one row per category, four products at
 * a time, with arrow buttons to see more. "All products" (?view=all) shows the
 * normal WooCommerce grid with sorting and pages.
 */

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WooCommerce' ) ) {
	return;
}

/** Products shown in each category row. */
const MSG_ROW_PRODUCTS = 12;

/** True on the main Shop page, before any search, sorting, filter or "All products". */
function msg_is_shop_home() {
	if ( ! is_shop() || is_search() || is_paged() ) {
		return false;
	}
	foreach ( array_keys( $_GET ) as $key ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( in_array( $key, array( 'view', 'orderby', 'min_price', 'max_price', 'rating_filter' ), true ) || 0 === strpos( $key, 'filter_' ) || 0 === strpos( $key, 'query_type_' ) ) {
			return false;
		}
	}
	return true;
}

function msg_all_products_url() {
	return add_query_arg( 'view', 'all', wc_get_page_permalink( 'shop' ) );
}

add_filter( 'template_include', function ( $template ) {
	if ( msg_is_shop_home() ) {
		$custom = MSG_SHOP_DIR . '/templates/shop-home.php';
		if ( file_exists( $custom ) ) {
			return $custom;
		}
	}
	return $template;
}, 50 );

/** Top-level categories that have products, in the order set in Products > Categories. */
function msg_shop_categories() {
	$cats = get_terms( array(
		'taxonomy'   => 'product_cat',
		'parent'     => 0,
		'hide_empty' => true,
		'menu_order' => 'ASC',
	) );
	if ( is_wp_error( $cats ) ) {
		return array();
	}
	$uncat = (int) get_option( 'default_product_cat' );
	return array_values( array_filter( $cats, function ( $c ) use ( $uncat ) {
		return (int) $c->term_id !== $uncat;
	} ) );
}

/** Picks an icon for a category from words in its name. */
function msg_cat_icon( $name ) {
	$n   = strtolower( $name );
	$map = array(
		'visiting'  => 'id-card',
		'business card' => 'id-card',
		'id card'   => 'id-card',
		'gift'      => 'gift',
		'album'     => 'book-open',
		'bag'       => 'shopping-bag',
		'cap'       => 'shopping-bag',
		'cloth'     => 'shirt',
		'shirt'     => 'shirt',
		'apparel'   => 'shirt',
		'winter'    => 'shirt',
		'poster'    => 'image',
		'banner'    => 'flag',
		'flex'      => 'flag',
		'stamp'     => 'stamp',
		'stationery' => 'notebook-pen',
		'letterhead' => 'file-text',
		'sticker'   => 'sticker',
		'label'     => 'tag',
		'packag'    => 'package',
		'box'       => 'package',
		'calendar'  => 'calendar',
		'diar'      => 'calendar',
		'notebook'  => 'notebook-pen',
		'mug'       => 'cup-soda',
		'drink'     => 'cup-soda',
		'bottle'    => 'cup-soda',
		'pen'       => 'pen',
		'sign'      => 'signpost',
		'standee'   => 'signpost',
		'award'     => 'award',
		'trophy'    => 'award',
		'certificate' => 'award',
		'frame'     => 'frame',
		'photo'     => 'frame',
		'print'     => 'printer',
		'marketing' => 'image',
	);
	foreach ( $map as $word => $icon ) {
		if ( false !== strpos( $n, $word ) ) {
			return $icon;
		}
	}
	return 'tag';
}

function msg_render_category_row( WP_Term $cat ) {
	$ids = wc_get_products( array(
		'status'     => 'publish',
		'limit'      => MSG_ROW_PRODUCTS,
		'category'   => array( $cat->slug ),
		'visibility' => 'catalog',
		'orderby'    => 'menu_order',
		'order'      => 'ASC',
		'return'     => 'ids',
	) );
	if ( ! $ids ) {
		return;
	}
	$id    = 'msg-row-' . $cat->term_id;
	$link  = get_term_link( $cat );
	$label = $cat->name;
	?>
	<section class="msg-row" aria-labelledby="<?php echo esc_attr( $id ); ?>-h">
		<div class="msg-row__head">
			<h2 class="msg-row__title" id="<?php echo esc_attr( $id ); ?>-h">
				<span class="msg-row__icon"><?php echo msg_icon( msg_cat_icon( $label ) ); ?></span>
				<?php echo esc_html( $label ); ?>
			</h2>
			<div class="msg-row__ctrl">
				<a class="msg-row__all" href="<?php echo esc_url( $link ); ?>">View all<span class="screen-reader-text"> <?php echo esc_html( $label ); ?></span> (<?php echo esc_html( $cat->count ); ?>)</a>
				<button type="button" class="msg-row__btn" data-dir="-1" aria-controls="<?php echo esc_attr( $id ); ?>"><?php echo msg_icon( 'chevron-left' ); ?><span class="screen-reader-text">Previous <?php echo esc_html( $label ); ?> products</span></button>
				<button type="button" class="msg-row__btn" data-dir="1" aria-controls="<?php echo esc_attr( $id ); ?>"><?php echo msg_icon( 'chevron-right' ); ?><span class="screen-reader-text">More <?php echo esc_html( $label ); ?> products</span></button>
			</div>
		</div>
		<ul class="products msg-row__track" id="<?php echo esc_attr( $id ); ?>" tabindex="-1">
			<?php
			global $post;
			foreach ( $ids as $pid ) {
				$post = get_post( $pid ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
				setup_postdata( $post );
				wc_get_template_part( 'content', 'product' );
			}
			wp_reset_postdata();
			?>
		</ul>
	</section>
	<?php
}
