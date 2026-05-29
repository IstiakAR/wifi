import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

function Root() {
  const [wifiOn, setWifiOn] = useState(true);

  return (
    <React.StrictMode>
      <App wifiOn={wifiOn} setWifiOn={setWifiOn} />
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Root />,
);
