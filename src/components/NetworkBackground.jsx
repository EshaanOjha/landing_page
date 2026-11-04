import { useEffect, useRef } from 'react';
import { mountNetwork } from '../background/network.js';
import '../styles/network.css';

export default function NetworkBackground({ children }) {
  const canvas = useRef(null);
  useEffect(() => mountNetwork(canvas.current), []);
  return <div className="network-shell">
    <canvas ref={canvas} className="network-background" aria-hidden="true" />
    {children}
  </div>;
}
