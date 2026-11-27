import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root='docs/photo-inputs/2026-10-23';
const manifest=JSON.parse(await fs.readFile(`${root}/manifest.json`,'utf8'));
const descriptions={
 'covered-front-porch-brick-base':'Covered wood porch with railings, side steps and a brick base in front of gray siding.',
 'elevated-covered-front-porch':'Elevated covered wood porch with exposed posts, railings and stairs at the left.',
 'dining-room-trim':'Dining room with a vaulted ceiling, white crown molding and an arched opening.',
 'wood-cabinet-kitchen':'Kitchen with wood cabinets, an island, patterned countertops and diagonal floor tiles.',
 'white-paneled-room-metal-ceiling':'White-paneled room with glazed double doors, exposed wood beams and a corrugated metal ceiling.',
 'interior-staircase':'Wood staircase bordered by white horizontal paneling beside corrugated metal walls.',
 'white-paneled-room-alternate':'Alternate room view showing white paneling, windows, exposed beams and a metal ceiling.'
};
const photos=JSON.parse(await fs.readFile('src/photos.json','utf8')).filter(p=>p.id<22);
let id=22;
const selected=[];
for(const a of manifest.assets){
 const bytes=await fs.readFile(`${root}/${a.filename}`);
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==a.sha256) throw Error(`Hash mismatch: ${a.filename}`);
 const slug=a.filename.replace(/\.[^.]+$/,'');
 if(!descriptions[slug]) continue; // Existing enclosed-room image is the same view at higher resolution.
 const widths=[...new Set([Math.min(480,a.width),Math.min(960,a.width),Math.min(1600,a.width)])];
 for(const width of widths) await sharp(bytes).rotate().resize({width,withoutEnlargement:true}).webp({quality:80}).toFile(`public/images/${slug}-${width}.webp`);
 await sharp(bytes).rotate().resize({width:Math.min(1600,a.width),withoutEnlargement:true}).jpeg({quality:85}).toFile(`public/images/${slug}.jpg`);
 photos.push({id:id++,slug,width:a.width,height:a.height,alt:descriptions[slug],widths});
 selected.push({filename:a.filename,sha256:a.sha256,slug,source:a.source});
}
await fs.writeFile('src/photos.json',JSON.stringify(photos,null,2)+'\n');
await fs.writeFile('docs/gallery-photo-provenance.json',JSON.stringify({selected,omitted:[{filename:'wood-lined-enclosed-porch.png',reason:'Same photograph as existing enclosed-room; retained existing higher-resolution asset.'}],grouping:'The three white-paneled room and staircase images share one business-gallery post. Other images are grouped by subject only.'},null,2)+'\n');
