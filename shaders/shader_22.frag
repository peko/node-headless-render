#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform vec2 resolution;

#define ITE_MAX 150

#define EPS 0.005
#define FAR 10.0
#define V vec2(0.,1.)
#define INIT_LEN 0.01

mat2 rot2(float radian) {
	float c = cos(radian);
	float s = sin(radian);
	
	return mat2(c, s, -s, c);
}

vec3 rotHue(vec3 p, float a){
	vec2 cs = sin(vec2(1.570796, 0) + a);
	mat3 hr = mat3(0.299,  0.587,  0.114,  0.299,  0.587,  0.114,  0.299,  0.587,  0.114) +
        	  mat3(0.701, -0.587, -0.114, -0.299,  0.413, -0.114, -0.300, -0.588,  0.886) * cs.x +
        	  mat3(0.168,  0.330, -0.497, -0.328,  0.035,  0.292,  1.250, -1.050, -0.203) * cs.y;
	return clamp(p * hr, 0.0, 1.0);
}

// ------
// http://www.viz.tamu.edu/faculty/ergun/research/implicitmodeling/papers/sm99.pdf

vec3 n1 = vec3(1.000, 0.000, 0.000);
vec3 n2 = vec3(0.000, 1.000, 0.000);
vec3 n3 = vec3(0.000, 0.000, 1.000);
vec3 n4 = vec3(0.577, 0.577, 0.577);
vec3 n5 = vec3(-0.577, 0.577, 0.577);
vec3 n6 = vec3(0.577, -0.577, 0.577);
vec3 n7 = vec3(0.577, 0.577, -0.577);
vec3 n8 = vec3(0.000, 0.357, 0.934);
vec3 n9 = vec3(0.000, -0.357, 0.934);
vec3 n10 = vec3(0.934, 0.000, 0.357);
vec3 n11 = vec3(-0.934, 0.000, 0.357);
vec3 n12 = vec3(0.357, 0.934, 0.000);
vec3 n13 = vec3(-0.357, 0.934, 0.000);
vec3 n14 = vec3(0.000, 0.851, 0.526);
vec3 n15 = vec3(0.000, -0.851, 0.526);
vec3 n16 = vec3(0.526, 0.000, 0.851);
vec3 n17 = vec3(-0.526, 0.000, 0.851);
vec3 n18 = vec3(0.851, 0.526, 0.000);
vec3 n19 = vec3(-0.851, 0.526, 0.000);

// p as usual, e exponent (p in the paper), r radius or something like that
float cube(vec3 p, float e, float r) {
	float s = pow(abs(dot(p, n1)), e);
	s += pow(abs(dot(p, n2)), e);
	s += pow(abs(dot(p, n3)), e);
	s = pow(s, 1./e);
	return s-r;
}

float octahedral(vec3 p, float e, float r) {
	float s = pow(abs(dot(p, n4)), e);
	s += pow(abs(dot(p, n5)), e);
	s += pow(abs(dot(p, n6)), e);
	s += pow(abs(dot(p, n7)), e);
	s = pow(s, 1./e);
	return s-r;
}

float dodecahedral(vec3 p, float e, float r) {
	float s = pow(abs(dot(p, n14)), e);
	s += pow(abs(dot(p, n15)), e);
	s += pow(abs(dot(p, n16)), e);
	s += pow(abs(dot(p, n17)), e);
	s += pow(abs(dot(p, n18)), e);
	s += pow(abs(dot(p, n19)), e);
	s = pow(s, 1./e);
	return s-r;
}

float icosahedral(vec3 p, float e, float r) {
	float s = pow(abs(dot(p, n4)), e);
	s += pow(abs(dot(p, n5)), e);
	s += pow(abs(dot(p, n6)), e);
	s += pow(abs(dot(p, n7)), e);
	s += pow(abs(dot(p, n8)), e);
	s += pow(abs(dot(p, n9)), e);
	s += pow(abs(dot(p, n10)), e);
	s += pow(abs(dot(p, n11)), e);
	s += pow(abs(dot(p, n12)), e);
	s += pow(abs(dot(p, n13)), e);
	s = pow(s, 1./e);
	return s-r;
}

#define CUBE_RADIUS 0.162
#define CUBE_COEF_MIN 2.0
#define CUBE_COEF_MAX 15.0
#define OCTA_RADIUS 0.158
#define OCTA_COEF_MIN 2.0
#define OCTA_COEF_MAX 18.0
#define DODECA_RADIUS 0.19
#define DODECA_COEF_MIN 3.0
#define DODECA_COEF_MAX 40.0
#define ICOSA_RADIUS 0.2
#define ICOSA_COEF_MIN 5.0
#define ICOSA_COEF_MAX 50.0

#define TIME_COEF 0.9
#define ROTATE_COEF 1.0

#define OBJ_DIST_X 0.7
#define HALF_OBJ_DIST_X OBJ_DIST_X*0.5
#define OBJ_DIST_Y 0.7
#define HALF_OBJ_DIST_Y OBJ_DIST_Y*0.5

float distanceFromCenter;

float dfScene(vec3 _p) {
    	float yIndex = floor(mod(floor((abs(_p.y) + HALF_OBJ_DIST_Y) / OBJ_DIST_Y), 4.0));
	float dist = 0.;

	_p.x += HALF_OBJ_DIST_X * (yIndex + 1.0);
    	_p.y += HALF_OBJ_DIST_Y;
    	vec3 p = vec3(mod(_p.x, OBJ_DIST_X) - HALF_OBJ_DIST_X, mod(_p.y, OBJ_DIST_Y) - HALF_OBJ_DIST_Y, _p.z);
    
     	p.zx = rot2(time * ROTATE_COEF) * p.zx;

	float c = cos(time * TIME_COEF + _p.y * 2.0);
	float mixCoef = c * 0.5 + 0.5;
	
	if (yIndex == 0.0) {
		float coef = mix(ICOSA_COEF_MIN, ICOSA_COEF_MAX, mixCoef);     
    		dist = icosahedral(p, coef, ICOSA_RADIUS);
	} else if (yIndex <= 1.0 && _p.y > 0.0){
		float coef = mix(OCTA_COEF_MIN, OCTA_COEF_MAX, mixCoef);
     		dist = octahedral(p, coef, OCTA_RADIUS);
	}  else if (yIndex <= 1.0) {
		float coef = mix(DODECA_COEF_MIN, DODECA_COEF_MAX, mixCoef);
     		dist = dodecahedral(p, coef, DODECA_RADIUS);
	}  else {
		float coef = mix(CUBE_COEF_MIN, CUBE_COEF_MAX, mixCoef);
     		dist = cube(p, coef, CUBE_RADIUS);
	} 
	
    	distanceFromCenter = length(p);

    	return dist;
}

vec3 surfaceNormal(in vec3 _p) {
	vec2 d = V * 1E-2;
	return normalize(vec3(dfScene(_p + d.yxx) - dfScene(_p - d.yxx),
			      dfScene(_p + d.xyx) - dfScene(_p - d.xyx),
			      dfScene(_p + d.xxy) - dfScene(_p - d.xxy)));
}

vec3 marchScene(vec3 ro, vec3 rd) {
	vec3 pixelColor = vec3(0.0);
	float dist = 0.0;
	vec3 rayPosition = vec3(0.0);
   
	vec3 lightPosition = normalize(vec3(2.0, 5.0, -3.0));
	vec3 sceneColor = rotHue(vec3(0.5, 0.2, 0.8), mod(time / 3.0 + ro.y * 100.0, 6.283));

	for (int i = 0; i < ITE_MAX; i++) {
		rayPosition = ro + rd * dist;
		float ns = dfScene(rayPosition);
		dist += ns;
		if (ns < EPS || dist > FAR) break;
	}
    
	if (dist < FAR) {
		vec3 normalVector = surfaceNormal(rayPosition);

		float g = distanceFromCenter;
		g /= ICOSA_RADIUS;
		g *= 1.35;
		pixelColor = sceneColor * exp(g * g) * 0.05; // 中心から遠くなるほど明るくする

		float spe = pow(max(dot(reflect(rd, normalVector), lightPosition), 0.0), 16.0); // スペキュラ
		pixelColor += spe * vec3(1.0);
	}
    
	return pixelColor;
}
    
void main() {
	vec2 uv = (gl_FragCoord.xy / resolution.xy) * 2.0 - 1.0;
	
	float aspect = resolution.x / resolution.y;
	vec3 dir = normalize(vec3(uv * vec2(aspect, 1.0), 1.0));
	
	vec3 pos = vec3(0.0, 0.0, -1.0);
	
	float rayLen = INIT_LEN; // 探索レイの長さ
    	vec3 rayPos = pos + rayLen * dir; // 探索レイの位置

	vec3 col = marchScene(rayPos, dir);

	gl_FragColor = vec4(col, 1.0);
}
