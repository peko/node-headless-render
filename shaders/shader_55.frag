#ifdef GL_ES
precision highp float;
#endif

//Fixed by kloumpt ?

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

const float VECTOR_SIZE = 24.0;

float distLine(vec2 p0,vec2 p1,vec2 uv)
{
	vec2 dir = normalize(p1-p0);
	uv = (uv-p0) * mat2(dir.x,dir.y,-dir.y,dir.x);
	return distance(uv,clamp(uv,vec2(0),vec2(distance(p0,p1),0)));   
}

float distVector(vec2 vec, vec2 uv)
{
	vec = normalize(vec);
	
	float dist = 1e6;
	
	uv -= 0.5;
	uv *= mat2(vec.x,vec.y,-vec.y,vec.x);
	
	dist = min(dist, distLine(vec2( 0.4, 0.0),vec2(-0.4, 0.0),uv));
	dist = min(dist, distLine(vec2( 0.4, 0.0),vec2( 0.2, 0.2),uv));
	dist = min(dist, distLine(vec2( 0.4, 0.0),vec2( 0.2,-0.2),uv));
	
	return dist;
}

void main( void ) 
{
	vec2 aspect = vec2(resolution.xy/resolution.y);
	vec2 uv = (gl_FragCoord.xy / resolution.y);
	
	//uv.x -= (aspect.x-1.0)/2.0;
	float x= sin(time) + sin(time*2.12834)*0.5 + sin(time*4.438143)*0.25;
	float y= sin(time*1.2341+1.4138) + sin(time*2.12834+3.185123)*0.5 + sin(time*4.438143+8.431234)*0.25;
	
	vec2 mo = vec2(mouse.x*2.,mouse.y);
	
	float color = 0.0;
	
	float vectors = floor(resolution.y / VECTOR_SIZE);
	
	vec2 rep = mod(uv,vec2(1.0/vectors))*vectors;
	
	vec2 pos = (floor(uv*vectors)+0.5)/vectors;
	
	color = distVector(normalize(mo-pos),rep);
	
	float scale = 1.0/resolution.y * vectors;
	
	color = smoothstep(1.5*scale,0.0,color);
	
	gl_FragColor = vec4( vec3( color ), 1.0 );

}