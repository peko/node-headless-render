/*
#ifdef GL_ES
precision highp float;
#endif
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
float floorSmooth(float x,float c){float a=fract(x);return((pow(a,c)-pow(1.-a,c))/2.)+floor(x);}
vec3 hue(float hue){vec3 rgb=fract(hue+vec3(0.,2./3.,1./3.));rgb=abs(rgb*2.-1.);return clamp(rgb*3.-1.,0.,1.);}
vec3 d(vec2 uv){uv-=.5;return (vec3((max(abs(uv.x),abs(uv.y))-.3)*6.)*hue(time+length(uv)+length(uv))*2.);}
#define cl3(x) clamp(x,0.,1.)
void main() {
	vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
	float th=floorSmooth(time*2.,5.);
	uv*=mat2(cos(th),-sin(th),sin(th),cos(th));
	float c=3.;float s=3.;float t=2.;
	float t2=(time/2.)-(length(uv)*2.);
	vec2 a=fract(uv*pow(2.,floorSmooth((fract(t2)*t)+s,c)));
	vec2 b=fract(uv*pow(2.,floorSmooth(((fract(t2)-1.)*t)+s,c)));
	gl_FragColor = vec4(mix(cl3(d(a)),cl3(d(b)),fract(t2)),1.);
}
*/
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
float floorSmooth(float x,float c){float a=fract(x);return((pow(a,c)-pow(1.-a,c))/2.)+floor(x);}
vec3 hue(float hue){vec3 rgb=fract(hue+vec3(0.,2./3.,1./3.));rgb=abs(rgb*2.-1.);return clamp(rgb*3.-1.,0.,1.);}
vec3 d(vec2 uv){uv-=.5;return (vec3((max(abs(uv.x),abs(uv.y))-.3)*6.)*hue(time+length(uv)+length(uv))*2.);}
#define cl3(x) clamp(x,0.,1.)
void main() {
	vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
	float th=floorSmooth(time*.1,27.);
	uv*=mat2(cos(th),-cos(th),cos(th),cos(th));
	float c=5.;float s=3.;float t=1.;
	float t2=(time/2.)-(length(uv)*2.);
	vec2 a=fract(uv*pow(2.,floorSmooth((fract(t2)*t)+s,c)));
	vec2 b=fract(uv*pow(2.,floorSmooth(((fract(t2)-1.)*t)+s,c)));
	vec3 col=mix(cl3(d(a)),cl3(d(b)),fract(t2));
	gl_FragColor = vec4(col,1);
}