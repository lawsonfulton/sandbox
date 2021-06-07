import React, { useEffect, useRef } from "react";
import { Button, Card, Slider } from "antd";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";

import { ChargeViewer } from "./ChargeViewer";
import { ChargeSystem } from "./ChargeSystem";

import Two from "twojs-ts";
import Stats from "stats.js";

import { glMatrix, vec2 } from "gl-matrix";
glMatrix.setMatrixArrayType(Array); // Faster than TypedArray

export const SimulationApp = () => {
  // Must use refs to manage simulation state independently from React
  let stageRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  let twoRef = useRef(new Two({fullscreen: true, autostart: true }));

  // Simulation uses particles of unit radius by default
  // The scale constant determines how big the particles appear on screen
  // Or, the ration between screen space and world space
  const scale = 14;

  // Set the bounds of the simulation to be the bounds of the screen scaled
  // down to world space
  const simWidth = twoRef.current.width / scale;
  const simHeight = twoRef.current.height / scale;

  const showDebug = false;
  let systemRef = useRef(new ChargeSystem(100, simWidth, simHeight));
  let viewerRef = useRef(
    new ChargeViewer(systemRef.current, twoRef.current, scale, showDebug)
  );
    
  // One time call to setup function
  // which sets up callbacks and attaches the two.js stage
  // to the dom.
  useEffect(setup, []);
  function setup() {
    let two = twoRef.current;
    two.appendTo(stageRef.current);
    two.bind(Two.Events.update, update);
    two.bind(Two.Events.resize, resize);

    return function () {
      // Unmount handler
      two.unbind(Two.Events.update, update);
      two.unbind(Two.Events.resize, resize);
    }; 
  }
  
  // Called when window is resized
  function resize() {
    const simWidth = twoRef.current.width / scale;
    const simHeight = twoRef.current.height / scale;
    systemRef.current.updateBounds(simWidth, simHeight);
  }

  // Called whenever animation frame is requested
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

  function setCharge(charge:number) {
    systemRef.current.setCharge(charge);
  }

  return (
    <div>
      <Card title="Parameters" className="control-panel">
        <Button type="primary" onClick={click}>
          Test
        </Button>
        <div className="charge-slider">
          <MinusCircleOutlined />
          <Slider defaultValue={-1.0} min={-2.0} max={2.0} step={0.01} onChange={setCharge}/>
          <PlusCircleOutlined />
        </div>
      </Card>
      <div>
        <div className="stage" ref={stageRef} />
      </div>
    </div>
  );
};
