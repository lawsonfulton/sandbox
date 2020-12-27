import React, { useEffect } from "react";
import './App.css';

import cwise from "cwise";
import ndarray from "ndarray";
import ops from "ndarray-ops";

import { vec2 } from "gl-matrix";
import { glMatrix } from "gl-matrix";

import Two, { Vector } from "twojs-ts";
import Stats from "stats.js";

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

const muladdseq = cwise({
  args: ["array", "array", "scalar"],
  body: function (a, b, s) {
    a += b * s;
  },
});

class ChargeSystem {
  // State
  pos: ndarray;
  oldPos: ndarray;
  charge: ndarray;
  invMass: ndarray;

  // Simulation params
  nParts: number;
  maxParts: number;
  rad: number; // Constant for now
  bmax: vec2; // bounds
  bmin: vec2;

  // Temporaries
  force: ndarray;
  acc: ndarray; // Acceleration

  constructor(maxParts: number, width: number, height: number) {
    this.nParts = maxParts; // Could be less than max
    this.maxParts = maxParts;
    this.rad = 1;
    this.bmax = vec2.fromValues(width / 2 - this.rad, height / 2 - this.rad);
    this.bmin = vec2.create();
    vec2.scale(this.bmin, this.bmax, -1);

    const dim = 2;

    this.pos = ndarray(new Float64Array(maxParts * dim), [maxParts, dim]);
    for (let i = 0; i < maxParts; i++) {
      this.pos.set(i, 0, ((i / 10) >> 0) * 2); // x
      this.pos.set(i, 1, (i % 10) * 2); // y
    }

    this.oldPos = ndarray(new Float64Array(maxParts * dim), [maxParts, dim]);
    ops.assign(this.oldPos, this.pos);

    this.charge = ndarray(new Float64Array(maxParts), [maxParts]);
    ops.assigns(this.charge, -1);

    this.invMass = ndarray(new Float64Array(maxParts), [maxParts]);
    ops.assigns(this.invMass, 1.0);

    this.acc = ndarray(new Float64Array(maxParts * dim), [maxParts, dim]);
    this.force = ndarray(new Float64Array(maxParts * dim), [maxParts, dim]);
  }

  attractParticles(point: vec2, strength: number) {
    for (let i = 0; i < this.nParts; i++) {
      const pi = vec2.fromValues(this.pos.get(i, 0), this.pos.get(i, 1));

      const force = vec2.create();
      vec2.sub(force, point, pi);
      vec2.normalize(force, force);
      vec2.scale(force, force, strength);

      this.force.set(i, 0, force[0]);
      this.force.set(i, 1, force[1]);
    }
  }

  applyCoulombForces() {
    for (let i = 0; i < this.nParts; i++) {
      const pi = vec2.fromValues(this.pos.get(i, 0), this.pos.get(i, 1));
      const qi = this.charge.get(i);

      for (let j = i + 1; j < this.nParts; j++) {
        const pj = vec2.fromValues(this.pos.get(j, 0), this.pos.get(j, 1));
        const qj = this.charge.get(j);

        const magnitude = ((qi * qj) / vec2.sqrDist(pi, pj)) * 50;

        const offset = vec2.create();
        vec2.sub(offset, pj, pi); // vec from pi to pj
        vec2.normalize(offset, offset);

        const fi = vec2.create(); // force acting on pi
        vec2.scale(fi, offset, -magnitude);

        const fj = vec2.create(); // force acting on pi
        vec2.scale(fj, offset, magnitude);

        this.force.set(i, 0, this.force.get(i, 0) + fi[0]);
        this.force.set(i, 1, this.force.get(i, 1) + fi[1]);

        this.force.set(j, 0, this.force.get(j, 0) + fj[0]);
        this.force.set(j, 1, this.force.get(j, 1) + fj[1]);
      }
    }
  }

  step(dt: number) {
    this.applyCoulombForces();

    const fGrav = [0, 0]; // -9.8];
    // Reset and apply gravity
    ops.addseq(this.force.pick(null, 0), fGrav[0]);
    ops.addseq(this.force.pick(null, 1), fGrav[1]);
    // logSync("force", this.force);

    // a = F/m
    // Could store result back in F to optimize
    for (let i = 0; i < this.nParts; i++) {
      const f = vec2.fromValues(this.force.get(i, 0), this.force.get(i, 1));
      const mInv = this.invMass.get(i);
      const p0 = vec2.fromValues(this.oldPos.get(i, 0), this.oldPos.get(i, 1));
      const p1 = vec2.fromValues(this.pos.get(i, 0), this.pos.get(i, 1));

      let a = vec2.create();
      vec2.scale(a, f, mInv);

      let p2 = vec2.create();
      vec2.scale(p2, p1, 2.0); // 2x_n
      vec2.scaleAndAdd(p2, p2, p0, -1); // - x_n-1
      vec2.scaleAndAdd(p2, p2, a, dt * dt); // + a_n * t^2

      // Update
      this.pos.set(i, 0, p2[0]);
      this.pos.set(i, 1, p2[1]);

      this.oldPos.set(i, 0, p1[0]);
      this.oldPos.set(i, 1, p1[1]);
    }

    // collisions
    for (let its = 0; its < 2; its++) {
      for (let i = 0; i < this.nParts; i++) {
        // bounds
        const pi = vec2.fromValues(this.pos.get(i, 0), this.pos.get(i, 1));
        vec2.min(pi, pi, this.bmax);
        vec2.max(pi, pi, this.bmin);
        this.pos.set(i, 0, pi[0]);
        this.pos.set(i, 1, pi[1]);

        // particles
        for (let j = i + 1; j < this.nParts; j++) {
          const pi = vec2.fromValues(this.pos.get(i, 0), this.pos.get(i, 1));
          const pj = vec2.fromValues(this.pos.get(j, 0), this.pos.get(j, 1));

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
            this.pos.set(j, 0, pjNew[0]);
            this.pos.set(j, 1, pjNew[1]);

            this.pos.set(i, 0, piNew[0]);
            this.pos.set(i, 1, piNew[1]);
          }
        }
      }
    }

    // reset forces
    ops.assigns(this.force, 0.0);
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

  toScreen(wx: number, wy: number): [number, number] {
    const ofstX = this.two.width / 2.0;
    const ofstY = this.two.height / 2.0;
    return [wx * this.scale + ofstX, -wy * this.scale + ofstY];
  }

  update() {
    for (let i = 0; i < this.sys.nParts; i++) {
      const wx = this.sys.pos.get(i, 0);
      const wy = this.sys.pos.get(i, 1);
      const [sx, sy] = this.toScreen(wx, wy);

      // this.partSprites[i].translation.set(sx, sy);
      // this.partSprites[i].scale = this.scale;
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

  let system = new ChargeSystem(600, simWidth, simHeight);
  let viewer = new ChargeViewer(system, two, scale);

  var stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  two.bind(Two.Events.update, function () {
    stats.begin();

    system.attractParticles(vec2.fromValues(0.1, 0.1), 10);
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
