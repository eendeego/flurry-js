import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {initFlurries, renderScene} from './flurry';
import {DEF_PRESET} from './flurry/constants';
import {boostrapGlobal, resizeGlobal} from './flurry/global';
import {resize} from './webgl/global';
import {Presets} from './flurry/presets';

function App() {
  const canvasRef = useRef();
  const canvas = canvasRef.current;

  const globalRef = useRef();

  const [preset, setPreset] = useState(DEF_PRESET);
  const [size, setSize] = useState('medium');

  useEffect(() => {
    // Initialization
    const global = boostrapGlobal(canvasRef.current);
    globalRef.current = global;

    initFlurries(global, DEF_PRESET);

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

  useEffect(() => {
    initFlurries(globalRef.current, preset);
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
