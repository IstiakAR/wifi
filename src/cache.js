export const NETWORK_CACHE_KEY = "wifi:lastNetworks";

export const loadCachedNetworks = () => {
  try {
    const cached = localStorage.getItem(NETWORK_CACHE_KEY);
    if (!cached) return [];
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCachedNetworks = (networks) => {
  try {
    localStorage.setItem(NETWORK_CACHE_KEY, JSON.stringify(networks));
  } catch {
    // Ignore storage failures and keep the in-memory list.
  }
};

export const computeStartupNetworks = ({ cachedNetworks, activeSsid }) => {
  const activeValue = String(activeSsid || "").trim();
  if (activeValue) {
    return [
      {
        active: true,
        bssid: `active:${activeValue}`,
        ssid: activeValue,
        rate: "",
        rateLevel: 4,
        signal: "",
        security: "",
      },
    ];
  }

  return (Array.isArray(cachedNetworks) ? cachedNetworks : []).map((net) => ({
    ...net,
    active: false,
  }));
};
