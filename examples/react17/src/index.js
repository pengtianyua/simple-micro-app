import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

window.globalStr = 'child'

window.addEventListener('scroll', () => {
  console.log('scroll')
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

window.microApp?.addDataListener((data) => {
  console.log('接收数据', data)
})

setTimeout(() => {
  window.microApp?.dispatch({name: '来自子应用的数据'})
}, 3000)
