=== Quick Navigation Interface ===
Contributors:      iandunn
Donate link:       https://www.debian.org/donations
Tags:              keyboard,navigation,shortcuts,wp-admin
Requires at least: 5.0
Tested up to:      5.2
Stable tag:        0.7
License:           GPLv2

Quickly access screens and content within wp-admin just by typing the first few letters of the name.


== Description ==

Quick Navigation Interface provides a new way to navigate through the Administration Panels, combining the speed of keyboard shortcuts with the ease of a graphical user interface.

Just press \` (above the tab key) to bring up the interface, and then start typing part of the name of any screen, post, page, etc. As you type, you'll be shown a list of matching links. Use the `Up` and `Down` keys to move between them, and press `Enter` to open one.

https://www.youtube.com/watch?v=60iVn94hEIE

This was inspired by Ubuntu's Dash and [HUD](http://www.markshuttleworth.com/archives/939), and is also similar to the Spotlight feature in OS X.


== Installation ==

For help installing this (or any other) WordPress plugin, please read the [Managing Plugins](http://codex.wordpress.org/Managing_Plugins) article on the Codex.

Once the plugin is installed and activated, you don't need to do anything else. See [the Description page](https://wordpress.org/plugins/quick-navigation-interface/) and [FAQ](https://wordpress.org/plugins/quick-navigation-interface/faq/) for details on using the plugin.


== Frequently Asked Questions ==

= I'm pressing the ` key, but nothing happens =

There are a few likely causes for this:

1. The page hasn't finished loading yet. Make sure you wait until the circle in the title bar has stopped spinning.
1. The cursor could be focused on an input field (like a text area or a button). Try clicking anywhere outside an input field (like the page's background) to move the focus off of the input field, and then try to open the interface again.
1. If you're not using an English keyboard, the key might not work. You can pick another key by following the instructions in the FAQ entry below. To help improve this for other non-English users, please [let me know what a good key would be for your language](https://github.com/iandunn/quick-navigation-interface/issues/1).
1. You might be mistaking the \` (backtick) key for the ' (single-quote) key. You need to press the backtick key, which is normally located above the `tab` key and left of the `1` key.
1. JavaScript execution might have been halted because of errors on the page, which would most likely be caused by the theme or another plugin. You can check your browser's error console for details, and send the error to the plugin's developer. To work around it, try disabling all other plugins temporarily, and switching to one of the Core themes, and see if that solves the problem. If it does, turn them back on one-by-one until you isolate which one is causing the problem.


= Why doesn't the content I'm searching for show up? =

There are a few reasons why you may not see all content.

1. For performance reasons, only a limited number of posts are searched. The default is 500, and can be changed via the `qni_content_index_params` filter.
1. The search term must match the title of the content exactly. It doesn't need to be the entire word, but it can't be a typo or a "fuzzy" match.
1. You'll only be shown content that your user account has permission to edit.


= Can I customize the keyboard shortcuts and other options? =
There isn't a settings page, but all of the internal options can be modified via the `qni_options` filter. If you're not familiar with using filters, you can [learn more about them](https://developer.wordpress.org/plugins/hooks/filters/) from the WordPress Plugin Developer's Handbook, and then implement them in [a functionality plugin](http://wpcandy.com/teaches/how-to-create-a-functionality-plugin) that you write, or via a plugin like [Functionality](https://wordpress.org/plugins/functionality/).

The values of the keys must correspond to [jQuery's standardized key codes](http://jquerypp.com/release/latest/docs/key.html), and the plugin doesn't currently support using combinations.


= How can I override or customize the UI templates? =

There are several methods:

1. Use the `qni_template_path` filter to provide an arbitrary path for any template file.
1. Copy the file you want to replace into your theme's root file, and add `qni-` to the beginning of the filename. For example, copy `interface.php` in the plugin's views folder to `qni-interface.php` in your theme's folder.
1. Use the `qni_template_content` filter to provide the content as a string.
1. If you just want to add content to the beginning and/or end of a template, you can hook into the `qni_render_template_pre` and `qni_render_template_post` actions and echo whatever you want.

Regardless of the method you choose, all of the variables used to build the original template will be available to you. Read the `render_template()` function for details.


= Is this plugin secure? =
I've done my best to ensure that it is, but just in case I missed anything [I also offer a security bounty](https://hackerone.com/iandunn-projects/) for any vulnerabilities that can be found and privately disclosed in any of my plugins.


== Screenshots ==

1. Pressing \` (above the tab key) brings up the interface
2. Matches are displayed and filtered as you type


== Changelog ==

= v1.0 (2019-??-??) =

* [NEW] Highlighting a link shows a preview of its URL, so you can know where it will take you.
* [NEW] Links for menu items include their parent menu, if applicable.
* [NEW] The type of link is now displayed (post, page, menu item, etc).
* [NEW] Front end rebuilt in React, using Gutenberg's library of UI components.
* [FIX] Removed duplicate on-page links from the results.
* [FIX] Fixed conflict with using backtick key within Gutenberg editor.


* rest api? local storage?


close-interface filter removed b/c using built-in modal now

[Full changelog](https://github.com/iandunn/quick-navigation-interface/compare/?...?)


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
