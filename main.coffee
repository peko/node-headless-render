fs = require 'fs'
createContext = require('gl')
utils = require('./utils.js')

main = ->
  # Create context
  width  = 512
  height = 512
  gl = createContext(width, height)

  vertex_src   = fs.readFileSync("shaders/shader.vert").toString('utf8')   
  fragment_src = fs.readFileSync("shaders/shader_28.frag").toString('utf8')

  # setup a GLSL program
  program = utils.createProgramFromSources(gl, [vertex_src, fragment_src])
  if !program
    return
  
  gl.useProgram program
  pos_loc = gl.getAttribLocation(program, 'pos')
  
  time        = gl.getUniformLocation program, 'time'
  mouse       = gl.getUniformLocation program, 'mouse'
  resolution  = gl.getUniformLocation program, 'resolution'
  backbuffer  = gl.getUniformLocation program, 'backbuffer'
  surfaceSize = gl.getUniformLocation program, 'surfaceSize'

  # look up where the vertex data needs to go.
  # Create a buffer and put a single clipspace rectangle in
  # it (2 triangles)
  buffer = gl.createBuffer()
  gl.bindBuffer gl.ARRAY_BUFFER, buffer
  gl.bufferData gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0 
     1.0, -1.0 
    -1.0,  1.0
    -1.0,  1.0 
     1.0, -1.0  
     1.0,  1.0
  ]), gl.STATIC_DRAW
  gl.enableVertexAttribArray pos_loc
  gl.vertexAttribPointer pos_loc, 2, gl.FLOAT, false, 0, 0

  frames = 9000.0
  start = Date.now()
  for i in [0...frames|0]
    
    gl.uniform1f time       , (Date.now()-start) / 1000.0
    gl.uniform2f mouse      , i/frames, i/frames 
    gl.uniform2f resolution , width, height 
    gl.uniform1i backbuffer , 0 
    gl.uniform2f surfaceSize, height, height
    
    gl.drawArrays gl.TRIANGLES, 0, 6
    utils.bufferToStdout gl, width, height
    i++
  gl.destroy()
  return

main()