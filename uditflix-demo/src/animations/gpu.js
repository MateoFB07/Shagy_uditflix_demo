/** WebGL surface owned by an animation engine; the original canvas stays available for Canvas 2D fallback and pointer input. */
export function createSurface(canvas, vertex, fragment) {
  if (new URLSearchParams(location.search).get('renderer') === 'cpu') return null;
  const surface = document.createElement('canvas');
  surface.className = canvas.className;
  surface.setAttribute('aria-hidden', 'true');
  surface.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  const gl = surface.getContext('webgl', { alpha:true, premultipliedAlpha:false, antialias:false, depth:true, powerPreference:'high-performance' });
  if (!gl) return null;
  let program; const shaders=[], buffers=[], textures=[];
  try {
    program=gl.createProgram();
    for (const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]) {
      const sh=gl.createShader(type); shaders.push(sh); gl.shaderSource(sh,source); gl.compileShader(sh);
      if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(program,sh);
    }
    gl.linkProgram(program); if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch(e) { console.warn('WebGL fallback:',e); shaders.forEach(s=>gl.deleteShader(s)); if(program)gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();return null; }
  shaders.forEach(s=>gl.deleteShader(s)); gl.useProgram(program); canvas.before(surface);
  return {gl,surface,program,
    uniform(name){return gl.getUniformLocation(program,name);},
    buffer(){const b=gl.createBuffer();buffers.push(b);return b;},
    texture(){const t=gl.createTexture();textures.push(t);return t;},
    resize(w,h){if(surface.width!==w)surface.width=w;if(surface.height!==h)surface.height=h;gl.viewport(0,0,w,h);},
    dispose(){surface.remove();buffers.forEach(b=>gl.deleteBuffer(b));textures.forEach(t=>gl.deleteTexture(t));gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}
  };
}
