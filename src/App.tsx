import React, { useEffect, useRef } from "react";
import './App.css';

import { Button } from "antd";
import "./App.css";

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

const SimulationApp = () => {
  let ref = useRef() as React.MutableRefObject<HTMLInputElement>;
  let twoRef = useRef(new Two({fullscreen: true, autostart: true }));

  useEffect(setup, []);

  const scale = 16;
  const simWidth = twoRef.current.width / scale;
  const simHeight = twoRef.current.height / scale;
  const showDebug = false;
  let systemRef = useRef(new ChargeSystem(100, simWidth, simHeight));
  let viewerRef = useRef(
    new ChargeViewer(systemRef.current, twoRef.current, scale, showDebug)
    );
    
  function setup() {
    let two = twoRef.current;
    two.appendTo(ref.current);

    // Add any shapes you'd like here
    two.bind(Two.Events.update, update);
    two.bind(Two.Events.resize, resize);

    return function () {
      // Unmount handler
      two.unbind(Two.Events.update, update);
      two.unbind(Two.Events.resize, resize);
    }; 
  }
  
  function resize() {
    const simWidth = twoRef.current.width / scale;
    const simHeight = twoRef.current.height / scale;
    systemRef.current.updateBounds(simWidth, simHeight);
  }

  function update() {
    // stats.begin();

    systemRef.current.attractParticles(vec2.fromValues(0.1, 0.1), 20); //20);
    systemRef.current.step(0.05);
    
    viewerRef.current.update();
    
    // stats.end();
  }
  function click() {
    systemRef.current.attractParticles(vec2.fromValues(0, 0), 200); //20);
  }
  return (
    <div>
      <div>
        <Button type="primary" style={{ position: 'fixed', zIndex:1}} onClick={click}>Test</Button>
      </div>
      <div>
        <div className="stage" ref={ref} />
      </div>
    </div>
  );
};


const App = () => {
  return (
    <div className="Charges">
      <header className="Charges-header"></header>
      <SimulationApp />
    </div>
  );
}

export default App;
