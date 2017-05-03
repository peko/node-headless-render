#ifdef GL_ES
precision mediump float;
#endif

// rakesh@picovico.com : www.picovico.com

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

const float fRadius = 0.05;
const float fadeSpeed = 0.75;
const float motionSpeed = 1.0;
const int bubbles = 64;
vec3 color = vec3(0.2,0.2,0.4);


float hash( float n )
{
	return fract( (1.0 + cos(n)) * 415.92653);
}

float noise2d( in vec2 x )
{
    float xhash = hash( x.x * 37.0 );
    float yhash = hash( x.y * 57.0 );
    return fract( xhash + yhash );
}

void main(void) {
	
    vec2 uv = -1.0 + 2.0*gl_FragCoord.xy / resolution.xy;
    uv.x *=  resolution.x / resolution.y;

    // bubbles
    for (int i=0; i < bubbles; i++ ) {
            // bubble seeds
        float pha = tan(float(i)*6.+1.0)*0.5 + 0.5;
        float siz = pow( cos(float(i)*2.4+5.0)*0.5 + 0.5, 4.0 );
        float pox = cos(float(i)*3.55+4.1) * resolution.x / resolution.y;
        
            // bubble size, position and color
        float rad = fRadius + sin(float(i))*0.12+0.08;
	float rndVal = noise2d( resolution );    
	float rndVal2 = noise2d( vec2(i+10, i+10)  );    
        vec2  pos = vec2( rndVal+pox+sin(time*motionSpeed/15.+pha+siz), rndVal2+ -1.0-rad + (2.0+2.0*rad)
                         *mod(pha+0.1*(time*motionSpeed/5.)*(0.2+0.8*siz),1.0)) * vec2(1.0, 1.0);
	rndVal = noise2d( vec2(i, i) ); 

        float dis = length( uv - pos );
        vec3  col = mix( vec3(0.1, 0.2, 0.8), vec3(0.2,0.8,0.6), 0.5+0.5*sin(float(i)*sin(time*fadeSpeed*pox*0.03)+1.9));
        
            // render
        color += col.xyz *(1.- smoothstep( rad*(0.65+0.20*sin(pox*time*fadeSpeed)), rad, dis )) * (1.0 - cos(pox*time*fadeSpeed));
    }

    gl_FragColor = vec4(color,1.0);
}
