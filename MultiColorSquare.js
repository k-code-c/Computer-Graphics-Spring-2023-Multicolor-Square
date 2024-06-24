// create vertex shader source
let vertexShaderSrc = `#version 300 es
#pragma vscode_glsllint_stage: vert


// i.e. vertext position
in vec4 a_position;

//add another attribute for color
in vec3 a_color;
out vec3 fragColor;
uniform float theta;

void main(){

    vec2 pos = a_position.xy;
    vec2 rpos = vec2(pos.x * cos(theta) - pos.y * sin(theta), pos.x * sin(theta) + pos.y * cos(theta));

    //gl_position is a special var in vertext shader
    gl_Position = vec4(rpos, 0.0, 1.0);

    //new attribute for color
    fragColor = a_color;


}
`;
// create fragment shaders source
let fragmentShaderSrc = `#version 300 es
#pragma vscode_glsllint_stage: frag
// set default precision
precision highp float;
out vec4 outColor;

//new out variable
in vec3 fragColor;

void main(){
    outColor = vec4(fragColor, 1);
}
`;
// we need a function to compile shaders
function createShader(gl, type, source){
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
   
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
// we need a function to link shaders into a program
function createProgram(gl, vertexShader, fragmentShader){
  let  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

let theta = 0;
let rotationDirection = true;

/* main function that execute steps to 
   render a single triangle on the canvas
*/
function draw(){  // get canvas from DOM (HTML)
    let canvas = document.querySelector("#c");
    /** @type {WebGLRenderingContext} */
    let gl = canvas.getContext('webgl2'); 
    // create a shader program
    /* compile vertex shader source
     compile fragment shader source
     create program (using vertex and shader)
    */
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
    let program = createProgram(gl, vertexShader, fragmentShader);
    /* get handle for input variable in vertex shader */
    // attribute location in vertexShader
    let positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    let colorAttributeLocation = gl.getAttribLocation(program, 'a_color'); 
    // create memory buffer for vertex shader and copy/transfer vertices to GPU
    let positionBuffer = gl.createBuffer();
    let colorBuffer = gl.createBuffer();
    //do all actions related to VBO holding position data
    //bind buffer, buffer send, enable the attribute, specify vertex pointer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    triangleVertices = [
     
      // x     y    z
      -0.5, 0.5, 0.0, // vertex 1
       0.5,  -0.5, 0.0, // vertex 2
       -0.5, -0.5, 0.0,  // vertex3
       0.5, -0.5, 0.0, // vertex 4
       -0.5,  0.5, 0.0, // vertex 5
       0.5, 0.5, 0.0  // vertex 6 // vertex 6
       
     ];
 


   // send vertices position data to GPU
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

   gl.enableVertexAttribArray(positionAttributeLocation);

   let size = 3; // get/read 3 components per iteration
   let type = gl.FLOAT; // size in bits for each item
   let normalize = false;  // do not normalize data, generally Never
   let stride = 0; // used to skip over bytes when different attributes are stored in buffer (ie position, color)
   let offset = 0;  // location to start reading data from in the buffer

   gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, 
    offset);

    //do all actions related to VBO holding color data
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
   

    triangleColor = [
      /* R  G   B */

      1.0, 0.0, 0.0, //vertex 1
      1.0, 0.0, 0.0, //vertex 2
      1.0, 0.0, 0.0, //vertex 3
      1.0, 1.0, 0.0, //vertex 4
      1.0, 1.0, 0.0, //vertex 5
      1.0, 1.0, 0.0 //vertex 6
    ];
 
  // send vertices position data to GPU

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleColor), gl.STATIC_DRAW);
  // Now we tell vertex shader how to extract/pull/interpret bytes in buffer
  // now set up how to retrieve data from buffer
  // 1.st enable attrib location in shader
 //gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(colorAttributeLocation);
  // specifically how to interpret bits

  
  gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
  // tell the GPU which program to use 
  gl.useProgram(program);
  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  if(rotationDirection){
    theta -= 0.05;
  }
  else{
    theta += 0.05;
  }

  thetaLoc = gl.getUniformLocation(program, "theta");
  gl.uniform1f(thetaLoc, theta);
  // issue draw function. GPU will start executing pipeline
  //  pulling data from buffer and we populated ...  
  let primitiveType = gl.TRIANGLES;
  offset = 0;
  
  let count = 6;
  gl.drawArrays(primitiveType, offset, count);
  requestAnimationFrame(draw);

  
}

function initWebGL(){
  requestAnimationFrame(draw);

}

