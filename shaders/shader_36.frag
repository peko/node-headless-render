#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform vec2 surfaceSize; 
uniform sampler2D backbuffer;
varying vec2 surfacePosition;

#define time ((sin(time/3.141592)*15.5)+10.0*(mouse.x-mouse.y*3.141592))

// Star Nest by Pablo Román Andrioli
// Modified a lot. ( says http://glslsandbox.com/e#33445.0 who )

// This content is under the MIT License.


#define iterations 10
#define formuparam .2524

//(0.5 + 0.5*cos(time))

#define volsteps 8
#define stepsize 0.190

#define zoom   ((1.900+(mouse.y*2.0-1.0)) * (0.5 + 0.5*cos(0.1*time)) + 0.5)
#define tile   85e-2
#define speed  1e-10

#define brightness (0.005 + 0.004*(sin(0.2*time)))
#define darkmatter 0.400
#define distfading 0.560
#define saturation 0.800


void main(void)
{
	//get coords and direction
	vec2 uv=gl_FragCoord.xy/resolution.xy-.5;
	uv.y*=resolution.y/resolution.x;
	
	
		uv += mouse.xy;

	
	vec3 dir=vec3(uv*zoom,1.);
	
	//float a2=time*speed+.5;
	float a2=-2.1;
	float a1=0.8;
	
	float a3 = 0.063*time;
	
	mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
	mat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
	mat2 rot3=mat2(cos(a3),sin(a3),-sin(a3),cos(a3));
	
	//from.x-=time;
	//mouse movement
	
		dir.xy *= rot3;

	vec3 from=vec3(.3,0.,0.);
	
	dir.xy += mouse.xy;
	
	
	
	from+=vec3(.05*time,.05*time,-.03*time*0.1);//*1.5;//*mouse.y*1.3;
	dir-=vec3(0.1*time,.15*time,-.003*time);
	
	
	//dir.xy *= rot3;
	
	dir.xz*=rot1;
	dir.yz*=rot2;
	
	from.xz*=rot1;
	from.yz*=rot2;
	
	
	
	//volumetric rendering
	float s=.4,fade=.2;
	vec3 v=vec3(0.4);
	for (int r=0; r<volsteps; r++) {
		vec3 p=from+s*dir*.5;
		p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
		float pa,a=pa=0.;
		for (int i=0; i<iterations; i++) { 
			p=abs(p)/dot(p,p)-formuparam; // the magic formula
			a+=abs(length(p)-pa); // absolute sum of average change
			pa=length(p);
		}
		float dm=max(0.,darkmatter-a*a*.001); //dark matter
		a*=a*a*2.; // add contrast
		if (r>3) fade*=1.-dm; // dark matter, don't render near
		//v+=vec3(dm,dm*.5,0.);
		v+=fade;
		v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance
		fade*=distfading; // distance fading
		s+=stepsize;
	}
	v=mix(vec3(length(v)),v,saturation); //color adjust
	gl_FragColor = vec4(v*.01,1.);	
	
}