export const business = {
  name: "TrueCraft Home Improvements LLC",
  phone: "(903) 275-0361",
  tel: "tel:+19032750361",
  base: "Frankston, Texas",
  established: "2021",
  reviewDate: "October 19, 2026",
  maps: "https://www.google.com/maps/place/TrueCraft+Home+Improvements+LLC/@32.212331,-95.555003,10z/data=!3m1!4b1!4m6!3m5!1s0x88e565b767eb47b7:0xecf931e13c3ce431!8m2!3d32.212331!4d-95.555003!16s%2Fg%2F11yfdxvk3k?hl=en&entry=ttu",
};
export const services = [
  {
    id: "kitchens-bathrooms",
    name: "Kitchens & bathrooms",
    photo: 10,
    copy: "Make room for the way you live. Talk with us about improvements to your kitchen or bathroom.",
  },
  {
    id: "interiors",
    name: "Interior improvements",
    photo: 1,
    copy: "From drywall to interior updates, tell us which parts of your home you would like to improve.",
  },
  {
    id: "exteriors",
    name: "Outdoor projects",
    photo: 23,
    copy: "Explore possibilities for your porch, decking, wood staining or fencing. Share your ideas and the space you have in mind.",
  },
  {
    id: "other",
    name: "Other projects",
    photo: 11,
    copy: "Have something else in mind? Describe your home improvement or repair project so we can discuss whether it is a fit.",
  },
];
export const reviews = [
  {
    quote: "His crew was professional, friendly, and a pleasure to work with.",
    name: "Quence Miller",
  },
  {
    quote: "They are prompt, dependable and professional!!",
    name: "Larry Harper",
  },
];
export const roomProject = [
  { id: 26, title: "White-paneled room", category: "Interiors" },
  { id: 27, title: "Staircase details", category: "Interiors" },
];
export const projects = [
  { id: 29, title: "Covered patio details", category: "Outdoors", description: "Wood ceiling, fans, recessed lights and seating beneath a patio cover." },
  { id: 30, title: "Covered patio overview", category: "Outdoors", description: "The covered seating area viewed across a swimming pool. The pool is shown for context." },
  { id: 31, title: "Wood deck & stairs", category: "Outdoors", description: "An elevated view of wood decking, steps, railings and exposed framing." },
  { id: 22, title: "Porch with brick base", category: "Outdoors" },
  { id: 23, title: "Raised wooden porch", category: "Outdoors", description: "A raised covered wood porch with railings, exposed posts and stairs at the left." },
  { id: 24, title: "Dining room trim", category: "Interiors" },
  { id: 25, title: "Wood-cabinet kitchen", category: "Interiors" },
  {
    id: 15,
    title: "Bathroom",
    category: "Interiors",
    description:
      "A tub, tiled shower and patterned floor, shown together in one room.",
  },
  { id: 4, title: "Living room", category: "Interiors" },
  {
    id: 11,
    title: "Garage",
    category: "Interiors",
    description: "Blue walls, a speckled floor and geometric ceiling lighting.",
  },
  { id: 10, title: "Kitchen", category: "Interiors" },
  { id: 8, title: "Rear enclosure", category: "Outdoors" },
  {
    id: 1,
    title: "Interior details",
    category: "Interiors",
    description:
      "Wood-lined walls and ceiling beams framed by white door trim.",
  },
  { id: 12, title: "Wood fencing", category: "Outdoors" },
  { id: 17, title: "Double vanity", category: "Interiors" },
  { id: 7, title: "Enclosed room", category: "Interiors" },
];
export const featuredProjects = [15, 1, 23, 11].map((id) =>
  projects.find((p) => p.id === id),
);
export const serviceGroups = services.filter((s) => s.id !== "other");
export const routes = [
  [
    "/",
    "Home",
    "Home improvements serving Tyler and surrounding East Texas communities. Explore TrueCraft’s kitchens, bathrooms, interior and outdoor project photography.",
  ],
  [
    "/services/",
    "Services",
    "Explore kitchen, bathroom, interior, exterior and fencing services with TrueCraft Home Improvements, serving Tyler and surrounding East Texas communities.",
  ],
  [
    "/our-work/",
    "Our Work",
    "Browse genuine TrueCraft photographs of living rooms, bathrooms, porches, fencing and other home improvement subjects.",
  ],
  [
    "/about/",
    "About",
    "Meet TrueCraft Home Improvements LLC, serving Tyler and East Texas. Based in Frankston, Texas and established in 2021.",
  ],
  [
    "/request-estimate/",
    "Plan Your Estimate",
    "Plan your Tyler or East Texas home improvement project with TrueCraft. Call (903) 275-0361 and learn what to discuss about your project.",
  ],
  [
    "/privacy/",
    "Privacy",
    "How TrueCraft handles website information and project details shared through its inquiry form.",
  ],
];

export const servicePages = [
  {
    slug: "kitchen-updates", group: "kitchens-bathrooms", title: "Kitchen updates", photo: 25,
    description: "Plan kitchen updates in Tyler and surrounding East Texas communities with TrueCraft. Discuss your space, priorities and next steps with Bo Frizzell.",
    intro: "Start with what you want to change about the kitchen you use every day. TrueCraft works with homeowners on kitchen updates in Tyler and surrounding East Texas communities.",
    heading: "A clearer starting point for your kitchen",
    copy: "You may be looking to update the room’s appearance or improve how the space works for your household. Tell Bo which parts of the kitchen you want to keep and which need attention. Discuss the proposed scope before choosing materials or making plans around a start date.",
    details: ["The parts of the kitchen you would like to update.", "What currently feels inconvenient or unfinished.", "Approximate room dimensions and any ideas you have collected.", "Whether you will need to use the kitchen during the work."],
    question: "Do I need a complete plan before calling?", answer: "No. You can start with the room and the changes you have in mind. Bo can discuss your priorities and the next steps for an estimate; pricing and availability are confirmed separately."
  },
  {
    slug: "bathroom-updates", group: "kitchens-bathrooms", title: "Bathroom updates", photo: 15,
    description: "Discuss bathroom updates with TrueCraft Home Improvements, serving Tyler and East Texas. Share your goals, room details and preferred timing with Bo.",
    intro: "A bathroom update starts with understanding the room and what you want to improve. Talk with TrueCraft about your bathroom project in Tyler or a surrounding East Texas community.",
    heading: "Plan around the room you have",
    copy: "Describe the existing bathroom, the changes you are considering and any areas that need attention. Distinguish the features you want to retain from those you hope to change. The conversation helps establish which work is a fit before a price or schedule is agreed.",
    details: ["Which bathroom you want to update and its approximate size.", "The changes that matter most to you.", "Any existing damage or concerns you have noticed.", "Whether another bathroom will be available during the project."],
    question: "Can I discuss a smaller bathroom update?", answer: "Describe the specific update you have in mind. TrueCraft can discuss whether the scope is a fit and what information is needed for an estimate."
  },
  {
    slug: "drywall-interior-improvements", group: "interiors", title: "Drywall & interior improvements", photo: 1,
    description: "Drywall installation, drywall repairs and interior improvements serving Tyler and East Texas. Discuss the rooms and repairs you have in mind with TrueCraft.",
    intro: "TrueCraft offers drywall installation and repairs along with interior improvements for homes in Tyler and surrounding East Texas communities.",
    heading: "From a repair to a room update",
    copy: "Tell us whether you need attention to an existing wall or ceiling, drywall installation, or a wider interior update. Describe the affected area and what you have noticed. If there is staining or recurring damage, mention it so the cause can be discussed before the finish work is planned.",
    details: ["The room and whether the work involves walls, ceilings or both.", "The approximate size and number of areas needing attention.", "Any recurring damage or known source of the problem.", "Other interior changes you would like to discuss at the same time."],
    question: "Should I describe damage before asking about a finish?", answer: "Yes. Explain what you see and whether it has happened before. That context helps the project conversation; the appropriate scope must be assessed before work is agreed."
  },
  {
    slug: "porches-decks", group: "exteriors", title: "Porches & decks", photo: 31,
    description: "Explore porch and deck projects with TrueCraft, serving Tyler and surrounding East Texas communities. Discuss your outdoor space, ideas and project scope.",
    intro: "Talk with TrueCraft about the porch or deck you have in mind for your home in Tyler or the surrounding East Texas area.",
    heading: "Think through how you use your outdoor space",
    copy: "Describe the existing space, how it connects to your home and what you would like to change. Whether your idea concerns a porch or decking, clear information about the site and your goals helps Bo discuss the project. Details such as dimensions, access and the condition of existing wood are useful starting points.",
    details: ["Whether you have an existing porch or deck and what needs attention.", "Approximate dimensions and how the space is accessed.", "Your ideas for using the space.", "Any visible wood damage, loose components or other concerns."],
    question: "Can the gallery help me explain my ideas?", answer: "Yes. Browse the TrueCraft gallery and describe the features you like. Photographs are examples to discuss; your project’s scope, materials and pricing are determined separately."
  },
  {
    slug: "fencing-wood-staining", group: "exteriors", title: "Fencing & wood staining", photo: 12,
    description: "Discuss fencing and wood staining with TrueCraft Home Improvements in Tyler and East Texas. Share the wood surface, condition and changes you have in mind.",
    intro: "TrueCraft’s outdoor work includes fencing and wood staining, serving Tyler and surrounding East Texas communities.",
    heading: "Start with the wood and its condition",
    copy: "For fencing, describe the area, the approximate length and what you want to change. For wood staining, tell us which surface needs attention and whether it already has a finish. The condition of the wood and the desired result are important parts of the discussion before work is planned.",
    details: ["Whether your request concerns fencing, staining or both.", "The approximate length or area involved.", "The condition of the wood and any existing coating.", "Access to the work area and your preferred timing."],
    question: "Can staining be discussed alongside a porch or deck project?", answer: "Yes. Explain which wood surfaces you have in mind when discussing the project. TrueCraft can review whether the requested work is a fit; no material choice or scope is assumed in advance."
  }
];
for (const service of servicePages) routes.push([`/services/${service.slug}/`, service.title, service.description]);
