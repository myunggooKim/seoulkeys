import {
  AgXToneMapping, BufferGeometry, CanvasTexture, Color, DirectionalLight,
  Group, HemisphereLight, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  OrthographicCamera, PCFShadowMap, PlaneGeometry, Scene, SRGBColorSpace,
  Object3D, Texture, WebGLRenderTarget, HalfFloatType, MeshPhysicalMaterial, Box3, Vector3, RectAreaLight,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { crosswordCeramicPalette } from './crossword-tile-style';
import { CROSSWORD_BUILD } from './crossword-build';
import { createCeramicStudioEnvironment } from './crossword-studio-light';
import { frameCrosswordCamera, crosswordTileBounds, crosswordOccupiedBounds, CROSSWORD_FACE_Y } from './crossword-projection';
import type { CrosswordDioramaCell } from './CrosswordDiorama';

export type CrosswordSceneState = { size: number; cells: CrosswordDioramaCell[]; angle: number; elevation?: number; chapter?: number; completed?: boolean };
export type CrosswordScene = { update(state: CrosswordSceneState): void; dispose(): void };
type Tile = { group: Group; skin: MeshStandardMaterial[]; light: MeshStandardMaterial[]; texture: CanvasTexture; canvas: HTMLCanvasElement; signature: string; target: number; solved: boolean; celebrate: number; order: number };

function binary(base64: string) {
  const bytes = atob(base64); const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i);
  return array.buffer;
}
async function loadModel(encoded: string): Promise<Group> {
  const gltf = await new GLTFLoader().parseAsync(binary(encoded), '');
  return gltf.scene;
}

/** Blender assets own physical detail. DOM buttons own all input and accessibility. */
export async function createCrosswordScene(host: HTMLElement, overlay: HTMLElement, initial: CrosswordSceneState, failed: () => void): Promise<CrosswordScene> {
  const [{ WebGLRenderer }, assets] = await Promise.all([
    import('three'), import('./crossword-assets'),
  ]);
  const [tileTemplate, environment] = await Promise.all([loadModel(assets.TILE_GLB), loadModel(assets.PLATFORM_GLB)]);
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = AgXToneMapping; renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = PCFShadowMap; renderer.shadowMap.autoUpdate=false;
  host.dataset.assetSource="blender-white-glb";
  host.dataset.buildRevision=CROSSWORD_BUILD.revision;
  host.dataset.tileSha256=CROSSWORD_BUILD.tileHash;
  host.dataset.sourceSha256=CROSSWORD_BUILD.sourceHash;
  renderer.setClearColor(0, 0); host.appendChild(renderer.domElement);
  const scene = new Scene(), n = initial.size;
  const camera = new OrthographicCamera(-9,9,9,-9,.1,100);
  camera.layers.enable(1); // Text is visible in the beauty pass, not the contact-AO geometry pass.
  scene.background = new Color('#e3e5e3');
  const aoCamera = camera.clone(); aoCamera.layers.set(0);
  const target = new WebGLRenderTarget(1,1,{type:HalfFloatType,samples:4});
  const composer = new EffectComposer(renderer,target);
  const beautyPass = new RenderPass(scene,camera);
  const aoPass = new GTAOPass(scene,aoCamera,1,1);
  aoPass.updateGtaoMaterial({radius:.24,thickness:.24,distanceExponent:2,scale:1,samples:8});
  aoPass.blendIntensity=.65;
  const outputPass=new OutputPass();
  composer.addPass(beautyPass);composer.addPass(aoPass);composer.addPass(outputPass);
  let advanced=true;
  const environmentMap = createCeramicStudioEnvironment(renderer); scene.environment = environmentMap.texture;
  scene.environmentIntensity = .85;
  // Broad reflected light supplies the glaze; a restrained key supplies grounding shadows.
  RectAreaLightUniformsLib.init();
  const softKey = new RectAreaLight('#fffdf8', 1.8, n * .9, n * .75);
  softKey.position.set(-n * .6, n * 1.1, -n * .6); softKey.lookAt(0, 0, 0);
  const softFill = new RectAreaLight('#f4f7ff', .5, n * .7, n * .9);
  softFill.position.set(n, n * .7, n * .2); softFill.lookAt(0, 0, 0);
  scene.add(softKey, softFill, new HemisphereLight('#ffffff', '#a8afae', .25));
  const keyLight = new DirectionalLight('#fffdf8', 1.2);
  keyLight.position.set(-n * .65, n * 1.35, -n * .35); keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  Object.assign(keyLight.shadow.camera, { left: -n*.85, right:n*.85, top:n*.85, bottom:-n*.85, near:.1, far:n*5 });
  keyLight.shadow.bias = -.00015; keyLight.shadow.normalBias = .008; keyLight.shadow.radius = 3;
  scene.add(keyLight);
  const layout = crosswordOccupiedBounds(initial.cells, n);
  const platformBox = new Box3().setFromObject(environment), platformSize = platformBox.getSize(new Vector3());
  environment.scale.set((layout.columns + .8) / platformSize.x, 1, (layout.rows + .8) / platformSize.z);
  environment.traverse(object=>{if(object instanceof Mesh){
    object.castShadow=true;object.receiveShadow=true;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    for(const material of materials)if(material instanceof MeshStandardMaterial){
      material.metalness=0; material.roughness=.48;
      if(/working surface/.test(material.name)){material.color.set('#cbd1ce');material.roughness=.7;}
      else if(/aluminum/.test(material.name))material.color.set('#aeb7b4');
      else if(/porcelain/.test(material.name))material.color.set('#dce0db');
      else if(/champagne/.test(material.name))material.color.set('#b2b8b1');
    }
  }});
  scene.add(environment);
  const ground = new Mesh(new PlaneGeometry(200,200), new MeshStandardMaterial({color:'#e3e5e3',roughness:.88,metalness:0}));
  ground.rotation.x=-Math.PI/2;ground.position.y=platformBox.min.y-.015;ground.receiveShadow=true;scene.add(ground);
  const deck = new Group(); scene.add(deck);
  const labelGeometry = new PlaneGeometry(.69,.69), tiles = new Map<string,Tile>();
  for (const [order,cell] of initial.cells.entries()) {
    const group = new Group();
    group.position.set(cell.col-layout.centerCol,-.12,cell.row-layout.centerRow);
    const model = tileTemplate.clone(true), skin:MeshStandardMaterial[]=[], light:MeshStandardMaterial[]=[];
    model.traverse(object=>{
      if(!(object instanceof Mesh))return;
      object.castShadow=true; object.receiveShadow=true;
      const original=Array.isArray(object.material)?object.material:[object.material];
      const materials=original.map(material=>{
        if(!(material instanceof MeshStandardMaterial))return material;
        const isCeramic=/tile_top|tile_body|tile_rim/i.test(object.name);
        const isLight=/tile_emissive/i.test(object.name)||/LIGHT/i.test(material.name);
        // Baked Gaussian sheen is a separate art-directed radiance term, not
        // a display beauty image relit as albedo. GLTFLoader decodes its sRGB
        // PNG to linear; OutputPass tone-maps the summed radiance exactly once.
        const copy=isCeramic?new MeshPhysicalMaterial({
          name:material.name, color: /tile_body/.test(object.name)?'#e7e9e2':/tile_rim/.test(object.name)?'#dce1dc':'#ffffff',
          metalness:0, map:null, emissiveMap:/tile_top/.test(object.name)?material.emissiveMap:null, emissive:/tile_top/.test(object.name)?'#ffffff':'#000000', emissiveIntensity:/tile_top/.test(object.name)?2:0, roughness:/tile_top/.test(object.name)?.30:.32,
          clearcoat:/tile_top/.test(object.name)?.18:.4, clearcoatRoughness:/tile_top/.test(object.name)?.28:.24, ior:1.46,
        }):material.clone();
        if(/tile_gasket|tile_foot/.test(object.name)){copy.color.set('#adb5af');copy.metalness=0;copy.roughness=.64;}
        if(/tile_top/.test(object.name)){
          skin.push(copy);
          if(copy instanceof MeshPhysicalMaterial){
            host.dataset.loadedTopMaterial=JSON.stringify({type:copy.type,roughness:copy.roughness,clearcoat:copy.clearcoat,clearcoatRoughness:copy.clearcoatRoughness,metalness:copy.metalness,ior:copy.ior,mapLoaded:!!copy.map,mapColorSpace:copy.map?.colorSpace,sheenMapLoaded:!!copy.emissiveMap,sheenColorSpace:copy.emissiveMap?.colorSpace,sheenRadianceScale:copy.emissiveIntensity,uv:!!object.geometry.getAttribute('uv')});
            const normals=object.geometry.getAttribute('normal');let minY=1,upward=0;
            for(let i=0;i<normals.count;i++)if(normals.getY(i)>.98){upward++;minY=Math.min(minY,normals.getY(i));}
            host.dataset.loadedTopGeometry=JSON.stringify({vertices:object.geometry.getAttribute('position').count,upwardNormals:upward,maxUpwardNormalTiltDegrees:Math.acos(minY)*180/Math.PI});
          }
        }
        if(isLight)light.push(copy);
        return copy;
      });
      object.material=Array.isArray(object.material)?materials:materials[0];
    });
    model.scale.y=1.16;
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
    texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    const label=new Mesh(labelGeometry,new MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));
    label.layers.set(1);
    label.rotation.x=-Math.PI/2;label.position.y=CROSSWORD_FACE_Y;
    group.add(model,label);deck.add(group);
    tiles.set(cell.key,{group,skin,light,texture,canvas,signature:'',target:.008,solved:false,celebrate:0,order});
  }
  let state=initial,disposed=false,frame=0,width=1,height=1,visible=true;
  let yaw=initial.angle,targetYaw=initial.angle,tilt=initial.elevation??44,targetTilt=tilt,completionTime=0,wasCompleted=false;
  const entered=performance.now();
  const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');let reduced=motionQuery.matches;
  const signalMaterials:MeshStandardMaterial[]=[];
  environment.traverse(object=>{if(object instanceof Mesh){const materials=Array.isArray(object.material)?object.material:[object.material];for(const m of materials)if(m instanceof MeshStandardMaterial&&/LIGHT.*ice|Signal|Accent|Emissive|quiet status/i.test(m.name))signalMaterials.push(m);}});
  const uniqueSignals=[...new Set(signalMaterials)];
  const chapterColors=['#93cfe2','#9bb8ec','#d7b77b','#a8d1bc'];
  function paint(cell:CrosswordDioramaCell,tile:Tile) {
    const focused=cell.active&&!!cell.focused;
    const signature=`${cell.value}|${cell.number}|${cell.solved}|${cell.wrong}|${cell.active}|${focused}`;
    if(signature===tile.signature)return;tile.signature=signature;
    const ctx=tile.canvas.getContext('2d');if(!ctx)return;
    ctx.clearRect(0,0,256,256);
    ctx.fillStyle=cell.wrong?'#932f35':'#132c3a';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='700 137px "Noto Sans KR", "Apple SD Gothic Neo", system-ui, sans-serif';ctx.fillText(cell.value,128,144);
    if(cell.number){ctx.font='800 49px system-ui, sans-serif';ctx.textAlign='left';ctx.fillStyle='#142820';ctx.fillText(String(cell.number),17,34);}
    if(cell.solved){ctx.fillStyle='#258278';ctx.beginPath();ctx.arc(232,24,7,0,Math.PI*2);ctx.fill();}
    const palette=crosswordCeramicPalette(cell.solved,cell.active,focused);
    for(const skin of tile.skin){skin.color.set(palette.face);if(skin instanceof MeshPhysicalMaterial)skin.emissive.set(palette.sheen);}
    // The selection border survives a solved crossing or an incorrect answer.
    // Paint it on the ceramic face so orbiting keeps the mark aligned in 3D.
    if(cell.active){
      ctx.strokeStyle=focused?'#114779':'#24629d';ctx.lineWidth=focused?9:5;
      const inset=focused?6:4,edge=256-inset,radius=15;
      ctx.beginPath();ctx.moveTo(inset+radius,inset);
      ctx.arcTo(edge,inset,edge,edge,radius);ctx.arcTo(edge,edge,inset,edge,radius);
      ctx.arcTo(inset,edge,inset,inset,radius);ctx.arcTo(inset,inset,edge,inset,radius);
      ctx.closePath();ctx.stroke();
    }
    if(cell.solved||cell.wrong){ctx.strokeStyle=cell.wrong?'#9b4943':'#4b8272';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(18,239);ctx.lineTo(238,239);ctx.stroke();}
    tile.texture.needsUpdate=true;
    for(const light of tile.light){light.color.set(cell.active?'#69b9ff':cell.wrong?'#e08077':cell.solved?'#77d1c4':'#7595a6');light.emissive.copy(light.color);light.emissiveIntensity=focused?.3:cell.active?.22:cell.solved?.16:.025;}
  }
  function projectControls(){
    for(const cell of state.cells){const tile=tiles.get(cell.key),button=overlay.querySelector<HTMLElement>(`[data-cell="${cell.key}"]`);if(!tile||!button)continue;
      const face=crosswordTileBounds(camera,tile.group.position.x,tile.group.position.y,tile.group.position.z,width,height);
      const {left,right,top,bottom}=face;
      button.style.setProperty('--tile-left',`${left}px`);button.style.setProperty('--tile-top',`${top}px`);button.style.setProperty('--tile-width',`${right-left}px`);button.style.setProperty('--tile-height',`${bottom-top}px`);button.style.zIndex=String(10+cell.row+(cell.active?n:0));
      // Adjacent projected rectangles overlap at a diagonal view. Clip input to the true face.
      button.style.clipPath=`polygon(${face.polygon.map(p=>`${(p.x-left)/(right-left)*100}% ${(p.y-top)/(bottom-top)*100}%`).join(',')})`;
    }
  }
  function render(){
    frame=0;if(disposed||!visible||document.hidden)return;
    const now=performance.now();let moving=Math.abs(targetYaw-yaw)>.02||Math.abs(targetTilt-tilt)>.02;
    yaw=reduced?targetYaw:yaw+(targetYaw-yaw)*.35;tilt=reduced?targetTilt:tilt+(targetTilt-tilt)*.35;
    const entryAge=now-entered;
    for(const tile of tiles.values()){
      const reveal=Math.max(0,Math.min(1,(entryAge-tile.order*13)/530));
      const entrance=reduced?0:-Math.pow(1-reveal,3)*.28;
      const successAge=(now-tile.celebrate)/620;
      const successBounce=tile.celebrate&&successAge<1&&!reduced?Math.sin(successAge*Math.PI)*.075:0;
      const waveAge=completionTime?(now-completionTime)/1100-tile.order*.012:2;
      const wave=state.completed&&waveAge>0&&waveAge<1&&!reduced?Math.sin(waveAge*Math.PI)*.07:0;
      if((reveal<1||successBounce||wave)&&!reduced)moving=true;
      const distance=tile.target+entrance+successBounce+wave-tile.group.position.y;
      if(Math.abs(distance)>.002)moving=true;
      tile.group.position.y=reduced||Math.abs(distance)<.002?tile.target+entrance+successBounce+wave:tile.group.position.y+distance*.22;
    }
    const pulse=completionTime?Math.max(0,1-(now-completionTime)/1600):0;
    const signal=chapterColors[((state.chapter??1)-1)%chapterColors.length];
    for(const material of uniqueSignals){material.emissive.set(signal);material.emissiveIntensity=.12+(state.completed?pulse*.2:0);}
    if(pulse>0&&!reduced)moving=true;
    frameCrosswordCamera(camera,n,width,height,yaw,layout,tilt);
    host.dataset.orbitAngle=String(yaw);host.dataset.orbitElevation=String(tilt);
    aoCamera.copy(camera);aoCamera.layers.set(0);
    try {
      renderer.shadowMap.needsUpdate=true;
      if(advanced)composer.render();else renderer.render(scene,camera);
      projectControls();
    } catch {
      // Optional contact AO never makes the playable board unavailable.
      advanced=false;host.dataset.renderQuality="standard-pbr";
      try{renderer.setRenderTarget(null);renderer.render(scene,camera);projectControls();}catch{failed();return;}
    }
    if(moving&&!reduced)frame=window.requestAnimationFrame(render);
  }
  function requestRender(){if(!frame&&!disposed&&visible&&!document.hidden)frame=window.requestAnimationFrame(render);}
  function update(next:CrosswordSceneState){
    state=next;targetYaw=next.angle;targetTilt=next.elevation??44;
    if(next.completed&&!wasCompleted)completionTime=performance.now();wasCompleted=!!next.completed;
    for(const cell of next.cells){const tile=tiles.get(cell.key);if(!tile)continue;if(cell.solved&&!tile.solved)tile.celebrate=performance.now();tile.solved=cell.solved;tile.target=cell.active?.045:cell.solved?.012:.008;paint(cell,tile);}requestRender();
  }
  function resize(){width=Math.max(host.clientWidth,1);height=Math.max(host.clientHeight,1);renderer.setSize(width,height,false);composer.setSize(width,height);const pixels=width*height*renderer.getPixelRatio()**2;
    const constrained=pixels>1800000||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4);
    aoPass.enabled=true;aoPass.setSize(Math.max(1,Math.round(width*(constrained?.65:1))),Math.max(1,Math.round(height*(constrained?.65:1))));
    host.dataset.renderQuality=advanced?(constrained?"studio-contact-ao-scaled":"studio-contact-ao-msaa"):"standard-pbr";requestRender();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(visible)requestRender();else{window.cancelAnimationFrame(frame);frame=0;}});intersection.observe(host);
  const visibility=()=>{if(document.hidden){window.cancelAnimationFrame(frame);frame=0;}else requestRender();};
  const changeMotion=()=>{reduced=motionQuery.matches;requestRender();};
  const lost=(event:Event)=>{event.preventDefault();failed();};
  document.addEventListener('visibilitychange',visibility);motionQuery.addEventListener('change',changeMotion);renderer.domElement.addEventListener('webglcontextlost',lost);
  void document.fonts?.ready.then(()=>{if(disposed)return;for(const tile of tiles.values())tile.signature='';update(state);});
  resize();update(initial);
  return{update,dispose(){
    if(disposed)return;disposed=true;window.cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);motionQuery.removeEventListener('change',changeMotion);renderer.domElement.removeEventListener('webglcontextlost',lost);
    const geometries=new Set<BufferGeometry>(),materials=new Set<Material>(),textures=new Set<Texture>();
    const collect=(root:Object3D)=>root.traverse(object=>{if(object instanceof Mesh){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);}});collect(scene);collect(tileTemplate);
    for(const tile of tiles.values())tile.texture.dispose();for(const geometry of geometries)geometry.dispose();for(const material of materials){for(const value of Object.values(material))if(value instanceof Texture)textures.add(value);material.dispose();}for(const texture of textures){texture.dispose();const image=texture.source.data;if(typeof ImageBitmap!=='undefined'&&image instanceof ImageBitmap)image.close();}environmentMap.dispose();aoPass.dispose();aoPass.gtaoMaterial.dispose();aoPass.blendMaterial.dispose();outputPass.dispose();composer.dispose();keyLight.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
  }};
}
