import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { invoke } from "@tauri-apps/api/core";
import { loadCachedNetworks, computeStartupNetworks } from "./cache";

function Root() {
  const [wifiOn, setWifiOn] = useState(true);
  const [initialNetworks, setInitialNetworks] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [activeSsid, cachedNetworks] = await Promise.all([
        invoke("active_wifi_connection").catch(() => null),
        Promise.resolve().then(loadCachedNetworks),
      ]);

      if (cancelled) return;
      setInitialNetworks(computeStartupNetworks({ cachedNetworks, activeSsid }));
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <React.StrictMode>
      <App wifiOn={wifiOn} setWifiOn={setWifiOn} initialNetworks={initialNetworks} />
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
