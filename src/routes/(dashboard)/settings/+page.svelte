<script lang="ts">
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";

	onMount(() => {
		goto("/settings/general");
	});
</script>

<div class="flex h-48 items-center justify-center">
	<div class="flex items-center gap-2 text-sm text-muted-foreground">
		<div class="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
		<span>Loading Settings...</span>
	</div>
</div>
