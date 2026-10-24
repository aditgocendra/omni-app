<script lang="ts">
	import MetricCard from "$lib/components/common/MetricCard.svelte";
	import ChannelBadge from "$lib/components/common/ChannelBadge.svelte";
	import StatusDot from "$lib/components/common/StatusDot.svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import BanknoteIcon from "@lucide/svelte/icons/banknote";
	import PackageIcon from "@lucide/svelte/icons/package";
	import StoreIcon from "@lucide/svelte/icons/store";
	import ShoppingBagIcon from "@lucide/svelte/icons/shopping-bag";
	import XCircleIcon from "@lucide/svelte/icons/x-circle";
	import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
	import DownloadIcon from "@lucide/svelte/icons/download";
	import PlusCircleIcon from "@lucide/svelte/icons/plus-circle";
	import FilterIcon from "@lucide/svelte/icons/filter";

	import { t } from "$lib/i18n/index.js";
	import type { OmnichannelTransaction } from "$lib/types/index.js";

	// Time range state for chart
	let selectedRange = $state<"7d" | "30d">("7d");

	// Simulated orders volume per channel (Offline vs Shopee vs TikTok)
	const volumeData7d = [
		{ day: "Mon", offline: 65, shopee: 110, tiktok: 85 },
		{ day: "Tue", offline: 78, shopee: 145, tiktok: 115 },
		{ day: "Wed", offline: 82, shopee: 160, tiktok: 130 },
		{ day: "Thu", offline: 74, shopee: 150, tiktok: 125 },
		{ day: "Fri", offline: 95, shopee: 195, tiktok: 160 },
		{ day: "Sat", offline: 140, shopee: 220, tiktok: 190 },
		{ day: "Sun", offline: 125, shopee: 180, tiktok: 155 },
	];

	// Recent transactions data across Shopee, TikTok, Tokopedia, and Offline Store
	const transactions: OmnichannelTransaction[] = [
		{
			id: "tx-1",
			invoiceNumber: "INV-SHP-88219",

			channel: "shopee",
			amount: 485000,
			amountFormatted: "Rp 485.000",
			itemsCount: 3,
			timestamp: "3 mins ago",
			status: "processing",
			statusLabel: "Diproses",
		},
		{
			id: "tx-2",
			invoiceNumber: "INV-TTK-44012",

			channel: "tiktok",
			amount: 320000,
			amountFormatted: "Rp 320.000",
			itemsCount: 2,
			timestamp: "12 mins ago",
			status: "completed",
			statusLabel: "Selesai",
		},
		{
			id: "tx-3",
			invoiceNumber: "INV-POS-09144",
			channel: "offline",
			amount: 1250000,
			amountFormatted: "Rp 1.250.000",
			itemsCount: 5,
			timestamp: "24 mins ago",
			status: "completed",
			statusLabel: "Selesai",
		},
		{
			id: "tx-4",
			invoiceNumber: "INV-TKP-10932",
			channel: "tokopedia",
			amount: 790000,
			amountFormatted: "Rp 790.000",
			itemsCount: 4,
			timestamp: "45 mins ago",
			status: "pending",
			statusLabel: "Pending",
		},
		{
			id: "tx-5",
			invoiceNumber: "INV-SHP-88190",
			channel: "shopee",
			amount: 210000,
			amountFormatted: "Rp 210.000",
			itemsCount: 1,
			timestamp: "1 hour ago",
			status: "completed",
			statusLabel: "Selesai",
		},
		{
			id: "tx-6",
			invoiceNumber: "INV-POS-09143",
			channel: "offline",
			amount: 640000,
			amountFormatted: "Rp 640.000",
			itemsCount: 2,
			timestamp: "2 hours ago",
			status: "cancelled",
			statusLabel: "Dibatalkan",
		},
	];
</script>

<div class="space-y-6">
	<!-- Page Header & Quick Actions -->
	<div
		class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h1
				class="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
			>
				{t("overview.title")}
			</h1>
			<p class="text-xs sm:text-sm text-muted-foreground mt-1">
				{t("overview.subtitle")}
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<Button.Root
				size="sm"
				class="h-9 gap-1.5 rounded-lg bg-primary text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
			>
				<DownloadIcon class="size-3.5" />
				<span>{t("overview.exportReport")}</span>
			</Button.Root>
		</div>
	</div>

	<!-- KPI Summary 4-Cards Grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<MetricCard
			title={t("overview.revenue")}
			value="Rp 248.5M"
			trend="up"
			trendValue="+18.2%"
			description={t("overview.revenueDesc")}
			icon={BanknoteIcon}
		/>
		<MetricCard
			title={t("overview.orders")}
			value="1,450"
			trend="up"
			trendValue="+8.6%"
			description={t("overview.ordersDesc")}
			icon={PackageIcon}
		/>
		<MetricCard
			title={t("overview.productsSold")}
			value="3,820"
			trend="up"
			trendValue="+14.8%"
			description={t("overview.productsSoldDesc")}
			icon={ShoppingBagIcon}
		/>
		<MetricCard
			title={t("overview.cancelled")}
			value="24"
			trend="down"
			trendValue="-2.4%"
			description={t("overview.cancelledDesc")}
			icon={XCircleIcon}
		/>
	</div>

	<!-- Middle Section: Omnichannel Order Volume Chart -->
	<Card.Root
		class="overflow-hidden border border-border/80 bg-card p-5 shadow-xs"
	>
		<div
			class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4"
		>
			<div>
				<h3 class="font-heading text-lg font-bold text-foreground">
					{t("overview.volumeChartTitle")}
				</h3>
				<p class="text-xs text-muted-foreground mt-0.5">
					{t("overview.volumeChartSubtitle")}
				</p>
			</div>
			<div class="flex items-center gap-3">
				<!-- Legends -->
				<div class="hidden md:flex items-center gap-4 text-xs">
					<span class="flex items-center gap-1.5">
						<span class="size-2.5 rounded-full bg-blue-500"></span>
						<span class="text-muted-foreground font-medium"
							>Offline POS</span
						>
					</span>
					<span class="flex items-center gap-1.5">
						<span class="size-2.5 rounded-full bg-orange-500"
						></span>
						<span class="text-muted-foreground font-medium"
							>Shopee</span
						>
					</span>
					<span class="flex items-center gap-1.5">
						<span class="size-2.5 rounded-full bg-rose-500"></span>
						<span class="text-muted-foreground font-medium"
							>TikTok Shop</span
						>
					</span>
				</div>
				<!-- Range Toggle -->
				<div
					class="flex rounded-lg border border-border/80 bg-muted/60 p-0.5 text-xs font-medium"
				>
					<button
						onclick={() => (selectedRange = "7d")}
						class={`rounded-md px-2.5 py-1 transition-all ${selectedRange === "7d" ? "bg-white dark:bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
					>
						7D
					</button>
					<button
						onclick={() => (selectedRange = "30d")}
						class={`rounded-md px-2.5 py-1 transition-all ${selectedRange === "30d" ? "bg-white dark:bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
					>
						30D
					</button>
				</div>
			</div>
		</div>

		<!-- Interactive Stacked Volume Bars -->
		<div class="mt-6">
			<div
				class="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-6 pb-2"
			>
				{#each volumeData7d as point}
					{@const total = point.offline + point.shopee + point.tiktok}
					{@const max = 600}
					<div
						class="group flex flex-col items-center h-full justify-end gap-2"
					>
						<!-- Bar container -->
						<div
							class="relative w-full max-w-12 rounded-lg overflow-hidden flex flex-col justify-end bg-muted/40 transition-all hover:opacity-90"
						>
							<!-- Stacked Segments -->
							<div
								style="height: {(point.tiktok / max) * 100}%;"
								class="w-full bg-rose-500 transition-all duration-300"
								title="TikTok Shop: {point.tiktok} orders"
							></div>
							<div
								style="height: {(point.shopee / max) * 100}%;"
								class="w-full bg-orange-500 transition-all duration-300"
								title="Shopee: {point.shopee} orders"
							></div>
							<div
								style="height: {(point.offline / max) * 100}%;"
								class="w-full bg-blue-500 transition-all duration-300"
								title="Offline POS: {point.offline} orders"
							></div>
						</div>
						<!-- Day Label -->
						<span
							class="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors"
						>
							{point.day}
						</span>
					</div>
				{/each}
			</div>
			<!-- Summary Footnote -->
			<div
				class="mt-4 flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50"
			>
				<span
					>Peak shopping activity recorded on Saturday & Sunday
					(Shopee & TikTok Live surges).</span
				>
				<span class="font-medium text-foreground"
					>Total Weekly Inflow: 3,465 Transactions</span
				>
			</div>
		</div>
	</Card.Root>

	<!-- Recent Omnichannel Transactions Table -->
	<Card.Root
		class="overflow-hidden border border-border/80 bg-card p-5 shadow-xs"
	>
		<div
			class="flex items-center justify-between pb-4 border-b border-border/60"
		>
			<div>
				<h3 class="font-heading text-lg font-bold text-foreground">
					{t("overview.recentTransactions")}
				</h3>
				<p class="text-xs text-muted-foreground mt-0.5">
					{t("overview.recentTransactionsSubtitle")}
				</p>
			</div>
			<Button.Root
				variant="outline"
				size="sm"
				class="h-8 gap-1.5 rounded-lg border border-border/80 bg-white dark:bg-card px-2.5 text-xs font-medium text-foreground hover:bg-slate-50 dark:hover:bg-muted shadow-xs transition-colors"
			>
				<FilterIcon class="size-3.5 text-muted-foreground" />
				<span>{t("common.viewAll")}</span>
			</Button.Root>
		</div>

		<!-- Table Component -->
		<div class="overflow-x-auto mt-2">
			<Table.Root>
				<Table.Header>
					<Table.Row
						class="border-b border-border/60 hover:bg-transparent"
					>
						<Table.Head class="text-xs font-semibold uppercase"
							>{t("overview.invoiceNumber")}</Table.Head
						>
						<Table.Head class="text-xs font-semibold uppercase"
							>{t("overview.channel")}</Table.Head
						>

						<Table.Head class="text-xs font-semibold uppercase"
							>{t("overview.amount")}</Table.Head
						>
						<Table.Head class="text-xs font-semibold uppercase"
							>{t("overview.time")}</Table.Head
						>
						<Table.Head
							class="text-xs font-semibold uppercase text-right"
							>{t("common.status")}</Table.Head
						>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each transactions as item}
						<Table.Row
							class="hover:bg-muted/50 border-b border-border/40 transition-colors"
						>
							<Table.Cell
								class="py-3 font-mono text-xs font-bold text-primary"
							>
								{item.invoiceNumber}
							</Table.Cell>
							<Table.Cell class="py-3">
								<ChannelBadge channel={item.channel} />
							</Table.Cell>
							<Table.Cell
								class="py-3 font-semibold text-xs text-foreground"
							>
								{item.amountFormatted}
							</Table.Cell>
							<Table.Cell
								class="py-3 text-xs text-muted-foreground"
							>
								{item.timestamp}
							</Table.Cell>
							<Table.Cell class="py-3 text-right">
								<span
									class="inline-flex items-center gap-1.5 text-xs font-medium"
								>
									<StatusDot
										status={item.status === "completed"
											? "online"
											: item.status === "processing"
												? "pending"
												: item.status === "cancelled"
													? "busy"
													: "pending"}
										ping={item.status === "processing"}
									/>
									<span class="capitalize"
										>{item.statusLabel}</span
									>
								</span>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</Card.Root>
</div>
