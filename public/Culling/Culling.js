function webGLStart() {
	var xRot = 0,
		yRot = 0;
	var PI = Math.PI;
	var cone, ground;
  //Load models arrays
  var coneVertices = [];
  var coneColors = [];
  var groundVertices = [];
  var groundColors = [];

  PhiloGL('culling-canvas', {
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
      //clockwise for triangle_fan
      gl.frontFace(gl.GL_CW);
      
      camera.modelView.id();
  
      function createGeometry() {
    	  var doublePI = 2* PI;
    	  doublePI = parseFloat(doublePI.toFixed(8));
    	  var step = PI / 8;
    	  step = parseFloat(step.toFixed(8));
    	  //cone
    	  coneVertices[0] = [0, 0, 3];
    	  coneColors[0] = [0, 1, 0, 1];
    	  var iPivot = 1;
    	  var i = 1;
    	  for ( var angle = 0; angle < doublePI; angle += step ) {
    		  angle = parseFloat(angle.toFixed(8));
    		  var x = Math.sin(angle) * 3;
    		  var y = Math.cos(angle) * 3;
    		  
    		  //rotate colors green and red
    		  if (iPivot % 2 === 0 ) {
    			  coneColors[i] = [0, 1, 0, 1];
    		  } else {
    			  coneColors[i] = [1, 0, 0, 1];
    		  }
    		  iPivot++;
    		  
    		  coneVertices[i] = [x, y, 0];
    		  i++;
    	  }
    	  
    	  //ground
    	  groundVertices[0] = [0, 0, 0];
    	  groundColors[0] = [1, 0, 0, 1];
    	  
    	  iPivot = 1;
    	  i = 1;
    	  for (var angle = 0; angle < doublePI; angle += step) {
    		  angle = parseFloat(angle.toFixed(8));
    		  var x = Math.sin(angle) * 3;
    		  var y = Math.cos(angle) * 3;
    		  
    		  //rotate colors green and red
    		  if (iPivot % 2 === 0 ) {
    			  groundColors[i] = [0, 1, 0, 1];
    		  } else {
    			  groundColors[i] = [1, 0, 0, 1];
    		  }
    		  iPivot++;
    		  
    		  groundVertices[i] = [x, y, 0];
    		  i++;
    	  }
    	  
    	  cone = new PhiloGL.O3D.Model({
    		  vertices: coneVertices,
    		  colors: coneColors
    	  });
    	  
    	  ground = new PhiloGL.O3D.Model({
    		  vertices: groundVertices,
    		  colors: groundColors
    	  });
      }
      
      function setupElement(elem) {
        //update element matrix
        elem.update();
        //get new view matrix out of element and camera matrices
        view.mulMat42(camera.modelView, elem.matrix);
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
        rPyramid += 0.01;
        rCube += 0.01;
      }

      function tick() {
        drawScene();
        //animate();
      }

      function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        //Draw cone
        cone.position.set(0, 0, -8);
        cone.rotation.set(xRot, yRot, 0);
        setupElement(cone);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, coneVertices.length);
        
        //Draw ground
        ground.position.set(0, 0, -8);
        ground.rotation.set(xRot, yRot, 0);
        setupElement(ground);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, groundVertices.length);
      }
      createGeometry();
      setInterval(tick, 1000/60);
    } 
  });
  
}
