=== Quick Navigation Interface ===
Contributors:      iandunn
Donate link:       https://www.debian.org/donations
Tags:              keyboard,navigation,shortcuts,wp-admin
Requires at least: 3.6
Tested up to:      4.2
Stable tag:        0.1
License:           GPLv2

Quickly access screens and content within wp-admin just by typing the first few letters of the name.


== Description ==

Quick Navigation Interface provides a new way to navigate through the Administration Panels, combining the speed of keyboard shortcuts with the ease of a graphical user interface.

Just press \` (above the tab key) to bring up the interface, and then start typing part of the name of any screen, post, page, etc. As you type, you'll be shown a list of matching links. Use the `Up` and `Down` keys to move between them, and press `Enter` to open one.

https://www.youtube.com/watch?v=jhjt9hSyMZw

This was inspired by Ubuntu's Dash and [HUD](http://www.markshuttleworth.com/archives/939), and is also similar to the Spotlight feature in OS X.


== Installation ==

For help installing this (or any other) WordPress plugin, please read the [Managing Plugins](http://codex.wordpress.org/Managing_Plugins) article on the Codex.

Once the plugin is installed and activated, you don't need to do anything else. See [the Description page](https://wordpress.org/plugins/quick-navigation-interface/) and [FAQ](https://wordpress.org/plugins/quick-navigation-interface/faq/) for details on using the plugin.


== Frequently Asked Questions ==

= I'm pressing the ` key, but nothing happens =
Make sure you're not focused on an input field (like a text area or a button), and then try again. You can click anywhere outside an input field (like the page's background) to move the focus off of the input field.

This could also happen if JavaScript execution has been halted because of errors on the page, which is most likely caused by another plugin. Try disabling all other plugins temporarily, and see if that solves the problem.

Also, make sure you're not mistaking it for the ' (single-quote) key. You need to press the backtick key, which is normally located above the `tab` key and left of the `1` key.


= Why doesn't the content I'm searching for show up? =

There are a few reasons why you may not see all content.

1. For performance reasons, only a limited number of posts are searched. The default is 500, and can be changed via the `qni_content_index_params` filter.
1. The search term must match the title of the content exactly. It doesn't need to be the entire word, but it can't be a typo or a "fuzzy" match.
1. You'll only be shown content that your user account has permission to edit.


= Can I customize the keyboard shortcuts and other options? =
There isn't a settings page, but all of the internal options can be modified via the `idi_options` filter. If you're not familiar with using filters, you can [learn more about them](https://developer.wordpress.org/plugins/hooks/filters/) from the WordPress Plugin Developer's Handbook, and then implement them in [a functionality plugin](http://wpcandy.com/teaches/how-to-create-a-functionality-plugin) that you write, or via a plugin like [Functionality](https://wordpress.org/plugins/functionality/).

The values of the keys must correspond to [jQuery's standardized key codes](http://jquerypp.com/release/latest/docs/key.html), and the plugin doesn't currently support using combinations.


= How can I override or customize the UI templates? =

There are several methods:

1. Use the `idi_template_path` filter to provide an arbitrary path for any template file.
1. Copy the file you want to replace into your theme's root file, and add `idi-` to the beginning of the filename. For example, copy `interface.php` in the plugin's views folder to `idi-interface.php` in your theme's folder.
1. Use the `idi_template_content` filter to provide the content as a string.
1. If you just want to add content to the beginning and/or end of a template, you can hook into the `idi_render_template_pre` and `idi_render_template_post` actions and echo whatever you want.

Regardless of the method you choose, all of the variables used to build the original template will be available to you. Read the `render_template()` function for details.


= Is this plugin secure? =
I've done my best to ensure that it is, but just in case I missed anything [I also offer a security bounty](https://hackerone.com/iandunn-projects/) for any vulnerabilities that can be found and privately disclosed in any of my plugins.


== Screenshots ==

1. Pressing \` (above the tab key) brings up the interface
2. Matches are displayed and filtered as you type


== Changelog ==

= v0.2 (todo) =
* [NEW] Post, pages, and other content now appears in the search results.
* [FIX] Exact duplicate links have been removed from the search results.

[Full changelog](todo github compare)


= v0.1 (2015-05-22) =
* [NEW] Initial release


== Upgrade Notice ==

= 0.2 =
Version 0.2 adds posts, pages and other content to the search results, and reduces the number of duplicate results.

= 0.1 =
Initial release.
