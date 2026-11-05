import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { startTranslation } from './lib/app-language'

startTranslation(Capacitor.isNativePlatform());

console.log("main.tsx: React imported:", React);
console.log("main.tsx: App imported:", App);

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
