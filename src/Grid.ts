export class Grid<T> {
  nRows: number;
  nCols: number;
  cells: Array<T>; // Row-major

  constructor(TCreator: { new (): T }, nRows: number, nCols: number) {
    this.nRows = nRows;
    this.nCols = nCols;
    this.cells = new Array<T>(nRows * nCols);
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = new TCreator();
    }
  }

  get(row: number, col: number): T {
    return this.cells[col + row * this.nCols];
  }

  getCellAndNeighbors(row: number, col: number): Array<T> {
    const offsets = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
    ];
    let res = new Array<T>(offsets.length);
    res.length = 0;
    for (const ofst of offsets) {
      const r = row + ofst[0];
      const c = col + ofst[1];

      if (this.inBounds(r, c)) {
        res.push(this.get(r, c));
      }
    }

    return res;
  }

  inBounds(row: number, col: number) {
    return row >= 0 && row < this.nRows && col >= 0 && col < this.nCols;
  }

  getCells(): Array<T> {
    return this.cells;
  }
}
