
//---------------------------------------------------------------
// RollingMarblesRaytraced  2015-07-04 by rubixcom
// https://www.shadertoy.com/view/MllXDn
//---------------------------------------------------------------
#ifdef GL_ES
precision mediump float;
#endif

//uniform vec2 mouse;
uniform float time;
uniform vec2 resolution;

float iTime = time * 0.2;

#define NO_INTERSECTION 1000000.
#define OBJ_PLANE 0
#define OBJ_SPHERE 1
#define OBJ_LIGHT 2

#define SPHERES 5
#define LIGHTS 3
#define SHADOWS 
#define REFLECTIONS

const vec4 lightColor = vec4(1.0,.75,0.6,0.0); 
const vec4 lightColor2 = vec4(0.0,1.0,0.6,0.0);
const vec4 lightColor3 = vec4(0.75,0.0,1.0,0.0);

// Returns ray vector for a pixel location based on a camera position, 
// target and pixel coordinate
vec3 rayVector(in vec3 position, in vec3 target)
{
    vec3 eye = normalize(target - position);
    vec3 up = vec3(0., 1., 0.);
    vec3 right = cross(eye, up);
    up = cross(eye,right);

    mat3 cameraMatrix = mat3(right.x, up.x, eye.x,
                			 right.y, up.y, eye.y,
                			 right.z, up.z, eye.z);

    vec2 uv = gl_FragCoord.xy / resolution.xy - vec2(.5);
    uv.x = uv.x * resolution.x / resolution.y;
    uv.y = -uv.y;
    float focalDistance = 0.6 + .3 * sin(iTime* .25);
    return normalize(vec3(uv.x,uv.y,focalDistance) * cameraMatrix) ;
}

// Texture for a ball object, basically dioganal stripes
vec4 textureBall (in vec2 pos)
{
	return vec4(step(.5,fract((pos.x+pos.y)*4.)));
}

// Texture for the plane object, a checkerboard
vec4 texturePlane (in vec2 pos)
{
	return vec4(abs(step(0.5,fract(pos.x*3.)) - step(0.5,fract(pos.y*3.))));
}

// Shading calculation, basic phong shading
vec4 shade(in vec3 pos, in vec3 normal, in vec3 cameraVector, in vec3 lightPos
	  ,in vec4 lightColor, in vec4 surfaceTexture)
{
    vec3 light = normalize(lightPos - pos);
    float dotlight = dot(normal,light);

    vec3 cameraReflected = normalize(reflect(cameraVector,normal));
    float spec = 0.0;
    if (dot(cameraReflected,light) < 0.0)
        spec = min(1.0,pow(dot(cameraReflected,light),2.0));
    return (surfaceTexture
        * vec4(0.2+dotlight) * lightColor
        + vec4(0.5*spec)) * 10.0/length(lightPos - pos); // Sphere color
}

// Returns a bounce value for a ball based on it's position
vec3 bounce(in vec3 p)
{
	return vec3(0.0,1.6*abs(sin(iTime + float(int(p.y/6.0) + int(p.x/6.0)))),0.0);
}

// Calculates the intersection between a vector (o = origin, I = direction) 
// and a sphere (c = origin, r = radius) and returns distance along vector I. 
// Returns NO_INTERSECTION if there isn't one.
float lineSphereIntersection(in vec3 o, in vec3 I, in vec3 c, float r)
{
	float det = pow(dot(I,o-c),2.) - pow(length(o-c),2.) + pow(r,2.);
	
	if (det <= 0.0)
		return NO_INTERSECTION;
	else 
	{
		float d = dot(I, o-c) + sqrt(det);
		if (d > 0.0)
			return NO_INTERSECTION;
		return -d;
	}
}

// Calculates the intersection between a vector (o = origin, I = direction) 
// and a level y-plane (y = height) and returns distance along vector I. 
// Returns NO_INTERSECTION if there isn't one.
float lineFloorIntersection(in vec3 o, in vec3 I, in float y)
{
	float t = ((y-o.y) / I.y);
	return (t > 0.) ? t : NO_INTERSECTION;
}

// Finds an intersection between a camera vector (ro = origin, rd = direction) 
// and all the shapes in the scene. 
// Returns distance along the vector rd and objectType (0 = plane, 1 = sphere) 
float rayTrace(in vec3 ro, in vec3 rd, in vec3 shapeLoc, in vec3 lights[3]
	      ,out vec3 shapeOffset, out int objectType)
{
    float t = 0.0;
	t = lineFloorIntersection(ro, rd, 0.0);
	shapeOffset = vec3(0.);
	objectType = OBJ_PLANE;

	for (int i = 0; i < SPHERES; i++)
	{
		vec3 off = vec3(float(i) * rd.x,0.0,float(i) * rd.z)+vec3(ro.x,0.,ro.z) / 6.; 
		off = 6. * (off - fract(off));
		vec3 tcc = shapeLoc + off + bounce(off);
		float tm = lineSphereIntersection(ro, rd, tcc, 1.8);
		if (tm < t)
		{
			t = tm;
			shapeOffset = tcc;
			objectType = OBJ_SPHERE;
			break;
		}
	}
		
	for (int i = 0; i < LIGHTS; i++)
	{
		float tm = lineSphereIntersection(ro, rd, lights[i], .5);
		if (tm < t)
		{
			t = tm;
			objectType = OBJ_LIGHT + i;
		}
	}
		
	return t;
}

// Returns a normal and a texture pixel from the scene based on the ray traced position
void normalsAndTexture(in vec3 ro, in vec3 rd, in float t, in int objectType
		      ,in vec3 shapeOffset, in mat3 rotation
		      ,out vec3 p, out vec3 normal, out vec4 texc)
{
	p = ro + rd * t;
	if (objectType==OBJ_PLANE)
	{
		normal = vec3(0.,1.,0.);
		texc = texturePlane( vec2(p.x *.1 - 3.1415 * .5 * iTime,p.z *.1));
	}
	else if (objectType==OBJ_SPHERE)
	{
		normal = normalize(p - shapeOffset);
		vec3 pmr = rotation * normal; 
		texc = textureBall( vec2(atan(pmr.x,pmr.z)*.20,pmr.y*.25));
	}
	else if (objectType>=OBJ_LIGHT && objectType<OBJ_LIGHT+SPHERES)
	{
		normal = normalize(p - shapeOffset);
		if (objectType == OBJ_LIGHT)
			texc = vec4(lightColor);
		else if (objectType == OBJ_LIGHT + 1)
			texc = vec4(lightColor2);
		else if (objectType == OBJ_LIGHT + 2)
			texc = vec4(lightColor3);
		//textureBall( vec2(atan(pmr.x,pmr.z)*.20,pmr.y*.25));
	}
}

// Returns the amount of shadow from a vector (ro,rd)
float shadow(in vec3 ro, in vec3 rd, in vec3 shapeLoc, in vec3 lights[3])
{
	vec3 shapeOffset = vec3(0.0);
	int objectType = 0;
	float t = rayTrace(ro, rd, shapeLoc, lights, shapeOffset, objectType);

	if (objectType>=OBJ_LIGHT && objectType<OBJ_LIGHT+SPHERES)
		return 1.0;
	
	if (t == NO_INTERSECTION)
		return 1.;
	else
		return 0.2 / float(LIGHTS);
}

// Returns a reflection pixel color from a vector (ro, rd)
vec4 reflection(in vec3 ro, in vec3 rd, in vec3 shapeLoc, in mat3 rotation, in vec3 lights[3])
{
	vec3 shapeOffset = vec3(0.0);
	int objectType = 0;
	float t = rayTrace(ro, rd, shapeLoc, lights, shapeOffset, objectType);
	if (t == NO_INTERSECTION)
		return vec4(0.);
	
	vec3 p = vec3(0.0);
	vec3 normal = vec3(0.0);
	vec4 texc = vec4(0.0);
	normalsAndTexture(ro, rd, t, objectType, shapeOffset, rotation, p, normal, texc);

	if (objectType>=OBJ_LIGHT && objectType<OBJ_LIGHT+SPHERES)
		return texc;

	return (0.0
  #if (LIGHTS >= 1)
			+ shade(p, normal, -rd, lights[0], lightColor, texc)
  #endif
  #if  (LIGHTS >= 2)
			+ shade(p, normal, -rd, lights[1], lightColor2, texc)
  #endif
  #if  (LIGHTS >= 3)
			+ shade(p, normal, -rd, lights[2], lightColor3, texc)
  #endif
  #if (LIGHTS > 1)
		) / float(LIGHTS);
  #else
		);
  #endif
}

// Returns a traced pixel value for a camera vector (ro,rd) 
vec4 trace(in vec3 ro, in vec3 rd, in vec3 shapeLoc, in mat3 rotation, in vec3 lights[3])
{
	vec3 shapeOffset = vec3(0.0);
	int objectType = 0;
	float t = rayTrace(ro, rd, shapeLoc, lights, shapeOffset, objectType);
	if (t == NO_INTERSECTION)
		return vec4(0.);
	
	vec3 p = vec3(0.0);
	vec3 normal = vec3(0.0);
	vec4 texc = vec4(0.0);
	normalsAndTexture(ro, rd, t, objectType, shapeOffset, rotation, p, normal, texc);
	
	if (objectType>=OBJ_LIGHT && objectType<OBJ_LIGHT+SPHERES)
		return texc;

	vec3 cameraReflected = normalize(reflect(rd,normal));
	return (0.0
#if (LIGHTS >= 1)
			+ shade(p, normal, -rd, lights[0], lightColor, texc)
	#ifdef SHADOWS
			* shadow(p+normal*.01, normalize(lights[0]-p), shapeLoc, lights)
	#endif
#endif
#if  (LIGHTS >= 2)
			+ shade(p, normal, -rd, lights[1], lightColor2, texc)
	#ifdef SHADOWS
			* shadow(p+normal*.01, normalize(lights[1]-p), shapeLoc, lights)
	#endif
#endif
#if  (LIGHTS >= 3)
			+ shade(p, normal, -rd, lights[2], lightColor3, texc)
	#ifdef SHADOWS
			* shadow(p+normal*.01, normalize(lights[2]-p), shapeLoc, lights)
	#endif
#endif
		) 
#if (LIGHTS > 1)
		/ float(LIGHTS)
#endif
#ifdef REFLECTIONS
		+ .5*reflection(p+normal*.01, cameraReflected, shapeLoc, rotation, lights)
#endif
		;
}

// Fragment shader entry point, sets up scene data
void main( void )
{
    vec3 shapeLoc = vec3(3.0,2.5,3.0);
    vec3 cameraLoc = vec3(4.0 * sin(iTime), 5.0 + 4.0 * sin(0.4*iTime) , 4.0 * cos(iTime)) + shapeLoc;
    vec3 cameraTarget = shapeLoc + vec3(0.0,1.+1.*sin(iTime*.01),0.0);
    vec3 lights[3];
#if (LIGHTS >= 1)
	lights[0] = //vec3(-cameraLoc.x, 3.*cameraLoc.y, -cameraLoc.z);
		    vec3(4.0 * sin(iTime*.1), 9.0 + 7.0 * sin(0.8*iTime) , 4.0 * cos(iTime*.1)) + shapeLoc;
#endif
#if (LIGHTS >= 2)
	lights[1] = vec3(4.0 * sin(iTime*.1+2.*3.1415*.33), 9.0 + 7.0 * sin(0.8*iTime) 
			,4.0 * cos(iTime*.1+2.*3.1415*.33)) + shapeLoc;
#endif
#if (LIGHTS >= 3)
	lights[2] = vec3(4.0 * sin(iTime*.1+2.*3.1415*.66), 9.0 + 7.0 * sin(0.8*iTime)
			,4.0 * cos(iTime*.1+2.*3.1415*.66)) + shapeLoc;
#endif
    
    vec3 ro = cameraLoc;
    vec3 rd = rayVector(cameraLoc, cameraTarget);

    mat3 rotation = mat3(cos(iTime*5.),-sin(iTime*5.), 0.,
                  sin(iTime*5.),cos(iTime*5.), 0.,
                   0.,0.,1.);

    gl_FragColor = trace(ro, rd, shapeLoc, rotation, lights);
}
