export interface SupplierCatalogEntry {
  id: "howdens" | "wren" | "ikea" | "bq";
  label: string;
  sourceFiles: string[];
  styles: string[];
  colors: string[];
  handles: string[];
  worktops: string[];
  appliances: string[];
}

export const SUPPLIER_CATALOG: SupplierCatalogEntry[] = [
  {
    id: "howdens",
    label: "Howdens",
    sourceFiles: [
      "Howdens Kitchen Brochure.pdf",
      "Howdens Classic Timber Kitchens.pdf",
    ],
    styles: [
      "Shaker",
      "In-Frame",
      "Slab",
      "Classic Timber",
      "Modern Handleless",
    ],
    colors: [
      "Chalk White",
      "Porcelain",
      "Cashmere",
      "Dove Grey",
      "Navy",
      "Graphite",
      "Natural Oak",
      "Walnut",
      "Black",
    ],
    handles: [
      "Brushed Nickel Bar",
      "Brass Knob",
      "Cup Handle",
      "Rail Handle",
      "Handleless Rail",
    ],
    worktops: [
      "Laminate",
      "Compact Laminate",
      "Quartz",
      "Granite",
      "Solid Timber",
    ],
    appliances: [
      "Single Oven",
      "Double Oven",
      "Induction Hob",
      "Gas Hob",
      "Integrated Extractor",
      "Fridge Freezer",
      "Dishwasher",
      "Microwave",
    ],
  },
  {
    id: "wren",
    label: "Wren",
    sourceFiles: ["Big Book singles by Wren Kitchens (image set)"],
    styles: [
      "Shaker",
      "J-Pull Handleless",
      "True Handleless",
      "Slab Matt",
      "Slab Gloss",
    ],
    colors: [
      "Super White",
      "Soft Grey",
      "Pebble",
      "Onyx",
      "Midnight Blue",
      "Sage",
      "Oak",
      "Cashmere",
      "Black",
    ],
    handles: [
      "J-Pull",
      "Handleless Rail",
      "Slim Bar Handle",
      "Knob Handle",
      "Cup Handle",
    ],
    worktops: [
      "Laminate",
      "Solid Surface",
      "Quartz",
      "Granite",
      "Wood Effect",
    ],
    appliances: [
      "Single Oven",
      "Combi Microwave Oven",
      "Induction Hob",
      "Extractor Hood",
      "Integrated Fridge",
      "Integrated Freezer",
      "Dishwasher",
      "Wine Cooler",
    ],
  },
  {
    id: "ikea",
    label: "IKEA",
    sourceFiles: ["ikea-kitchens.pdf", "ikea-appliances.pdf"],
    styles: [
      "Scandinavian",
      "Modern Minimal",
      "Classic Framed",
      "Matte Slab",
      "Wood Effect",
    ],
    colors: [
      "White",
      "Off-White",
      "Light Grey",
      "Dark Grey",
      "Black",
      "Blue",
      "Green",
      "Oak Effect",
      "Walnut Effect",
    ],
    handles: [
      "Integrated Handle",
      "Slim Bar Handle",
      "Round Knob",
      "Leather Loop Handle",
      "Cup Handle",
    ],
    worktops: [
      "Laminate",
      "Butcher Block",
      "Quartz",
      "Porcelain Effect",
      "Stone Effect",
    ],
    appliances: [
      "Single Oven",
      "Oven + Microwave Combo",
      "Induction Hob",
      "Gas Hob",
      "Extractor",
      "Fridge Freezer",
      "Dishwasher",
      "Warming Drawer",
    ],
  },
  {
    id: "bq",
    label: "B&Q",
    sourceFiles: [
      "UKKitchensbrochure-Kitchens.pdf",
      "UKKitchenspricelistw20-Kitchens.pdf",
      "UKAppliancesbrochure-Appliances.pdf",
      "KitchenBathroom-Splashwall-2024-Kitchens-Brochure.pdf",
      "partner-Hi-Macs-My-Worktops-Brocure-Jun23.pdf",
    ],
    styles: [
      "Shaker",
      "Contemporary Slab",
      "Handleless",
      "Traditional",
      "Industrial",
    ],
    colors: [
      "White",
      "Ivory",
      "Cashmere",
      "Light Grey",
      "Graphite",
      "Navy",
      "Sage",
      "Oak",
      "Black",
    ],
    handles: [
      "T-Bar Handle",
      "D-Handle",
      "Knob Handle",
      "Cup Handle",
      "Handleless Rail",
    ],
    worktops: [
      "Laminate",
      "Compact Laminate",
      "Solid Surface",
      "Quartz",
      "Hi-Macs",
    ],
    appliances: [
      "Single Oven",
      "Double Oven",
      "Induction Hob",
      "Gas Hob",
      "Extractor Hood",
      "Integrated Fridge",
      "Integrated Freezer",
      "Dishwasher",
    ],
  },
];

export type SupplierId = (typeof SUPPLIER_CATALOG)[number]["id"];

export function getSupplierCatalogById(id: string): SupplierCatalogEntry | null {
  return SUPPLIER_CATALOG.find((entry) => entry.id === id) ?? null;
}
