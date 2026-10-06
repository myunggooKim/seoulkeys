import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const shell = readFileSync('public/games/seoul-defense/index.html','utf8');
const code = shell.match(/<script id="viewport-controller">([\s\S]*?)<\/script>/)[1];
test('actual export controller preserves aspect across 40 viewport/DPR/fullscreen cases',()=>{
 let size={width:1300,height:734}; let resize;
 const listeners={}; const canvas={width:300,height:150,getBoundingClientRect:()=>size};
 const window={devicePixelRatio:1,addEventListener:(type,cb)=>listeners[type]=cb,matchMedia:()=>({addEventListener:(type,cb)=>listeners.dpr=cb,removeEventListener(){}})};
 const document={getElementById:()=>canvas,addEventListener:(type,cb)=>listeners[type]=cb};
 vm.runInNewContext(code,{window,document,ResizeObserver:class{constructor(cb){resize=cb;}observe(){}}});
 let checks=0;
 for(const [width,height] of [[1300,734],[1503,768],[1920,1016],[2560,1376],[390,712],[844,292],[320,508],[1365.5,767.25]]) for(const dpr of [1,1.25,1.5,2,3]){
   size={width,height};window.devicePixelRatio=dpr;resize();listeners.fullscreenchange();listeners.dpr();
   assert.equal(canvas.width,Math.round(width*dpr));assert.equal(canvas.height,Math.round(height*dpr));
   assert.equal(window.seoulDefenseViewport.cssWidth,width);assert.equal(window.seoulDefenseViewport.cssHeight,height);
   assert.ok(Math.abs(canvas.width/width-canvas.height/height)<=1/Math.min(width,height));checks++;
 }
 assert.equal(checks,40);
});
test('shell has no second resize owner, transform, fixed aspect, or page scroll',()=>{
 assert.match(shell,/canvasResizePolicy: 0/);assert.match(shell,/height:100%;overflow:hidden/);assert.match(shell,/width:100%;height:100%;border:0/);
 assert.doesNotMatch(shell,/transform:|image-rendering:pixelated|user-scalable=no/);
 const css=readFileSync('app/godot-defense.css','utf8');
 assert.match(css,/\.godot-defense-game:fullscreen\s*\{[^}]*height:\s*100%/);
 assert.match(css,/:fullscreen \.gd-viewport\s*\{[^}]*flex:\s*1;[^}]*min-height:\s*0;[^}]*aspect-ratio:\s*auto/);
 assert.match(css,/iframe\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%/);

});
// Actual engine resize contract, not browser/WebGL/IME testing.
test('Godot policy zero consumes backing dimensions without rewriting CSS',()=>{
 const engineJs=readFileSync('public/games/seoul-defense/index.js','utf8');
 const start=engineJs.indexOf('var GodotDisplayScreen=');
 const end=engineJs.indexOf(';var GodotInputGamepads=',start);
 assert.ok(start>=0 && end>start);
 let resized=0;const canvas={width:1500,height:900,style:{}};
 const context={GodotConfig:{canvas,canvas_resize_policy:0},window:{devicePixelRatio:1.5},document:{},_emscripten_webgl_get_current_context:()=>1,GL:{getContext:()=>({}),resizeOffscreenFramebuffer:()=>{resized++;}}};
 vm.runInNewContext(engineJs.slice(start,end)+';',context);
 const screen=context.GodotDisplayScreen;screen.desired_size=[1280,720];
 assert.equal(screen.updateSize(),1);assert.equal(resized,1);
 assert.equal(screen.desired_size[0],1500);assert.equal(screen.desired_size[1],900);
 assert.deepEqual(canvas.style,{});assert.equal(screen.updateSize(),0);
 canvas.width=2880;canvas.height=1620;
 assert.equal(screen.updateSize(),1);assert.equal(screen.desired_size[0]/screen.desired_size[1],16/9);assert.deepEqual(canvas.style,{});
});
