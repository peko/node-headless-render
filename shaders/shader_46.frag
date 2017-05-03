#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

//based on a gif I saw on imgur. 
//looked easy to duplicate. It was. 
//https://i.imgur.com/zk2rtku.gif

uniform float time;
uniform vec2 resolution;

float size = 32.0;
float speed= 0.9;

float random(vec2 co){
    return fract(sin(dot(co.xy ,vec2(0.5, 8))) * 128.0);
}
vec3 random_color(vec2 coords){
	float r = random(coords.xy * 32.0);
	float g = random(coords.xy * 64.0);
	float b = random(coords.xy * 128.0);
	return vec3(r,g,b);
}
float tri(float x){
	x = mod(x,1.0);
	if (x > 1.0) x = -x+2.0;
	return x;
}
float chess_dist(vec2 uv) {
    return max(abs(uv.x),abs(uv.y));
}
void main( void ) {
	vec2 uv = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
	uv.y *= resolution.y/resolution.x;
	vec3 colors = random_color(floor(uv*size))*step(chess_dist((fract(uv*size)-.5)*2.),tri((((time*speed)+((random(floor(uv*size)))*2.)))));
	gl_FragColor = vec4(colors, 1.0 );

}