class Camera {
    constructor() {
        this.eye = new Vector3([0,  3,  5]);
        this.at  = new Vector3([0,  0,  0]);
        this.up  = new Vector3([0,  1,  0]);
        this.speed = 0.1;
    }

    forward() {
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();
        this.eye.add(f.mul(this.speed));
        this.at.add(f);
    }

    backward() {
        var f = new Vector3(this.eye.elements);
        f.sub(this.at);
        f.normalize();
        this.eye.add(f.mul(this.speed));
        this.at.add(f);
    }

    strafeLeft() {
        var f = new Vector3(this.eye.elements);
        f.sub(this.at);
        f.normalize();
        var s = Vector3.cross(f, this.up);
        s.normalize();
        this.eye.add(s.mul(this.speed));
        this.at.add(s);
        // this.eye.elements[0] += s.elements[0] * this.speed;
        // this.eye.elements[1] += s.elements[1] * this.speed;
        // this.eye.elements[2] += s.elements[2] * this.speed;
        // this.at.elements[0]  += s.elements[0] * this.speed;
        // this.at.elements[1]  += s.elements[1] * this.speed;
        // this.at.elements[2]  += s.elements[2] * this.speed;
    }

    strafeRight() {
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();
        var s = Vector3.cross(f, this.up);
        s.normalize();
        this.eye.add(s.mul(this.speed));
        this.at.add(s);
    }

    moveUp() {
        this.eye.elements[1] += this.speed;
        this.at.elements[1]  += this.speed;
    }

    moveDown() {
        this.eye.elements[1] -= this.speed;
        this.at.elements[1]  -= this.speed;
    }

    yaw(delta) {
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();
        var cos = Math.cos(delta);
        var sin = Math.sin(delta);
        // Rotate forward vector around world Y axis
        var newFx = f.elements[0] * cos - f.elements[2] * sin;
        var newFz = f.elements[0] * sin + f.elements[2] * cos;
        this.at.elements[0] = this.eye.elements[0] + newFx;
        this.at.elements[2] = this.eye.elements[2] + newFz;
    }

    pitch(delta) {
        var f = new Vector3(this.at.elements);
        f.sub(this.eye);
        f.normalize();
        var right = Vector3.cross(f, this.up);
        right.normalize();
        var cos = Math.cos(delta);
        var sin = Math.sin(delta);
        // Rodrigues rotation around right axis (right ⊥ f, so dot term is 0)
        var crf = Vector3.cross(right, f);
        var newF = new Vector3([
            f.elements[0] * cos + crf.elements[0] * sin,
            f.elements[1] * cos + crf.elements[1] * sin,
            f.elements[2] * cos + crf.elements[2] * sin
        ]);
        newF.normalize();
        // Clamp so camera can't flip past vertical
        if (Math.abs(newF.elements[1]) > 0.99) return;
        this.at.elements[0] = this.eye.elements[0] + newF.elements[0];
        this.at.elements[1] = this.eye.elements[1] + newF.elements[1];
        this.at.elements[2] = this.eye.elements[2] + newF.elements[2];
    }

    turnLeft()  { this.yaw(-0.0872665); }
    turnRight() { this.yaw( 0.0872665); }
}
