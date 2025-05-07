#version 330 compatibility

/*
Here is where all the magic is done.
*/

uniform float       uEdgeWidth;             // determine edge size for primary edge method
uniform float       uUnlitEdge, uLitEdge;   // edge size for secondary edge method
uniform float       uHighlight;             // highlight size for toon shading           
uniform float       uKa, uKd, uKs;          // per fragment lighting
uniform float       uShininess;             // shininess
uniform bool        uEdge1, uEdge2, uToon;  // bool values for effects
uniform bool        uTexture, uNormalTex;   // bool for texture effects
uniform sampler2D   TexUnit1;
uniform sampler2D   TexUnit2;

in vec2 vST;        // Texture
in vec3 vN;			// Normal vector
in vec3 vL;			// vector from point to Light
in vec3 vE;			// vector from point to Eye
in vec3 vMCposition;

// mint == (.6, .9, .8)

void main()
{
    // standard normal for regular lighting, edge detection, and light intensity.
    vec3 Normal = normalize(vN);
    // second normal for normal mapping.
    vec3 DepthNormal = normalize(vN * (2. * texture(TexUnit2, vST).xyz - vec3(1., 1., 1.)));
    vec3 Light = normalize(vL);
    vec3 Eye = normalize(vE);

    float lightIntensity = dot(Light, Normal);          // light intensity for later use
    float depthIntensity = dot(Light, DepthNormal);     // depth for normal mapping
    
    vec3 mySpecularColor = vec3(1., 1., 1.);
    vec3 myColor = vec3(.6, .9, .8);
    
    vec3 ambient;                                       // standard lighting vars
    vec3 diffuse;
    vec3 specular;

    if(uNormalTex == true)
    {
        // Code from normal mapping slides
        myColor = texture(TexUnit1, vST).rgb;
        ambient = uKa * myColor;
        diffuse = uKd * depthIntensity * myColor;
        float specIntensity = pow( max( dot( reflect(-Light, DepthNormal), Eye), 0.), uShininess);
        specular = uKs * specIntensity * mySpecularColor;
        gl_FragColor = vec4(ambient + diffuse + specular, 1.);
    }

    if(uToon == true)
    {
        if(uTexture == true)
            {
                myColor = texture(TexUnit1, vST).rgb;
            }
        if(uNormalTex == true)
            {
                myColor = vec3(ambient + diffuse + specular);
            }
        // check the light intensity at the pixel location and change the color as needed
        // its a step down method so it will give blocks of color as opposed to gradient 
        // or uniform shading.
        // Based on Toon Shader - Version II 
        // https://www.lighthouse3d.com/tutorials/glsl-12-tutorial/toon-shader-version-ii/
        if(lightIntensity > uHighlight)
        {
            gl_FragColor = vec4(mySpecularColor, 1.);
        }
        else if(lightIntensity > uHighlight * .9)
        {
            gl_FragColor = vec4(myColor, 1.);
        }
        else if (lightIntensity > uHighlight * .5)
        {
            gl_FragColor = vec4(myColor * .7, 1.);
        }
        else if (lightIntensity > uHighlight * .2)
        {
            gl_FragColor = vec4(myColor * .4, 1.);
        }
        else
        {
            gl_FragColor = vec4(myColor * .2, 1.);
        }
    }
    // per fragment lighting in all other cases
    else if(uTexture != true)
    {
        ambient = uKa * myColor;
        float d = 0.;
        float s = 0.;
        if( lightIntensity > 0. )
        {
            d = lightIntensity;
            vec3 ref = normalize( reflect(-Light, Normal));
            s = pow( max( dot(Eye, ref), 0.), uShininess);
        }
        diffuse = uKd * d * myColor;
        specular = uKs * s * mySpecularColor;
        gl_FragColor = vec4(ambient + diffuse + specular, 1.);
    }

    /*
    edge detection or silhouettes
    two different methods here, I cannot decide which I like better
    I had tried to utilize the silhouette method provided in the Geometry Shaders powerpoint
    but I wasn't able to get full silhouettes. I tested the code that I used for the 
    Dragon Menagerie assignment and found that the code worked on objects with smoother edges.
    From there I broke down the code for just the edges and created colors.
    */

    // first checks for any edges or areas where the normal is smaller than the chosen edge width
    // Based on The Cg Tutorial by Randima Fernando & Mark Kilgard, Ch. 9.2.2 - Silhouette Outline 
    // https://developer.download.nvidia.com/CgTutorial/cg_tutorial_chapter09.html
    if(max( dot(Normal, Eye), 0.) < uEdgeWidth && uEdge1 == true)
    {
        gl_FragColor = vec4(0., 0., 0., 1.);
    }
    // second accounts for edges in shadow and allows for adjustment
    // Based on GLSL Programming/Unity/Toon Shading
    // https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Toon_Shading 
    if(uEdge2 == true && dot(Eye, Normal) < mix(uUnlitEdge, uLitEdge, max(0., lightIntensity)))
    {
        gl_FragColor = vec4(0., 0., 0., 1.);
    }
}