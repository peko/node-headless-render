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
	 
	
	pos = gl_FragCoord.xy / resolution.xy * 2.0 - 1.0;
	
	for(float i=0.0;i<0.5;i+=0.05){
	
	color *= abs(1.0+i /(sin(pos.y + sin(pos.x + i*time) * 4.) * 4.0));
		
	}
	
	 
	gl_FragColor = vec4(color, 1.0 );
}