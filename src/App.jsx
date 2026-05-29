import "./styles/App.css";
import DecorationBar from "./DecorationBar";
import { ListView } from "./ListView";

function App({ wifiOn, setWifiOn }) {
  return (
    <main className="container">
      <DecorationBar wifiOn={wifiOn} setWifiOn={setWifiOn} />
      <ListView wifiOn={wifiOn} />
    </main>
  );
}

export default App;
