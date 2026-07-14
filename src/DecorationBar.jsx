import "./styles/DecorationBar.css";
import wifiOnImg from "./assets/wifi-on.png";
import wifiOffImg from "./assets/wifi-off.png";
import toggleOnImg from "./assets/toggle-on.png";
import toggleOffImg from "./assets/toggle-off.png";
import XImg from "./assets/x.png";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

export default function DecorationBar({ wifiOn, setWifiOn }) {
  const toggleWiFi = async () => {
    try {
      if (wifiOn) {
        await invoke("wifi_off");
      } else {
        await invoke("wifi_on");
      }
      setWifiOn(!wifiOn);
    } catch (err) {
      console.error("Failed to toggle WiFi", err);
    }
  };

  const closeWindow = async () => {
    const win = getCurrentWindow();
    try {
      await win.close();
    } catch (err) {
      console.error("Failed to close window", err);
    }
  };

  return (
    <div
      className="decoration-container" data-tauri-drag-region
    >
      <div className="left-side" data-tauri-drag-region>
        <img className="wifiimg no-drag" src={wifiOn ? wifiOnImg : wifiOffImg} onClick={toggleWiFi} />
        <img className="toggleimg no-drag" src={wifiOn ? toggleOnImg : toggleOffImg} onClick={toggleWiFi} />
      </div>

      <div className="middle-side" data-tauri-drag-region>WiFi</div>

      <div className="right-side" data-tauri-drag-region>
        <button className="icon-x no-drag" onClick={closeWindow}>
          <img src={XImg}/>
        </button>
      </div>
    </div>
  );
}
