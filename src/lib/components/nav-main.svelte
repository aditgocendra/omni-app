<script lang="ts">
	import type { Component } from "svelte";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import { t } from "$lib/i18n/index.js";

	let {
		items,
		label,
	}: {
		items: {
			title: string;
			url: string;
			icon?: Component;
			isActive?: boolean;
			items?: {
				title: string;
				url: string;
				isActive?: boolean;
			}[];
		}[];
		label?: string;
	} = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel class="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1.5">{label ?? t("nav.features")}</Sidebar.GroupLabel>
	<Sidebar.Menu class="gap-2.5">
		{#each items as item (item.title)}
			<Collapsible.Root open={item.isActive} class="group/collapsible">
				{#snippet child({ props }: { props: Record<string, unknown> })}
					<Sidebar.MenuItem {...props}>
						<Collapsible.Trigger>
							{#snippet child({
								props,
							}: {
								props: Record<string, unknown>;
							})}
								<Sidebar.MenuButton
									{...props}
									tooltipContent={item.title}
									class="h-10 text-sm font-medium px-3 rounded-lg transition-all hover:bg-sidebar-accent/80 data-[state=open]:bg-sidebar-accent/60 [&>svg]:size-4.5"
								>
									{#if item.icon}
										<item.icon />
									{/if}
									<span class="truncate">{item.title}</span>
									<ChevronRightIcon
										class="ms-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground/70"
									/>
								</Sidebar.MenuButton>
							{/snippet}
						</Collapsible.Trigger>
						<Collapsible.Content>
							<Sidebar.MenuSub class="mt-1 gap-1">
								{#each item.items ?? [] as subItem (subItem.title)}
									<Sidebar.MenuSubItem>
										<Sidebar.MenuSubButton
											isActive={subItem.isActive}
											class="h-8.5 rounded-md text-xs font-normal transition-colors"
										>
											{#snippet child({
												props,
											}: {
												props: Record<string, unknown>;
											})}
												<a
													href={subItem.url}
													{...props}
												>
													<span class="truncate">{subItem.title}</span>
												</a>
											{/snippet}
										</Sidebar.MenuSubButton>
									</Sidebar.MenuSubItem>
								{/each}
							</Sidebar.MenuSub>
						</Collapsible.Content>
					</Sidebar.MenuItem>
				{/snippet}
			</Collapsible.Root>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
