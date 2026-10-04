export type PortfolioProject = { title: string; details: string; images: string[]; video?: string; slug?: string };
export const portfolioSections: { category: string; description: string; projects: PortfolioProject[] }[] = [
  {
    category: "Recent Finished Kitchens",
    description: "Freshly completed residential kitchens covering first-home renovations and a larger premium flat-pack installation with upgraded flooring and stone finishes.",
    projects: [
      {
        title: "Robyn's First Home Kitchen Renovation",
        slug: "first-home-kitchen-renovation",
        details: "A bright, practical kitchen completed for Robyn's first home renovation. The room was finished with a clean, durable layout that feels fresh and ready for everyday use while still keeping the space easy to maintain.",
        images: [
          "/projects/kitchen46.JPG",
          "/projects/kitchen47.JPG",
          "/projects/kitchen48.JPG",
          "/projects/kitchen49.JPG",
          "/projects/kitchen50.JPG",
        ],
      },
      {
        title: "Premium Flat-Pack Kitchen with Stone Finishes",
        slug: "kitchen-stone-finishes-herringbone-floor",
        details: "A larger finished kitchen featuring tile removal, self-levelling, herringbone flooring, stone worktops and splashback, plus premium appliances and hidden storage details. The result is a polished, high-spec kitchen with strong everyday usability.",
        images: [
          "/projects/kitchen51.jpeg",
          "/projects/kitchen52.jpg",
          "/projects/kitchen53.jpeg",
          "/projects/kitchen54.jpeg",
          "/projects/kitchen55.jpeg",
          "/projects/kitchen56.jpeg",
          "/projects/kitchen57.JPG",
          "/projects/kitchen58.JPG",
          "/projects/kitchen59.JPG",
          "/projects/kitchen60.JPG",
          "/projects/kitchen61.jpeg",
          "/projects/kitchen62.JPG",
          "/projects/kitchen63.JPG",
        ],
      },
    ],
  },
  {
    category: "Wren Kitchens",
    description: "Wren installations delivered with clean finishes, accurate scribing and practical handover.",
    projects: [
      {
        title: "Compact Kitchen Fit - Rental Property Refresh",
        details: "Small-space kitchen installation completed as part of a full home renovation for a rental property. The layout was planned for maximum storage, easy daily use and a durable finish that suits high-traffic, low-maintenance living.",
        images: [
          "/projects/Kitchen37.JPG",
          "/projects/Kitchen38.JPG",
          "/projects/Kitchen39.JPG",
          "/projects/Kitchen40.JPG",
          "/projects/Kitchen41.JPG",
          "/projects/Kitchen42.JPG",
          "/projects/Kitchen43.JPG",
          "/projects/Kitchen44.JPG",
        ],
      },
      {
        title: "Wren Kitchen - Precision Dry Fit",
        details: "Complete dry-fit installation with panel alignment, appliance housing checks and a tidy handover, prepared for quartz templating.",
        images: ["/projects/kitchen10.jpg", "/projects/kitchen11.jpg"],
      },
      {
        title: "Wren Kitchen - Fit + Tile Package",
        details: "Full install package including kitchen fit, splashback tiling, and LVT flooring for a seamless, ready-to-use finish.",
        images: ["/projects/kitchen13.jpeg", "/projects/kitchen14.jpeg", "/projects/kitchen15.jpeg"],
      },
    ],
  },
  {
    category: "Howdens Kitchens",
    description: "Howdens projects focused on storage efficiency, robust fittings and day-to-day practicality.",
    projects: [
      {
        title: "Large Howdens Kitchen with Walk-In Corner Pantry",
        slug: "howdens-kitchen-walk-in-pantry",
        details: "Large-format installation with walk-in corner storage, clean worktop joints and appliance spacing planned for easy daily workflow.",
        images: [
          "/projects/kitchen1.jpg",
          "/projects/kitchen2.jpg",
          "/projects/kitchen3.jpg",
          "/projects/kitchen4.jpg",
        ],
      },
    ],
  },
  {
    category: "Bespoke Kitchens",
    description: "Bespoke kitchens tailored to each room, client goals and supplier specification.",
    projects: [
      {
        title: "U-Shaped Bespoke Kitchen - Rental Renovation",
        details: "U-shaped kitchen fitted for a rental refurbishment with durable materials, practical storage and straightforward maintenance.",
        images: [
          "/projects/kitchen5.jpg",
          "/projects/kitchen6.jpg",
          "/projects/kitchen7.jpg",
          "/projects/kitchen8.jpg",
          "/projects/kitchen9.jpg",
        ],
      },
      {
        title: "Bespoke Kitchen Series - Installation Only",
        details: "Three bespoke kitchen installs completed with consistent finish standards, accurate panel fitting and coordinated appliance clearances.",
        images: [
          "/projects/kitchen12.jpg",
          "/projects/kitchen21.jpeg",
          "/projects/kitchen22.jpeg",
        ],
      },
      {
        title: "Bespoke Kitchen - HMO Renovation",
        details: "HMO-focused renovation with layout planning for multi-tenant durability, easy cleaning and reliable appliance access.",
        images: [
          "/projects/kitchen25.jpeg",
          "/projects/kitchen26.jpeg",
          "/projects/kitchen27.jpeg",
          "/projects/kitchen28.jpeg",
          "/projects/kitchen29.jpeg",
          "/projects/kitchen30.jpeg",
          "/projects/kitchen31.jpeg",
        ],
      },
      {
        title: "Compact Kitchen Fit - Rental Property Refresh",
        details: "Small-space kitchen installation completed as part of a full home renovation for a rental property. The layout was planned for maximum storage, easy daily use and a durable finish that suits high-traffic, low-maintenance living.",
        images: [
          "/projects/Kitchen37.JPG",
          "/projects/Kitchen38.JPG",
          "/projects/Kitchen39.JPG",
          "/projects/Kitchen40.JPG",
          "/projects/Kitchen41.JPG",
          "/projects/Kitchen42.JPG",
          "/projects/Kitchen43.JPG",
          "/projects/Kitchen44.JPG",
        ],
      },
    ],
  },
  {
    category: "IKEA / B&Q Kitchens & Utility Rooms",
    description: "Flat-pack kitchens and utility spaces installed for practical use and long-term reliability.",
    projects: [
      {
        title: "IKEA / B&Q Kitchen + Utility Programme",
        details:
          "Three projects delivered: two kitchens and one utility room, with careful fitting around existing services and consistent finishing detail.",
        images: [
          "/projects/kitchen16.jpg",
          "/projects/kitchen35.jpeg",
          "/projects/kitchen33.jpeg",
        ],
        video: "/projects/video.MOV",
      },
    ],
  },
  {
    category: "Bespoke Built-In Furniture, Wardrobes & Bedroom Joinery",
    description: "Custom fitted furniture and wardrobes designed to maximise awkward spaces and daily usability.",
    projects: [
      {
        title: "Bespoke Wall Feature",
        details: "Custom wall feature unit fitted to room dimensions for a clean focal point and integrated storage.",
        images: ["/projects/kitchen20.jpeg"],
      },
      {
        title: "Office Wardrobe",
        slug: "fitted-office-wardrobe",
        details: "Fitted office wardrobe with tailored shelving and hanging layout matched to client storage needs.",
        images: ["/projects/kitchen18.jpeg"],
      },
      {
        title: "Trophy Display Unit",
        details: "Purpose-built display unit engineered for safe presentation, visual balance and long-term durability.",
        images: ["/projects/kitchen19.JPG"],
      },
    ],
  },
];
