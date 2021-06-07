import { BBox } from "./BBox";
import { Grid } from "./Grid";
import { vec2 } from "gl-matrix";

class Cell {
  partIds: Array<number>; // Stores index in the particles Array

  constructor() {
    this.partIds = new Array<number>(10); // preallocate for 10?
    this.clear();
  }

  add(pId: number) {
    this.partIds.push(pId);
  }

  remove(pId: number) {
    const index = this.partIds.indexOf(pId);
    this.partIds.splice(index, 1);
  }

  ids(): Array<number> {
    return this.partIds;
  }

  clear() {
    this.partIds.length = 0;
  }
}

export class SpatialHash {
  readonly cellSize: number;
  readonly invCellSize: number;
  readonly bounds: BBox;
  readonly origin: vec2; // origin at bounds.min
  grid: Grid<Cell>;
  idToCell: Array<Cell>;

  constructor(particles: Array<vec2>, cellSize: number, bounds: BBox) {
    this.cellSize = cellSize;
    this.invCellSize = 1.0 / cellSize;
    this.bounds = bounds;
    this.origin = bounds.min;

    // Set up grid
    const ncol = Math.ceil((bounds.max[0] - bounds.min[0]) / cellSize);
    const nrow = Math.ceil((bounds.max[0] - bounds.min[0]) / cellSize);
    this.grid = new Grid<Cell>(Cell, nrow, ncol);

    // Set up reverse index
    this.idToCell = new Array<Cell>(particles.length);

    // Add the particles
    this.updateParticles(particles);
  }

  private checkBounds(pos: Array<vec2>) {
    for (const p of pos) {
      if (
        p[0] > this.bounds.max[0] ||
        p[1] > this.bounds.max[1] ||
        p[0] < this.bounds.min[0] ||
        p[1] < this.bounds.min[1]
      ) {
        throw new Error("Attempting to add particle outside of bounds");
      }
    }
  }

  updateParticles(particles: Array<vec2>) {
    // this.checkBounds(particles); // For debugging only
    for (let cell of this.grid.getCells()) {
      cell.clear();
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      let cell = this.getCell(p);
      cell.add(i);
      this.idToCell[i] = cell;
    }
  }

  // Update the position of an existing particle
  setParticle(pId: number, pos: vec2) {
    // this.checkBounds([pos]); // For debugging only
    let origCell = this.idToCell[pId];
    let newCell = this.getCell(pos);
    if (newCell !== origCell) {
      origCell.remove(pId);
      newCell.add(pId);
      this.idToCell[pId] = newCell;
    }
  }

  pointToId(p: vec2): [number, number] {
    let gridP = vec2.create(); // gridP = floor((p - origin) / cellSize
    vec2.sub(gridP, p, this.origin);
    vec2.scale(gridP, gridP, this.invCellSize);
    vec2.floor(gridP, gridP);

    return [gridP[0], gridP[1]];
  }

  getCell(p: vec2): Cell {
    return this.grid.get(...this.pointToId(p));
  }

  getCellAndNeighbors(p: vec2): Array<Cell> {
    return this.grid.getCellAndNeighbors(...this.pointToId(p));
  }

  getParticles(
    particles: Array<vec2>,
    point: vec2,
    sqrRad: number
  ): Array<number> {
    let res = new Array<number>();

    const cells = this.getCellAndNeighbors(point);
    for (const cell of cells) {
      for (const id of cell.ids()) {
        const p = particles[id];
        if (vec2.sqrDist(p, point) < sqrRad) {
          res.push(id);
        }
      }
    }

    return res;
  }
}
