import generatedCatalog from "./supplier-catalog.generated.json";

export interface BrochureReference {
  document: string;
  page?: number;
  snippet?: string;
  image?: string;
}

export interface CatalogOption {
  value: string;
  references: BrochureReference[];
}

export interface SupplierDocument {
  name: string;
  type: "pdf" | "image-sequence";
  pages: number;
  samples?: string[];
}

export interface SupplierCatalogEntry {
  id: "howdens" | "wren" | "ikea" | "bq";
  label: string;
  sourceFolder: string;
  documents: SupplierDocument[];
  styles: CatalogOption[];
  colors: CatalogOption[];
  handles: CatalogOption[];
  worktops: CatalogOption[];
  appliances: CatalogOption[];
}

const WREN_FALLBACK: Omit<SupplierCatalogEntry, "sourceFolder" | "documents"> = {
  id: "wren",
  label: "Wren",
  styles: [
    { value: "Shaker", references: [{ document: "IMG_7684.PNG", image: "IMG_7684.PNG" }] },
    { value: "J-Pull", references: [{ document: "IMG_7693.PNG", image: "IMG_7693.PNG" }] },
    { value: "True Handleless", references: [{ document: "IMG_7703.PNG", image: "IMG_7703.PNG" }] },
    { value: "Slab Matt", references: [{ document: "IMG_7714.PNG", image: "IMG_7714.PNG" }] },
    { value: "Slab Gloss", references: [{ document: "IMG_7721.PNG", image: "IMG_7721.PNG" }] },
  ],
  colors: [
    { value: "Super White", references: [{ document: "IMG_7728.PNG", image: "IMG_7728.PNG" }] },
    { value: "Soft Grey", references: [{ document: "IMG_7729.PNG", image: "IMG_7729.PNG" }] },
    { value: "Pebble", references: [{ document: "IMG_7730.PNG", image: "IMG_7730.PNG" }] },
    { value: "Onyx", references: [{ document: "IMG_7731.PNG", image: "IMG_7731.PNG" }] },
    { value: "Midnight Blue", references: [{ document: "IMG_7732.PNG", image: "IMG_7732.PNG" }] },
    { value: "Sage", references: [{ document: "IMG_7733.PNG", image: "IMG_7733.PNG" }] },
    { value: "Oak", references: [{ document: "IMG_7734.PNG", image: "IMG_7734.PNG" }] },
    { value: "Cashmere", references: [{ document: "IMG_7735.PNG", image: "IMG_7735.PNG" }] },
    { value: "Black", references: [{ document: "IMG_7736.PNG", image: "IMG_7736.PNG" }] },
  ],
  handles: [
    { value: "J-Pull", references: [{ document: "IMG_7743.PNG", image: "IMG_7743.PNG" }] },
    { value: "Handleless Rail", references: [{ document: "IMG_7744.PNG", image: "IMG_7744.PNG" }] },
    { value: "Slim Bar Handle", references: [{ document: "IMG_7745.PNG", image: "IMG_7745.PNG" }] },
    { value: "Knob Handle", references: [{ document: "IMG_7746.PNG", image: "IMG_7746.PNG" }] },
    { value: "Cup Handle", references: [{ document: "IMG_7747.PNG", image: "IMG_7747.PNG" }] },
  ],
  worktops: [
    { value: "Laminate", references: [{ document: "IMG_7750.PNG", image: "IMG_7750.PNG" }] },
    { value: "Solid Surface", references: [{ document: "IMG_7751.PNG", image: "IMG_7751.PNG" }] },
    { value: "Quartz", references: [{ document: "IMG_7752.PNG", image: "IMG_7752.PNG" }] },
    { value: "Granite", references: [{ document: "IMG_7753.PNG", image: "IMG_7753.PNG" }] },
    { value: "Wood Effect", references: [{ document: "IMG_7754.PNG", image: "IMG_7754.PNG" }] },
  ],
  appliances: [
    { value: "Single Oven", references: [{ document: "IMG_7757.PNG", image: "IMG_7757.PNG" }] },
    { value: "Combi Microwave Oven", references: [{ document: "IMG_7758.PNG", image: "IMG_7758.PNG" }] },
    { value: "Induction Hob", references: [{ document: "IMG_7759.PNG", image: "IMG_7759.PNG" }] },
    { value: "Extractor Hood", references: [{ document: "IMG_7760.PNG", image: "IMG_7760.PNG" }] },
    { value: "Dishwasher", references: [{ document: "IMG_7761.PNG", image: "IMG_7761.PNG" }] },
  ],
};

type OptionGroupKey = "styles" | "colors" | "handles" | "worktops" | "appliances";

type SupplierOptionSupplement = Record<OptionGroupKey, CatalogOption[]>;

function createReference(document: string, page: number, snippet: string): BrochureReference {
  return { document, page, snippet };
}

const SUPPLIER_SUPPLEMENTS: Partial<
  Record<SupplierCatalogEntry["id"], Partial<SupplierOptionSupplement>>
> = {
  howdens: {
    styles: [
      { value: "Chilcomb", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 7, "Howdens range index and style families")] },
      { value: "Elmbridge", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 7, "Howdens range index and style families")] },
      { value: "Ilfracombe", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 7, "Howdens range index and style families")] },
      { value: "Greenwich", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 6, "Budget range with slab/handled or handleless doors")] },
      { value: "Clerkenwell", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 44, "Integrated J-pull handleless slab front")] },
      { value: "Hockley", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 6, "Hockley range listed in style families")] },
      { value: "Bridgemere", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 6, "Shaker range family listing")] },
      { value: "Allendale", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 6, "Shaker range family listing")] },
      { value: "Halesworth", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 1, "Range listing and summary")] },
      { value: "Witney", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 6, "Range listing and summary")] },
    ],
    colors: [
      { value: "Pale Plaster", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Mushroom", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Navy", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Fir Green", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Charcoal", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Truffle", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Antique Rose", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Earth Red", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Saffron", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Porcelain", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Linen", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Pebble", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Dove Grey", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Mist", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Seafoam", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Dusk Blue", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Laguna Blue", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Sage Green", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Reed Green", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Olive", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Ash Green", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Sandstone", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Deep Blue", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Willow Green", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
      { value: "Oak", references: [createReference("Howdens%20Classic%20Timber%20Kitchens.pdf", 13, "Colour Palette and 24-colour paint-to-order list")] },
    ],
  },
  ikea: {
    styles: [
      { value: "ASKERSUND", references: [createReference("ikea-kitchens.pdf", 16, "METOD slab front family")] },
      { value: "HAVSTORP", references: [createReference("ikea-kitchens.pdf", 17, "METOD slab front family")] },
      { value: "VALLSTENA", references: [createReference("ikea-kitchens.pdf", 18, "METOD slab front family")] },
      { value: "AXSTAD", references: [createReference("ikea-kitchens.pdf", 19, "METOD shaker front family")] },
      { value: "ENKÖPING", references: [createReference("ikea-kitchens.pdf", 20, "METOD shaker front family")] },
      { value: "FORSBACKA", references: [createReference("ikea-kitchens.pdf", 21, "METOD shaker front family")] },
      { value: "STENSUND", references: [createReference("ikea-kitchens.pdf", 22, "METOD framed front family")] },
      { value: "RINGHULT", references: [createReference("ikea-kitchens.pdf", 23, "METOD high gloss front family")] },
      { value: "UPPLÖV", references: [createReference("ikea-kitchens.pdf", 24, "METOD matt anthracite front family")] },
      { value: "VOXTORP", references: [createReference("ikea-kitchens.pdf", 25, "METOD J-pull integrated handle front")] },
      { value: "VÅRSTA", references: [createReference("ikea-kitchens.pdf", 26, "Stainless steel front family")] },
      { value: "TERRSJÖ", references: [createReference("ikea-kitchens.pdf", 27, "Wave-pattern decorative front family")] },
    ],
    colors: [
      { value: "Deep Green", references: [createReference("ikea-kitchens.pdf", 17, "HAVSTORP colour/design")] },
      { value: "White", references: [createReference("ikea-kitchens.pdf", 18, "VALLSTENA colour/design")] },
      { value: "Matt White", references: [createReference("ikea-kitchens.pdf", 19, "AXSTAD colour/design")] },
      { value: "White Wood Effect", references: [createReference("ikea-kitchens.pdf", 20, "ENKÖPING colour/design")] },
      { value: "Oak", references: [createReference("ikea-kitchens.pdf", 21, "FORSBACKA colour/design")] },
      { value: "High-Gloss Light Grey", references: [createReference("ikea-kitchens.pdf", 23, "RINGHULT colour/design")] },
      { value: "Matt Anthracite", references: [createReference("ikea-kitchens.pdf", 24, "UPPLÖV colour/design")] },
      { value: "Stainless Steel", references: [createReference("ikea-kitchens.pdf", 26, "VÅRSTA colour/design")] },
      { value: "Red-Brown", references: [createReference("ikea-kitchens.pdf", 27, "TERRSJÖ colour/design")] },
    ],
  },
  bq: {
    styles: [
      { value: "Ashmead Shaker", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 10, "Door styles and range mapping")] },
      { value: "Elcot Slab", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 10, "Door styles and range mapping")] },
      { value: "Alpinia Shaker", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 32, "Select kitchen family listing")] },
      { value: "Artemisia Shaker-Style", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 32, "Select kitchen family listing")] },
      { value: "Stevia Slab", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 32, "Select kitchen family listing")] },
      { value: "Garcinia Slab", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 32, "Select kitchen family listing")] },
      { value: "Tydeman Shaker", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 11, "Shaker range in painted colours")] },
    ],
    colors: [
      { value: "Dove Grey", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 10, "Door colour examples by range")] },
      { value: "Pebble", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 10, "Door colour examples by range")] },
      { value: "Reed Green", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 10, "Door colour examples by range")] },
      { value: "Midnight Blue", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 10, "Door colour examples by range")] },
      { value: "Dusk Blue", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 10, "Door colour examples by range")] },
      { value: "Ivory", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 10, "Door colour examples by range")] },
      { value: "Porcelain", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 11, "Door colour examples by range")] },
      { value: "Stone", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 11, "Door colour examples by range")] },
      { value: "Steel Grey", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 28, "Elcot steel grey feature page")] },
      { value: "White", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 26, "Elcot white feature page")] },
    ],
  },
};

function mergeReferences(left: BrochureReference[], right: BrochureReference[]): BrochureReference[] {
  const seen = new Set<string>();
  const merged: BrochureReference[] = [];
  for (const ref of [...left, ...right]) {
    const key = `${ref.document}|${ref.page ?? ""}|${ref.image ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(ref);
  }
  return merged;
}

function mergeOptions(base: CatalogOption[], supplements: CatalogOption[]): CatalogOption[] {
  const map = new Map<string, CatalogOption>();
  for (const option of base) {
    const key = option.value.trim().toLowerCase();
    if (!key) continue;
    map.set(key, {
      value: option.value.trim(),
      references: mergeReferences([], option.references),
    });
  }

  for (const extra of supplements) {
    const key = extra.value.trim().toLowerCase();
    if (!key) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        value: extra.value.trim(),
        references: mergeReferences([], extra.references),
      });
      continue;
    }
    map.set(key, {
      value: existing.value,
      references: mergeReferences(existing.references, extra.references),
    });
  }

  return Array.from(map.values());
}

function ensureOptionCoverage(entry: SupplierCatalogEntry): SupplierCatalogEntry {
  const coerce = (options: CatalogOption[]) => mergeOptions(options, []).slice(0, 80);
  return {
    ...entry,
    styles: coerce(entry.styles),
    colors: coerce(entry.colors),
    handles: coerce(entry.handles),
    worktops: coerce(entry.worktops),
    appliances: coerce(entry.appliances),
  };
}

const parsed = (generatedCatalog as { suppliers: SupplierCatalogEntry[] }).suppliers ?? [];

const mergedCatalog = parsed.map((supplier) => {
  const supplemental = SUPPLIER_SUPPLEMENTS[supplier.id] ?? {};
  const withSupplements: SupplierCatalogEntry = {
    ...supplier,
    styles: mergeOptions(supplier.styles, supplemental.styles ?? []),
    colors: mergeOptions(supplier.colors, supplemental.colors ?? []),
    handles: mergeOptions(supplier.handles, supplemental.handles ?? []),
    worktops: mergeOptions(supplier.worktops, supplemental.worktops ?? []),
    appliances: mergeOptions(supplier.appliances, supplemental.appliances ?? []),
  };

  if (supplier.id !== "wren") {
    return ensureOptionCoverage(withSupplements);
  }

  const imageSequenceDoc = withSupplements.documents.find((doc) => doc.type === "image-sequence");
  const withFallback: SupplierCatalogEntry = {
    ...withSupplements,
    styles: withSupplements.styles.length > 0 ? withSupplements.styles : WREN_FALLBACK.styles,
    colors: withSupplements.colors.length > 0 ? withSupplements.colors : WREN_FALLBACK.colors,
    handles: withSupplements.handles.length > 0 ? withSupplements.handles : WREN_FALLBACK.handles,
    worktops: withSupplements.worktops.length > 0 ? withSupplements.worktops : WREN_FALLBACK.worktops,
    appliances:
      withSupplements.appliances.length > 0 ? withSupplements.appliances : WREN_FALLBACK.appliances,
    documents: imageSequenceDoc
      ? withSupplements.documents
      : [
          ...withSupplements.documents,
          {
            name: "Wren image set",
            type: "image-sequence",
            pages: 0,
            samples: WREN_FALLBACK.styles.map((item) => item.references[0]?.image || "").filter(Boolean),
          },
        ],
  };
  return ensureOptionCoverage(withFallback);
});

export const SUPPLIER_CATALOG = mergedCatalog as SupplierCatalogEntry[];

export type SupplierId = (typeof SUPPLIER_CATALOG)[number]["id"];

export function getSupplierCatalogById(id: string): SupplierCatalogEntry | null {
  return SUPPLIER_CATALOG.find((entry) => entry.id === id) ?? null;
}

export function getSupplierOptionValues(
  supplier: SupplierCatalogEntry,
  type: "styles" | "colors" | "handles" | "worktops" | "appliances"
): string[] {
  return supplier[type].map((item) => item.value);
}
