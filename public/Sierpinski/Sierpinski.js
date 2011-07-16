function webGLStart() {
    //UI stuff
    var recursionLevel = 2;
    var self = this;
    $( "#slider" ).slider({
        orientation: "vertical",
        range: "min",
        min: 0,
        max: 6,
        value: recursionLevel,
        slide: function( event, ui ) {
            
            recursionLevel = ui.value;
            $( "#recursionLevel" ).val( recursionLevel );
            
        }
    });
    $( "#recursionLevel" ).val( recursionLevel );
    
    //hacky implementation of sierpinski tetraedon
    //@todo make calculation of tetraedon in worker
    //and solve recursion stack exception if recursionLevel>6
    var xRot = 0,
        yRot = 0;
    var PI = Math.PI;
    var currentVec3,
        startingY = 0,
        triangleCount = 0,
        sideLength = 4,
        defaultSideLength = 6,
        lastRecursionLevel = -1;
    
    var transformMatrixStack = new matrixStack.MatrixStack();
    
    //Load models arrays
    var triangles = [];
    var sierpinskiVertices = [];

  PhiloGL('sierpinski-canvas', {
    program: {
      from: 'ids',
      vs: 'shader-vs',
      fs: 'shader-fs'
    },
    events: {
        onKeyDown: function(e) {
          switch(e.key) {
            case 'up':
              xRot -= 0.05;
              break;
            case 'down':
              xRot += 0.05;
              break;
            case 'left':
              yRot -= 0.05;
              break;
            case 'right':
              yRot += 0.05;
              break;
            default:
                break;
          }
        }
    }, 
    onError: function() {
      alert("An error ocurred while loading the application");
    },
    onLoad: function(app) {
      var gl = app.gl,
          canvas = app.canvas,
          program = app.program,
          camera = app.camera,
          view = new PhiloGL.Mat4;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.GL_CULL_FACE);
      gl.depthFunc(gl.LEQUAL);
      
      camera.modelView.id();
  
      /**
       * add one single tetraedon
       */
      function addTetraeder()
      {
          transformMatrixStack.pushMatrix();
          var m = transformMatrixStack.getMatrix();
          for ( var i = 0; i < 12; i++) {
              currentVec3 = m.mulVec3(sierpinskiVertices[i].position);
              triangles[recursionLevel].colors.push(sierpinskiVertices[i].color);
              triangles[recursionLevel].vertices.push([currentVec3.x, currentVec3.y, currentVec3.z]);
          }
          transformMatrixStack.popMatrix();
      }


      /**
       * create the sierpinski tetraedon
       * @param depth
       */
      function createSierpinski(depth)
      {    
          transformMatrixStack.pushMatrix();
            
            //along the levels
            for (var i = 0; i <= depth; i++) {
                //create the tetraedons alog x-axis
                
                for (var j = 0 ; j < 2 ; j++) {
                    transformMatrixStack.pushMatrix();
                    //create tetraedon for every x along z-axis
                    if (i == 0) {
                        addTetraeder(); //draw upper tetraedon
                        transformMatrixStack.popMatrix();
                        break;
                    }
                    for (var k = 0; k < 2; k++) {
                        
                        transformMatrixStack.pushMatrix();
                        //for the first two levels
                        if (i == 1) {
                            if (j == 0) {
                                transformMatrixStack.matrix[transformMatrixStack.currentMatrixIndex].$translate(-sideLength, 0.0, sideLength); //linker Tetraeder        
                                addTetraeder();
                                transformMatrixStack.popMatrix();
                                break;
                            } else {
                                if (k == 0) {
                                    transformMatrixStack.matrix[transformMatrixStack.currentMatrixIndex].$translate(sideLength, 0.0, sideLength); //Tetraeder rechts vorne
                                } else {
                                    transformMatrixStack.matrix[transformMatrixStack.currentMatrixIndex].$translate(sideLength, 0.0, -sideLength); //Tetraeder rechts hinten
                                }
                                addTetraeder();
                            }
                        }
                        
                        //for upper levels make recursive call
                        if (i > 1) {
                            if (j == 0) {
                                transformMatrixStack.matrix[transformMatrixStack.currentMatrixIndex].$translate( -Math.pow(2.0, (i-1))*sideLength, 0.0, (Math.pow(2.0, i)*sideLength)/2 ); //linken Sierpinski Unterwuerfel
                                createSierpinski((i-1));
                                transformMatrixStack.popMatrix();
                                break;
                            } else {
                                if (k == 0) {
                                    transformMatrixStack.matrix[transformMatrixStack.currentMatrixIndex].$translate( Math.pow(2.0, (i-1))*sideLength, 0.0, (Math.pow(2.0, i)*sideLength)/2 ); //Sierpinski Unterwuerfel rechts vorne
                                }    else {
                                    transformMatrixStack.matrix[transformMatrixStack.currentMatrixIndex].$translate( Math.pow(2.0, (i-1))*sideLength, 0.0, -(Math.pow(2.0, i)*sideLength)/2 ); //Sierpinski Unterwuerfel rechts hinten
                                }
                                createSierpinski((i-1));
                            }
                        }
                        transformMatrixStack.popMatrix();
                    }
                    transformMatrixStack.popMatrix();
                }
                //move to next level, one level down
                var multiplikator = i;
                //set level 0 to 1
                if (i == 0) {
                    multiplikator = 1;
                }
                transformMatrixStack.matrix[transformMatrixStack.currentMatrixIndex].$translate(0.0, -Math.pow(2.0, multiplikator)*sideLength, 0.0);
                
                
            }
            transformMatrixStack.popMatrix();

      }    
      
      
      function changeRecursionLevel()
      {
          sideLength = defaultSideLength;
          lastRecursionLevel = recursionLevel;
          var numTetraeder = Math.pow(4.0, recursionLevel);
          
          //adjust sideLength to recursionLevel
          if (recursionLevel != 0) {
              sideLength =  sideLength/(Math.pow(2.0, recursionLevel));    
          }
          startingY = defaultSideLength - sideLength;
          triangleCount = numTetraeder * 12;
          createGeometry();
      }
      
      function createGeometry() {
        for (var i = 0; i < 12; i++) {
            sierpinskiVertices[i] = {
                    position: null,
                    color: null
            };
        }
        sierpinskiVertices[0].position = new PhiloGL.Vec3(0.0, sideLength, 0.0);
        sierpinskiVertices[1].position = new PhiloGL.Vec3(-sideLength,-sideLength, sideLength);
        sierpinskiVertices[2].position = new PhiloGL.Vec3(sideLength,-sideLength, sideLength);
        sierpinskiVertices[3].position = new PhiloGL.Vec3(0.0, sideLength, 0.0);
        sierpinskiVertices[4].position = new PhiloGL.Vec3(sideLength,-sideLength, sideLength);
        sierpinskiVertices[5].position = new PhiloGL.Vec3(sideLength,-sideLength, -sideLength);
        sierpinskiVertices[6].position = new PhiloGL.Vec3(-sideLength,-sideLength, sideLength);
        sierpinskiVertices[7].position = new PhiloGL.Vec3(0.0, sideLength, 0.0);
        sierpinskiVertices[8].position = new PhiloGL.Vec3(sideLength,-sideLength, -sideLength);
        sierpinskiVertices[9].position = new PhiloGL.Vec3(-sideLength,-sideLength, sideLength);
        sierpinskiVertices[10].position = new PhiloGL.Vec3(sideLength,-sideLength, -sideLength);
        sierpinskiVertices[11].position = new PhiloGL.Vec3(sideLength,-sideLength, sideLength);
    
        sierpinskiVertices[0].color = [1.0, 0.0, 0.0, 1.0];
        sierpinskiVertices[1].color = [1.0, 0.0, 0.0, 1.0];
        sierpinskiVertices[2].color = [1.0, 0.0, 0.0, 1.0];
        sierpinskiVertices[3].color = [1.0, 1.0, 0.0, 1.0];
        sierpinskiVertices[4].color = [1.0, 1.0, 0.0, 1.0];
        sierpinskiVertices[5].color = [1.0, 1.0, 1.0, 1.0];
        sierpinskiVertices[6].color = [1.0, 1.0, 0.0, 1.0];
        sierpinskiVertices[7].color = [1.0, 1.0, 0.0, 1.0];
        sierpinskiVertices[8].color = [1.0, 1.0, 0.0, 1.0];
        sierpinskiVertices[9].color = [1.0, 1.0, 0.0, 1.0];
        sierpinskiVertices[10].color = [1.0, 1.0, 0.0, 1.0];
        sierpinskiVertices[11].color = [0.0, 0.0, 1.0, 1.0];
        
        triangles[recursionLevel] = {
                vertices: [],
                colors: []
        };
        createSierpinski(recursionLevel);
          
          sierpinskiTetraedon = new PhiloGL.O3D.Model({
              vertices: triangles[recursionLevel].vertices,
              colors: triangles[recursionLevel].colors
          });
          triangles[recursionLevel].vertices = null;
          triangles[recursionLevel].colors = null;
      }
      
      function setupElement(elem) {
        //update element matrix
        elem.update();
        //get new view matrix out of element and camera matrices
        view.mulMat42(camera.modelView, elem.matrix);
        //move viewMatrix up, so the object rotates around its center
        view.$translate(0, startingY, 0);
        //set buffers with element data
        program.setBuffers({
          'aVertexPosition': {
            value: elem.toFloat32Array('vertices'),
            size: 3
          },
          'aVertexColor': {
            value: elem.toFloat32Array('colors'),
            size: 4
          }
        });
        //set uniforms
        program.setUniform('uMVMatrix', view);
        program.setUniform('uPMatrix', camera.projection);
      }

      function animate() {
        xRot += 0.01;
        yRot += 0.01;
      }

      function tick() {
        drawScene();
        animate();
      }

      function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //check if recursionLevel changed
        if (lastRecursionLevel != recursionLevel) {
            changeRecursionLevel();
        }
        //Draw sierpinskiTetraedon
        sierpinskiTetraedon.position.set(0, 0, -30);
        sierpinskiTetraedon.rotation.set(xRot, yRot, 0);
        setupElement(sierpinskiTetraedon);
        gl.drawArrays(gl.TRIANGLES, 0, triangleCount);
        
      }
      
      changeRecursionLevel();
      setInterval(tick, 1000/60);
    } 
  });
  
}