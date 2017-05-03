#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
//varying vec2 surfacePosition;

vec3   iResolution = vec3(resolution, 1.0);
float  iGlobalTime = time;
vec4   iMouse = vec4(mouse, 0.0, 1.0);
uniform sampler2D iChannel0,iChannel1;

// raymarcher from https://www.shadertoy.com/view/XsB3Rm

// ray marching
const int max_iterations = 80;
const float stop_threshold = 0.001;
const float grad_step = 0.0001;
const float clip_far = 1000.0;

// math
const float PI = 3.14159265359;
const float DEG_TO_RAD = PI / 180.0;


// get distance in the world
float dist_field(vec3 p) {
    p = mod(p, 8.0) - 4.0;
    p = abs(p);
    float cube = length(max(p - 1.0, 0.0));
    //return cube;
    float xd = max(p.y,p.z);
    float yd = max(p.x,p.z);
    float zd = max(p.x,p.y);
    float beams = min(zd, min(xd, yd)) - 0.25;
    //return beams;
    return min(beams, cube);
}
// phong shading
vec3 shading( vec3 v, vec3 eye ) {
	float s = v.x + v.y + v.z;
	return vec3(mod(floor (s * 3.0), 2.0));
}

// ray marching
float ray_marching( vec3 origin, vec3 dir, float start, float end ) {
	float depth = start;
	for ( int i = 0; i < max_iterations; i++ ) {
		float dist = dist_field( origin + dir * depth );
		if ( dist < stop_threshold ) {
			return depth;
		}
		depth += dist;
		if ( depth >= end) {
			return end;
		}
	}
	return end;
}

// get ray direction
vec3 ray_dir( float fov, vec2 size, vec2 pos ) {
	vec2 xy = pos - size * 0.5;

	float cot_half_fov = tan( ( 90.0 - fov * 0.5 ) * DEG_TO_RAD );	
	float z = size.y * 0.5 * cot_half_fov;
	
	return normalize( vec3( xy, -z ) );
}

// camera rotation : pitch, yaw
mat3 rotationXY( vec2 angle ) {
	vec2 c = cos( angle );
	vec2 s = sin( angle );
	
	return mat3(
		c.y      ,  0.0, -s.y,
		s.y * s.x,  c.x,  c.y * s.x,
		s.y * c.x, -s.x,  c.y * c.x
	);
}

void main(void)
{
	// default ray dir
	vec3 dir = ray_dir( 35.0, iResolution.xy, gl_FragCoord.xy );
	
	// default ray origin
	vec3 eye = vec3( 0.0, 0.0, 10.0 );

	// rotate camera
	mat3 rot = rotationXY( vec2( iGlobalTime * 0.13, iGlobalTime * 0.19 ) );
	dir = rot * dir;
	eye = rot * eye;
    eye.z -=  mod(iGlobalTime * 4.0, 8.0);
    eye.y = eye.x = 0.0;
	
	// ray marching
	float depth = ray_marching( eye, dir, 3.75, clip_far );
	if ( depth >= clip_far ) {
		gl_FragColor = vec4(1.0);
    } else {
		// shading
		vec3 pos = eye + dir * depth;
		gl_FragColor = vec4( shading( pos, eye ) , 1.0 );
        gl_FragColor += depth/clip_far * 12.0;
    }
	
    gl_FragColor = vec4(vec3(1.0, 0.6, 0.0) - gl_FragColor.xyz, 1.0);
}