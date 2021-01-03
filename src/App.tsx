import React, { useEffect } from "react";
import './App.css';

import { ChargeViewer } from "./ChargeViewer";
import { ChargeSystem } from "./ChargeSystem";

import Two from "twojs-ts";
import Stats from "stats.js";

import { glMatrix, vec2 } from "gl-matrix";
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


function initTwo() {
  clearCanvas(document.body); // For hot reloading

  let two = new Two({
    fullscreen: true,
    autostart: true,
  }).appendTo(document.body);

  const scale = 16;
  const simWidth = two.width / scale;
  const simHeight = two.height / scale;

  let system = new ChargeSystem(200, simWidth, simHeight);
  const showDebug = false;
  let viewer = new ChargeViewer(system, two, scale, showDebug);
  // viewer.drawSpatialHash();

  var stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  two.bind(Two.Events.update, function () {
    stats.begin();

    system.attractParticles(vec2.fromValues(0.1, 0.1), 20); //20);
    system.step(0.05);

    viewer.update();

    stats.end();
  });
}

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
