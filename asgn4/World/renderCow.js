function renderCow() {
  var cowBody = new Cube();
  cowBody.color = [0.549, 0.463, 0.282, 1];
  cowBody.matrix.setTranslate(0, 0, 0);
  var bodyPassMat = new Matrix4(cowBody.matrix);
  cowBody.matrix.scale(1, .5, .5);
  cowBody.render();

  // draw the back left leg cube
  var backLeftLegMatrix = new Matrix4(bodyPassMat);
  backLeftLegMatrix.translate(-.3, -.3, .2);
  var backLeftLegColor = [0.549, 0.463, 0.282, 1];
  Leg(backLeftLegMatrix, backLeftLegColor, -1);

  // draw the back right leg cube
  var backRightLegyMatrix = new Matrix4(bodyPassMat);
  backRightLegyMatrix.translate(-.3, -.3, -.2);
  var backRightLegColor = [0.549, 0.463, 0.282, 1];
  Leg(backRightLegyMatrix, backRightLegColor, 1);

  // draw the front left leg cube
  var frontLeftLegMatrix = new Matrix4(bodyPassMat);
  frontLeftLegMatrix.translate(.3, -.3, .2);
  var frontLeftLegColor = [0.549, 0.463, 0.282, 1];
  Leg(frontLeftLegMatrix, frontLeftLegColor, 1);

  // draw the front right leg cube
  var frontRightLegyMatrix = new Matrix4(bodyPassMat);
  frontRightLegyMatrix.translate(.3, -.3, -.2);
  var frontRightLegColor = [0.549, 0.463, 0.282, 1];
  Leg(frontRightLegyMatrix, frontRightLegColor, -1);

  var tailMatrix = new Matrix4();
  var tailColor = [0.486, 0.4, 0.219, 1];
  Tail(tailMatrix, tailColor, 1);

  // draw the head cube
  var headMatrix = new Matrix4();
  var headColor = [0.486, 0.4, 0.219, 1];
  Head(headMatrix, headColor);
}
function Tail(matrix, color, dir) {
  var tailJoint1 = new Cube();
  tailJoint1.color = color;
  tailJoint1.matrix.translate(-.55, .1, 0);
  if (g_isAnimated) {
    tailJoint1.matrix.rotate(-15, dir * 100 * (Math.sin(g_seconds * 4)) * 2, 0, 100);
  } else {
    tailJoint1.matrix.rotate(-15, -g_tailAngle, 0, 1);
  }
  var jointPass1 = new Matrix4(tailJoint1.matrix);
  tailJoint1.matrix.translate(0, -.1, 0);
  tailJoint1.matrix.scale(.1, .3, .1);
  tailJoint1.render();

  var tailJoint2 = new Cube();
  tailJoint2.color = [color[0] * .9, color[1] * .9, color[2] * .9, color[3]];
  tailJoint2.matrix = new Matrix4(jointPass1);
  var jointPass2 = tailJoint2.matrix;
  tailJoint2.matrix.translate(0, -.2, 0);
  if (g_isAnimated) {
    tailJoint2.matrix.rotate(15, dir * -35 * (Math.sin(g_seconds * 4) * 5), 0, 100);
  } else {
    tailJoint2.matrix.rotate(15, g_tailAngle, 0, 1);
  }
  tailJoint2.matrix.translate(0, -.15, 0);
  tailJoint2.matrix.scale(.08, .25, .08);
  tailJoint2.render();
}
function Head(matrix, color) {
  //draw main part of head cube
  var cowHead = new Cube();
  cowHead.matrix = new Matrix4(matrix);
  cowHead.color = color;
  cowHead.matrix.translate(.6, .2, 0);
  var cowHeadMat = new Matrix4(cowHead.matrix);
  cowHead.matrix.scale(.3, .35, .35);
  cowHead.render();

  // draw the left horn snout cube
  var cowHornL = new Cube();
  cowHornL.color = [0.5, 0.5, 0.5, 1];
  cowHornL.matrix = new Matrix4(cowHeadMat);
  cowHornL.matrix.translate(.15, .1, -0.225);
  cowHornL.matrix.scale(.25, .1, .1);
  cowHornL.render();

  // draw the right horn snout cube
  var cowHornR = new Cube();
  cowHornR.color = [0.5, 0.5, 0.5, 1];
  cowHornR.matrix = new Matrix4(cowHeadMat);
  cowHornR.matrix.translate(.15, .1, 0.225);
  cowHornR.matrix.scale(.25, .1, .1);
  cowHornR.render();

  // draw the front snout cube
  var cowSnout = new Cube();
  cowSnout.color = color;
  cowSnout.matrix.translate(.75, .1, 0);
  cowSnout.matrix.scale(.15, .15, .25);
  cowSnout.render();
}
function Leg(matrix, color, dir) {
  var cowLegJoint1 = new Cube();
  cowLegJoint1.color = color;
  cowLegJoint1.matrix = new Matrix4(matrix);
  if (g_isAnimated) {
    cowLegJoint1.matrix.rotate(15 * (dir * Math.sin(g_seconds * 4)), 0, 0);
  } else {
    cowLegJoint1.matrix.rotate((g_legAngle) * dir, 0, 0);
  }
  cowLegJoint1.matrix.translate(0, .05, 0);
  var jointPass1 = new Matrix4(cowLegJoint1.matrix);
  cowLegJoint1.matrix.scale(.2, .2, .2);
  cowLegJoint1.render();

  var cowLegJoint2 = new Cube();
  cowLegJoint2.color = [color[0] * .9, color[1] * .9, color[2] * .9, color[3]];
  cowLegJoint2.matrix = jointPass1;
  if (g_isAnimated) {
    cowLegJoint2.matrix.rotate(30 * (dir * Math.sin(g_seconds * 4)), 0, 0);
  } else {
    cowLegJoint2.matrix.rotate((g_legAngle) * dir, 0, 0);
  }
  cowLegJoint2.matrix.translate(0, -.2, .0);
  var jointPass2 = new Matrix4(cowLegJoint2.matrix);
  cowLegJoint2.matrix.scale(.175, .3, .175);
  cowLegJoint2.render();

  var cowLegJoint3 = new Cube();
  cowLegJoint3.color = [color[0] * .8, color[1] * .8, color[2] * .8, color[3]];
  cowLegJoint3.matrix = jointPass2;
  if (g_isAnimated) {
    cowLegJoint2.matrix.rotate(30 * (dir * Math.sin(g_seconds * 4)), 0, 0);
  } else {
    cowLegJoint2.matrix.rotate((15 + g_legAngle) * dir, 0, 0);
  }
  cowLegJoint3.matrix.translate(0.05, -0.15, 0);
  cowLegJoint3.matrix.scale(.3, .1, .2);
  cowLegJoint3.render();

}
