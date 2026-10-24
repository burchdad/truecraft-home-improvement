import fs from 'node:fs/promises';
import sharp from 'sharp';
const photos=JSON.parse(await fs.readFile('src/photos.json','utf8'));
const entries=[
 {id:15,source:'bathroom-brightened-bo',slug:'bathroom',alt:'Bright bathroom with a tub, marble-patterned tiled shower walls, pebble shower floor and polished floor tiles.'},
 {id:29,source:'covered-patio-detail-bo',slug:'covered-patio-detail-bo',alt:'Covered patio with a wood ceiling, ceiling fans, recessed lights, seating and a picnic table.'},
 {id:30,source:'poolside-covered-patio-bo',slug:'poolside-covered-patio-bo',alt:'Covered patio with seating and a picnic table, viewed across a swimming pool.'},
 {id:31,source:'wood-deck-stairs-bo',slug:'wood-deck-stairs-bo',alt:'Raised wood deck with stairs, railings and exposed wood framing, viewed from above.'},
];
for(const item of entries){
 const bytes=await fs.readFile(`public/images/${item.source}.jpg`);
 const {width,height}=await sharp(bytes).metadata();
 const old=photos.find(p=>p.id===item.id);
 const widths=[480,width].filter((w,i,a)=>w<=width&&a.indexOf(w)===i);
 if(old)for(const w of old.widths)if(!widths.includes(w))await fs.rm(`public/images/${old.slug}-${w}.webp`,{force:true});
 for(const w of widths)await sharp(bytes).resize({width:w,withoutEnlargement:true}).webp({quality:82}).toFile(`public/images/${item.slug}-${w}.webp`);
 if(item.slug!==item.source)await sharp(bytes).jpeg({quality:90}).toFile(`public/images/${item.slug}.jpg`);
 const record={id:item.id,slug:item.slug,width,height,alt:item.alt,widths};
 if(old)Object.assign(old,record);else photos.push(record);
}
await fs.writeFile('src/photos.json',JSON.stringify(photos,null,2)+'\n');
console.log('Four clean source photographs processed; responsive outputs contain no copied metadata.');
