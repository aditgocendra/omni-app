export interface CategoryNode {
	id: string;
	name: string; // Primary name in English (English-first)
	nameId?: string; // Indonesian translation
	children?: CategoryNode[];
}

export interface FlattenedCategory {
	node: CategoryNode;
	path: CategoryNode[];
	breadcrumb: string;
}

export function getNodeName(node: CategoryNode, locale: string = "en"): string {
	if (locale === "id" && node.nameId) {
		return node.nameId;
	}
	return node.name;
}

export const nestedCategories: CategoryNode[] = [
	{
		id: "beauty-personal-care",
		name: "Beauty & Personal Care",
		nameId: "Perawatan & Kecantikan",
		children: [
			{
				id: "hand-foot-nail-care",
				name: "Hand, Foot & Nail Care",
				nameId: "Perawatan Tangan, Kaki & Kuku",
				children: [
					{
						id: "hand-care",
						name: "Hand Care",
						nameId: "Perawatan Tangan",
						children: [
							{ id: "hand-cream", name: "Hand Cream & Lotion", nameId: "Krim & Losion Tangan" },
							{ id: "hand-wash", name: "Hand Wash & Soap", nameId: "Sabun Cuci Tangan" },
							{ id: "hand-mask", name: "Hand Mask", nameId: "Masker Tangan" },
							{ id: "other-hand-care", name: "Other Hand Care", nameId: "Perawatan Tangan Lainnya" }
						]
					},
					{
						id: "foot-care",
						name: "Foot Care",
						nameId: "Perawatan Kaki",
						children: [
							{ id: "foot-deodorant", name: "Foot Deodorant", nameId: "Deodoran Kaki" },
							{ id: "foot-mask", name: "Foot Mask", nameId: "Masker Kaki" },
							{ id: "foot-cream-scrub", name: "Lotion, Cream & Scrub", nameId: "Lotion, Cream & Scrub" },
							{ id: "other-foot-care", name: "Other Foot Care", nameId: "Perawatan Kaki Lainnya" }
						]
					},
					{
						id: "nail-care",
						name: "Nail Care",
						nameId: "Perawatan Kuku",
						children: [
							{ id: "nail-polish", name: "Nail Polish", nameId: "Cat Kuku" },
							{ id: "nail-polish-remover", name: "Nail Polish Remover", nameId: "Pembersih Cat Kuku" },
							{ id: "nail-art", name: "Nail Art & Stickers", nameId: "Nail Art & Aksesoris" },
							{ id: "nail-tools", name: "Clippers & Files", nameId: "Gunting & Kikir Kuku" }
						]
					},
					{
						id: "other-hand-foot-nail",
						name: "Other Hand, Foot & Nail Care",
						nameId: "Perawatan Tangan, Kaki & Kuku Lainnya"
					}
				]
			},
			{
				id: "hair-care",
				name: "Hair Care",
				nameId: "Perawatan Rambut",
				children: [
					{ id: "shampoo", name: "Shampoo", nameId: "Sampo" },
					{ id: "conditioner", name: "Conditioner", nameId: "Kondisioner" },
					{ id: "hair-oil-serum", name: "Hair Oils & Serums", nameId: "Minyak & Serum Rambut" },
					{ id: "hair-color", name: "Hair Color", nameId: "Pewarna Rambut" },
					{ id: "hair-mask", name: "Hair Masks & Treatments", nameId: "Masker & Treatment Rambut" }
				]
			},
			{
				id: "mens-grooming",
				name: "Men's Care",
				nameId: "Perawatan Pria",
				children: [
					{ id: "mens-cleanser", name: "Men's Facial Cleansers", nameId: "Pembersih Wajah Pria" },
					{ id: "pomade-wax", name: "Pomades, Gels & Wax", nameId: "Pomade & Gel Rambut" },
					{ id: "shaving-creams", name: "Shaving Cream & Razors", nameId: "Alat & Krim Cukur" },
					{ id: "mens-deodorant", name: "Men's Deodorants", nameId: "Deodoran Pria" }
				]
			},
			{
				id: "fragrances",
				name: "Fragrance & Perfume",
				nameId: "Parfum & Wewangian",
				children: [
					{ id: "edp", name: "Eau de Parfum (EDP)", nameId: "Eau de Parfum (EDP)" },
					{ id: "edt", name: "Eau de Toilette (EDT)", nameId: "Eau de Toilette (EDT)" },
					{ id: "body-mist", name: "Body Mist & Cologne", nameId: "Body Mist & Cologne" },
					{ id: "solid-perfume", name: "Roll-on & Solid Perfume", nameId: "Parfum Roll On & Solid" }
				]
			},
			{
				id: "cosmetics",
				name: "Cosmetics",
				nameId: "Kosmetik",
				children: [
					{ id: "lip-products", name: "Lipsticks & Lip Tints", nameId: "Lipstik & Lip Tint" },
					{ id: "foundations", name: "Foundations & Cushions", nameId: "Bedak & Foundation" },
					{ id: "mascara-eyeliner", name: "Mascara & Eyeliner", nameId: "Maskara & Eyeliner" },
					{ id: "blush-contour", name: "Blush, Contour & Highlighters", nameId: "Blush On & Highlighter" }
				]
			},
			{
				id: "beauty-tools",
				name: "Beauty Tools",
				nameId: "Alat Kecantikan",
				children: [
					{ id: "brushes-sponges", name: "Makeup Brushes & Sponges", nameId: "Kuas & Spons Makeup" },
					{ id: "eyelash-curler", name: "Eyelash Curlers", nameId: "Penjepit Bulu Mata" },
					{ id: "vanity-mirrors", name: "Vanity Mirrors", nameId: "Cermin Rias LED" }
				]
			},
			{
				id: "facial-skincare",
				name: "Facial Care",
				nameId: "Perawatan Wajah",
				children: [
					{ id: "face-wash", name: "Facial Wash & Cleanser", nameId: "Pembersih Wajah" },
					{ id: "toner-essence", name: "Toner & Essence", nameId: "Toner & Essence" },
					{ id: "face-serum", name: "Face Serums & Ampoules", nameId: "Serum & Ampoule" },
					{ id: "moisturizer", name: "Face Moisturizer", nameId: "Pelembab Wajah" },
					{ id: "sunscreen", name: "Sunscreen & Sun Care", nameId: "Tabir Surya (Sunscreen)" },
					{ id: "face-masks", name: "Sheet Masks & Clay Masks", nameId: "Sheet Mask & Clay Mask" }
				]
			},
			{
				id: "beauty-sets",
				name: "Beauty Sets & Packages",
				nameId: "Paket & Set Kecantikan",
				children: [
					{ id: "skincare-bundles", name: "Skincare Bundles", nameId: "Paket Skincare Harian" },
					{ id: "makeup-kits", name: "Makeup Kits", nameId: "Paket Makeup Starter Kit" },
					{ id: "gift-sets", name: "Beauty Gift Sets", nameId: "Gift Set Kecantikan" }
				]
			},
			{
				id: "other-beauty-care",
				name: "Other Beauty Care",
				nameId: "Perawatan & Kecantikan Lainnya"
			},
			{
				id: "body-care",
				name: "Body Care",
				nameId: "Perawatan Tubuh",
				children: [
					{ id: "body-wash", name: "Body Wash & Shower Gels", nameId: "Sabun Mandi (Body Wash)" },
					{ id: "body-lotion", name: "Body Lotions & Butters", nameId: "Body Lotion & Body Butter" },
					{ id: "body-scrub", name: "Body Scrubs & Exfoliators", nameId: "Body Scrub & Lulur Tubuh" },
					{ id: "body-deodorant", name: "Deodorant & Antiperspirants", nameId: "Deodoran & Antiperspirant" }
				]
			}
		]
	},
	{
		id: "womens-apparel",
		name: "Women's Apparel",
		nameId: "Pakaian Wanita",
		children: [
			{
				id: "womens-tops",
				name: "Women's Tops",
				nameId: "Atasan Wanita",
				children: [
					{ id: "womens-tshirts", name: "T-Shirts & Tanks", nameId: "Kaos & T-Shirt" },
					{ id: "blouses-shirts", name: "Blouses & Shirts", nameId: "Kemeja & Blouse" },
					{ id: "crop-tops", name: "Crop Tops", nameId: "Crop Top" },
					{ id: "knitwear-sweaters", name: "Knitwear & Sweaters", nameId: "Rajut & Knitwear" }
				]
			},
			{
				id: "womens-bottoms",
				name: "Women's Bottoms",
				nameId: "Bawahan Wanita",
				children: [
					{ id: "womens-pants", name: "Pants & Trousers", nameId: "Celana Panjang" },
					{ id: "culottes", name: "Culottes", nameId: "Celana Kulot" },
					{ id: "womens-shorts", name: "Shorts", nameId: "Celana Pendek" },
					{ id: "long-skirts", name: "Maxi & Midi Skirts", nameId: "Rok Panjang" }
				]
			},
			{
				id: "dresses-jumpsuits",
				name: "Dresses & Jumpsuits",
				nameId: "Dress & Jumpsuit",
				children: [
					{ id: "casual-dresses", name: "Casual Dresses", nameId: "Casual Dress" },
					{ id: "maxi-dresses", name: "Maxi Dresses", nameId: "Maxi Dress" },
					{ id: "jumpsuits", name: "Jumpsuits & Overalls", nameId: "Jumpsuit & Overall" }
				]
			},
			{
				id: "womens-outerwear",
				name: "Outerwear",
				nameId: "Outerwear Wanita",
				children: [
					{ id: "cardigans", name: "Cardigans", nameId: "Cardigan" },
					{ id: "blazers", name: "Formal Blazers", nameId: "Blazer Formal" },
					{ id: "womens-jackets", name: "Jackets & Coats", nameId: "Jaket & Mantel" }
				]
			}
		]
	},
	{
		id: "mens-apparel",
		name: "Men's Apparel",
		nameId: "Pakaian Pria",
		children: [
			{
				id: "mens-tops",
				name: "Men's Tops",
				nameId: "Atasan Pria",
				children: [
					{ id: "mens-plain-tees", name: "Plain T-Shirts", nameId: "Kaos Polos" },
					{ id: "mens-graphic-tees", name: "Graphic T-Shirts", nameId: "Kaos Grafis" },
					{ id: "short-sleeve-shirts", name: "Short Sleeve Shirts", nameId: "Kemeja Lengan Pendek" },
					{ id: "long-sleeve-shirts", name: "Long Sleeve Shirts", nameId: "Kemeja Lengan Panjang" },
					{ id: "polo-shirts", name: "Polo Shirts", nameId: "Polo Shirt" }
				]
			},
			{
				id: "mens-bottoms",
				name: "Men's Bottoms",
				nameId: "Bawahan Pria",
				children: [
					{ id: "chino-pants", name: "Chino Pants", nameId: "Celana Chino" },
					{ id: "mens-jeans", name: "Denim & Jeans", nameId: "Celana Jeans" },
					{ id: "formal-trousers", name: "Formal Trousers", nameId: "Celana Bahan / Formal" },
					{ id: "mens-shorts", name: "Shorts", nameId: "Celana Pendek Pria" }
				]
			},
			{
				id: "mens-outerwear",
				name: "Men's Outerwear",
				nameId: "Outerwear Pria",
				children: [
					{ id: "bomber-jackets", name: "Bomber Jackets", nameId: "Jaket Bomber" },
					{ id: "mens-hoodies", name: "Hoodies & Sweatshirts", nameId: "Hoodie & Sweatshirt" },
					{ id: "denim-jackets", name: "Denim Jackets", nameId: "Jaket Denim" }
				]
			}
		]
	},
	{
		id: "health-wellness",
		name: "Health & Wellness",
		nameId: "Kesehatan",
		children: [
			{
				id: "vitamins-supplements",
				name: "Vitamins & Supplements",
				nameId: "Suplemen & Vitamin",
				children: [
					{ id: "multivitamins", name: "Multivitamins", nameId: "Multivitamin Harian" },
					{ id: "vitamin-c-d", name: "Vitamin C & D", nameId: "Vitamin C & Vitamin D" },
					{ id: "immune-boosters", name: "Immune Boosters", nameId: "Suplemen Daya Tahan Tubuh" }
				]
			},
			{
				id: "first-aid-medical",
				name: "Medical & First Aid",
				nameId: "Alat Medis & Perlengkapan P3K",
				children: [
					{ id: "medical-masks", name: "Medical Masks", nameId: "Masker Medis & KN95" },
					{ id: "blood-pressure-monitors", name: "Digital Blood Pressure Monitors", nameId: "Tensimeter Digital" },
					{ id: "thermometers", name: "Thermometers", nameId: "Termometer Suhu Tubuh" }
				]
			}
		]
	},
	{
		id: "fashion-accessories",
		name: "Fashion Accessories",
		nameId: "Aksesoris Fashion",
		children: [
			{
				id: "watches",
				name: "Watches",
				nameId: "Jam Tangan",
				children: [
					{ id: "mens-watches", name: "Men's Watches", nameId: "Jam Tangan Pria" },
					{ id: "womens-watches", name: "Women's Watches", nameId: "Jam Tangan Wanita" }
				]
			},
			{
				id: "eyewear",
				name: "Eyewear",
				nameId: "Kacamata & Aksesoris",
				children: [
					{ id: "sunglasses", name: "Sunglasses", nameId: "Kacamata Hitam (Sunglasses)" },
					{ id: "blue-light-glasses", name: "Anti-Radiation Glasses", nameId: "Kacamata Anti Radiasi" }
				]
			}
		]
	},
	{
		id: "electronics",
		name: "Electronics",
		nameId: "Elektronik",
		children: [
			{
				id: "audio-speakers",
				name: "Audio & Speakers",
				nameId: "Audio & Speaker",
				children: [
					{ id: "bluetooth-speakers", name: "Bluetooth Speakers", nameId: "Speaker Bluetooth Portabel" },
					{ id: "soundbars", name: "Soundbars & Home Theaters", nameId: "Soundbar & Home Theater" },
					{ id: "headphones", name: "TWS Earbuds & Headphones", nameId: "Earphone TWS & Headphone" }
				]
			},
			{
				id: "televisions",
				name: "Televisions & Video",
				nameId: "Televisi & Perangkat Video",
				children: [
					{ id: "smart-tvs", name: "Smart TVs & 4K TVs", nameId: "Smart TV & Android TV" },
					{ id: "streaming-devices", name: "TV Boxes & Sticks", nameId: "Set Top Box & TV Stick" }
				]
			},
			{
				id: "home-appliances",
				name: "Small Home Appliances",
				nameId: "Elektronik Rumah Tangga",
				children: [
					{ id: "air-fryers", name: "Air Fryers & Electric Ovens", nameId: "Air Fryer & Oven Listrik" },
					{ id: "air-purifiers", name: "Air Purifiers & Humidifiers", nameId: "Air Purifier & Humidifier" },
					{ id: "vacuum-cleaners", name: "Robot & Stick Vacuums", nameId: "Vacuum Cleaner Robot & Stick" }
				]
			}
		]
	},
	{
		id: "mens-shoes",
		name: "Men's Shoes",
		nameId: "Sepatu Pria",
		children: [
			{
				id: "mens-sneakers",
				name: "Men's Sneakers",
				nameId: "Sneakers Pria",
				children: [
					{ id: "casual-sneakers", name: "Casual Sneakers", nameId: "Sneakers Kasual" },
					{ id: "running-shoes", name: "Running Shoes", nameId: "Sepatu Lari (Running)" },
					{ id: "chunky-sneakers", name: "Chunky Sneakers", nameId: "Chunky Sneakers" }
				]
			},
			{
				id: "formal-shoes",
				name: "Formal & Dress Shoes",
				nameId: "Sepatu Formal & Kasual",
				children: [
					{ id: "oxford-shoes", name: "Oxfords & Derbies", nameId: "Oxford & Derby" },
					{ id: "loafers", name: "Loafers & Slip-ons", nameId: "Loafers & Moccasins" },
					{ id: "mens-boots", name: "Boots", nameId: "Boots Pria" }
				]
			}
		]
	},
	{
		id: "mobile-gadgets",
		name: "Mobile & Gadgets",
		nameId: "Handphone & Aksesoris",
		children: [
			{
				id: "smartphones",
				name: "Smartphones",
				nameId: "Handphone & Smartphone",
				children: [
					{ id: "android-phones", name: "Android Phones", nameId: "Smartphone Android" },
					{ id: "iphones", name: "Apple iPhones", nameId: "Apple iPhone" }
				]
			},
			{
				id: "tablets",
				name: "Tablets & e-Readers",
				nameId: "Tablet & e-Reader",
				children: [
					{ id: "ipads", name: "Apple iPads", nameId: "Apple iPad" },
					{ id: "android-tablets", name: "Android Tablets", nameId: "Tablet Android" }
				]
			},
			{
				id: "mobile-accessories",
				name: "Mobile Accessories",
				nameId: "Aksesoris Handphone",
				children: [
					{ id: "phone-cases", name: "Cases & Covers", nameId: "Case & Casing Smartphone" },
					{ id: "screen-protectors", name: "Screen Protectors", nameId: "Screen Protector / Tempered Glass" },
					{ id: "chargers-cables", name: "Chargers & Fast Cables", nameId: "Kabel Data & Fast Charger" }
				]
			}
		]
	},
	{
		id: "muslim-fashion",
		name: "Muslim Fashion",
		nameId: "Fashion Muslim",
		children: [
			{
				id: "womens-muslim-wear",
				name: "Women's Islamic Wear",
				nameId: "Busana Muslim Wanita",
				children: [
					{ id: "abayas-gamis", name: "Abayas & Gamis", nameId: "Gamis & Abaya" },
					{ id: "tunics", name: "Islamic Tunics", nameId: "Tunik Muslim" },
					{ id: "hijabs", name: "Hijabs & Scarves", nameId: "Hijab & Jilbab" }
				]
			},
			{
				id: "mens-muslim-wear",
				name: "Men's Islamic Wear",
				nameId: "Busana Muslim Pria",
				children: [
					{ id: "koko-shirts", name: "Koko Shirts", nameId: "Baju Koko" },
					{ id: "kurtas", name: "Kurtas", nameId: "Kurta & Gamis Pria" },
					{ id: "sarongs", name: "Sarongs", nameId: "Sarung Tenun & Motif" }
				]
			}
		]
	},
	{
		id: "luggage-travel",
		name: "Luggage & Travel Bags",
		nameId: "Koper & Tas Travel",
		children: [
			{
				id: "suitcases",
				name: "Suitcases & Luggage",
				nameId: "Koper & Bagasi",
				children: [
					{ id: "cabin-luggage", name: "Cabin Luggage (20\")", nameId: "Koper Kabin (20 Inch)" },
					{ id: "checked-luggage", name: "Checked Luggage (24-28\")", nameId: "Koper Bagasi (24-28 Inch)" }
				]
			},
			{
				id: "travel-bags",
				name: "Travel Bags & Duffles",
				nameId: "Tas Travel & Duffle",
				children: [
					{ id: "duffle-bags", name: "Duffle Bags", nameId: "Duffle Bag & Tas Gym" },
					{ id: "travel-backpacks", name: "Travel Backpacks", nameId: "Backpack & Ransel Travelling" }
				]
			}
		]
	},
	{
		id: "womens-shoes",
		name: "Women's Shoes",
		nameId: "Sepatu Wanita",
		children: [
			{
				id: "womens-sneakers",
				name: "Women's Sneakers",
				nameId: "Sneakers Wanita",
				children: [
					{ id: "white-sneakers", name: "White Casual Sneakers", nameId: "Sneakers Putih Kasual" },
					{ id: "slip-on-sneakers", name: "Slip-on Sneakers", nameId: "Slip On & Walking Shoes" }
				]
			},
			{
				id: "heels",
				name: "Heels & Wedges",
				nameId: "Heels & Wedges",
				children: [
					{ id: "high-heels", name: "High Heels & Pumps", nameId: "High Heels & Stiletto" },
					{ id: "wedges", name: "Wedges", nameId: "Wedges Wanita" }
				]
			}
		]
	},
	{
		id: "computers-accessories",
		name: "Computers & Accessories",
		nameId: "Komputer & Aksesoris",
		children: [
			{
				id: "laptops",
				name: "Laptops",
				nameId: "Laptop & PC",
				children: [
					{ id: "ultrabooks", name: "Business Ultrabooks", nameId: "Laptop Bisnis & Ultrabook" },
					{ id: "gaming-laptops", name: "Gaming Laptops", nameId: "Laptop Gaming" }
				]
			},
			{
				id: "computer-components",
				name: "PC Components",
				nameId: "Komponen Komputer",
				children: [
					{ id: "processors", name: "Processors (CPUs)", nameId: "Processor (CPU)" },
					{ id: "graphic-cards", name: "Graphics Cards (GPUs)", nameId: "Kartu Grafis (GPU)" },
					{ id: "memory-ram", name: "Desktop & Laptop RAM", nameId: "RAM Desktop & Laptop" }
				]
			},
			{
				id: "computer-peripherals",
				name: "Peripherals & Accessories",
				nameId: "Aksesoris & Periferal",
				children: [
					{ id: "keyboards", name: "Mechanical Keyboards", nameId: "Mechanical Keyboard" },
					{ id: "mice", name: "Ergonomic & Gaming Mice", nameId: "Mouse Gaming & Ergonomis" },
					{ id: "monitors", name: "Monitors", nameId: "Monitor Gaming & Desain" }
				]
			}
		]
	},
	{
		id: "food-beverages",
		name: "Food & Beverages",
		nameId: "Makanan & Minuman",
		children: [
			{
				id: "beverages",
				name: "Coffee & Tea",
				nameId: "Kopi, Teh & Minuman",
				children: [
					{ id: "coffee-beans", name: "Coffee Beans & Ground", nameId: "Biji Kopi & Kopi Bubuk" },
					{ id: "tea", name: "Artisan & Herbal Tea", nameId: "Teh Celup & Teh Herbal" }
				]
			},
			{
				id: "snacks",
				name: "Snacks & Sweets",
				nameId: "Makanan Ringan & Snack",
				children: [
					{ id: "chips-crisps", name: "Chips & Crisps", nameId: "Keripik & Kerupuk Gurih" },
					{ id: "cookies-biscuits", name: "Cookies & Biscuits", nameId: "Biskuit, Wafer & Cookies" }
				]
			}
		]
	},
	{
		id: "home-living",
		name: "Home & Living",
		nameId: "Perlengkapan Rumah",
		children: [
			{
				id: "bedding",
				name: "Bedding & Linens",
				nameId: "Perlengkapan Kamar Tidur",
				children: [
					{ id: "bedsheets", name: "Bedsheet Sets", nameId: "Sprei & Bed Cover" },
					{ id: "pillows", name: "Memory Foam Pillows", nameId: "Bantal & Guling Memory Foam" }
				]
			},
			{
				id: "home-decor",
				name: "Home Decor",
				nameId: "Dekorasi & Ruang Tamu",
				children: [
					{ id: "rugs-carpets", name: "Area Rugs & Mats", nameId: "Karpet Lantai Ruang Tamu" },
					{ id: "diffusers", name: "Reed Diffusers & Scents", nameId: "Reed Diffuser & Aromaterapi" }
				]
			}
		]
	},
	{
		id: "automotive",
		name: "Automotive",
		nameId: "Otomotif",
		children: [
			{
				id: "car-accessories",
				name: "Car Accessories",
				nameId: "Aksesoris & Perlengkapan Mobil",
				children: [
					{ id: "car-mats", name: "All-Weather Car Mats", nameId: "Karpet Mobil 5D / PVC" },
					{ id: "dash-cams", name: "Dash Cameras", nameId: "Dashcam Kamera Mobil" }
				]
			},
			{
				id: "motorcycle-gear",
				name: "Motorcycle Accessories",
				nameId: "Aksesoris & Perlengkapan Motor",
				children: [
					{ id: "helmets", name: "Helmets", nameId: "Helm Full Face & Half Face" },
					{ id: "riding-gloves", name: "Riding Gloves", nameId: "Sarung Tangan Riding" }
				]
			}
		]
	},
	{
		id: "sports-outdoors",
		name: "Sports & Outdoors",
		nameId: "Olahraga & Outdoor",
		children: [
			{
				id: "fitness-gear",
				name: "Fitness & Gym",
				nameId: "Fitness & Gym",
				children: [
					{ id: "dumbbells", name: "Dumbbells & Weights", nameId: "Dumbbell & Barbell" },
					{ id: "yoga-mats", name: "Yoga Mats", nameId: "Matras Yoga Anti Slip" }
				]
			},
			{
				id: "camping",
				name: "Camping & Hiking",
				nameId: "Camping & Hiking Outdoor",
				children: [
					{ id: "tents", name: "Camping Tents", nameId: "Tenda Camping Dome" },
					{ id: "sleeping-bags", name: "Sleeping Bags", nameId: "Sleeping Bag & Matras Angin" }
				]
			}
		]
	},
	{
		id: "books-stationery",
		name: "Books & Stationery",
		nameId: "Buku & Alat Tulis",
		children: [
			{
				id: "stationery-supplies",
				name: "Office & School Stationery",
				nameId: "Alat Tulis Sekolah & Kantor",
				children: [
					{ id: "gel-pens", name: "Gel Pens & Markers", nameId: "Pulpen Gel & Ballpoint" },
					{ id: "notebooks", name: "Notebooks & Planners", nameId: "Buku Tulis, Catatan & Binder" }
				]
			}
		]
	},
	{
		id: "hobbies-collections",
		name: "Hobbies & Collections",
		nameId: "Hobi & Koleksi",
		children: [
			{
				id: "figures-models",
				name: "Action Figures & Model Kits",
				nameId: "Action Figure & Model Kit",
				children: [
					{ id: "model-kits", name: "Scale & Robot Model Kits", nameId: "Gundam & Gunpla Model Kit" },
					{ id: "diecast", name: "Diecast Scale Models", nameId: "Diecast & Miniatur Mobil" }
				]
			}
		]
	},
	{
		id: "mom-baby",
		name: "Mom & Baby",
		nameId: "Ibu & Bayi",
		children: [
			{
				id: "diapers-wipes",
				name: "Diapers & Baby Care",
				nameId: "Popok & Kebersihan Bayi",
				children: [
					{ id: "baby-diapers", name: "Baby Diapers", nameId: "Popok Celana / Perekat" },
					{ id: "baby-wipes", name: "Gentle Baby Wipes", nameId: "Tisu Basah Khusus Bayi" }
				]
			}
		]
	}
];

// Helper to flatten categories for fast full-text search
export function getAllFlattenedCategories(
	nodes: CategoryNode[] = nestedCategories,
	currentPath: CategoryNode[] = [],
	locale: string = "en"
): FlattenedCategory[] {
	let results: FlattenedCategory[] = [];

	for (const node of nodes) {
		const nextPath = [...currentPath, node];
		const breadcrumb = nextPath.map((n) => getNodeName(n, locale)).join(" > ");

		results.push({
			node,
			path: nextPath,
			breadcrumb
		});

		if (node.children && node.children.length > 0) {
			results = results.concat(getAllFlattenedCategories(node.children, nextPath, locale));
		}
	}

	return results;
}

// Helper to resolve an initial string path to CategoryNode array (matches both EN and ID names)
export function resolvePathFromBreadcrumb(
	breadcrumb: string,
	nodes: CategoryNode[] = nestedCategories
): CategoryNode[] {
	if (!breadcrumb || !breadcrumb.trim()) return [];

	const parts = breadcrumb.split(">").map((s) => s.trim().toLowerCase());
	if (parts.length === 0) return [];

	const path: CategoryNode[] = [];
	let currentLevel: CategoryNode[] | undefined = nodes;

	for (const part of parts) {
		if (!currentLevel) break;
		const match: CategoryNode | undefined = currentLevel.find((n: CategoryNode): boolean => {
			const nameEn = n.name.toLowerCase();
			const nameId = n.nameId ? n.nameId.toLowerCase() : "";
			return (
				nameEn === part ||
				nameEn.includes(part) ||
				part.includes(nameEn) ||
				(nameId !== "" && (nameId === part || nameId.includes(part) || part.includes(nameId)))
			);
		});

		if (match) {
			path.push(match);
			currentLevel = match.children;
		} else {
			break;
		}
	}

	return path;
}
