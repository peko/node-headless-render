// Lightning
// By: Brandon Fogerty
// bfogerty at gmail dot com 
// xdpixel.com


#ifdef GL_ES
precision lowp float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;


float Hash( vec2 p)
{
     vec3 p2 = vec3(p.xy,1.0);
    return fract(sin(dot(p2,vec3(37.1,61.7, 12.4)))*3758.5453123);
}

float noise(in vec2 p)
{
    vec2 i = floor(p);
     vec2 f = fract(p);
     f *= f * (3.0-2.0*f);

    return mix(mix(Hash(i + vec2(0.,0.)), Hash(i + vec2(1.,0.)),f.x),
               mix(Hash(i + vec2(0.,1.)), Hash(i + vec2(1.,1.)),f.x),
               f.y);
}

float fbm(vec2 p)
{
     float v = 0.0;
     v += noise(p*1.0)*.5;
     v += noise(p*2.)*.25;
     v += noise(p*4.)*.125;
     return v;
}

void main( void ) 
{

	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) * 2.0 - 1.0;
	uv.x *= resolution.x/resolution.y*0.5;
	uv -= mouse;
	
	float timeVal = time*0.1;
	vec3 finalColor = vec3( 0.0 );
	for( int i=0; i < 8; ++i )
	{
		float indexAsFloat = float(i);
		float amp = 40.0 + (indexAsFloat*5.0);
		float period = 3.0 + (indexAsFloat+2.0);
		float thickness = mix( 0.7, 1.0, noise(uv*10.0) );
		float t = 0.3*abs( 1.0 / (sin(uv.x + fbm( uv + timeVal * period )) * amp) * thickness );
		float show = fract(abs(sin(timeVal))) >= 0.9 ? 1.0 : 0.0;
		show = 1.0;
		finalColor +=  t * vec3( 0.3, 0.5, 2.0 ) * show;
	}
	
	gl_FragColor = vec4( finalColor, 1.0 );

}