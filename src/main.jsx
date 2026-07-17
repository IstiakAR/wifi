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
      if (!localStorage.getItem("wifi:bootServiceInstalled")) {
        try {
          await invoke("setup_boot_scan");
          localStorage.setItem("wifi:bootServiceInstalled", "1");
        } catch {
          // systemd not available – non-critical
        }
      }
    })();

    (async () => {
      const [activeSsid, cachedNetworks, actuallyOn] = await Promise.all([
        invoke("active_wifi_connection").catch(() => null),
        Promise.resolve().then(loadCachedNetworks),
        invoke("wifi_is_on").catch(() => true),
      ]);

      if (cancelled) return;
      setWifiOn(actuallyOn);
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
