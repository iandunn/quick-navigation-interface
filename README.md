Quick Navigation Interface provides a new way to navigate through the Administration Panels, combining the speed of keyboard shortcuts with the ease of a graphical user interface.

Just press `g` or ``` ` ``` -- _the backtick character, usually located above the tab key_ -- to bring up the interface, and then start typing part of the name of any screen, post, page, etc. As you type, you'll be shown a list of matching links. Use the `Up` and `Down` keys to move between them, and press `Enter` to open one.

<a href="http://www.youtube.com/watch?v=60iVn94hEIE"><img src="https://ps.w.org/quick-navigation-interface/assets/screenshot-2.png?rev=2192997" /></a>

This was inspired by Ubuntu's Dash and [HUD](http://www.markshuttleworth.com/archives/939), and is also similar to the Spotlight feature in OS X.

## Setup

If you just want to **use** the plugin, you can [install the packaged version](https://wordpress.org/plugins/quick-navigation-interface/) from the WordPress.org plugin repository.

If you want to **develop** the plugin, then follow these steps to setup the development version:

* `git clone https://github.com/iandunn/quick-navigation-interface.git`
* `cd quick-navigation-interface`
* `npm install`
* `npm start`

After the initial setup, you only need to run `npm start`. To build the distributed version, run `npm run build`.
