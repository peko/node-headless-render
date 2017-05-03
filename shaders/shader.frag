precision mediump float;
const int max_iterations = 255;

uniform vec2 center_u;

vec2 complex_square( vec2 v ) {
  return vec2(
    v.x * v.x - v.y * v.y,
    v.x * v.y * 2.0
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy - vec2(512.0,512.0) * 0.5;
  uv *= 2.5 / min( 512.0, 512.0 );

  #if 0 // Mandelbrot
    vec2 c = uv;
    vec2 v = vec2( 0.0 );
    float scale = 0.06;
  #else // Julia
    vec2 c = vec2( center_u.x, center_u.y );
    vec2 v = uv;
    float scale = 0.01;
  #endif

  int count = max_iterations;

  for ( int i = 0 ; i < max_iterations; i++ ) {
    v = c + complex_square( v );
    if ( dot( v, v ) > 4.0 ) {
      count = i;
      break;
    }
  }

  gl_FragColor = vec4( float( count ) * scale );
}