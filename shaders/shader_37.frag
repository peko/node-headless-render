#ifdef GL_ES
precision mediump float;
#endif
 
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

#define PI 3.1415927
#define PI2 (PI*2.0)

// http://glsl.heroku.com/e#7109.0 simplified by logos7@o2.pl

void main(void)
{
	vec2 position = 100.0 * ((2.0 * gl_FragCoord.xy - resolution) / resolution.x);

	float r = length(position) * 2.;
	float a = atan(position.y, position.x);
	float d = r - a + PI2;
	float n = PI2 * float(int(d / PI2));
	float k = a + n;
	float rand = tan(floor(0.025 * k * k + time * 1.));

	gl_FragColor.rgba = vec4(fract(rand*vec3(2, 7., 3)) * 2. - 0.6, 1.);
}