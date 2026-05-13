class Camera{
    constructor(){
        this.eye = new Vector3([0,  3,  5  ]);
        this.at  = new Vector3([0,  0,  0  ]);
        this.up  = new Vector3([0,  1,  0  ]);
    }

    forward(){
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();
        this.at.add(f);
        this.eye.add(f);
    }
    backward(){
        var f = new Vector3(this.eye.elements);
        f.sub(this.at);
        f.normalize();
        this.at.add(f);
        this.eye.add(f);
    }
    strafeLeft(){
        var f = new Vector3(this.eye.elements);
        f.sub(this.at);
        f.normalize();
        var s = Vector3.cross(f, this.up);
        s.normalize();
        this.at.add(s);
        this.eye.add(s);
    }
    strafeRight(){
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();
        var s = Vector3.cross(f, this.up);
        s.normalize();
        this.at.add(s);
        this.eye.add(s);
    }
    turnLeft(){
        var atp = new Vector3(this.at.elements).sub(this.eye);
        var r = Math.sqrt(Math.pow(atp.elements[0], 2) + Math.pow(atp.elements[2], 2));
        var theta = Math.atan2(atp.elements[2], atp.elements[0]);
        theta = theta - 0.0872665;
        this.at.elements[0] = this.eye.elements[0] + r * Math.cos(theta);
        this.at.elements[2] = this.eye.elements[2] + r * Math.sin(theta);
    }
    turnRight(){
        var atp = new Vector3(this.at.elements).sub(this.eye);
        var r = Math.sqrt(Math.pow(atp.elements[0], 2) + Math.pow(atp.elements[2], 2));
        var theta = Math.atan2(atp.elements[2], atp.elements[0]);
        theta = theta + 0.0872665;
        this.at.elements[0] = this.eye.elements[0] + r * Math.cos(theta);
        this.at.elements[2] = this.eye.elements[2] + r * Math.sin(theta);
    }
}