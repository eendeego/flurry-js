import React, {useEffect, useRef} from 'react';
import './App.css';
import {initFlurry, renderScene} from './flurry';
import {createGlobal} from './flurry/global';
// import {DEF_PRESET} from "./flurry";
import {initWebGL} from './webgl/init';
// import {PresetNum} from "./flurry/preset-num";
// import {tutorialMain} from "./webgl-tutorial";

function App() {
  const canvasRef = useRef();
  const canvas = canvasRef.current;

  useEffect(() => {
    // Initialization
    const canvas = canvasRef.current;
    const gl = initWebGL(canvas);

    const global = createGlobal(gl);

    // initFlurry(global, DEF_PRESET);
    initFlurry(global, 'psychedelic');
    // initFlurry(global, "water");
    // initFlurry(global, "fire");

    // Animation
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

  return (
    <div className="App">
      <canvas
        style={{backgroundColor: 'black'}}
        ref={canvasRef}
        width={640}
        height={480}
      />
    </div>
  );
}

export default App;
