import { createSurface } from './gpu.js';
// The original projected silhouette is sampled only on resize. Deformation, UV scrolling,
// perspective-like fold depth and localized optical effects are evaluated by the GPU.
const vertex=`attribute vec4 aShape; attribute vec2 aUV; uniform float uBend,uHover,uHoverX; varying mediump vec2 vUV; varying mediump float vEdge; void main(){float x=aShape.z,t=aShape.w;float l=1.-smoothstep(.015,.19,x),r=smoothstep(.74,.97,x);float hx=(x-uHoverX)/.14;float influence=uHover*exp(-hx*hx);float y=aShape.y+uBend*(r-l)*.38*(.4+.6*sin(t*1.5707963))-influence*.012;float z=l*.65-r*1.2+(t-.5)*(l*.45+r*1.4)+influence*.12;gl_Position=vec4(aShape.x*2.-1.,1.-2.*y,-z*.25,1.);vUV=aUV;vEdge=max(1.-smoothstep(.025,.19,x),smoothstep(.77,.98,x));}`;
const fragment=`precision mediump float;uniform sampler2D uAtlas;uniform float uPhase,uSpeed;varying mediump vec2 vUV;varying mediump float vEdge;
vec3 art(vec2 q){return texture2D(uAtlas,vec2(fract(q.x/5.),clamp(q.y,.001,.999))).rgb;}
void main(){vec2 q=vec2(vUV.x+uPhase,vUV.y);float dim=min(.68,.68*vEdge+min(.16,abs(uSpeed)*.032));float k=floor(dim/.085+.5);vec3 c=art(q);if(k>0.){float rad=k*k*.19;vec2 d=vec2(rad/288.,rad/416.);c=c*.28+(art(q+vec2(d.x,0.))+art(q-vec2(d.x,0.))+art(q+vec2(0.,d.y))+art(q-vec2(0.,d.y)))*.12+(art(q+d*.75)+art(q-d*.75)+art(q+vec2(d.x,-d.y)*.75)+art(q+vec2(-d.x,d.y)*.75))*.06;if(k>1.){float shift=k*k*.32/288.;vec3 split=vec3(art(q+vec2(shift,0.)).r,c.g,art(q-vec2(shift,0.)).b);c=mix(c,split,.64);}c=mix(c,vec3(.027,.027,.035),k*.015);if(k>5.)c=mix(c,vec3(.60,.69,.78),.07);}float edge=1.-smoothstep(0.,.008,min(vUV.y,1.-vUV.y));vec3 tint=vUV.y<.5?vec3(.92,.62,.27):vec3(.22,.62,.89);c=mix(c,tint,edge*vEdge*vEdge*.30);gl_FragColor=vec4(c,1.);}`;
export function createRibbonGPU(canvas){
 const gpu=createSurface(canvas,vertex,fragment);if(!gpu)return null;const {gl,program}=gpu;
 const mesh=gpu.buffer(),index=gpu.buffer(),texture=gpu.texture();const NX=180,NY=12;
 const data=new Float32Array((NX+1)*(NY+1)*6),idx=new Uint16Array(NX*NY*6);let j=0;
 for(let i=0;i<NX;i++)for(let k=0;k<NY;k++){let a=i*(NY+1)+k,b=a+NY+1;idx.set([a,a+1,b,b,a+1,b+1],j);j+=6;}
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);
 gl.bindBuffer(gl.ARRAY_BUFFER,mesh);for(const [name,size,offset] of [['aShape',4,0],['aUV',2,16]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,24,offset);}
 const U=Object.fromEntries(['uBend','uHover','uHoverX','uPhase','uSpeed','uAtlas'].map(n=>[n,gpu.uniform(n)]));gl.uniform1i(U.uAtlas,0);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
 gl.bindTexture(gl.TEXTURE_2D,texture);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
 return {...gpu, upload(img){const atlas=document.createElement('canvas');atlas.width=1440;atlas.height=416;const c=atlas.getContext('2d');c.fillStyle='#151415';c.fillRect(0,0,1440,416);for(let i=0;i<5;i++)c.drawImage(img,i*288,0,288,416,i*288+5,4,278,408);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);},
 geometry(extent,view,aspect,pitch,spline,topX,botX,topY,botY){let j=0;for(let i=0;i<=NX;i++){const u=-extent+2*extent*i/NX,x=.5+u/(view*aspect),a=spline(topX,x),b=spline(botX,x),c=spline(topY,x),d=spline(botY,x);for(let k=0;k<=NY;k++){const t=k/NY;data.set([a+(b-a)*t,c+(d-c)*t,x,t,u/pitch,t],j);j+=6;}}gl.bindBuffer(gl.ARRAY_BUFFER,mesh);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);},
 draw(phase,speed,bend,hover,hx){gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(U.uPhase,((phase%5)+5)%5);gl.uniform1f(U.uSpeed,speed);gl.uniform1f(U.uBend,bend);gl.uniform1f(U.uHover,hover);gl.uniform1f(U.uHoverX,hx);gl.drawElements(gl.TRIANGLES,idx.length,gl.UNSIGNED_SHORT,0);}
 };
}
