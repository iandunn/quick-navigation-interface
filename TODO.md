### Next minor version

* fix gutenberg conflict with backtick

O remove local localizations and load_text_domain etc
	https://make.wordpress.org/core/2016/07/06/i18n-improvements-in-4-6/

* convert to use REST api, but with cached result. bump min ver to 4.4
	* remove 4.2 back-compat css once WP 4.5 comes out, and update required version to 4.3

* Maybe change command to `[modifier] /` or just `g`
	probably add it as an additional for back-compat
	https://medium.com/@sashika/j-k-or-how-to-choose-keyboard-shortcuts-for-web-applications-a7c3b7b408ee#.cbjvagkdg
	https://ux.stackexchange.com/questions/76405/what-are-conventions-for-keyboard-shortcuts-in-windows-and-osx
	http://www.hanselman.com/blog/TheWebIsTheNewTerminalAreYouUsingTheWebsKeyboardShortcutsAndHotkeys.aspx
	* Maybe use https://github.com/jeresig/jquery.hotkeys if it'd make hotkeys easier. it's already in core

* usermeta is global, so what happens in multisite when you store content index there?
	index if for site A b/c that was first site to load, but then it gets used for site B b/c code isn't aware of changes?
	need to store index as qni_content_index_{blog_id} ?
* for content, add post type in parenthesis

* exclude nav_menu_item and revisions from qni_content_index_params
* maybe implement the main container as a view, even though it's not dynamic?
	* it still has behavior on it like events, even though it doesn't change visually
* think about any ally issues
	* aria active state when up/down through links
* load the plugin earlier, so can start using it even before page finishes loading?


### Future iterations

* make it discoverable for users who don't already know it exists and how to use it
	* https://wordpress.org/support/topic/trigger-from-search-iconbutton/
* check responsiveness once https://core.trac.wordpress.org/ticket/32194 lands
* Setup phpunit and qunit tests
* Setup travis
* update grunt task versions to latest available
* Move concat/minified files to separate folder to so can phpstorm exclude them from code hints etc to avoid collisions?
* better way to call start() after everything concatenated, so you can remove bootstrap.js?
* setup csslint, php codesniffer
* Read https://ozkatz.github.io/avoiding-common-backbonejs-pitfalls.html
* sourcemap xss issues? remove b/c not useful anyway?
	* users safe b/c not distributed w/ wporg repo version, but still want to look into
* ie8 doesn't open - might work w/ different keys? can't use "event" as param? https://stackoverflow.com/a/2412501/450127

* when use up/down keys to navigate result links, show the url in the browser status bar
	* browser api has a way to show it? prob not b/c of security
	* need to programatically move the mouse to hover the link? that's bad UX though?

* use local storage for client-side data caching?
  	* Or something like it, whatever's best now
  	* Can double/triple limit or eliminate it?
  	* But still need to store in db so limit there

* Improve search results if current method is not good enough
	* Log each title/url to console, then browse through screens to get a feel for where the biggest problems are
	* Links from admin bar New menu are duplicates and titles aren't helpful, maybe ignore them
    	* maybe ignore all of admin bar b/c it's all duplicates
    	* For menus, show parent > child if the current is a child?
	* remove duplicate urls? but how to determine which one has the best title and keep that one? assume that a longer title contains more info and use that?
		* maybe not. already removed ones with same url and title, which was worst of part. if removed ones w/ same url but diff title, would be confusing for user searching for title that isn't there
	* Disambiguate links like "New" (new what?) and "Add new"
		* Maybe loop through admin menu and add those w/ special context since those are known, then loop through rest of page and just add?
		* Maybe detect append last part of url? only if conflict, or maybe always?
	* Remove any links that are just # or javascript: b/c the handlers are setup based on ID and won't do anything here
	* Don't add links that aren't visible?

* More sophisticated search if above tweaks don't make it good enough
	* Get list of specific examples where current isn't good enough
	* Maybe calculate a Levenshtein distance, or soundex, or something else
		* Find a good, performant implementation. Maybe https://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript

* Add a way to search for more content via AJAX if some posts were left out of local index b/c of limit?

* Add ability to search by additional keywords that are associated w/ each link, not just the title
	* Can pull the keywords from link title tags, post excerpts, etc

* Listen for new links added by asyncronously, like News dashboard widget

* Maybe show most popular links by default, and then track what links they visit and show those as default

* Highlight exact query matches in link titles w/ bold

* showRelevantLinks -- improve performance by waiting a few milliseconds before issuing a query, to avoid wasted searches when they're going to type more characters?
	* if this is non-trivial, then might be better to rely on twitter typeahead (or something similar).
	* but wouldn't be worth adding weight just for this, unless it's a noticeable problem, which right now it isn't

* Look at twitter typeahead and it's bloodhound suggestion engine. any compelling reason to use it? what about alternatives?
