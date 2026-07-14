#![allow(unused)]
mod wifi;

use tauri::command;
use wifi::*;

#[command]
async fn scan_networks(rescan: Option<bool>) -> Result<String, String> {
    let rescan = rescan.unwrap_or(true);
    tauri::async_runtime::spawn_blocking(move || scan_wifi_networks(rescan))
        .await
        .map_err(|e| e.to_string())?
}

#[command]
async fn scan_saved_networks() -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(scan_known_networks)
        .await
        .map_err(|e| e.to_string())?
}

#[command]
async fn active_wifi_connection() -> Option<String> {
    tauri::async_runtime::spawn_blocking(get_active_wifi_connection)
        .await
        .ok()
        .flatten()
}

#[command]
async fn wifi_on() {
    let _ = tauri::async_runtime::spawn_blocking(turn_wifi_on).await;
}

#[command]
async fn wifi_off() {
    let _ = tauri::async_runtime::spawn_blocking(turn_wifi_off).await;
}

#[command]
async fn connect_known(ssid: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || connect_to_known_wifi(&ssid))
        .await
        .map_err(|e| e.to_string())?
}

#[command]
async fn connect_new(ssid: String, password: Option<String>) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || connect_to_new_wifi(&ssid, password.as_deref()))
        .await
        .map_err(|e| e.to_string())?
}

#[command]
async fn disconnect_wifi(ssid: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || wifi::disconnect_wifi(&ssid))
        .await
        .map_err(|e| e.to_string())?
}

#[command]
async fn forget_wifi(ssid: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || wifi::forget_wifi(&ssid))
        .await
        .map_err(|e| e.to_string())?
}

#[command]
async fn get_password(ssid: String) -> Option<String> {
    tauri::async_runtime::spawn_blocking(move || get_wifi_password(&ssid))
        .await
        .ok()
        .flatten()
}

#[command]
async fn update_password(ssid: String, password: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || modify_wifi_password(&ssid, &password))
        .await
        .map_err(|e| e.to_string())?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            scan_networks,
            scan_saved_networks,
            active_wifi_connection,
            wifi_on,
            wifi_off,
            connect_known,
            connect_new,
            disconnect_wifi,
            forget_wifi,
            get_password,
            update_password
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
