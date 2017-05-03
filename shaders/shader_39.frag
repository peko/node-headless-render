precision lowp float;
#define MAPS
#define GRADIENTS
#define TRACE
#define SPRITES


#ifdef COLOR
vec3 hsv(float h,float s,float v);
#endif	


uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

#extension GL_OES_standard_derivatives : enable

#define COLOR
#define TRANSFORMATIONS
#define FIELDS
#define LINES
#ifdef TRANSFORMATIONS	
vec2 cross(vec2 uv);
vec2 project(vec2 position, vec2 a, vec2 b);
mat2 rmat(float t);
#endif

#ifdef FIELDS
float sphere(vec2 position, float radius);
float sphere(vec3 position, float radius);
float cube(vec2 position, vec2 scale);
float cube(vec3 position, vec3 scale);
float torus(vec2 position, vec2 radius);
float segment(vec2 position, vec2 a, vec2 b);
float lattice(vec3 position, float scale, float width);	
#endif
	
#ifdef LINES
float contour(float x);
float point(vec2 position, float radius);
float point(vec2 position);
float circle(vec2 position, float radius);
float line(vec2 position, vec2 a, vec2 b);
float box(vec2 position, vec2 scale);
float grid(vec2 position, float scale);
#endif	


#ifdef MAPS
float map(vec2 position);
float map(vec3 position);
#endif


#ifdef GRADIENTS
vec2 gradient(vec2 position);
vec3 gradient(vec3 position);
#endif


#ifdef TRACE
vec3 view(vec2 coordinates, float field_of_view);
vec4 trace(vec3 origin, vec3 direction);
#endif


#ifdef SPRITES
float extract_bit(float n, float b);
float sprite(float n, vec2 p);
float digit(float n, vec2 p);
float print_digit(float index, vec2 position);
#endif





void main( void ) 
{
	vec2 coordinate 		= gl_FragCoord.xy;
	vec2 uv 			= coordinate / resolution.xy;
	vec2 aspect		= resolution/min(resolution.x, resolution.y);
	vec2 position		= (uv - .5
				) * aspect;
	
		
	vec3 origin		= vec3(0., 0., 1);
	vec3 direction		= view(position, 2.);
	vec4 intersection	= vec4(0.);
	intersection		= trace(origin, direction);
	
	gl_FragColor 		= 20./intersection.wwww;
}





#ifdef MAPS
float map(vec3 position)
{
	position.z	+= time * .5;
	position.xy	*= rmat(position.z * position.z * mouse.y * .5);
	return lattice(position, .125, .00125); 
}

float map(vec2 position)
{
	return sphere(position, .5);
}
#endif


#ifdef TRANSFORMATIONS
vec2 cross(in vec2 uv)
{
	return vec2(-uv.y, uv.x);
}


vec2 project(vec2 position, vec2 a, vec2 b)
{
	vec2 q	 	= b - a;					
	float u 		= dot(position - a, q)/dot(q, q);	
	u 		= clamp(u, 0., 1.);
	return mix(a, b, u);
}

mat2 rmat(in float t)
{
	float c = cos(t);
	float s = sin(t);   
	return mat2(c,s,-s,c);
}
#endif
	

#ifdef FIELDS
float sphere(vec2 position, float radius)
{
	return length(position) - radius;
}

float sphere(vec3 position, float radius)
{
	return length(position) - radius; 
}

float cube(vec2 position, vec2 scale)
{
	vec2 vertex 	= abs(position) - scale;
	vec2 edge 	= max(vertex, 0.);
	float interior	= max(vertex.x, vertex.y);
	return min(interior, 0.) + length(edge);
}

float cube(vec3 position, vec3 scale)
{
	vec3 vertex = (abs(position) - scale);
	return min(max(max(vertex.x,vertex.y),vertex.z),0.) + length(max(vertex, 0.));
}

float torus(vec2 position, vec2 radius)
{
	
	return abs(abs(length(position)-radius.y)-radius.x);
}


float segment(vec2 position, vec2 a, vec2 b)
{
	return distance(position, project(position, a, b));
}
#endif


#ifdef LINES
float contour(float x)
{
	return 1.-clamp(x, 0., 1.);
}

float point(vec2 position, float radius)
{
	return contour(sphere(position, radius));	
}

float point(vec2 position)
{
	return point(position, 4.);	
}

float circle(vec2 position, float radius)
{
	return contour(torus(position, vec2(radius,0.)));
}

float line(vec2 p, vec2 a, vec2 b)
{
	return contour(segment(p, a, b));
}


float box(vec2 position, vec2 scale)
{
	return contour(abs(cube(position, scale)));	
}


float grid(vec2 position, float scale)
{
	position = mod(position, scale);
	position = 1.-abs(position/scale)*scale;
	
	return contour(.5-max(position.x, position.y));
}


float lattice(vec3 position, float scale, float width) 
{
	position 	= mod(position, scale) - scale * .5;
	position 	= max(-abs(position), -position - scale);
	float x		= max(position.x, position.y);
	float y 		= max(position.x, position.z);
	float z 		= max(position.y, position.z);
					
	return max(max(max(x, y), z), -min(min(x, y),z)) - width;
}
#endif


#ifdef GRADIENTS
vec2 gradient(vec2 position)
{
	vec2 gradient	= vec2(0.);
	vec2 offset	= vec2(.001, 0.);
	gradient.x   	= map(position + offset.xy) - map(position - offset.xy);
	gradient.y    	= map(position + offset.yx) - map(position - offset.yx);
	return gradient;
}

vec3 gradient(vec3 position)
{
	vec3 gradient	= vec3(0.);
	vec2 offset	= vec2(.001, 0.);
	gradient.x   	= map(position + offset.xyy) - map(position - offset.xyy);
	gradient.y    	= map(position + offset.yxy) - map(position - offset.yxy);
	gradient.z    	= map(position + offset.yyx) - map(position - offset.yyx);
	return gradient;
}
#endif


#ifdef TRACE
vec3 view(vec2 coordinates, float field_of_view)
{
	return normalize(vec3(coordinates, field_of_view));		
}

vec4 trace(vec3 origin, vec3 direction) 
{
	vec3 position		= origin;
	
	float surface_threshold = .00001;	
	float total_distance	= 0.;
	float max_distance	= 64.;
	float iteration		= 128.;
	for(int i = 0; i < 448; i++)
	{
		float distance_to_surface = map(position);
		total_distance		+= distance_to_surface * .75;
		
		if(total_distance > max_distance)
		{
			break;
		}
		
		if(distance_to_surface <= surface_threshold) 
		{ 
			iteration = float(i); 
			position = origin + direction * distance(position, origin);					     
			break;
		}
		
		position = origin + direction * total_distance;
		
		surface_threshold *= 1.05;	
	}

	return vec4(position, iteration);
}
#endif


#ifdef SPRITES
float extract_bit(float n, float b)
{
	n = floor(n);
	b = floor(b);
	b = floor(n/pow(2.,b));
	return float(mod(b,2.) == 1.);
}

float sprite(float n, vec2 p)
{
	p = floor(p);
	float bounds = float(all(lessThan(p, vec2(3., 5.))) && all(greaterThanEqual(p,vec2(0,0))));
	return extract_bit(n, (2. - p.x) + 3. * p.y) * bounds;
}

float digit(float n, vec2 p)
{	
	n = mod(floor(n), 10.0);
	if(n == 0.) return sprite(31599., p);
	else if(n == 1.) return sprite( 9362., p);
	else if(n == 2.) return sprite(29671., p);
	else if(n == 3.) return sprite(29391., p);
	else if(n == 4.) return sprite(23497., p);
	else if(n == 5.) return sprite(31183., p);
	else if(n == 6.) return sprite(31215., p);
	else if(n == 7.) return sprite(29257., p);
	else if(n == 8.) return sprite(31727., p);
	else if(n == 9.) return sprite(31695., p);
	else return 0.0;
}

float print_digit(float index, vec2 position)
{	
	float result	= index >= 0. ? 0. : sprite(24., position);		
	position 	-= vec2(4., 0.);
	for(int i = 8; i >= 0; i--)
	{
		float place = pow(10., float(i));
		if(index >= place || float(i) < 1.)
		{
			result	 	+= digit(abs(index/place), position);
			position.x 	-= 4.;
		}
	}
	return result;
}
#endif


#ifdef COLOR
vec3 hsv(float h,float s,float v)
{
	return mix(vec3(1.),clamp((abs(fract(h+vec3(3.,2.,1.)/3.)*6.-3.)-1.),0.,1.),s)*v;
}
#endif