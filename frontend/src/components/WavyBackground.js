import React, { useEffect, useRef } from 'react';
import chroma from 'chroma-js';

const settings = {
  amplitudeX: 100,
  amplitudeY: 20,
  lines: 20,
  hueStartColor: 253,
  saturationStartColor: 74,
  lightnessStartColor: 67,
  hueEndColor: 216,
  saturationEndColor: 100,
  lightnessEndColor: 7,
  smoothness: 3,
  offsetX: 10,
  fill: true,
  crazyness: false
};

function createWaves(svg, winW, winH) {
  svg.innerHTML = '';
  let overflow = Math.abs(settings.lines * settings.offsetX);
  let startColor = `hsl(${settings.hueStartColor}, ${settings.saturationStartColor}%, ${settings.lightnessStartColor}%)`;
  let endColor = `hsl(${settings.hueEndColor}, ${settings.saturationEndColor}%, ${settings.lightnessEndColor}%)`;
  let Colors = chroma.scale([startColor, endColor]).mode('lch').colors(settings.lines + 2);

  for (let i = 0; i < settings.lines + 1; i++) {
    let rootY = parseInt(winH / settings.lines * i);
    let offsetX = settings.offsetX * i;
    let root = [];
    let x = -overflow + offsetX;
    let y = 0;
    let upSideDown = 0;
    root.push({ x: x, y: rootY });

    while (x < winW) {
      let value = Math.random() > 0.5 ? 1 : -1;
      if (settings.crazyness) {
        x += parseInt((Math.random() * settings.amplitudeX / 2) + (settings.amplitudeX / 2));
        y = (parseInt((Math.random() * settings.amplitudeY / 2) + (settings.amplitudeY / 2)) * value) + rootY;
      } else {
        upSideDown = !upSideDown;
        value = (upSideDown === 0) ? 1 : -1;
        x += settings.amplitudeX;
        y = settings.amplitudeY * value + rootY;
      }
      root.push({ x: x, y: y });
    }
    root.push({ x: winW + overflow, y: rootY });

    // Create path
    const fill = Colors[i + 1];
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', fill);
    path.setAttribute('stroke', fill);

    // Path d
    let d = `M -${overflow} ${winH + overflow}`;
    d += ` L ${root[0].x} ${root[0].y}`;
    for (let j = 1; j < root.length - 1; j++) {
      let prevPoint = root[j - 1];
      let actualPoint = root[j];
      let diffX = (actualPoint.x - prevPoint.x) / settings.smoothness;
      let x1 = prevPoint.x + diffX;
      let x2 = actualPoint.x - diffX;
      let x = actualPoint.x;
      let y1 = prevPoint.y;
      let y2 = actualPoint.y;
      let y = actualPoint.y;
      d += ` C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`;
    }
    const reverseRoot = root.slice().reverse();
    d += ` L ${reverseRoot[0].x} ${reverseRoot[0].y}`;
    d += ` L ${winW + overflow} ${winH + overflow}`;
    d += ` Z`;
    path.setAttribute('d', d);

    svg.appendChild(path);
  }
}

const WavyBackground = () => {
  const svgRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const svg = svgRef.current;
      svg.setAttribute('width', winW);
      svg.setAttribute('height', winH);
      createWaves(svg, winW, winH);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
      }}
    />
  );
};

export default WavyBackground; 