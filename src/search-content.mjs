export const searchTitles = {
  '/': 'Home Remodeling in Tyler, TX | TrueCraft',
  '/services/kitchen-updates/': 'Kitchen Remodeling & Updates in Tyler, TX | TrueCraft',
  '/services/bathroom-updates/': 'Bathroom Remodeling & Updates in Tyler, TX | TrueCraft',
  '/services/': 'Home Improvement Services in Tyler, TX | TrueCraft',
  '/services/drywall-interior-improvements/': 'Drywall Repair & Interior Improvements in Tyler, TX | TrueCraft',
  '/services/porches-decks/': 'Porches & Decks in Tyler, TX | TrueCraft',
  '/services/fencing-wood-staining/': 'Fencing & Wood Staining in Tyler, TX | TrueCraft',
  '/our-work/': 'Home Remodeling Project Gallery | TrueCraft Tyler, TX',
  '/about/': 'About Bo Frizzell & TrueCraft Home Improvements | Tyler, TX',
  '/areas/': 'Home Improvement Service Areas | Tyler & East Texas | TrueCraft',
  '/request-estimate/': 'Request a Home Improvement Estimate | TrueCraft Tyler, TX',
  '/blog/': 'Home Remodeling Planning Tips | TrueCraft Tyler, TX',
};

// Search snippets emphasize the page's purpose rather than repeating the full town list.
export const searchDescriptions = {
  '/': 'TrueCraft Home Improvements serves Tyler and East Texas with kitchen and bathroom updates, drywall, porches, decks and fencing. Discuss your project with Bo.',
  '/services/': 'Explore kitchen and bathroom updates, drywall and interior improvements, porches, decks, fencing and wood staining in Tyler and nearby East Texas towns.',
  '/services/kitchen-updates/': 'Planning kitchen remodeling in Tyler or East Texas? Browse real kitchen photos and discuss your layout, materials, priorities and estimate with Bo.',
  '/services/bathroom-updates/': 'Explore real shower, bathtub, vanity and bathroom flooring photos from TrueCraft. Discuss your bathroom update and estimate in Tyler and East Texas.',
  '/services/drywall-interior-improvements/': 'Discuss drywall installation, wall and ceiling repairs, and interior home improvements with TrueCraft in Tyler and surrounding East Texas communities.',
  '/services/porches-decks/': 'Browse real covered porch and deck photographs from TrueCraft. Discuss your outdoor project, dimensions and an estimate in Tyler and East Texas.',
  '/services/fencing-wood-staining/': 'Explore TrueCraft privacy fences, gates and outdoor wood projects. Discuss fencing and wood staining in Tyler and surrounding East Texas towns.',
  '/about/': 'Meet Bo Frizzell, your contact at TrueCraft Home Improvements LLC, established in 2021 and based in Tyler, Texas. Explore real project photos.',
  '/areas/': 'Based in Tyler, TrueCraft serves nearby East Texas communities including Flint, Lindale, Bullard, Chandler and more. Confirm your project location with Bo.',
  '/request-estimate/': 'Discuss your home improvement project with Bo at TrueCraft in Tyler, Texas. Share your project details or call (903) 275-0361 to request an estimate.',
};

// Practical planning guidance drawn from the existing service and estimate copy.
export function planningAnswers(slug) {
  const room = slug === 'kitchen-updates' ? 'kitchen' : slug === 'bathroom-updates' ? 'bathroom' : null;
  if (!room) return '';
  const examples = room === 'bathroom' ? `<h2>What bathroom features can I explore in the gallery?</h2><p>TrueCraft’s supplied project photographs show a <a href="/our-work/bathrooms/#marble-look-shower-and-bath">marble-look tiled shower with a pebble-style floor, niches and a window-side bathtub</a>, a <a href="/our-work/bathrooms/#double-vanity">double vanity and mirror</a>, and <a href="/our-work/bathrooms/#bathroom-flooring-and-fixtures">wood-look flooring and compact fixtures</a>. These are real photographs to help you explain your ideas, not a promise that every feature is included in a particular project.</p>` : '';
  return `<section class="wrap prose section" aria-label="${room} project planning answers"><h2>What can I include in a ${room} update?</h2><p>Start with the parts of the room you want to keep and the changes you want to make. Share the room’s approximate size and any existing damage or concerns. Bo will discuss whether the proposed work is a fit before a scope is agreed.</p>${examples}<h2>What information helps with a ${room} estimate?</h2><p>Room dimensions, the extent of the changes, material preferences and the condition of the existing space help define the work to be priced. Pricing is provided separately after your project details are reviewed; this website does not calculate a price.</p><h2>How is the project timeline decided?</h2><p>Discuss the scope, material choices and availability before planning around a start date. Share your preferred timing and whether ${room === 'kitchen' ? 'you will need to use the kitchen during the work' : 'another bathroom will be available'}. Sending an inquiry does not book work or guarantee a schedule.</p><h2>How do I get started?</h2><p><a href="/request-estimate/">Share your project details</a>, including your town, priorities and preferred timing, or <a href="tel:+19032750361">call Bo at (903) 275-0361</a>. You do not need a complete plan to begin the conversation.</p></section>`;
}
