### 1.0

* store the contentindex in localstorage
	* any security/privacy issues with that?
	* Can double/triple limit or eliminate it?
		* But still need to store in db so consider the impact there too
	test that caching still works similar to before, where you only  make the api request when local storage is stale
	how to know when localstorage is stale, i guess need to output var in inline script
	maybe kick off the stale request in the bg instead of making them wait while it occurs?
		but the db cache will already be generated, so it'll just be a normal http request, won't have to wait on the index to be generated 

* localstorage or something else instead of memory? then don't have to pass around
	* maybe use service worker like https://codesandbox.io/s/github/haldarmahesh/react-context-demo/tree/master/?from-embed
	* cant setup service worker until pwa plugin integrated w/ core

change all css classes to BEMish convention
	er, but what abiout back-compat?
	that'll break anyway b/c of changing the containers etc?
	but things like qni-search-results haven't changed, right?
	so few uesrs, unlikely anybody has customized, just go ahead and change it. it's a 1.0 release anyway

test that everything in php side still works as expected, caching, expiring cache, etc


* Maybe change command to `[modifier] /` or just `g`
	probably add it as an additional for back-compat
	https://medium.com/@sashika/j-k-or-how-to-choose-keyboard-shortcuts-for-web-applications-a7c3b7b408ee#.cbjvagkdg
	https://ux.stackexchange.com/questions/76405/what-are-conventions-for-keyboard-shortcuts-in-windows-and-osx
	http://www.hanselman.com/blog/TheWebIsTheNewTerminalAreYouUsingTheWebsKeyboardShortcutsAndHotkeys.aspx
	* Maybe use https://github.com/jeresig/jquery.hotkeys if it'd make hotkeys easier. it's already in core

	// maybe fix https://github.com/iandunn/quick-navigation-interface/issues/1 now too, by changing key
	// primary is now `g` or something else instead of `\`` ? still keep that one as backup though?
		// if in input field, then modifier-g
			// cmg-g conflicts with search in firefox
			// https://docs.google.com/spreadsheets/d/1nK1frKawxV7aboWOJbbslbIqBGoLY7gqKvfwqENj2yE/edit#gid=0

	// search web to see what common ones are, also
		// `/` for search might also fit, but could conflict w/ jetpack/core search in future
		// https://www.hanselman.com/blog/TheWebIsTheNewTerminalAreYouUsingTheWebsKeyboardShortcutsAndHotkeys.aspx
		// look for more

finish readme

* remove default exports from everything
change to `import { render, createElement } from '@wordpress/element';` style and loading that file automatically instead of manually declaring deps

* write post announcing new version - mention react convert but focus on features
	https://iandunn.name/wordpress/wp-admin/post.php?post=2437&action=edit
* write another blog post on how to build react app in wp that isn't a block, but uses G's components and abstraction layer
	https://iandunn.name/wordpress/wp-admin/post.php?post=2393&action=edit
* then consider doing a seattle wp dev meetup presentation
* then consider doing a seattle wordcamp talk
	* #262-meta would be better example since it's a normal admin screen rather than a modal that appears on all screens

update screenshots - have to do after pushing stable
	on w.org and in readme.md
update w.org banner - have to do after pushing stable
update youtube video - have nicer mic now too. maybe do a quick "hi i'm ian, built this because... but 5 seconds max, then get to the point". set video poster to be the interface not your face.



### 1.0 stretch goals

* Switch to SASS once wp-scripts supports it
	* https://github.com/WordPress/gutenberg/issues/14801
	* Can do it now like wordcamp.org did? See https://github.com/WordPress/wordcamp.org/pull/157/

reorganize folder structure similar to compassionate comments
	don't break back-compat though

add to changelog in readme.txt if do any of these

// todo "33 plugin links" when 3 plugins need updating
	// probably throw out the text in `ab-label`
	// or maybe shouldn't be searching for .ab-label above?
	// related https://github.com/iandunn/quick-navigation-interface/issues/2
		fix ^ too if not same thing

* reduce build size
	9k for `npm run build`, not horrible but still seems pretty high for something so small as thing
		backbone version was 2k
	why is it so big? maybe need to set some things as webpack externals, or need tree-shaking? but dependencies is empty.
	look in the buld file and see what's in there
	make sure you're loooking at build not watch

should load the script sooner.
	on slow connections have to wait until after images have loaded etc, but may want to skip all that and go to another page

* feels like there's a slight delay in up/down keys, maybe look into how to troubleshoot react performance issues
	* maybe things are unneccessarily re-rendering or some other common mistake?
	* actually, that may just be firefox vs chrome, since the backbone version feels a bit slow in ff too
	* might still be some optimizations you can make though



### Next minor version

* css no longer minified b/c not using grunt anymore and wp-scripts doesn't support it
when it does, scss files inside each component folder, and have wp-scripts build a single minified/concat'd file in `build/`
https://github.com/WordPress/gutenberg/issues/14801

* Listen for new links added by asyncronously, like News dashboard widget

* doesn't work inside customizer?


### Next-next minor version

* remove page links to things that already exist in content index
	e.g., when on All Posts screen

modal window shifts positions as this list grows/shrinks, which sucks
	use CSS to set a fixed height maybe, or maybe just a fixed position

activeurlpreview - if url is relative, add host
need to test different scenarios where that might break

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

* maybe add a "new window" icon for external links
	- probably one in dashicons


### Future iterations

* make it discoverable for users who don't already know it exists and how to use it
	* https://wordpress.org/support/topic/trigger-from-search-iconbutton/
	* integrate into core's list of keyboard shortcuts?
* Setup phpunit and jest tests
* Setup travis
* setup php codesniffer
* sourcemap xss issues? remove b/c not useful anyway?
	* users safe b/c not distributed w/ wporg repo version, but still want to look into

* when pressing down key and holding, nothing happens until release
	but if move from keyup to keypress or keydown, that might have side-effects that introduce bigger problems
	https://stackoverflow.com/questions/3396754/onkeypress-vs-onkeyup-and-onkeydown

* dont need bootstrap now that wp supports checking php version via `Requires PHP: 5.6` header in readme?
	* are there edge cases where it's still useful, though?
	* can't remove b/c that'd disbale plugin, but could make it just `require classes/quick-nav.php` unconditionally, with a note that it's only there for back-compat

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

* Maybe show most popular links by default, and then track what links they visit and show those as default

* Highlight exact query matches in link titles w/ bold

* showRelevantLinks -- improve performance by waiting a few milliseconds before issuing a query, to avoid wasted searches when they're going to type more characters?
	* if this is non-trivial, then might be better to rely on twitter typeahead (or something similar).
	* but wouldn't be worth adding weight just for this, unless it's a noticeable problem, which right now it isn't

* Look at twitter typeahead and it's bloodhound suggestion engine. any compelling reason to use it? what about alternatives?
