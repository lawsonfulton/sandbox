import { SpatialHash } from "./SpatialHash";
import { BBox } from "./BBox";

import { vec2 } from "gl-matrix";
import { number } from "mathjs";

// TODO
// 1. Make Spatial Hash own the position array so they can't get out of sync

export class ChargeSystem {
  useSpatial: boolean;
  spatial: SpatialHash;

  // State
  pos: Array<vec2>;
  oldPos: Array<vec2>;
  charge: Array<number>;
  invMass: Array<number>;

  // Simulation params
  nParts: number;
  maxParts: number;
  rad: number; // Constant for now
  collisionRad: number;
  bounds: BBox;

  // Temporaries
  force: Array<vec2>;

  constructor(maxParts: number, width: number, height: number) {
    this.nParts = maxParts; // Could be less than max
    this.maxParts = maxParts;

    this.rad = 1;
    this.collisionRad = this.rad * this.rad * 4; // * 3;

    this.bounds = this.getBounds(width, height);

    this.pos = new Array<vec2>(maxParts);
    this.oldPos = new Array<vec2>(maxParts);
    for (let i = 0; i < maxParts; i++) {
      this.pos[i] = vec2.fromValues(
        this.rad * 2 + this.bounds.min[0] + ((i / 10) >> 0) * 2,
        (i % 10) * 2
      ); // grid

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

    // spatial bounds need to be a bit bigger to account for overshoot
    this.useSpatial = true;
    const cellSize = this.rad * 4;
    const buffer = this.rad * 8 * 2;
    const spatialBounds = {
      max: vec2.fromValues(width / 2 + buffer, height / 2 + buffer),
      min: vec2.fromValues(-(width / 2) - buffer, -(height / 2) - buffer),
    };
    this.spatial = new SpatialHash(this.pos, cellSize, spatialBounds);
  }

  getBounds(width: number, height: number): BBox {
    return {
      max: vec2.fromValues(width / 2 - this.rad, height / 2 - this.rad),
      min: vec2.fromValues(-(width / 2 - this.rad), -(height / 2 - this.rad)),
    };
  }

  updateBounds(width: number, height: number) {
    this.bounds = this.getBounds(width, height);
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

        const magnitude =
          ((qi * qj) / vec2.sqrDist(this.pos[i], this.pos[j])) * 50;

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
    const fGrav = vec2.fromValues(0.0, 9.8);
    for (let i = 0; i < this.nParts; i++) {
      vec2.add(this.force[i], this.force[i], fGrav);
    }
  }

  private updatePosition(idx: number, pos: vec2) {
    this.pos[idx] = pos;
    // TODO Maybe I should just fully abstract the position array
    if (this.useSpatial) {
      this.spatial.setParticle(idx, pos);
    }
  }

  step(dt: number) {
    this.applyCoulombForces();
    // this.applyGravity();

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
      this.updatePosition(i, p2);
      this.oldPos[i] = p1;
    }

    // collisions
    // this.spatial.updateParticles(this.pos);
    for (let its = 0; its < 2; its++) {
      for (let i = 0; i < this.nParts; i++) {
        // bounds
        vec2.min(this.pos[i], this.pos[i], this.bounds.max);
        vec2.max(this.pos[i], this.pos[i], this.bounds.min);

        if (this.useSpatial) {
          const closeParts = this.spatial.getParticles(
            this.pos,
            this.pos[i],
            this.collisionRad
          );

          for (const j of closeParts) {
            if (j !== i) {
              this.resolveCollision(i, j);
            }
          }
        } else {
          for (let j = i + 1; j < this.nParts; j++) {
            this.resolveCollision(i, j);
          }
        }
      }
    }

    // reset forces
    for (let i = 0; i < this.nParts; i++) {
      this.force[i] = vec2.fromValues(0.0, 0.0);
    }
  }

  resolveCollision(i: number, j: number) {
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
      this.updatePosition(i, piNew);
      this.updatePosition(j, pjNew);
    }
  }
}
