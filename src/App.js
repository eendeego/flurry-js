import React, {useCallback, useEffect, useRef, useState} from 'react';
import './App.css';
import {resetFlurries, renderScene} from './flurry';
import {DEF_PRESET} from './flurry/constants';
import {boostrapGlobal, resizeGlobal} from './flurry/global';
import {resizeViewport} from './webgl/global';
import {Presets} from './flurry/presets';
import {useWindowSize} from '@react-hook/window-size';

type KnobEvent = {
  timeStamp: number,
  knob: number,
  dir: number,
};

const KeyCodesToKnobs = {
  KeyQ: {knob: 0, dir: +1},
  KeyA: {knob: 0, dir: -1},
  KeyW: {knob: 1, dir: +1},
  KeyS: {knob: 1, dir: -1},
  KeyE: {knob: 2, dir: +1},
  KeyD: {knob: 2, dir: -1},
  KeyR: {knob: 3, dir: +1},
  KeyF: {knob: 3, dir: -1},
  KeyT: {knob: 4, dir: +1},
  KeyG: {knob: 4, dir: -1},
  KeyY: {knob: 5, dir: +1},
  KeyH: {knob: 5, dir: -1},
};

function App() {
  const [width, height] = useWindowSize();

  const canvasRef = useRef();
  const canvas = canvasRef.current;

  const globalRef = useRef();
  const knobs = useRef([0, 0, 0, 0, 0, 0]);
  const [_knobUIUpdates, setKnobUIUpdates] = useState(0);
  const [visuals, setVisuals] = useState(true);
  const eventQueue = useRef([]);

  const [preset, setPreset] = useState(DEF_PRESET);

  const updateParameters = useCallback((queue: Array<KnobEvent>) => {
    for (const event of queue) {
      knobs.current[event.knob] += event.dir;
    }

    globalRef.current = {
      ...globalRef.current,
      smokeParameters: {
        ...globalRef.current.smokeParameters,
        incohesion: 0.07 + (knobs.current[0] * 0.07) / 10,
        colorIncoherence: 0.15 + (knobs.current[1] * 0.15) / 10,
        streamBias: 7.0 + (7.0 * knobs.current[2]) / 10,
        fieldSpeed: 6 + knobs.current[3] / 20,
      },
      flurries: globalRef.current.flurries.map((f) => ({
        ...f,
        streamExpansion: 100 + (knobs.current[4] * 150000) / 10,
        briteFactor: 1.0 + knobs.current[5] / 20,
      })),
    };

    if (queue.length > 0) {
      setKnobUIUpdates((v) => v + 1);
    }

    queue.length = 0;
  }, []);

  useEffect(() => {
    // Initialization
    const global = boostrapGlobal(canvasRef.current, DEF_PRESET);
    globalRef.current = global;

    // Animation
    let handle;
    const update = () => {
      try {
        updateParameters(eventQueue.current);
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
  }, [updateParameters]);

  useEffect(() => {
    globalRef.current = resizeGlobal(globalRef.current, width, height);
    resizeViewport(globalRef.current.gl, width, height);
  }, [width, height]);

  useEffect(() => {
    globalRef.current = resetFlurries(globalRef.current, preset);
  }, [preset]);

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      const knobEvent = KeyCodesToKnobs[event.code];

      if (knobEvent !== undefined) {
        eventQueue.current.push({...knobEvent, timestamp: event.timeStamp});
        return;
      }

      console.log(event);
      if (event.code === 'Digit0') {
        setVisuals((v) => !v);
      }
    }

    document.addEventListener('keypress', handleKeyPress, false);
    return () =>
      document.removeEventListener('keypress', handleKeyPress, false);
  }, []);

  return (
    <div className="App">
      {visuals && (
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
      )}
      <div className="Flurry">
        <canvas
          className="Flurry-canvas"
          ref={canvasRef}
          width={width}
          height={height}
        />
      </div>
      {visuals && (
        <div className="Knobs">
          <table>
            <tbody>
              {knobs.current.map((k, i) => (
                <td key={i}>{k}</td>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
