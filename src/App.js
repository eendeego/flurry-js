import React, {useEffect, useRef} from 'react';
import './App.css';
import {initFlurry, drawFlurry} from './flurry';
import {newGlobal} from './flurry/global';
import {DEF_PRESET} from './flurry';
import {newRenderingContext} from './flurry/rendering-context';

function App() {
  const width = 600;
  const height = 600;
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    const renderingContext = newRenderingContext(canvas);
    const global = newGlobal(renderingContext);

    initFlurry(global, DEF_PRESET);
    let handle;
    const update = () => {
      try {
        drawFlurry(global);
      } finally {
      }
      handle = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div className="App">
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
}

export default App;
