import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const sourceRoot=process.argv[2];
if(!sourceRoot) throw Error('Pass the directory containing photo-manifest.json, curated-groups.json and photos/');
const inputs=JSON.parse(await fs.readFile(path.join(sourceRoot,'photo-manifest.json')));
const groups=JSON.parse(await fs.readFile(path.join(sourceRoot,'curated-groups.json')));
const categories=[['fencing','Fencing & gates'],['outdoors','Porches & exteriors'],['kitchens','Kitchens'],['bathrooms','Bathrooms'],['interiors','Interior details'],['concrete','Concrete'],['commercial','Commercial spaces']];
const images=JSON.parse(await fs.readFile('src/photos.json'));
const seen=new Map();const imported=[];const duplicates=[];
for(const group of groups){
 group.slug=group.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');group.photos=[];
 for(const [view,i] of group.indices.entries()){
  const f=inputs[i];
  if(seen.has(f.sha256)){duplicates.push({index:i,duplicateOf:seen.get(f.sha256)});continue;}
  seen.set(f.sha256,i);
  const slug=`project-${i}-${group.slug}`;const file=path.join(sourceRoot,'photos',f.id+'.jpg');
  const processed=await sharp(file).rotate().jpeg({quality:92}).toBuffer();const meta=await sharp(processed).metadata();
  const widths=[480,960,1600].filter(w=>w<meta.width);widths.push(Math.min(meta.width,1600));
  const uniqueWidths=[...new Set(widths)];
  await fs.writeFile(`public/images/${slug}.jpg`,processed);
  for(const width of uniqueWidths)await sharp(processed).resize({width,withoutEnlargement:true}).webp({quality:80}).toFile(`public/images/${slug}-${width}.webp`);
  const photo={id:1000+i,slug,width:meta.width,height:meta.height,widths:uniqueWidths,alt:group.description+' '+(view===0?'Overview.':`Detail view ${view}.`)};
  images.push(photo);group.photos.push(photo.id);
  imported.push({index:i,driveId:f.id,sourceName:f.title,sourceUrl:f.url,sourceSha256:f.sha256,sourceSize:Number(f.size),group:group.slug,photoId:photo.id});
 }
 delete group.indices;
}
await fs.writeFile('src/photos.json',JSON.stringify(images,null,2)+'\n');
await fs.writeFile('src/gallery-collections.json',JSON.stringify({categories:categories.map(([slug,title])=>({slug,title})),groups},null,2)+'\n');
await fs.writeFile('docs/drive-gallery-provenance.json',JSON.stringify({sourceFolder:'https://drive.google.com/drive/folders/1WJrW5jW5uRWkpTOgUrM-3ZluUFNT56DM',importedAt:'2026-11-07',sourceCount:inputs.length,imported,duplicates,omitted:[{index:25,reason:'Repeated side-passage composition already represented by image 19.'},{index:87,reason:'Finger obscures image; property represented by images 88 and 89.'}],grouping:'Visually matching surroundings and fixtures; uncertain properties kept separate. No before/after chronology inferred. Fence with third-party sign retained without claiming installation scope.'},null,2)+'\n');
console.log({groups:groups.length,images:imported.length,duplicates});
