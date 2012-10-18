<?php

/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */
if (isset($_SERVER['DB_HOSTNAME'])) {
	// PagodaBox
	define('DB_HOST', $_SERVER['DB_HOSTNAME']);
	define('DB_USER', $_SERVER['DB_USER']);
	define('DB_PASSWORD', $_SERVER['DB_PASS']);
	define('DB_NAME', $_SERVER['DB_NAME']);
} else {
	define('DB_NAME', 'ent');
	define('DB_USER', 'root');
	define('DB_PASSWORD', 'root');
	define('DB_HOST', 'localhost');
}

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/* * #@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY', 'oRF5*82!_bL@}y|9!-Ry9-zR@9En/yB^pmIeGp]JWvu 9TZ<,_8?49qSq%i$~~YM');
define('SECURE_AUTH_KEY', '3E!CMJsyUj!Qa]H@s8Z]h,I#=R8gN!:t<67ND-Uns+<`#d/}^+BG+#*Pl9kA~Izh');
define('LOGGED_IN_KEY', '{JQm1RhnqAYPWFbO^,Sx3,Y%BR#Ot,mhTT8@+!k5y|?N}P~)EO_/i}|x}[kFT49(');
define('NONCE_KEY', '5>n`n|>W~Wg{-`_WrMt{{~LmLQ!$*#$Aih5bW*4Wa+i-=P-eIyi{ 96Rc<5k|9 r');
define('AUTH_SALT', '=iu-7LK5kb:+SBd|MlOKbPv-_a? K}[d;)m`_UsBFWuLDQu.blwwAzBu9@jP-p+i');
define('SECURE_AUTH_SALT', 'f}R_zH`fFB,z2qohALvYK[|`,g>}?NqZS_%.ab/Y<SOk8xUu,p@OwK-:Dw]J(G},');
define('LOGGED_IN_SALT', 'I@ YMpW6rHLf7?|z-W+? zK;;t`(l,P$sMU/#vn[.9s-vaK@p G4;l2,F~M1elNA');
define('NONCE_SALT', 'h+8?@KHh?#q[#z5}_-EUX,@S5o7~;}:A@Xe4/k]e6ma}5MR3]NRzU-hE{LL#?Oq0');

/* * #@- */

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define('WPLANG', '');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if (!defined('ABSPATH'))
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
