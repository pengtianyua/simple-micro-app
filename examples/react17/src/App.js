import logo from './logo.svg';
import './App.css';
import Page1 from "./pages/page1";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      微应用React
      <p className="text">微应用内容</p>
      <Page1 />
    </div>
  );
}

export default App;
