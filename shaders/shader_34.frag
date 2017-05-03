

// WORMHOLE - watch for a little while
// better, cleaner version.

#ifdef GL_ES
precision lowp float;
#endif
 
 
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;


#define iterations 7
#define formuparam 0.79
 
#define volsteps 6
#define stepsize 0.230
 
#define zoom 0.500
#define tile  0.85

#define speed (-0.01 * cos((cos(0.02*time))))
 
#define brightness (0.03 * (1.5 - 0.5*sus_sin(0.5*time)))
#define darkmatter 0.400
#define distfading 0.560
#define saturation 0.800


#define transverseSpeed zoom*.005



#define cloud 0.3
#define pi 3.141592653589

//#define centralDamping pow(pow( pow(uvs.x*uvs.x,1.3) + pow(uvs.y*uvs.y,1.3), 1.0/(6.) ),1.5*((0.5 - 0.5*sus_sin(0.5*time))))
#define centralDamping 1.0



// an alternating periodic smoothstepping function
float sus_sin(float x)
{
	float x1 = x + (8.5*pi/2.0);
	float o1 = (clamp((1.0/(sin(pi/10.0))) * sin((1.0/5.0)*x1),-1.0,1.0));
	
	return max(abs(sin(x1)),abs(o1)) * sign(o1);
	
}






vec2 warp4(vec2 uvs)
{
	float a = abs(atan(uvs.y,uvs.x));
	float r = pow( pow(uvs.x*uvs.x,1.8) + pow(uvs.y*uvs.y,1.8), 1.0/(0.9 / length(uvs)) );
	
	
	return (0.5 + 0.5*sus_sin(0.5*time))*uvs  +  (0.5 - 0.5*sus_sin(0.5*time))*vec2((0.3/pow(r,1.)), (1.*(a)/3.1415927));
		
}

vec2 warp2(vec2 uvs)
{
	float a = abs(atan(uvs.y,uvs.x));
	float r = pow( pow(uvs.x*uvs.x,1.3) + pow(uvs.y*uvs.y,1.3), 1.0/(6.) );
	
	
	return (0.5 + 0.5*sus_sin(0.5*time))*uvs  +  (0.5 - 0.5*sus_sin(0.5*time))*vec2((0.3/pow(r,1.)), (1.*a/3.1415927));
		
}

vec2 warp3(vec2 uvs)
{
	float a = abs(atan(uvs.y,uvs.x));
	float r = pow( pow(uvs.x*uvs.x,1.3) + pow(uvs.y*uvs.y,1.3), 1.0/(6.) );
	
	
	return (0.5 + 0.5*sus_sin(0.5*time))*uvs  +  (0.5 - 0.5*sus_sin(0.5*time))*vec2(uvs /pow(length(uvs),1.5));
		
}

vec2 warp5(vec2 uvs)
{
	float a = abs(atan(uvs.y,uvs.x));
	float r = pow( pow(uvs.x*uvs.x,1.0) + pow(uvs.y*uvs.y,1.0), 1.0/(1.0 / (sin(1.1*length(uvs))) ));
	
	
	//return (0.5 + 0.5*sus_sin(0.5*time))*uvs  +  (0.5 - 0.5*sus_sin(0.5*time))*vec2((0.3/pow(r,1.)), (1.*(a)/3.1415927));
	return (0.5 + 0.5*sus_sin(0.5*time))*uvs  +  (0.5 - 0.5*sus_sin(0.5*time))*vec2((20.7/cos(0.3*pow(r,0.5))), 5.2*(atan(0.4*(a))));
			
}

vec2 warp(vec2 uvs)
{
	float a = abs(atan(uvs.y,uvs.x));
	float r = pow( pow(uvs.x*uvs.x,1.0) + pow(uvs.y*uvs.y,1.0), 1.0/(1.0 / (sin(1.1*length(uvs))) ));
	
	
	//return (0.5 + 0.5*sus_sin(0.5*time))*uvs  +  (0.5 - 0.5*sus_sin(0.5*time))*vec2((0.3/pow(r,1.)), (1.*(a)/3.1415927));
	return (0.5 + 0.5*sus_sin(0.5*time))*uvs  +  (0.5 - 0.5*sus_sin(0.5*time))*vec2(1.0*uvs/pow(cos(0.02*pow(r,1.9)),46.8));
			
}
float field(in vec3 p) {
	
	float strength = 17. + .03 * log(1.e-6 + fract(sin(time) * 4373.11));
	float accum = 0.;
	float prev = 0.;
	float tw = 0.;
	

	for (int i = 0; i < 3; ++i) {
		float mag = dot(p, p);
		p = abs(p) / mag + vec3(-.5, -.8 + 0.1*sin(time*0.7 + 2.0), -1.1+0.3*cos(time*0.3));
		float w = exp(-float(i) / 7.);
		accum += w * exp(-strength * pow(abs(mag - prev), 2.3));
		tw += w;
		prev = mag;
	}
	return max(0., 3. * accum / tw - .7);
}



void main()
{
   	
	float a_xz = 0.9;
	float a_yz = -.6;
	float a_xy = 0.9 + time*0.01;
	
	
	mat2 rot_xz = mat2(cos(a_xz),sin(a_xz),-sin(a_xz),cos(a_xz));
	
	mat2 rot_yz = mat2(cos(a_yz),sin(a_yz),-sin(a_yz),cos(a_yz));
		
	mat2 rot_xy = mat2(cos(a_xy),sin(a_xy),-sin(a_xy),cos(a_xy));
	
	
     	vec2 uv2 = 2. * gl_FragCoord.xy / resolution.xy - 1.;
	vec2 uvs = uv2 * resolution.xy / max(resolution.x, resolution.y);
	
	
	vec3 from=vec3(0.0, 0.0,0.0);
 	
	
	vec2 from_change = 1.0*vec2((mouse.x-0.5), (mouse.y-0.5));
	from_change *= +3.0*rot_xy;
	from.xy += from_change;

	
	
	uvs *= -3.0*rot_xy;

	// warp!
	vec2 uv = warp(uvs);
	
	
	vec3 dir=vec3(uv*zoom,1.);
 
            

	vec3 forward = vec3(0.,0.,1.);
               
	
	from.y -= 20.0;
	from.x += transverseSpeed*(300.0)*(0.5 + 0.5*cos(0.2*time));
	
	from.z += 0.003*time;
	
	dir.x += -transverseSpeed*(300.0)*(cos(0.3*time));
	
	
	dir.xy*= rot_xy;
	forward.xy *= rot_xy;

	dir.xz*=rot_xz;
	forward.xz *= rot_xz;
	
	dir.yz*= rot_yz;
	forward.yz *= rot_yz;
	 

	
	from.xy*=-rot_xy;
	from.xz*= rot_xz;
	from.yz*= rot_yz;
	 
	
	//zoom
	float zooom = (time-3311.)*speed;
	from += forward* zooom;
	float sampleShift = mod( zooom, stepsize );
	 
	float zoffset = -sampleShift;
	sampleShift /= stepsize; // make from 0 to 1


	
	//volumetric rendering
	float s=0.24;
	float s3 = s + stepsize/2.0;
	vec3 v=vec3(0.);
	float t3 = 0.0;
	float v2 =1.0;
	

	
	vec3 backCol2 = vec3(0.);

	for (int r=0; r<volsteps; r++) {
		vec3 p2=from+(s+zoffset)*dir;
		vec3 p3=from+(s3+zoffset)*dir;
		
		p2 = abs(vec3(tile)-mod(p2,vec3(tile*2.))); // tiling fold
		p3 = abs(vec3(tile)-mod(p3,vec3(tile*2.))); // tiling fold
		
		#ifdef cloud
		t3 = field(p3);
		#endif
		
		float pa,a=pa=0.;
		for (int i=0; i<iterations; i++) {
			p2=abs(p2)/dot(p2,p2)-formuparam; // the magic formula
			//p=abs(p)/max(dot(p,p),0.005)-formuparam; // another interesting way to reduce noise
			float D = abs(length(p2)-pa); // absolute sum of average change
			a += i > 7 ? min( 12., D) : D;
			pa=length(p2);
		}
		
		
		//float dm=max(0.,darkmatter-a*a*.001); //dark matter
		a*=a*a; // add contrast
		//if (r>3) fade*=1.-dm; // dark matter, don't render near
		// brightens stuff up a bit
		float s1 = s+zoffset;
		// need closed form expression for this, now that we shift samples
		float fade = pow(distfading,max(0.,float(r)-sampleShift));
		
		
		
		v+=fade;

		// fade out samples as they approach the camera
		if( r == 0 )
			fade *= (1. - (sampleShift));
		// fade in samples as they approach from the distance
		if( r == volsteps-1 )
			fade *= sampleShift;
		v+=vec3(s1,s1*s1,s1*s1*s1*s1)*a*brightness*fade; // coloring based on distance
		
		backCol2 += mix(.4, 1., v2) * vec3(1.8 * t3 * t3 * t3, 1.4 * t3 * t3, t3) * fade;

		
		s+=stepsize;
		s3 += stepsize;
		
		
		
	}
		       
	v=mix(vec3(length(v)),v,saturation); //color adjust
	 
	
	vec4 forCol2 = vec4(v*.01,1.);
	
	#ifdef cloud
	backCol2 *= cloud;
	#endif
	
	backCol2.b *= 1.8;
	backCol2.r *= 0.05;
	backCol2.b = 0.5*mix(backCol2.g, backCol2.b, 0.8);
	backCol2.g = 0.0;
	backCol2.bg = mix(backCol2.gb, backCol2.bg, 0.5*(cos(time*0.01) + 1.0));
	
	vec4 newCol = (forCol2 + vec4(backCol2, 1.0)) * centralDamping;
	
	gl_FragColor = newCol;


	
 
}
