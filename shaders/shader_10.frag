#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float spherish( vec2 uv, vec2 minPow )
{
    return pow( max(minPow.x - dot(uv,uv), 0.), minPow.y);
}

vec3 abnormish( vec2 uv, vec2 minPow )
{
    float d = spherish( uv, minPow );
    uv *= uv += d;
    return vec3(uv,d);
}

void main( void )
{
    vec2 uv = ((gl_FragCoord.xy-mouse*resolution)*2.0)/max(resolution.x,resolution.y)-0.5/length(mouse.x);
    uv = fract( uv *= 8.0 * mouse.x ) - .5;
    gl_FragColor = vec4( abnormish(uv,vec2(0.25,0.18)), 1.0 );
}
