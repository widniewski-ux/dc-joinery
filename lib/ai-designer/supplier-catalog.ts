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
    { value: "Ultra Scandi", references: [{ document: "IMG_7693.PNG", image: "IMG_7693.PNG" }] },
    { value: "Milano Ultra", references: [{ document: "IMG_7697.PNG", image: "IMG_7697.PNG" }] },
    { value: "Country Inframe", references: [{ document: "IMG_7695.PNG", image: "IMG_7695.PNG" }] },
    { value: "Shaker Timber", references: [{ document: "IMG_7699.PNG", image: "IMG_7699.PNG" }] },
    { value: "Henley Timber", references: [{ document: "IMG_7703.PNG", image: "IMG_7703.PNG" }] },
    { value: "Shaker Chelsea", references: [{ document: "IMG_7705.PNG", image: "IMG_7705.PNG" }] },
    { value: "Handleless", references: [{ document: "IMG_7709.PNG", image: "IMG_7709.PNG" }] },
    { value: "Linea Elements", references: [{ document: "IMG_7711.PNG", image: "IMG_7711.PNG" }] },
    { value: "Shaker Five Piece", references: [{ document: "IMG_7713.PNG", image: "IMG_7713.PNG" }] },
    { value: "Country", references: [{ document: "IMG_7715.PNG", image: "IMG_7715.PNG" }] },
    { value: "Contour Woodgrain", references: [{ document: "IMG_7717.PNG", image: "IMG_7717.PNG" }] },
    { value: "Milano Contour", references: [{ document: "IMG_7718.PNG", image: "IMG_7718.PNG" }] },
    { value: "Shaker Slim", references: [{ document: "IMG_7723.PNG", image: "IMG_7723.PNG" }] },
    { value: "Milano Shaker Super Slim", references: [{ document: "IMG_7741.PNG", image: "IMG_7741.PNG" }] },
    { value: "Linea Autograph", references: [{ document: "IMG_7735.PNG", image: "IMG_7735.PNG" }] },
  ],
  colors: [
    { value: "Moss Green", references: [{ document: "IMG_7693.PNG", image: "IMG_7693.PNG" }] },
    { value: "Cloud", references: [{ document: "IMG_7697.PNG", image: "IMG_7697.PNG" }] },
    { value: "Cream", references: [{ document: "IMG_7695.PNG", image: "IMG_7695.PNG" }] },
    { value: "Whisper Grey", references: [{ document: "IMG_7699.PNG", image: "IMG_7699.PNG" }] },
    { value: "Regent Blue", references: [{ document: "IMG_7703.PNG", image: "IMG_7703.PNG" }] },
    { value: "Forest Green", references: [{ document: "IMG_7705.PNG", image: "IMG_7705.PNG" }] },
    { value: "Winter White", references: [{ document: "IMG_7709.PNG", image: "IMG_7709.PNG" }] },
    { value: "Silver Oak", references: [{ document: "IMG_7711.PNG", image: "IMG_7711.PNG" }] },
    { value: "Sage Green", references: [{ document: "IMG_7713.PNG", image: "IMG_7713.PNG" }] },
    { value: "Pebble Grey", references: [{ document: "IMG_7715.PNG", image: "IMG_7715.PNG" }] },
    { value: "Manhattan Oak", references: [{ document: "IMG_7717.PNG", image: "IMG_7717.PNG" }] },
    { value: "Pencil Grey", references: [{ document: "IMG_7718.PNG", image: "IMG_7718.PNG" }] },
    { value: "Buckingham Green", references: [{ document: "IMG_7741.PNG", image: "IMG_7741.PNG" }] },
    { value: "Navy Blue", references: [{ document: "IMG_7735.PNG", image: "IMG_7735.PNG" }] },
    { value: "Onyx", references: [{ document: "IMG_7731.PNG", image: "IMG_7731.PNG" }] },
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
      { value: "Chilcomb", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 132, "Classic timber shaker range")] },
      { value: "Elmbridge", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 138, "Beaded shaker timber range")] },
      { value: "Ilfracombe", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 146, "True in-frame timber shaker range")] },
      { value: "Ilfracombe Beaded", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 152, "Beaded true in-frame timber shaker range")] },
      { value: "Greenwich", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 12, "Budget slab range")] },
      { value: "Witney", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 24, "Budget shaker range")] },
      { value: "Allendale", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 32, "Budget woodgrain shaker range")] },
      { value: "Clerkenwell", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 44, "Integrated J-pull handleless slab front")] },
      { value: "Winterton", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 60, "Modern gloss slab range")] },
      { value: "Frome", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 72, "Contemporary shaker range")] },
      { value: "Halesworth", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 84, "Classic shaker range")] },
      { value: "Bridgemere", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 100, "Beaded shaker range")] },
      { value: "Hockley", references: [createReference("Howdens%20Kitchen%20Brochure.pdf", 108, "Luxury slab range")] },
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
      { value: "Light Ash Effect", references: [createReference("ikea-kitchens.pdf", 16, "ASKERSUND colour/design")] },
      { value: "Deep Green", references: [createReference("ikea-kitchens.pdf", 17, "HAVSTORP colour/design")] },
      { value: "White", references: [createReference("ikea-kitchens.pdf", 18, "VALLSTENA colour/design")] },
      { value: "Matt White", references: [createReference("ikea-kitchens.pdf", 19, "AXSTAD colour/design")] },
      { value: "White Wood Effect", references: [createReference("ikea-kitchens.pdf", 20, "ENKÖPING colour/design")] },
      { value: "Oak", references: [createReference("ikea-kitchens.pdf", 21, "FORSBACKA colour/design")] },
      { value: "Painted White", references: [createReference("ikea-kitchens.pdf", 22, "STENSUND colour/design")] },
      { value: "High-Gloss Light Grey", references: [createReference("ikea-kitchens.pdf", 23, "RINGHULT colour/design")] },
      { value: "Matt Anthracite", references: [createReference("ikea-kitchens.pdf", 24, "UPPLÖV colour/design")] },
      { value: "Integrated Matt White", references: [createReference("ikea-kitchens.pdf", 25, "VOXTORP colour/design")] },
      { value: "Stainless Steel", references: [createReference("ikea-kitchens.pdf", 26, "VÅRSTA colour/design")] },
      { value: "Red-Brown Wave Pattern", references: [createReference("ikea-kitchens.pdf", 27, "TERRSJÖ colour/design")] },
    ],
  },
  bq: {
    styles: [
      { value: "Ashmead Shaker", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 15, "Essential shaker range overview")] },
      { value: "Elcot Slab", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 25, "Essential slab range overview")] },
      { value: "Alpinia Shaker", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 35, "Select shaker range overview")] },
      { value: "Artemisia Shaker-Style", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 49, "Select shaker-style range overview")] },
      { value: "Stevia Slab", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 59, "Select slab range overview")] },
      { value: "Garcinia Slab", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 73, "Select integrated J-pull slab range overview")] },
      { value: "Tydeman Shaker", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 95, "Signature shaker range overview")] },
      { value: "Garcinia Shaker-Style", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 121, "Signature shaker-style integrated handle range overview")] },
      { value: "Rivero Slab", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 125, "Signature wood-effect slab range overview")] },
      { value: "Alisma Slab", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 131, "Signature premium slab range overview")] },
      { value: "Ethos Slab", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 135, "Signature made-to-order matt slab range overview")] },
    ],
    colors: [
      { value: "White", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 26, "Elcot white feature page")] },
      { value: "Steel Grey", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 28, "Elcot steel grey feature page")] },
      { value: "Dove Grey", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 16, "Ashmead dove grey feature page")] },
      { value: "Pebble", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 18, "Ashmead pebble feature page")] },
      { value: "Reed Green", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 20, "Ashmead reed green feature page")] },
      { value: "Midnight Blue", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 22, "Ashmead midnight blue feature page")] },
      { value: "Ivory", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 36, "Alpinia ivory feature page")] },
      { value: "Slate Grey", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 40, "Alpinia slate grey feature page")] },
      { value: "Dusk Blue", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 44, "Alpinia dusk blue feature page")] },
      { value: "Dark Green", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 52, "Artemisia dark green feature page")] },
      { value: "Graphite", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 54, "Artemisia graphite feature page")] },
      { value: "Sandstone", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 60, "Stevia sandstone feature page")] },
      { value: "Gloss White", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 64, "Stevia gloss white feature page")] },
      { value: "Gloss Light Grey", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 66, "Stevia gloss light grey feature page")] },
      { value: "Gloss Cream", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 68, "Stevia gloss cream feature page")] },
      { value: "Gloss Anthracite", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 70, "Stevia gloss anthracite feature page")] },
      { value: "Ocean Blue", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 78, "Garcinia ocean blue feature page")] },
      { value: "Carbon", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 82, "Garcinia carbon feature page")] },
      { value: "Gloss Sandstone", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 88, "Garcinia gloss sandstone feature page")] },
      { value: "Gloss Reed Green", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 90, "Garcinia gloss reed green feature page")] },
      { value: "Porcelain", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 96, "Tydeman porcelain feature page")] },
      { value: "Linen", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 102, "Tydeman linen feature page")] },
      { value: "Sage Green", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 104, "Tydeman sage green feature page")] },
      { value: "Antique Rose", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 106, "Tydeman antique rose feature page")] },
      { value: "Fir Green", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 112, "Tydeman fir green feature page")] },
      { value: "Blackberry", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 116, "Tydeman blackberry feature page")] },
      { value: "Black", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 118, "Tydeman black feature page")] },
      { value: "Stone", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 122, "Garcinia shaker-style stone feature page")] },
      { value: "Natural Oak", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 126, "Rivero natural oak feature page")] },
      { value: "Walnut", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 128, "Rivero walnut feature page")] },
      { value: "Azzurro Blue", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 132, "Alisma azzurro blue feature page")] },
      { value: "Tuscan Red", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 138, "Ethos tuscan red feature page")] },
      { value: "Heritage Green", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 140, "Ethos heritage green feature page")] },
      { value: "Indigo", references: [createReference("UKKitchensbrochure-Kitchens~a7ef37a25c1dd73e9afc533dd599f1a41ec395d7pdf.pdf", 142, "Ethos indigo feature page")] },
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
