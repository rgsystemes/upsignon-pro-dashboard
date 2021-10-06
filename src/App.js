import "./App.css";
import { Menu } from "./nav/Menu";

function App() {
  return (
    <div className="App">
      <Menu currentPage="overview" />
      <div>OK</div>
    </div>
  );
}

export default App;
