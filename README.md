# WiFi Manager

A desktop WiFi manager for Linux using `nmcli`.

## Downloads

Pre-built executables are available in [Releases](https://github.com/your-username/your-repo/releases). Download the latest release for your architecture and run it directly.

## Building from Source

```bash
npm install
npm run tauri:build
```

The executable will be in `src-tauri/target/release/`.

### Prerequisites

- Node.js 18+
- Rust toolchain
- Tauri system dependencies (webkit2gtk, etc.) — see [Tauri docs](https://v2.tauri.app/start/prerequisites/)

## Development

```bash
npm install
npm run tauri:dev
```

## Tech Stack

- **Frontend:** React 19 + Vite
- **Backend:** Rust + Tauri 2
- **Networking:** nmcli (NetworkManager CLI)
