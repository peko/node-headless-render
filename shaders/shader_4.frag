#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
void main(void) {
	vec2 uv = (2.*gl_FragCoord.xy - resolution.xy) / min(resolution.x, resolution.y);

	vec3 color;
	if (length(uv) > sin(time) * cos(time) * tan(time) + 0.1) {
		color = vec3(1.);
	} else {
		color = vec3(0.);
	}
	
	gl_FragColor = vec4(color, 1.);
}