import "./styles/App.css";
import DecorationBar from "./DecorationBar";
import { ListView } from "./ListView";

function App({ wifiOn, setWifiOn, initialNetworks = [] }) {
  return (
    <main className="container">
      <DecorationBar wifiOn={wifiOn} setWifiOn={setWifiOn} />
      <ListView wifiOn={wifiOn} initialNetworks={initialNetworks} />
    </main>
  );
}

export default App;
