import React, {useEffect, useRef} from 'react';
import './App.css';
import {initFlurry, renderScene} from './flurry';
import {newGlobal} from './flurry/global';
// import {DEF_PRESET} from "./flurry";
import {newRenderingContext} from './flurry/rendering-context';
// import {PresetNum} from "./flurry/preset-num";
// import {tutorialMain} from "./webgl-tutorial";

function App() {
  const width = 640;
  const height = 480;
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    const renderingContext = newRenderingContext(canvas);
    const global = newGlobal(renderingContext);

    // initFlurry(global, DEF_PRESET);
    initFlurry(global, 'psychedelic');
    // initFlurry(global, "water");
    // initFlurry(global, "fire");
    let handle;
    const update = () => {
      try {
        renderScene(global);
      } finally {
      }

      // TODO
      // if (global.frameCounter < 1200) {
      // handle = setTimeout(update, 40);
      handle = requestAnimationFrame(update);
      // }
    };

    update();
    // return () => clearTimeout(handle);
    return () => cancelAnimationFrame(handle);
  }, []);

  // const tutorialCanvasRef = useRef();
  // useEffect(() => {
  //   tutorialMain(tutorialCanvasRef.current);
  // }, []);

  return (
    <>
      <div className="App">
        <canvas
          style={{backgroundColor: 'black'}}
          ref={canvasRef}
          width={width}
          height={height}
        />
      </div>
      {/*
      <div className="App">
        <canvas ref={tutorialCanvasRef} width="640" height="480" />
      </div>
      */}
    </>
  );
}

export default App;
