#include"VAO.h"

// Constructor that generates a VAO ID
VAO::VAO()
{
	glGenVertexArrays(1, &ID);
}

void VAO::LinkAttrib(VBO& VBO, GLuint layout, GLuint numComponents, GLenum type, GLsizeiptr stride, void* offset)
{
    // Bind the VBO to ensure that we're working with the correct buffer
    VBO.Bind();

    // Specify the format of the vertex attribute
    // layout: Index of the attribute in the shader (e.g., location = 0 for position, 1 for color)
    // numComponents: Number of values per vertex (e.g., 3 for X, Y, Z or R, G, B)
    // type: Data type of the attribute (e.g., GL_FLOAT for floating-point numbers)
    // GL_FALSE: Specifies whether the data should be normalized (GL_FALSE means no normalization)
    // stride: The number of bytes between consecutive vertex attributes (determines data structure layout)
    // offset: The byte offset of the attribute within the vertex structure
    glVertexAttribPointer(layout, numComponents, type, GL_FALSE, stride, offset);

    // Enable the vertex attribute at the specified layout index
    // This allows OpenGL to use this attribute when rendering
    glEnableVertexAttribArray(layout);

    // Unbind the VBO to avoid unintended modifications
    VBO.Unbind();
}


// Binds the VAO
void VAO::Bind()
{
	glBindVertexArray(ID);
}

// Unbinds the VAO
void VAO::Unbind()
{
	glBindVertexArray(0);
}

// Deletes the VAO
void VAO::Delete()
{
	glDeleteVertexArrays(1, &ID);
}