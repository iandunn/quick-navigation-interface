<?php defined( 'WPINC' ) or die; ?>

<script type="text/html" id="tmpl-qni-link">
	<a href="{{data.url}}">
		<# if ( '' !== data.parentTitle ) { #>
			{{data.parentTitle}} &rarr;
		<# } #>

		<# if ( 'content' === data.type ) { #>
			{{{data.title}}} <?php // This needs to be escaped on the PHP side because of wptexturize() ?>
		<# } else { #>
			{{data.title}}
		<# } #>
	</a>
</script>
