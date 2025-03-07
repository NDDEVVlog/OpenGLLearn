#version 330 core

// Outputs colors in RGBA
out vec4 FragColor;

// Imports the current position from the Vertex Shader
in vec3 crntPos;
// Imports the normal from the Vertex Shader
in vec3 Normal;
// Imports the color from the Vertex Shader
in vec3 color;
// Imports the texture coordinates from the Vertex Shader
in vec2 texCoord;



// Gets the Texture Units from the main function
uniform sampler2D diffuse0;
uniform sampler2D specular0;
// Gets the color of the light from the main function
uniform vec4 lightColor;
// Gets the position of the light from the main function
uniform vec3 lightPos;
// Gets the position of the camera from the main function
uniform vec3 camPos;


vec4 pointLight()
{	
	// used in two variables so I calculate it here to not have to do it twice
	vec3 lightVec = lightPos - crntPos;

	// intensity of light with respect to distance
	float dist = length(lightVec);
	float a = 3.0;
	float b = 0.7;
	float inten = 1.0f / (a * dist * dist + b * dist + 1.0f);

	// ambient lighting
	float ambient = 0.20f;

	// diffuse lighting
	vec3 normal = normalize(Normal);
	vec3 lightDirection = normalize(lightVec);
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular lighting
	float specularLight = 0.50f;
	vec3 viewDirection = normalize(camPos - crntPos);
	vec3 reflectionDirection = reflect(-lightDirection, normal);
	float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16);
	float specular = specAmount * specularLight;

	return (texture(diffuse0, texCoord) * (diffuse * inten + ambient) + texture(specular0, texCoord).r * specular * inten) * lightColor;
}

vec4 direcLight()
{
	// ambient lighting
	float ambient = 0.20f;

	// diffuse lighting
	vec3 normal = normalize(Normal);
	vec3 lightDirection = normalize(vec3(1.0f, 1.0f, 0.0f));
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular lighting
	float specularLight = 0.50f;
	vec3 viewDirection = normalize(camPos - crntPos);
	vec3 reflectionDirection = reflect(-lightDirection, normal);
	float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16);
	float specular = specAmount * specularLight;

	return (texture(diffuse0, texCoord) * (diffuse + ambient) + texture(specular0, texCoord).r * specular) * lightColor;
}

vec4 spotLight()
{
	// controls how big the area that is lit up is
	float outerCone = 0.90f;
	float innerCone = 0.95f;

	// ambient lighting
	float ambient = 0.20f;

	// diffuse lighting
	vec3 normal = normalize(Normal);
	vec3 lightDirection = normalize(lightPos - crntPos);
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular lighting
	float specularLight = 0.50f;
	vec3 viewDirection = normalize(camPos - crntPos);
	vec3 reflectionDirection = reflect(-lightDirection, normal);
	float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16);
	float specular = specAmount * specularLight;

	// calculates the intensity of the crntPos based on its angle to the center of the light cone
	float angle = dot(vec3(0.0f, -1.0f, 0.0f), -lightDirection);
	float inten = clamp((angle - outerCone) / (innerCone - outerCone), 0.0f, 1.0f);

	return (texture(diffuse0, texCoord) * (diffuse * inten + ambient) + texture(specular0, texCoord).r * specular * inten) * lightColor;
}

// Uniform values for the near and far clipping planes
uniform float near = 0.1f;
uniform float far = 100.0f;

/**
 * Converts a non-linear depth value from gl_FragCoord.z to a linear depth value.
 * 
 * OpenGL depth buffer stores depth non-linearly, so this function transforms it
 * to a linear depth range [near, far].
 *
 * @param depth - The depth value from the depth buffer in range [0,1].
 * @return Linearized depth value in world space.
 */
float linearizeDepth(float depth)
{
    // Convert depth from [0,1] range to [-1,1] (NDC space)
    float ndcDepth = depth * 2.0 - 1.0;

    // Apply the linear depth formula to reconstruct the actual depth in world space
    return (2.0 * near * far) / (far + near - ndcDepth * (far - near));
}

/**
 * Applies a logistic function to the linearized depth.
 * 
 * This function maps the depth values using a sigmoid/logistic curve, which helps 
 * improve depth visualization by compressing depth values in a smooth transition.
 *
 * @param depth - Linearized depth value.
 * @param steepness - Controls the sharpness of the transition.
 * @param offset - Controls the midpoint of the transition.
 * @return Adjusted depth value using a logistic function.
 */
float logisticDepth(float depth, float steepness, float offset)
{
    float zVal = linearizeDepth(depth); // Convert depth to linear
    return 1.0 / (1.0 + exp(-steepness * (zVal - offset))); // Apply logistic function
}

/**
 * Main fragment shader function.
 * Computes the final color based on the linearized depth.
 */
void main()
{
    // Compute the linearized depth and normalize it to [0,1] range
    float depth = linearizeDepth(gl_FragCoord.z) / far;

    // Mix between directional lighting (presumably defined elsewhere) and depth-based color
    // "direcLight()" should be a function that returns the lighting effect at this fragment.
    FragColor = direcLight() * (1.0f - depth) + vec4(depth * vec3(0.85f, 0.85f, 0.90f), 1.0f);
}