import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {resetFlurries, renderScene} from './flurry';
import {DEF_PRESET} from './flurry/constants';
import {boostrapGlobal, resizeGlobal} from './flurry/global';
import {resizeViewport} from './webgl/global';
import {Presets} from './flurry/presets';
import {useWindowSize} from '@react-hook/window-size';

function App() {
  const [width, height] = useWindowSize();

  const canvasRef = useRef();
  const canvas = canvasRef.current;

  const globalRef = useRef();

  const [preset, setPreset] = useState(DEF_PRESET);

  useEffect(() => {
    // Initialization
    const global = boostrapGlobal(canvasRef.current, DEF_PRESET);
    globalRef.current = global;

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
    globalRef.current = resizeGlobal(globalRef.current, width, height);
    resizeViewport(globalRef.current.gl, width, height);
  }, [width, height]);

  useEffect(() => {
    globalRef.current = resetFlurries(globalRef.current, preset);
  }, [preset]);

  return (
    <div className="App">
      <div className="Controls">
        <label>
          Preset{' '}
          <select
            value={preset}
            onChange={(e) => setPreset(parseInt(e.target.value, 10))}
          >
            <option value={Presets.WATER}>Water</option>
            <option value={Presets.FIRE}>Fire</option>
            <option value={Presets.PSYCHEDELIC}>Psychedelic</option>
            <option value={Presets.RGB}>RGB</option>
            <option value={Presets.BINARY}>Binary</option>
            <option value={Presets.CLASSIC}>Classic</option>
            <option value={Presets.INSANE}>Insane</option>
          </select>
        </label>
      </div>
      <div className="Flurry">
        <canvas
          className="Flurry-canvas"
          ref={canvasRef}
          width={width}
          height={height}
        />
      </div>
    </div>
  );
}

export default App;
