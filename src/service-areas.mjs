// Coverage approved by Stephen; county evidence: docs/TOWN-COVERAGE-REVIEW-2026-11-08.md
export const serviceAreas=[
  ['tyler','Tyler, TX','Smith County','Discuss kitchen, bathroom, interior or outdoor improvements for your Tyler home. Share the changes you have in mind and your preferred timing.'],
  ['flint','Flint, TX','Smith County','Planning an update in Flint? Talk with Bo about the room or outdoor space, its current condition and the next steps for an estimate.'],
  ['lindale','Lindale, TX','Smith County','For your Lindale home, discuss kitchen and bathroom updates, drywall repairs or other interior improvements. Start with your priorities and approximate dimensions.'],
  ['chandler','Chandler, TX','Henderson County','Bring your Chandler home improvement ideas to TrueCraft. Describe the existing space and the details you would like to change.'],
  ['bullard','Bullard, TX','Smith and Cherokee Counties','Discuss your Bullard project, from interior updates to porches, decks or fencing. Scope, materials and timing are discussed for your individual property.'],
  ['troup','Troup, TX','Smith and Cherokee Counties','Talk with Bo about improvements to your Troup home. Share the rooms or outdoor areas that need attention and what you would like to achieve.'],
  ['kilgore','Kilgore, TX','Gregg and Rusk Counties','For a project in Kilgore, describe your kitchen, bathroom, interior or outdoor plans. Discuss the work involved and your preferred timing with TrueCraft.'],
  ['jacksonville','Jacksonville, TX','Cherokee County','Planning home improvements in Jacksonville? Explain what you want to update, what you want to keep and any concerns about the existing space.'],
  ['mineola','Mineola, TX','Wood County','Discuss your Mineola home and the improvements you have in mind. Room dimensions, the condition of surfaces and your priorities help start the conversation.'],
  ['athens','Athens, TX','Henderson County','Talk through your Athens project with Bo, whether it involves interior improvements or an outdoor space. Pricing and availability are confirmed separately.']
 ];
export const serviceTowns = serviceAreas.map(([, title]) => title.replace(/, TX$/, ""));
export const coverageText = `${serviceTowns.slice(0, -1).join(", ")}, and ${serviceTowns.at(-1)}, Texas`;
export const coverageSchema = serviceTowns.map(name => ({"@type":"City", name, containedInPlace:{"@type":"State",name:"Texas"}}));
