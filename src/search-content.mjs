export const searchTitles = {
  '/': 'Home Remodeling in Tyler, TX | TrueCraft',
  '/services/kitchen-updates/': 'Kitchen Remodeling & Updates in Tyler, TX | TrueCraft',
  '/services/bathroom-updates/': 'Bathroom Remodeling & Updates in Tyler, TX | TrueCraft',
};

// Practical planning guidance drawn from the existing service and estimate copy.
export function planningAnswers(slug) {
  const room = slug === 'kitchen-updates' ? 'kitchen' : slug === 'bathroom-updates' ? 'bathroom' : null;
  if (!room) return '';
  return `<section class="wrap prose section" aria-label="${room} project planning answers"><h2>What can I include in a ${room} update?</h2><p>Start with the parts of the room you want to keep and the changes you want to make. Share the room’s approximate size and any existing damage or concerns. Bo will discuss whether the proposed work is a fit before a scope is agreed.</p><h2>What information helps with a ${room} estimate?</h2><p>Room dimensions, the extent of the changes, material preferences and the condition of the existing space help define the work to be priced. Pricing is provided separately after your project details are reviewed; this website does not calculate a price.</p><h2>How is the project timeline decided?</h2><p>Discuss the scope, material choices and availability before planning around a start date. Share your preferred timing and whether ${room === 'kitchen' ? 'you will need to use the kitchen during the work' : 'another bathroom will be available'}. Sending an inquiry does not book work or guarantee a schedule.</p><h2>How do I get started?</h2><p><a href="/request-estimate/">Share your project details</a>, including your town, priorities and preferred timing, or <a href="tel:+19032750361">call Bo at (903) 275-0361</a>. You do not need a complete plan to begin the conversation.</p></section>`;
}
