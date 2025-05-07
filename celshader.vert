#version 330 compatibility

/*
Basic vertex shader, just passes variables to the fragment shader.
*/

out vec2 vST;           // Tex coords
out vec3 vN;            // Normal vec
out vec3 vL;            // Vec from point to light
out vec3 vE;            // Vec from point to light
out vec3 vMCposition;

const vec3 LIGHTPOSITION = vec3(0., 0., 10.);

void main()
{
    vST = gl_MultiTexCoord0.st;
	vMCposition = gl_Vertex.xyz;
	vec4 ECposition = gl_ModelViewMatrix * gl_Vertex;		// eye coordinate position
	vN = normalize( gl_NormalMatrix * gl_Normal );			// normal vector
	vL = LIGHTPOSITION - ECposition.xyz;					// vector from the point to the light position
	vE = vec3( 0., 0., 0. ) - ECposition.xyz;				// vector from the point to the eye position
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}