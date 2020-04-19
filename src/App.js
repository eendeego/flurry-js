import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {initFlurry, renderScene} from './flurry';
import {createGlobal, resizeGlobal} from './flurry/global';
// import {DEF_PRESET} from "./flurry";
import {initWebGL, resize} from './webgl/global';
// import {PresetNum} from "./flurry/preset-num";
// import {tutorialMain} from "./webgl-tutorial";

function App() {
  const canvasRef = useRef();
  const canvas = canvasRef.current;

  const globalRef = useRef();

  const [size, setSize] = useState('medium');

  useEffect(() => {
    // Initialization
    const canvas = canvasRef.current;
    const gl = initWebGL(canvas);

    const global = createGlobal(gl);
    globalRef.current = global;

    // initFlurry(global, DEF_PRESET);
    initFlurry(global, 'psychedelic');
    // initFlurry(global, "water");
    // initFlurry(global, "fire");

    // Animation
    let handle;
    const update = () => {
      try {
        renderScene(globalRef.current);
      } finally {
      }

      // TODO
      // if (globalRef.current.frameCounter < 1200) {
      // handle = setTimeout(update, 40);
      handle = requestAnimationFrame(update);
      // }
    };

    update();
    // return () => clearTimeout(handle);
    return () => cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    globalRef.current = resizeGlobal(globalRef.current);
    resize(globalRef.current.gl);
  }, [size]);

  return (
    <div className="App">
      <div className="Controls">
        <button
          className="Controls-size"
          onClick={() => {
            setSize(size === 'medium' ? 'small' : 'medium');
          }}
        >
          Toggle size [{size}]
        </button>
      </div>
      <div className="Flurry">
        <canvas
          className="Flurry-canvas"
          ref={canvasRef}
          width={size === 'medium' ? 640 : 320}
          height={size === 'medium' ? 480 : 240}
        />
      </div>
    </div>
  );
}

export default App;
