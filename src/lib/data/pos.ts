import type { PosTransactionRecord, PosSettingConfig } from "$lib/types/index.js";

export const defaultPosSettings: PosSettingConfig = {
	prefix: "ID",
	datePattern: "YYYYMMDD",
	sequenceDigits: 3,
	separator: "",
	counterResetFrequency: "daily",
	defaultWarehouse: "Warehouse A - Central Jakarta",
	defaultTaxRate: 11,
	autoPrintReceipt: true,
	allowManualDiscount: true,
};

export function formatTransactionId(
	config: PosSettingConfig = defaultPosSettings,
	sequence: number = 1,
	date: Date = new Date(2026, 9, 30),
): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	let dateStr = "";
	if (config.datePattern === "YYYYMMDD") {
		dateStr = `${year}${month}${day}`;
	} else if (config.datePattern === "YYMMDD") {
		dateStr = `${String(year).slice(-2)}${month}${day}`;
	} else if (config.datePattern === "YYYYMM") {
		dateStr = `${year}${month}`;
	}

	const seqStr = String(sequence).padStart(config.sequenceDigits, "0");
	const sep = config.separator || "";

	if (!sep) {
		return `${config.prefix}${dateStr}${seqStr}`;
	}
	return `${config.prefix}${sep}${dateStr}${sep}${seqStr}`;
}

export const initialPosTransactions: PosTransactionRecord[] = [
	{
		id: "pos-trx-001",
		transactionId: "ID20261030001",
		date: "30/10/2026",
		qty: 2,
		totalPayment: 200000,
		warehouse: "Warehouse A - Central Jakarta",
		cashierName: "Adit Gocendra",
		paymentMethod: "QRIS",
		notes: "Customer paid via BCA QRIS. Regular customer.",
		items: [
			{
				productId: "prd-5",
				name: "Logitech MX Master 3S Wireless Mouse",
				sku: "LOG-MXM3S-GRP",
				price: 1549000,
				qty: 1,
				total: 1549000,
				image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&auto=format&fit=crop&q=80",
			},
			{
				productId: "prd-acc-1",
				name: "Braided USB-C to USB-C Fast Charging Cable 2M",
				sku: "ACC-CBL-2M",
				price: 200000,
				qty: 1,
				total: 200000,
				image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
			},
		],
	},
	{
		id: "pos-trx-002",
		transactionId: "ID20261030002",
		date: "30/10/2026",
		qty: 1,
		totalPayment: 1549000,
		warehouse: "Warehouse A - Central Jakarta",
		cashierName: "Adit Gocendra",
		paymentMethod: "Cash",
		notes: "Cash received Rp 1.550.000, change Rp 1.000.",
		items: [
			{
				productId: "prd-5",
				name: "Logitech MX Master 3S Wireless Mouse",
				sku: "LOG-MXM3S-PGR",
				price: 1549000,
				qty: 1,
				total: 1549000,
				image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=80",
			},
		],
	},
	{
		id: "pos-trx-003",
		transactionId: "ID20261030003",
		date: "30/10/2026",
		qty: 3,
		totalPayment: 4998000,
		warehouse: "Warehouse B - East Surabaya",
		cashierName: "Budi Santoso",
		paymentMethod: "Debit Card",
		notes: "Mandiri Debit Card checkout.",
		items: [
			{
				productId: "prd-9",
				name: "Adidas Ultraboost Light Running Shoes",
				sku: "ADS-UB-BLK-41",
				price: 2499000,
				qty: 2,
				total: 4998000,
				image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=150&auto=format&fit=crop&q=80",
			},
			{
				productId: "prd-sock",
				name: "Adidas Cushioned Sport Crew Socks (3-Pack)",
				sku: "ADS-SCK-WHT",
				price: 199000,
				qty: 1,
				total: 199000,
			},
		],
	},
	{
		id: "pos-trx-004",
		transactionId: "ID20261029001",
		date: "29/10/2026",
		qty: 1,
		totalPayment: 21999000,
		warehouse: "Warehouse A - Central Jakarta",
		cashierName: "Adit Gocendra",
		paymentMethod: "Credit Card",
		notes: "BCA Visa Signature Card 0% 12 months installment.",
		items: [
			{
				productId: "prd-1",
				name: "Apple iPhone 15 Pro Max 256GB Natural Titanium",
				sku: "APL-IP15PM-NT-256",
				price: 21999000,
				qty: 1,
				total: 21999000,
				image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=150&auto=format&fit=crop&q=80",
			},
		],
	},
	{
		id: "pos-trx-005",
		transactionId: "ID20261029002",
		date: "29/10/2026",
		qty: 4,
		totalPayment: 1850000,
		warehouse: "Warehouse C - West Bandung",
		cashierName: "Dewi Sartika",
		paymentMethod: "Cash",
		notes: "Walk-in purchase. Printed duplicate receipt.",
		items: [
			{
				productId: "prd-acc-1",
				name: "Braided USB-C Cable",
				sku: "ACC-CBL-2M",
				price: 200000,
				qty: 2,
				total: 400000,
			},
			{
				productId: "prd-acc-2",
				name: "65W GaN Dual USB-C Fast Wall Charger",
				sku: "ACC-CHG-65W",
				price: 450000,
				qty: 1,
				total: 450000,
			},
			{
				productId: "prd-acc-3",
				name: "Tempered Glass Screen Protector 9H",
				sku: "ACC-GLS-15P",
				price: 150000,
				qty: 1,
				total: 150000,
			},
		],
	},
	{
		id: "pos-trx-006",
		transactionId: "ID20261028001",
		date: "28/10/2026",
		qty: 1,
		totalPayment: 5899000,
		warehouse: "Warehouse B - East Surabaya",
		cashierName: "Budi Santoso",
		paymentMethod: "QRIS",
		notes: "ShopeePay QRIS settlement.",
		items: [
			{
				productId: "prd-7",
				name: "Xiaomi Robot Vacuum X20+",
				sku: "XMI-VACX20-WHT",
				price: 5899000,
				qty: 1,
				total: 5899000,
				image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80",
			},
		],
	},
	{
		id: "pos-trx-007",
		transactionId: "ID20261028002",
		date: "28/10/2026",
		qty: 2,
		totalPayment: 850000,
		warehouse: "Warehouse D - Semarang Hub",
		cashierName: "Ahmad Fauzi",
		paymentMethod: "Cash",
		notes: "Exact cash payment.",
		items: [
			{
				productId: "prd-acc-4",
				name: "Ergonomic Memory Foam Mousepad",
				sku: "ACC-MPD-ERG",
				price: 250000,
				qty: 1,
				total: 250000,
			},
			{
				productId: "prd-acc-5",
				name: "RGB Mechanical Keyboard Wrist Rest",
				sku: "ACC-WST-RGB",
				price: 600000,
				qty: 1,
				total: 600000,
			},
		],
	},
	{
		id: "pos-trx-008",
		transactionId: "ID20261027001",
		date: "27/10/2026",
		qty: 1,
		totalPayment: 20499000,
		warehouse: "Warehouse B - East Surabaya",
		cashierName: "Budi Santoso",
		paymentMethod: "Credit Card",
		notes: "BNI Mastercard World elite.",
		items: [
			{
				productId: "prd-2",
				name: "Samsung Galaxy S24 Ultra Titanium Gray 256GB",
				sku: "SSG-S24U-GR-256",
				price: 20499000,
				qty: 1,
				total: 20499000,
				image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&auto=format&fit=crop&q=80",
			},
		],
	},
	{
		id: "pos-trx-009",
		transactionId: "ID20261026001",
		date: "26/10/2026",
		qty: 3,
		totalPayment: 1250000,
		warehouse: "Warehouse A - Central Jakarta",
		cashierName: "Adit Gocendra",
		paymentMethod: "QRIS",
		notes: "GoPay QRIS promotion applied.",
		items: [
			{
				productId: "prd-acc-1",
				name: "Braided USB-C Cable",
				sku: "ACC-CBL-2M",
				price: 200000,
				qty: 2,
				total: 400000,
			},
			{
				productId: "prd-acc-2",
				name: "65W GaN Fast Charger",
				sku: "ACC-CHG-65W",
				price: 450000,
				qty: 1,
				total: 450000,
			},
			{
				productId: "prd-acc-6",
				name: "Magnetic Car Phone Mount",
				sku: "ACC-MNT-MAG",
				price: 400000,
				qty: 1,
				total: 400000,
			},
		],
	},
	{
		id: "pos-trx-010",
		transactionId: "ID20261025001",
		date: "25/10/2026",
		qty: 1,
		totalPayment: 19999000,
		warehouse: "Warehouse A - Central Jakarta",
		cashierName: "Adit Gocendra",
		paymentMethod: "Debit Card",
		notes: "BCA Debit payment.",
		items: [
			{
				productId: "prd-8",
				name: "Apple MacBook Air 13 M3 Midnight 16GB/512GB",
				sku: "APL-MBAM3-MID",
				price: 19999000,
				qty: 1,
				total: 19999000,
				image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&auto=format&fit=crop&q=80",
			},
		],
	},
	{
		id: "pos-trx-011",
		transactionId: "ID20261024001",
		date: "24/10/2026",
		qty: 2,
		totalPayment: 380000,
		warehouse: "Warehouse C - West Bandung",
		cashierName: "Dewi Sartika",
		paymentMethod: "Cash",
		notes: "Accessories package bundle.",
		items: [
			{
				productId: "prd-acc-7",
				name: "Screen Cleaning Kit Microfiber",
				sku: "ACC-CLN-KIT",
				price: 180000,
				qty: 1,
				total: 180000,
			},
			{
				productId: "prd-acc-1",
				name: "Braided USB-C Cable",
				sku: "ACC-CBL-2M",
				price: 200000,
				qty: 1,
				total: 200000,
			},
		],
	},
	{
		id: "pos-trx-012",
		transactionId: "ID20261023001",
		date: "23/10/2026",
		qty: 1,
		totalPayment: 34999000,
		warehouse: "Warehouse A - Central Jakarta",
		cashierName: "Adit Gocendra",
		paymentMethod: "Credit Card",
		notes: "Corporate company laptop purchase.",
		items: [
			{
				productId: "prd-6",
				name: "Asus ROG Zephyrus G16 Gaming Laptop RTX 4070",
				sku: "ASU-G16-RTX4070",
				price: 34999000,
				qty: 1,
				total: 34999000,
				image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&auto=format&fit=crop&q=80",
			},
		],
	},
];

