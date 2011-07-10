/**
 * matrixStack.js
 * 
 * simulate the compatibility profile matrixStack
 * 
 * requires PhiloGL
 * 
 * @author Aco Mitevski <acomitevski@googlemail.com>
 */
(function() {
	
this.matrixStack = {};

	(function() {
	
		matrixStack.MatrixStack = function() {
			this.matrix[0] = new PhiloGL.Mat4();
			this.matrix[0].id();
		};
		  
		matrixStack.MatrixStack.prototype =  {
				currentMatrixIndex: 0,
				matrix: [],
				/**
				 * push current matrix to the stack
				 */
				pushMatrix: function() {
					var currentMatrixIndex = this.currentMatrixIndex;
					var newMatrixIndex = currentMatrixIndex + 1; 
					this.matrix[newMatrixIndex] = {};
					$.extend(true,this.matrix[newMatrixIndex], this.matrix[currentMatrixIndex]);
					this.currentMatrixIndex++;
				},
				/**
				 * remove current matrix from stack
				 */
				popMatrix: function() {
					this.matrix[this.currentMatrixIndex] = null;
					this.currentMatrixIndex--;
				},
				/**
				 * get current matrix on stack
				 * @returns PhiloGL.Mat4 matrix
				 */
				getMatrix: function() {
					return this.matrix[this.currentMatrixIndex];
				}
		};
	})();

})();