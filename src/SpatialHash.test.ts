import { SpatialHash } from "./SpatialHash";
import { vec2 } from "gl-matrix";

test("One particle per cell", () => {
  const bounds = {
    min: vec2.fromValues(0, 0),
    max: vec2.fromValues(10, 10),
  };
  let pos = new Array<vec2>();
  for (let xi = 0; xi < 10; xi++) {
    for (let yi = 0; yi < 10; yi++) {
      pos.push(vec2.fromValues(xi, yi));
    }
  }
  let spatial = new SpatialHash(pos, 1, bounds);

  const pis = spatial.getParticles(pos, vec2.fromValues(0, 0), 1);
  expect(pis).toHaveLength(1);
});

test("Set particles", () => {
  const bounds = {
    min: vec2.fromValues(0, 0),
    max: vec2.fromValues(10, 10),
  };
  let pos = new Array<vec2>();
  for (let xi = 0; xi < 10; xi++) {
    for (let yi = 0; yi < 10; yi++) {
      pos.push(vec2.fromValues(xi + 0.5, yi + 0.5));
    }
  }
  let spatial = new SpatialHash(pos, 1, bounds);

  const firstCellIds = spatial.getParticles(pos, vec2.fromValues(0, 0), 1);
  expect(firstCellIds).toHaveLength(1);

  // Move the particle
  pos[0] = vec2.fromValues(1.5, 0.5);
  spatial.setParticle(0, pos[0]);

  const newFirstCellIds = spatial.getParticles(pos, vec2.fromValues(0, 0), 1);
  expect(newFirstCellIds).toHaveLength(0);

  const newSecCellIds = spatial.getParticles(pos, vec2.fromValues(1.5, 0.5), 1);
  expect(newSecCellIds).toHaveLength(2);
});
