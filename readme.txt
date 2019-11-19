=== Quick Navigation Interface ===
Contributors:      iandunn
Donate link:       https://www.debian.org/donations
Tags:              keyboard,navigation,shortcuts,wp-admin
Requires at least: 5.0
Requires PHP:      5.6
Tested up to:      5.3
Stable tag:        1.0.1
License:           GPLv2

Quickly access screens and content within wp-admin just by typing the first few letters of the name.


== Description ==

Quick Navigation Interface provides a new way to navigate through the Administration Panels, combining the speed of keyboard shortcuts with the ease of a graphical user interface.

Just press `g` or \` -- _the backtick character, usually located above the tab key_ -- to bring up the interface, and then start typing part of the name of any screen, post, page, etc. As you type, you'll be shown a list of matching links. Use the `Up` and `Down` keys to move between them, and press `Enter` to open one.

https://www.youtube.com/watch?v=60iVn94hEIE

This was inspired by Ubuntu's Dash and [HUD](http://www.markshuttleworth.com/archives/939), and is also similar to the Spotlight feature in OS X.


== Frequently Asked Questions ==

= I'm pressing `g` or the ` key, but nothing happens =

There are a few likely causes for this:

1. The page hasn't finished loading yet. Make sure you wait until the circle in the title bar has stopped spinning.
1. The cursor could be focused on an input field (like a text area or a button). Try clicking anywhere outside an input field (like the page's background) to move the focus off of the input field, and then try to open the interface again.
1. If you're not using an English keyboard, the key might not work. You can pick another key by following the instructions in the FAQ entry below. To help improve this for other non-English users, please [let me know what a good key would be for your language](https://github.com/iandunn/quick-navigation-interface/issues/1).
1. You might be mistaking the \` (backtick) key for the ' (single-quote) key. You need to press the backtick key, which is normally located above the `tab` key and left of the `1` key. You can also try using the `g` key instead.
1. JavaScript execution might have been halted because of errors on the page, which would most likely be caused by the theme or another plugin. You can check your browser's error console for details, and send the error to the plugin's developer. To work around it, try disabling all other plugins temporarily, and switching to one of the Core themes, and see if that solves the problem. If it does, turn them back on one-by-one until you isolate which one is causing the problem.


= Why doesn't the content I'm searching for show up? =

There are a few reasons why you may not see all content.

1. For performance reasons, only a limited number of posts are searched. The default is 500, and can be changed via the `qni_content_index_params` filter.
1. The search term must match the title of the content exactly. It doesn't need to be the entire word, but it can't be a typo or a "fuzzy" match.
1. You'll only be shown content that your user account has permission to edit.


= Can I customize the keyboard shortcuts and other options? =
There isn't a settings page, but all of the internal options can be modified via the `qni_options` filter. If you're not familiar with using filters, you can [learn more about them](https://developer.wordpress.org/plugins/hooks/filters/) from the WordPress Plugin Developer's Handbook, and then implement them in [a functionality plugin](http://wpcandy.com/teaches/how-to-create-a-functionality-plugin) that you write, or via a plugin like [Functionality](https://wordpress.org/plugins/functionality/).

The values of the keys must correspond to [JavaScript `keyCode`s](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#Value_of_keyCode), and the plugin doesn't currently support using combinations. Be careful to choose `keyCode`s which are consistent across browsers.

= How can I edit the JavaScript files? =

Unfortunately modern JavaScript makes this more difficult than editing PHP, but there are instructions in [the GitHub repository](https://github.com/iandunn/quick-navigation-interface).

= Is this plugin secure? =
I've done my best to ensure that it is, but just in case I missed anything [I also offer a security bounty](https://hackerone.com/iandunn-projects/) for any vulnerabilities that can be found and privately disclosed in any of my plugins.


== Screenshots ==

1. Pressing `g` or \` brings up the interface
2. Matches are displayed and filtered as you type


== Changelog ==

= v1.0.1 (2019-11-19) =

* [FIX] Restore ability to search posts for users in Chrome/Safari on sites without SSL certificates.q
* [FIX] Expire stale cached content indexes that are missing the `type` field added in v1.0.
* [FIX] Fix several minor errors in browser console.

[Full changelog](https://github.com/iandunn/quick-navigation-interface/compare/be3346a3...4de4f97c)


= v1.0 (2019-11-13) =

* [NEW] The `g` key now also opens the interface, in addition to the \` (backtick) key.
* [NEW] Highlighting a link shows a preview of its URL, so you can know where it will take you.
* [NEW] Links for menu items include their parent menu title, if applicable.
* [NEW] The type of link is now displayed (post, page, menu item, etc).
* [NEW] The plugin can now be [translated on WordPress.org](https://translate.wordpress.org/projects/wp-plugins/quick-navigation-interface/).
* [NEW] Front end rebuilt in React, using Gutenberg's library of UI components, the REST API, and local storage.
* [FIX] Removed duplicate on-page links from the results.
* [FIX] Fixed conflict with using backtick key within Gutenberg editor.

### Breaking Changes:

* [REMOVED] The `['shortcuts']['close-interface']` item in the array passed to the `qni_options` filter has been removed. QNI now uses the `Modal` component provided by Gutenberg, which only uses the `Escape` key to close it.
* [REMOVED] The `qni_template_path` and `qni_template_content` filters have been removed, and files like `qni-interface.php` in your theme will no longer be used. This is because the plugin now declares the templates in React. There aren't currently any plans to make them customizable.

[Full changelog](https://github.com/iandunn/quick-navigation-interface/compare/eb9e78a...be3346a3)


= v0.7 (2019-02-14) =
* [SECURITY] Prevent leaking private post titles.

= v0.6 (2016-03-10) =
* [FIX] Add compatibility with WordPress 4.5 / Backbone 1.2.3 by concatenating JavaScript files in order of dependence.

[Full changelog](https://github.com/iandunn/quick-navigation-interface/compare/da6604f3bac46339987eda14a018503752bdd0d1...de511ec1620666d0fb583c74af3776cfc44a40b4)

= v0.5 (2015-11-01) =
* [FIX] Properly display HTML entities in post titles.

[Full changelog](https://github.com/iandunn/quick-navigation-interface/compare/6c4c1ababe43cc1b41a69d120b5d1ca1e98ad6aa...81b43b78d20bc756112451ed8d14a040cdab0d62)

= v0.4 (2015-08-14) =
* [UPDATE] Close button markup updated to match WordPress 4.3.

= v0.3 (2015-06-12) =
* [NEW] Added hierarchy information to menu items.
* [NEW] Added German localization (props tmconnect).
* [FIX] Added missing text domain.

[Full changelog](https://github.com/iandunn/quick-navigation-interface/compare/dbf46705a210a25e3ea2da8ca1b94398356f35be...963912d37c4d14a24320b8645572562bd016d34e)


= v0.2 (2015-05-24) =
* [NEW] Post, pages, and other content now appears in the search results.
* [FIX] Exact duplicate links have been removed from the search results.

[Full changelog](https://github.com/iandunn/quick-navigation-interface/compare/3fa0405482f7fe97a6a6e4023af33af2493eb306...32e4e9b0c8a57147368fcd9bedae3ce563501e77)


= v0.1 (2015-05-22) =
* [NEW] Initial release


== Upgrade Notice ==

= 1.0.1 =
Version 1.0.1 fixes several minor bugs in the 1.0 release. If you're experiencing any problems, please update.

= 1.0 =
Version 1.0 adds many new features and fixes some bugs.

= 0.6 =
Version 0.6 adds compatibility with the upcoming WordPress 4.5 release.

= 0.5 =
Version 0.5 contains a few minor bug fixes and minor internal code quality improvements.

= 0.4 =
Version 0.4 makes a small adjustment to the close button to stay in sync with WordPress 4.3.

= 0.3 =
Version 0.3 adds hierarchy information to menu items and a German localization.

= 0.2 =
Version 0.2 adds posts, pages and other content to the search results, and reduces the number of duplicate results.

= 0.1 =
Initial release.
