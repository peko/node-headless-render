#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main( void ) {
	vec2 pos = ( gl_FragCoord.xy / resolution.xy );
	float three = 1.0 - ((pos.x + pos.y) / 2.0);
	vec3 color = vec3(three, pos.x, pos.y);
	vec3 color2 = color;
	
	pos = gl_FragCoord.xy / resolution.xy * 2.0 - 1.0;
	color *= abs(5.0 / (sin(pos.y + sin(pos.x + time) * 0.1) * 15.0));
	color2 *= abs(1.2 / (sin(pos.y + cos(pos.x + time) * 0.3) * 5.0));
	color += color2;
	color /= 2.0;

	gl_FragColor = vec4(color, 1.0 );
}