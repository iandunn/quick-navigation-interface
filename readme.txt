=== Intent-Driven Interface ===
Contributors:      iandunn
Donate link:       https://www.debian.org/donations
Tags:              keyboard,navigation,keyboard shortcuts,interface,wp-admin
Requires at least: 3.6
Tested up to:      4.2
Stable tag:        0.1
License:           GPLv2

Allows you to quickly access any navigation link within wp-admin just by typing the first few letters.


== Description ==

Intent-Driven Interface provides a new way to navigate through the Administration Panels, combining the speed of keyboard shortcuts with the ease of a graphical user interface.

Just press ` (above the tab key) to bring up the interface, and then start typing what you want to do. As you type, you'll be shown a list of matching links. Use the up and down keys to move between them, and press enter to open one.

This was inspired by the Ubuntu's [Dash](https://www.youtube.com/watch?v=dUS8DHYwP5U) and [HUD](https://www.youtube.com/watch?v=hfmSTWyYbms), and is also similar to the Spotlight feature in OS X.

todo take screencast and embed video here


== Installation ==

For help installing this (or any other) WordPress plugin, please read the [Managing Plugins](http://codex.wordpress.org/Managing_Plugins) article on the Codex.

Once the plugin is installed and activated, you don't need to do anything else. See [the Description page](https://wordpress.org/plugins/intent-driven-interface/) for details on using the plugin.


== Frequently Asked Questions ==

= I'm pressing the ` key, but nothing happens =
Make sure you're not focused on an input field, and then try again. You can

This could also happen if JavaScript execution has been halted because of errors on the page, which is most likely caused by another plugin. Try disabling all other plugins temporarily, and see if that solves the problem.

Also, make sure you're not mistaking it for the ' (single-quote) key. You need to press the backtick key, which is normally located above the tab key and left of the 1 key.


= Can I customize the keyboard shortcuts and other options? =
There isn't a settings page, but all of the internal options can be modified via the `idi_options` filter. If you're not familiar with using filters, you can [learn more about them](https://developer.wordpress.org/plugins/hooks/filters/) from the WordPress Plugin Developer's Handbook, and then implement them in [a functionality plugin](http://wpcandy.com/teaches/how-to-create-a-functionality-plugin) that you write, or via a plugin like [Functionality](https://wordpress.org/plugins/functionality/).

The values of the keys must correspond to [the DOM Level 3 KeyboardEvent key Values](https://w3c.github.io/DOM-Level-3-Events-key/), and the plugin doesn't currently support using combinations.


= Will posts, comments, media and other content show up in the results? =

Not right now, but that may be added in the future. If you'd like something that does that now, take a look at [Jarvis](https://wordpress.org/plugins/jarvis/).


= Is this plugin secure? =
I've done my best to ensure that it is, but just in case I missed anything [I also offer a security bounty](https://hackerone.com/iandunn-projects/) for any vulnerabilities that can be found and privately disclosed in any of my plugins.


== Screenshots ==

1. Pressing ` (above the tab key) brings up the interface
2. Matches are displayed and filtered as you type


== Changelog ==

= v0.1 (2015-todo-todo) =
* [NEW] Initial release


== Upgrade Notice ==

= 0.1 =
Initial release.
