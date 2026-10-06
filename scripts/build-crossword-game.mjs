import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'game-assets/crossword-studio/source');
const output=path.join(root,'public/games/crossword-studio-v17');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const plugin={name:'accepted-interface-i18n',setup(b){b.onResolve({filter:/^\.\/runtime-i18n$/},()=>({path:'accepted-interface-i18n',namespace:'offline'}));b.onLoad({filter:/.*/,namespace:'offline'},()=>({loader:'js',contents:'export function getRuntimeTranslation(){return undefined;}'}));}};
const result=await build({absWorkingDir:source,plugins:[plugin],entryPoints:['entry.tsx'],bundle:true,write:false,outfile:'runtime.js',minify:true,jsx:'automatic',format:'iife',target:['chrome111','safari15.4'],define:{'process.env.NODE_ENV':'"production"'}});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).contents;
const componentCss=result.outputFiles.find(f=>f.path.endsWith('.css'))?.text??'';
const css=[await readFile(path.join(source,'review/base.css'),'utf8'),componentCss,await readFile(path.join(source,'review/shell.css'),'utf8'),await readFile(path.join(source,'runtime.css'),'utf8'),await readFile(path.join(source,'fonts.css'),'utf8')].join('\n');
const jsName=`runtime.${hash(js).slice(0,16)}.js`,cssName=`runtime.${hash(css).slice(0,16)}.css`;
if(process.argv.includes('--check')){
 const html=await readFile(path.join(output,'index.html'),'utf8');
 if(!html.includes(jsName)||!html.includes(cssName))throw new Error('Authoring source differs from the checked-in export; deliberate regeneration/review required.');
 if(hash(await readFile(path.join(output,jsName)))!==hash(js)||hash(await readFile(path.join(output,cssName)))!==hash(css))throw new Error('Checked-in crossword asset bytes do not match authoring source.');
 console.log(`Crossword source reproduces ${jsName} and ${cssName}`);
}else{
 const html=await readFile(path.join(output,'index.html'),'utf8');
 await mkdir(output,{recursive:true});await writeFile(path.join(output,jsName),js);await writeFile(path.join(output,cssName),css);
 await writeFile(path.join(output,'index.html'),html.replace(/runtime\.[a-f0-9]+\.js/g,jsName).replace(/runtime\.[a-f0-9]+\.css/g,cssName));
 console.log(`Rebuilt local crossword export: ${jsName}, ${cssName}. Review before deployment.`);
}
