import "./styles/ListView.css"
import ArrowDown from "./assets/down-arrow.png"
import PasswordDialog from "./PasswordDialog"
import { useEffect, useMemo, useState } from "react"
import { invoke } from "@tauri-apps/api/core"

const SCAN_TIMEOUT_MS = 15000;

const scanWithTimeout = () =>
    Promise.race([
        invoke("scan_networks"),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Scan timed out. Please try again.")), SCAN_TIMEOUT_MS);
        }),
    ]);

const parseSignalValue = (signal) => {
    const match = String(signal || "").match(/\d+(?:\.\d+)?/)
    return match ? Number(match[0]) : 0
}

// connectToWifi is implemented inside the component so it can access hooks/state

const getWifiStrengthLevel = (signal) => {
    const strength = parseSignalValue(signal)

    if (strength > 80) return 4
    if (strength > 55) return 3
    if (strength > 30) return 2
    return 1
}

const WifiStrengthIcon = ({ level }) => {
    const activeBars = Math.max(1, Math.min(4, level))
    const color = ["#d34d4d", "#f0a22e", "#6fba53", "#117aee"][activeBars - 1]

    return (
        <svg className="wifi-strength-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="17" width="3" height="4" rx="1" fill={activeBars >= 1 ? color : "#c8c8c8"} />
            <rect x="8" y="13" width="3" height="8" rx="1" fill={activeBars >= 2 ? color : "#c8c8c8"} />
            <rect x="13" y="9" width="3" height="12" rx="1" fill={activeBars >= 3 ? color : "#c8c8c8"} />
            <rect x="18" y="5" width="3" height="16" rx="1" fill={activeBars >= 4 ? color : "#c8c8c8"} />
        </svg>
    )
}


const parseScanOutput = (output) => {
    const parseFields = (line) => {
        const fields = [];
        let current = "";

        for (let index = 0; index < line.length; index += 1) {
            const char = line[index];

            if (char === "\\" && index + 1 < line.length) {
                current += line[index + 1];
                index += 1;
                continue;
            }

            if (char === ":") {
                fields.push(current);
                current = "";
                continue;
            }

            current += char;
        }

        fields.push(current);
        return fields;
    };

    return output.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
        const [inUse = "", bssid = "", ssid = "Unknown", rate = "", signal = "", security = "Open"] = parseFields(line);

        return {
            active: inUse.startsWith("*"),
            bssid,
            ssid,
            rate,
            rateLevel: getWifiStrengthLevel(signal),
            signal,
            security: security || "Open",
        };
    });
};

export function ListView({ wifiOn }) {
    const [networks, setNetworks] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [expandedBssid, setExpandedBssid] = useState("");
    const [focusedBssid, setFocusedBssid] = useState("");
    const [connectingBssid, setConnectingBssid] = useState("");
    const [disconnectingBssid, setDisconnectingBssid] = useState("");
    const [forgettingBssid, setForgettingBssid] = useState("");
    const [passwordDialog, setPasswordDialog] = useState({ open: false, ssid: "", bssid: "", error: false });

    const refreshNetworks = async () => {
        setRefreshing(true);
        setError("");
        try {
            const output = await scanWithTimeout();
            const parsed = parseScanOutput(String(output));
            setNetworks([...parsed].sort((left, right) => Number(right.active) - Number(left.active)));
        } catch (err) {
            setError(err?.message || String(err));
            setNetworks([]);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!wifiOn) {
            setNetworks([]);
            setError("");
            return;
        }

        refreshNetworks();
    }, [wifiOn]);

    const networkCount = useMemo(() => networks.length, [networks]);

    const toggleNetworkDetails = (bssid) => {
        setExpandedBssid((currentBssid) => (currentBssid === bssid ? "" : bssid));
    };

    const closePasswordDialog = () => {
        setPasswordDialog({ open: false, ssid: "", bssid: "", error: false });
    };

    const openPasswordDialog = (net) => {
        setPasswordDialog({ open: true, ssid: net.ssid, bssid: net.bssid, error: false });
    };

    const connectToWifi = async (bssid, ssid, net) => {
        try {
            setConnectingBssid(bssid);
            await invoke("connect_known", { ssid });
            await refreshNetworks();
        } catch (err) {
            openPasswordDialog(net);
        } finally {
            setConnectingBssid("");
        }
    };

    return (
        <div className="main-container">
            <div className="TextRow">
                <span>Available Networks{networkCount ? ` (${networkCount})` : ""}:</span>
                <button className="Refresh" onClick={refreshNetworks} disabled={refreshing || !wifiOn}>
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {!wifiOn && <div className="error-text">WiFi is off.</div>}

            <div className="ListView">
                {refreshing && (
                    <div className="ListRow">
                        <div className="upper-row">
                            <span>Scanning for networks…</span>
                        </div>
                    </div>
                )}

                {!refreshing && networks.map((net) => (
                    <div className="ListRow" key={`${net.bssid}-${net.ssid}`}>
                        <div className={`upper-row ${expandedBssid === net.bssid ? "expanded" : ""}`} onClick={async ()=>{
                                if (!net.active) {
                                    setFocusedBssid(net.bssid);
                                } else {
                                    setFocusedBssid("");
                                    toggleNetworkDetails(net.bssid);
                                }
                        }}>
                            <div className="row-left">
                                <div className={"icon-wrap " + (net.active ? "active" : "") }>
                                    <WifiStrengthIcon level={net.rateLevel} />
                                </div>
                                <div className="ssid-wrap">
                                    <div className="ssid">{net.ssid || "Unknown network"}</div>
                                    {(net.active || focusedBssid === net.bssid) && <div className="meta-inline">{net.rate} · {net.security}</div>}
                                </div>
                            </div>
                            {(net.active || focusedBssid === net.bssid) && (
                            <div className="row-right">
                                {net.active ? (
                                    <button
                                        type="button"
                                        className="small-disconnect"
                                        disabled={disconnectingBssid === net.bssid}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                setDisconnectingBssid(net.bssid);
                                                await invoke("disconnect_wifi", { ssid: net.ssid });
                                                await refreshNetworks();
                                            } catch (e) {
                                                setError(e?.message || String(e));
                                            } finally {
                                                setDisconnectingBssid("");
                                            }
                                        }}
                                        aria-label={`Disconnect ${net.ssid || "network"}`}
                                    >
                                        {disconnectingBssid === net.bssid ? "Disconnecting" : "Disconnect"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="small-connect"
                                        disabled={connectingBssid === net.bssid}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await connectToWifi(net.bssid, net.ssid, net);
                                        }}
                                        aria-label={`Connect to ${net.ssid || "network"}`}
                                    >
                                        {connectingBssid === net.bssid ? "Connecting" : "Connect"}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="details-button"
                                    onClick={(e) => { e.stopPropagation(); toggleNetworkDetails(net.bssid); }}
                                    aria-expanded={expandedBssid === net.bssid}
                                    aria-label={`Show details for ${net.ssid || "network"}`}
                                >
                                    <img
                                        src={ArrowDown}
                                        height={24}
                                        alt="details"
                                        className={expandedBssid === net.bssid ? "details-arrow open" : "details-arrow"}
                                    />
                                </button>
                            </div>
                            )}
                        </div>
                        {expandedBssid === net.bssid && (
                            <div className="lower-row">
                                <div className="details-grid">
                                    <div className="details-col">
                                        <div className="label">MAC ADDRESS</div>
                                        <div className="value mono">{net.bssid}</div>

                                        <div className="label">SIGNAL</div>
                                        <div className="value">{net.signal ? `${net.signal} / 100` : ""}</div>
                                    </div>
                                    <div className="details-col">
                                        <div className="label">SPEED</div>
                                        <div className="value">{net.rate}</div>

                                        <div className="label">SECURITY</div>
                                        <div className="value">{net.security}</div>
                                    </div>
                                </div>
                                <div className="details-actions">
                                    {net.active && (
                                        <button
                                            className="btn forget"
                                            disabled={forgettingBssid === net.bssid}
                                            onClick={async () => {
                                                try {
                                                    setForgettingBssid(net.bssid);
                                                    await invoke("forget_wifi", { ssid: net.ssid });
                                                    await refreshNetworks();
                                                } catch (e) {
                                                    setError(e?.message || String(e));
                                                } finally {
                                                    setForgettingBssid("");
                                                }
                                            }}
                                        >
                                            {forgettingBssid === net.bssid ? "Forgetting..." : "Forget"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <PasswordDialog
                    open={passwordDialog.open}
                    ssid={passwordDialog.ssid}
                    error={passwordDialog.error}
                    submitting={connectingBssid === passwordDialog.bssid}
                    onCancel={closePasswordDialog}
                    onSubmit={async (password) => {
                        try {
                            setConnectingBssid(passwordDialog.bssid);
                            await invoke("connect_new", { ssid: passwordDialog.ssid, password });
                            closePasswordDialog();
                            await refreshNetworks();
                        } catch (err) {
                            setPasswordDialog((current) => ({ ...current, error: true }));
                        } finally {
                            setConnectingBssid("");
                        }
                    }}
                />

                {!refreshing && networks.length === 0 && !error && (
                    <div className="ListRow">
                        <div className="upper-row">
                            <span>No networks found.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}