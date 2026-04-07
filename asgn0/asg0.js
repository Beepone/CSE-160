// DrawRectangle.js
var canvas = document.getElementById('example');
var ctx = canvas.getContext('2d');
var vector1;
var vector2;
function main() {
    // Retrieve <canvas> element <- (1)
   
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG <- (2)
    
    // Draw a blue rectangle <- (3)
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a blue color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color
    // var v1 = new Vector3([100,200,3]);
    // drawVector(v1);
}

function drawVector(vector, color){
    ctx.beginPath();
    ctx.moveTo(200,200);
    ctx.lineTo((vector.elements[0]*20)+200,(-vector.elements[1]*20)+200);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function handleDrawEvent(){
    ctx.fillRect(0, 0, 400, 400);
    inputX = Number(document.getElementById("v1inputX").value)
    inputY = Number(document.getElementById("v1inputY").value)
    vector1 = new Vector3([inputX,inputY,0]);
    drawVector(vector1, "red");
    inputX = Number(document.getElementById("v2inputX").value)
    inputY = Number(document.getElementById("v2inputY").value)
    vector2 = new Vector3([inputX,inputY,0]);
    drawVector(vector2, "blue");
}

function handleDrawOperationEvent(){
    const op = document.getElementById("op-select").value;
    if(op=="add"){
        handleDrawEvent();
        var sum = new Vector3(vector1.elements);
        sum.add(vector2);
        drawVector(sum, "green");
        return;
    }
    if(op=="sub"){
        handleDrawEvent();
        var sum = new Vector3(vector1.elements);
        sum.sub(vector2);
        drawVector(sum, "green");
        return;
    }
    const scalar = Number(document.getElementById("scalar").value);
    if(op=="mul"){
        handleDrawEvent();
        var sum1 = new Vector3(vector1.elements);
        var sum2 = new Vector3(vector2.elements);
        sum1.mul(scalar);
        sum2.mul(scalar);
        drawVector(sum1, "green");
        drawVector(sum2, "green");
        return;
    }
    if(op=="div"){
        handleDrawEvent();
        var sum1 = new Vector3(vector1.elements);
        var sum2 = new Vector3(vector2.elements);
        sum1.div(scalar);
        sum2.div(scalar);
        drawVector(sum1, "green");
        drawVector(sum2, "green");
        return;
    }
    if(op=="mag"){
        handleDrawEvent();
        console.log("v1: "+vector1.magnitude());
        console.log("v2: "+vector2.magnitude());
        return;
    }
    if(op=="norm"){
        handleDrawEvent();
        var sum1 = new Vector3(vector1.elements);
        var sum2 = new Vector3(vector2.elements);
        sum1.normalize();
        sum2.normalize();
        drawVector(sum1, "green");
        drawVector(sum2, "green");
        return;
    }
    if(op=="btwn"){
        handleDrawEvent();
        let dot = Vector3.dot(vector1, vector2);
        let arcos = Math.acos(Vector3.dot(vector1, vector2)/(vector1.magnitude()*vector2.magnitude()))
        console.log("Angle: "+(arcos*180)/Math.PI);
        return;
    }
    if(op=="area"){
        handleDrawEvent();
        console.log("The area of the Triangle is: "+Vector3.cross(vector1, vector2).magnitude()/2)
        return;
    }
}