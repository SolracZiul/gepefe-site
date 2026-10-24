import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerNativeAuthListener } from './lib/native'

registerNativeAuthListener();

console.log("main.tsx: React imported:", React);
console.log("main.tsx: App imported:", App);

createRoot(document.getElementById("root")!).render(<App />);
