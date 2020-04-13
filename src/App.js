import React, {useEffect, useRef} from 'react';
import './App.css';
import {initFlurry, drawFlurry} from './flurry';
import {newGlobal} from './flurry/global';
// import {DEF_PRESET} from "./flurry";
import {newRenderingContext} from './flurry/rendering-context';
// import {PresetNum} from "./flurry/preset-num";

function App() {
  const width = 640;
  const height = 480;
  const canvasRef = useRef();
  useEffect(() => {
    console.log('App effect!');

    const canvas = canvasRef.current;
    const renderingContext = newRenderingContext(canvas);
    const global = newGlobal(renderingContext);

    // TODO
    window.global = global;

    // initFlurry(global, DEF_PRESET);
    // initFlurry(global, "water");
    initFlurry(global, 'fire');
    let handle;
    const update = () => {
      if (global.flurry?.s?.programInfo == null) {
        debugger;
      }

      try {
        drawFlurry(global);
      } finally {
      }

      // TODO
      if (global.frameCounter < 2) {
        handle = requestAnimationFrame(update);
      }
    };

    update();
    return () => cancelAnimationFrame(handle);
  }, []);

  console.log('App');

  return (
    <div className="App">
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
}

export default App;
