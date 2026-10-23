import type { Snippet } from "svelte";

export interface DataTableColumn<TItem> {
	id: string;
	header: string;
	headerClass?: string;
	cellClass?: string;
	align?: "left" | "center" | "right";
	sortable?: boolean;
	accessorFn?: (item: TItem) => string | number;
	cell?: Snippet<[item: TItem, index: number]>;
}
