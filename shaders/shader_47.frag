// FractalColors
precision mediump float;
uniform vec2 mouse;
uniform vec2 resolution;
void main()
{
  vec3 p = vec3(gl_FragCoord.xy / resolution.y, mouse.x-2.0);
  for (int i = 0; i < 128; i++)
    p.xzy = vec3(1.3,0.999,0.777) * (abs(abs(p)/dot(p,p)-vec3(1.0,1.0,mouse.y*0.5)));
  gl_FragColor = vec4(p, 1.0);
}