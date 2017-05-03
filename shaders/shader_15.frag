#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main()
{
    vec4 p = vec4((gl_FragCoord.xy * 2.-resolution.xy)/resolution.y,0.31,1.5), r, q = p-p;
    
    float k = .295;
    q.w+= time * 0.3 + 1.;
    q += vec4(0.5*cos(time*.2),1.6*sin(time*.5),0.,1.);
	
	for (float i=120.; i>0.; i-=1.) 
	{
        	float d=0.,s=1.0;

 	      	for (int j = 0; j <2; j++)
		{
			r = abs( mod(q * s + 1.0,2.) - 1.0 );
            		d = max(d, (k - length( sqrt(r * 0.0445) )) / 1.5 );
			s *= 3.;
		}

        	q += p * d;
        	gl_FragColor = vec4(i/110.);
        	if(d < 1e-5) break;
    	}
}
