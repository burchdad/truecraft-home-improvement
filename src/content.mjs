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
  { id: 28, title: "Another room view", category: "Interiors" },
];
export const projects = [
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
    "Request an Estimate",
    "Plan your Tyler or East Texas home improvement project with TrueCraft. Call (903) 275-0361 or explore the preview estimate form.",
  ],
  [
    "/privacy/",
    "Privacy",
    "How this private TrueCraft website preview handles information and inquiry form entries.",
  ],
];
