import Two from "twojs-ts";
import { vec2 } from "gl-matrix";

import { ChargeSystem } from "./ChargeSystem";

export class ChargeViewer {
  sys: ChargeSystem;
  two: Two;
  showDebug: boolean;
  scale: number;
  partSprites: Array<Two.Group>;

  constructor(sys: ChargeSystem, two: Two, scale: number, showDebug: boolean) {
    this.sys = sys;
    this.two = two;
    this.showDebug = showDebug;
    this.scale = scale;

    if (showDebug) {
      this.drawSpatialHash();
    }

    this.partSprites = new Array<Two.Group>(sys.maxParts);
    for (let i = 0; i < sys.maxParts; i++) {
      this.partSprites[i] = this.makeNegCharge();
    }

    this.update();
  }

  drawSpatialHash() {
    const origin = this.sys.spatial.origin;
    const spacing = this.sys.spatial.cellSize;
    const cols = this.sys.spatial.grid.nCols;
    const rows = this.sys.spatial.grid.nRows;

    const drawLine = (sx: number, sy: number, ex: number, ey: number) => {
      let line = this.two.makeLine(sx, sy, ex, ey);
      line.stroke = "lightgrey";
    };

    for (let ci = 0; ci < cols; ci++) {
      const start = vec2.clone(origin);
      vec2.add(start, start, vec2.fromValues(ci * spacing, 0));
      const [sx, sy] = this.toScreen(start);

      const end = vec2.clone(start);
      vec2.add(end, end, vec2.fromValues(0, rows * spacing));
      const [ex, ey] = this.toScreen(end);

      drawLine(sx, sy, ex, ey);
    }

    for (let ri = 0; ri < rows; ri++) {
      const start = vec2.clone(origin);
      vec2.add(start, start, vec2.fromValues(0, ri * spacing));
      const [sx, sy] = this.toScreen(start);

      const end = vec2.clone(start);
      vec2.add(end, end, vec2.fromValues(cols * spacing, 0));
      const [ex, ey] = this.toScreen(end);

      drawLine(sx, sy, ex, ey);
    }
  }

  makeNegCharge() {
    let circ = this.two.makeCircle(0, 0, this.sys.rad);
    circ.fill = "purple";
    circ.linewidth = 0.1;
    // circ.noStroke();

    let rect = this.two.makeRectangle(
      0,
      0,
      1.2 * this.sys.rad,
      0.3 * this.sys.rad
    );
    rect.fill = "black";
    rect.noStroke();

    let chargeGroup = this.two.makeGroup([circ]);

    if (this.showDebug) {
      let collCirc = this.two.makeCircle(0, 0, this.sys.collisionRad);
      collCirc.noFill();
      collCirc.linewidth = 0.1;
      collCirc.stroke = "lightgrey";
      chargeGroup.add(collCirc);
    }

    return chargeGroup;
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
