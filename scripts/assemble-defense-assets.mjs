import {readFile,writeFile,mkdir,rename,unlink} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function assembleDefenseAssets(root=projectRoot){
 const folder=path.join(root,'game-assets/seoul-defense');
 const manifest=JSON.parse(await readFile(path.join(folder,'manifest.json'),'utf8'));
 if(manifest.output!=='public/games/seoul-defense/index.pck'||!Array.isArray(manifest.parts)||manifest.parts.length!==2)throw new Error('Invalid defense asset manifest');
 const buffers=[];
 for(const part of manifest.parts){
  if(!/^index\.pckpart[12]$/.test(part.file))throw new Error('Invalid defense part path');
  const bytes=await readFile(path.join(folder,part.file));
  if(bytes.length!==part.bytes||digest(bytes)!==part.sha256)throw new Error(`Defense asset part failed integrity check: ${part.file}`);
  buffers.push(bytes);
 }
 const bytes=Buffer.concat(buffers);
 if(bytes.length!==manifest.bytes||digest(bytes)!==manifest.sha256)throw new Error('Reconstructed defense pack failed integrity check');
 const output=path.join(root,manifest.output);
 try{if(digest(await readFile(output))===manifest.sha256)return {changed:false,bytes:bytes.length,sha256:manifest.sha256};}catch(error){if(error.code!=='ENOENT')throw error;}
 await mkdir(path.dirname(output),{recursive:true});
 const temporary=output+'.'+randomUUID()+'.tmp';
 try{await writeFile(temporary,bytes,{flag:'wx'});await rename(temporary,output);}finally{await unlink(temporary).catch(error=>{if(error.code!=='ENOENT')throw error;});}
 return {changed:true,bytes:bytes.length,sha256:manifest.sha256};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await assembleDefenseAssets();
 console.log(`Defense pack verified: ${result.bytes} bytes, SHA-256 ${result.sha256}${result.changed?' (assembled)':' (already current)'}`);
}
