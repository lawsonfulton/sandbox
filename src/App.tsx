import React, { useEffect } from "react";
import './App.css';

import { vec2 } from "gl-matrix";
import { glMatrix } from "gl-matrix";

import Two, { Vector } from "twojs-ts";
import Stats from "stats.js";
import { number } from "mathjs";

glMatrix.setMatrixArrayType(Array);

function logSync(...args: any[]) {
  try {
    args = args.map((arg) => JSON.parse(JSON.stringify(arg)));
    console.log(...args);
  } catch (error) {
    console.log("Error trying to console.logSync()", ...args);
  }
}

function clearCanvas(root: HTMLElement) {
  var svgs = root.getElementsByTagName("canvas");
  for (let el of svgs) {
    root.removeChild(el);
  }
}

class ChargeSystem {
  // State
  pos: Array<vec2>;
  oldPos: Array<vec2>;
  charge: Array<number>;
  invMass: Array<number>;

  // Simulation params
  nParts: number;
  maxParts: number;
  rad: number; // Constant for now
  bmax: vec2; // bounds
  bmin: vec2;

  // Temporaries
  force: Array<vec2>;

  constructor(maxParts: number, width: number, height: number) {
    this.nParts = maxParts; // Could be less than max
    this.maxParts = maxParts;
    
    this.rad = 1;

    this.bmax = vec2.fromValues(width / 2 - this.rad, height / 2 - this.rad);
    this.bmin = vec2.create();
    vec2.scale(this.bmin, this.bmax, -1);

    this.pos = new Array<vec2>(maxParts);
    this.oldPos = new Array<vec2>(maxParts);
    for (let i = 0; i < maxParts; i++) {
      this.pos[i] = vec2.fromValues(((i / 10) >> 0) * 2, (i % 10) * 2); // grid

      // Copy current pos into old pos
      this.oldPos[i] = vec2.clone(this.pos[i]);
    }

    this.charge = new Array<number>(maxParts);
    this.charge.fill(-1.0);

    this.invMass = new Array<number>(maxParts);
    this.invMass.fill(1.0);

    this.force = new Array<vec2>(maxParts);
    for (let i = 0; i < this.nParts; i++) {
      this.force[i] = vec2.fromValues(0.0, 0.0);
    }
  }

  attractParticles(point: vec2, strength: number) {
    for (let i = 0; i < this.nParts; i++) {
      const f = vec2.create();
      vec2.sub(f, point, this.pos[i]);
      vec2.normalize(f, f);
      vec2.scale(f, f, strength);

      vec2.add(this.force[i], this.force[i], f);
    }
  }

  applyCoulombForces() {
    for (let i = 0; i < this.nParts; i++) {
      const qi = this.charge[i];
      
      for (let j = i + 1; j < this.nParts; j++) {
        const qj = this.charge[j];
        
        const magnitude = ((qi * qj) / vec2.sqrDist(this.pos[i], this.pos[j])) * 50;
        
        const offset = vec2.create();
        vec2.sub(offset, this.pos[j], this.pos[i]); // vec from pi to pj
        vec2.normalize(offset, offset);
        
        const fi = vec2.create(); // force acting on pi
        vec2.scale(fi, offset, -magnitude);
        
        const fj = vec2.create(); // force acting on pi
        vec2.scale(fj, offset, magnitude);
        
        vec2.add(this.force[i], this.force[i], fi);
        vec2.add(this.force[j], this.force[j], fj);
      }
    }
  }
  
  applyGravity() {
    const fGrav = vec2.fromValues(0.0, 0.0);
    for (let i = 0; i < this.nParts; i++) {
      vec2.add(this.force[i], this.force[i], fGrav);
    }
  }

  step(dt: number) {
    this.applyCoulombForces();
    this.applyGravity();

    // a = F/m
    // Could store result back in F to optimize
    for (let i = 0; i < this.nParts; i++) {
      const p0 = this.oldPos[i];
      const p1 = this.pos[i];

      let a = vec2.create();
      vec2.scale(a, this.force[i], this.invMass[i]);

      let p2 = vec2.create();
      vec2.scale(p2, p1, 2.0); // 2x_n
      vec2.scaleAndAdd(p2, p2, p0, -1); // - x_n-1
      vec2.scaleAndAdd(p2, p2, a, dt * dt); // + a_n * t^2

      // Update
      this.pos[i] = p2;
      this.oldPos[i] = p1;
    }

    // collisions
    for (let its = 0; its < 2; its++) {
      for (let i = 0; i < this.nParts; i++) {
        // bounds
        vec2.min(this.pos[i], this.pos[i], this.bmax);
        vec2.max(this.pos[i], this.pos[i], this.bmin);

        // particles
        for (let j = i + 1; j < this.nParts; j++) {
          const pi = this.pos[i];
          const pj = this.pos[j];

          const sqrD = vec2.sqrDist(pi, pj);
          // If they are overlapping (assuming constant radius)
          if (sqrD < (this.rad * 2) ** 2) {
            const mid = vec2.create();
            vec2.add(mid, pi, pj);
            vec2.scale(mid, mid, 0.5);

            // normalized
            const offset = vec2.create();
            vec2.sub(offset, pi, mid); // vec from mid to pi
            vec2.normalize(offset, offset); // normalized
            vec2.scale(offset, offset, this.rad);

            const piNew = vec2.create();
            vec2.add(piNew, mid, offset);

            const pjNew = vec2.create();
            vec2.scaleAndAdd(pjNew, mid, offset, -1.0);

            // update
            this.pos[i] = piNew;
            this.pos[j] = pjNew;
          }
        }
      }
    }

    // reset forces
    for (let i = 0; i < this.nParts; i++) {
      this.force[i] = vec2.fromValues(0.0, 0.0);
    }
  }
}

class ChargeViewer {
  sys: ChargeSystem;
  two: Two;
  partSprites: Array<Two.Group>;
  scale: number;

  constructor(sys: ChargeSystem, two: Two, scale: number) {
    this.sys = sys;
    this.two = two;
    this.partSprites = new Array<Two.Group>(sys.maxParts);
    for (let i = 0; i < sys.maxParts; i++) {
      this.partSprites[i] = this.makeNegCharge();
    }

    this.scale = scale;

    this.update();
  }

  makeNegCharge() {
    let circ = this.two.makeCircle(0, 0, 1);
    circ.fill = "red";
    circ.noStroke();

    let rect = this.two.makeRectangle(0, 0, 1.2, 0.3);
    rect.fill = "black";
    rect.noStroke();

    return this.two.makeGroup([circ, rect]);
  }

  toScreen(pWorld: vec2): vec2 {
    const ofst = vec2.fromValues(this.two.width / 2.0, this.two.height / 2.0);
    const pScreen = vec2.create();
    vec2.scaleAndAdd(pScreen, ofst, pWorld, this.scale);
    return pScreen;
  }

  update() {
    for (let i = 0; i < this.sys.nParts; i++) {
      const pScreen = this.toScreen(this.sys.pos[i]);
      this.partSprites[i].translation.set(pScreen[0], pScreen[1]);
      this.partSprites[i].scale = this.scale;
    }
  }
}

function initTwo() {
  clearCanvas(document.body); // For hot reloading

  let two = new Two({
    fullscreen: true,
    autostart: true,
  }).appendTo(document.body);

  const scale = 8;
  const simWidth = two.width / scale;
  const simHeight = two.height / scale;

  let system = new ChargeSystem(300, simWidth, simHeight);
  let viewer = new ChargeViewer(system, two, scale);

  var stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  two.bind(Two.Events.update, function () {
    stats.begin();

    // system.attractParticles(vec2.fromValues(0.1, 0.1), 10);
    system.step(0.05);

    viewer.update();

    stats.end();
  });
}

// do a benchmark compare ndarray with array of vec

function App() {
  useEffect(() => {
    initTwo();
  }, []);
  
  return (
    <div className="Charges">
      <header className="Charges-header"></header>
    </div>
  );
}

export default App;
