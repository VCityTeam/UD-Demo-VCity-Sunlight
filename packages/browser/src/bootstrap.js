/** @file It's the main file of your application. This code will be interprate by your browser. It's here we can create your base of your DOM*/

// eslint-disable-next-line no-unused-vars
import { MyApplication } from './MyApplication';
import { landingPage } from './landingPage';
import { itowns } from '@ud-viz/browser';
import '../style.css';

// CREATE DOM ELEMENT
const domBody = document.body;
domBody.appendChild(landingPage);

if (DEBUG) {
  console.info('Your app is in DEBUG mode');
  const scriptReload = document.createElement('script');
  scriptReload.src = '/reload/reload.js';
  domBody.appendChild(scriptReload);
}

// START YOUR APPLICATION (UNCOMMENT THESES LINES)
landingPage.remove();
const app = new MyApplication();
app.start();
