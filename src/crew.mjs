const captions = {
  kitchen: ['Work underway in a kitchen.', 'A TrueCraft crew member at work beside kitchen cabinets.'],
  interior: ['A closer look at interior work.', 'A TrueCraft crew member kneeling beside an open wall and plumbing, with tools nearby.'],
  outdoor: ['On an outdoor project.', 'A TrueCraft crew member holding a drill beside a metal roof.'],
  team: ['The people behind the work.', 'Two TrueCraft crew members beside a wood-paneled wall and doorway.'],
};

export function crewSection(names = ['kitchen', 'team']) {
  return `<section class="crew-section ref-wrap"><h2>The people behind the work.</h2><div class="crew-grid${names.length === 1 ? ' crew-single' : ''}">${names.map(name => {
    const [caption, alt] = captions[name];
    return `<figure><div class="crew-frame"><picture><source type="image/webp" srcset="/images/truecraft-crew-${name}.webp"><img src="/images/truecraft-crew-${name}.jpg" width="878" height="2048" alt="${alt}" loading="lazy" decoding="async"></picture></div><figcaption>${caption}</figcaption></figure>`;
  }).join('')}</div></section>`;
}

export function serviceCrew(slug) {
  const name = {'kitchen-updates':'kitchen', 'bathroom-updates':'interior', 'drywall-interior-improvements':'interior', 'porches-decks':'outdoor'}[slug];
  return name ? crewSection([name]) : '';
}
