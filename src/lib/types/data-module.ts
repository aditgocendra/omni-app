export interface PerformanceOrderRecord {
	id: string;
	orderNumber: string; // e.g. "ID20261030001"
	orderDate: string; // format "DD/MM/YYYY" e.g. "20/12/2026"
	status: "Completed" | "Pending" | "Processing" | "Cancelled";
	productName: string;
	sku: string; // e.g. "PBO-ELC-001-STD"
	qty: number;
	revenue: number;
	hppUnit: number;
	hppTotal: number;
	profit: number;
	platform: "Shopee" | "Tokopedia" | "TikTok Shop" | "Lazada";
	warehouse: string;
	shopeeAccount: string;
}

export interface PerformancePlatformBreakdown {
	platform: string;
	soldQty: number;
	revenue: number;
	percentage: number;
}

export interface PerformanceProductRecord {
	id: string;
	productName: string;
	sku: string;
	photo: string;
	sold: number;
	revenue: number;
	createdAt: string; // format "DD/MM/YYYY" e.g. "20/02/2026"
	channelBreakdown: PerformancePlatformBreakdown[];
}

export type CostCategory = "service_fee" | "payroll" | "contingency";

export interface OperationalCostItem {
	id: string;
	category: CostCategory;
	name: string;
	type: "fixed_per_order" | "fixed_monthly" | "percentage" | "incident";
	amount: number;
	unit?: string;
	description: string;
	isActive: boolean;
	allocatedMonthly: number;
	updatedAt: string;
}

export interface AssetWarehouseBreakdown {
	warehouseName: string;
	qty: number;
	amount: number;
	location: string;
	minSafetyStock: number;
}

export interface AssetProductRecord {
	id: string;
	productName: string;
	sku: string;
	photo: string;
	hpp: number;
	qty: number;
	amount: number; // qty * hpp
	warehouses: AssetWarehouseBreakdown[];
}

