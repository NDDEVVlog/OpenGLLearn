#version 330 core

// Outputs colors in RGBA
out vec4 FragColor;


// Imports the color from the Vertex Shader
in vec3 color;
// Imports the texture coordinates from the Vertex Shader
in vec2 texCoord;
// Imports the normal from the Vertex Shader
in vec3 Normal;
// Imports the current position from the Vertex Shader
in vec3 crntPos;

// Gets the Texture Units from the main function
uniform sampler2D tex0;
uniform sampler2D tex1;
// Gets the color of the light from the main function
uniform vec4 lightColor;
// Gets the position of the light from the main function
uniform vec3 lightPos;
// Gets the position of the camera from the main function
uniform vec3 camPos;

vec4 pointLight(){
	
	vec3 lightVector = lightPos -crntPos;
	float distance = length(lightVector);
	float a = 3.0f;
	float b = 0.7f;
	float inten = 1.0f/(a*distance * distance+ b*distance+1.0f);

	// ambient lighting
	float ambient = 0.20f;

	// diffuse lighting
	vec3 normal = normalize(Normal);
	vec3 lightDirection = normalize(lightVector);
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular lighting
	float specularLight = 0.50f;
	vec3 viewDirection = normalize(camPos - crntPos);
	vec3 reflectionDirection = reflect(-lightDirection, normal);
	float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16);
	float specular = specAmount * specularLight;

	return (texture(tex0, texCoord) * (diffuse * inten + ambient) + texture(tex1, texCoord).r * specular*inten) * lightColor;


}

vec4 directLight(){
	
	vec3 lightVector = vec3(1.0f,1.0f,0.0f);

	// ambient lighting
	float ambient = 0.20f;

	// diffuse lighting
	vec3 normal = normalize(Normal);
	vec3 lightDirection = normalize(lightVector);
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular lighting
	float specularLight = 0.50f;
	vec3 viewDirection = normalize(camPos - crntPos);
	vec3 reflectionDirection = reflect(-lightDirection, normal);
	float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16);
	float specular = specAmount * specularLight;

	return (texture(tex0, texCoord) * (diffuse + ambient) + texture(tex1, texCoord).r * specular) * lightColor;


}

vec4 spotLight(){
	
	vec3 lightVector = lightPos -crntPos;
	
	float outerCone = 0.90f;
	float innerCone = 0.95f;


	// ambient lighting
	float ambient = 0.20f;

	// diffuse lighting
	vec3 normal = normalize(Normal);
	vec3 lightDirection = normalize(lightVector);
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular lighting
	float specularLight = 0.50f;
	vec3 viewDirection = normalize(camPos - crntPos);
	vec3 reflectionDirection = reflect(-lightDirection, normal);
	float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16);
	float specular = specAmount * specularLight;

	float angle = dot(vec3(0.0f,-1.0f,0.0f),-lightDirection);
	float inten = clamp((angle - outerCone) / (innerCone - outerCone ),0.0f,1.0f);

	return (texture(tex0, texCoord) * (diffuse * inten + ambient) + texture(tex1, texCoord).r * specular*inten) * lightColor;
}



	
void main()
{
	

	// outputs final color
	FragColor = spotLight();
}