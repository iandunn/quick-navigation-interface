<?php defined( 'WPINC' ) or die; ?>

<script type="text/html" id="tmpl-qni-link">
	<a href="{{data.url}}">
		<# if ( '' !== data.parentTitle ) { #>
			{{data.parentTitle}} &rarr;
		<# } #>

		{{data.title}}
	</a>
</script>
