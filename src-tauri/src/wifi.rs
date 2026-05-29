#![allow(unused)]
use std::process::Command;
use std::str;

pub fn scan_wifi_networks() -> Result<String, String> {
    let output = Command::new("nmcli")
        .args(["-t", "-f", "IN-USE,BSSID,SSID,RATE,SIGNAL,SECURITY", "device", "wifi", "list"])
        .output()
        .map_err(|e| e.to_string())?;


    if output.status.success() {
        let stdout = str::from_utf8(&output.stdout).map_err(|e| e.to_string())?;
        Ok(stdout.to_string())
    } else {
        let stderr = str::from_utf8(&output.stderr).map_err(|e| e.to_string())?;
        Err(stderr.to_string())
    }
}

pub fn scan_known_networks() -> Result<String, String> {
    let output = Command::new("nmcli")
        .args(["connection", "show"])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = str::from_utf8(&output.stdout).map_err(|e| e.to_string())?;
        Ok(stdout.to_string())
    } else {
        let stderr = str::from_utf8(&output.stderr).map_err(|e| e.to_string())?;
        Err(stderr.to_string())
    }
}

pub fn get_active_wifi_connection() -> Option<String> {
    let output = Command::new("nmcli")
        .args(["-t", "-f", "NAME,TYPE", "connection", "show", "--active"])
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let stdout = str::from_utf8(&output.stdout).ok()?;

    for line in stdout.lines() {
        let mut parts = line.splitn(2, ':');
        let name = parts.next()?.trim();
        let connection_type = parts.next()?.trim();

        if connection_type == "wifi" {
            return Some(name.to_string());
        }
    }

    None
}

pub fn get_wifi_password(ssid: &str) -> Option<String> {
    let output = Command::new("nmcli")
        .args(["--show-secrets", "connection", "show", ssid])
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let stdout = str::from_utf8(&output.stdout).ok()?;

    for line in stdout.lines() {
        if line.trim_start().starts_with("802-11-wireless-security.psk:") {
            if let Some(pw) = line.splitn(2, ':').nth(1) {
                return Some(pw.trim().to_string());
            }
        }
    }

    None
}

pub fn turn_wifi_on() -> () {
    let _ = Command::new("nmcli")
        .args(["radio", "wifi", "on"])
        .output();
}

pub fn turn_wifi_off() -> () {
    let _ = Command::new("nmcli")
        .args(["radio", "wifi", "off"])
        .output();
}

pub fn connect_to_known_wifi(ssid: &str) -> Result<String, String> {
    let output = Command::new("nmcli")
        .args(["connection", "up", ssid])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = str::from_utf8(&output.stdout).map_err(|e| e.to_string())?;
        Ok(stdout.to_string())
    } else {
        let stderr = str::from_utf8(&output.stderr).unwrap_or("Unknown error");
        Err(stderr.to_string())
    }
}

pub fn connect_to_new_wifi(ssid: &str, password: Option<&str>) -> Result<String, String> { 
    let mut cmd = Command::new("nmcli");
    cmd.args(["device", "wifi", "connect", ssid]);

    if let Some(pw) = password {
        cmd.args(["password", pw]);
    }
    let output = cmd.output().map_err(|e| e.to_string())?;

    if output.status.success() { 
        let stdout = str::from_utf8(&output.stdout).map_err(|e| e.to_string())?; 
        Ok(stdout.to_string()) 
    } else { 
        let stderr = str::from_utf8(&output.stderr).unwrap_or("Unknown error"); 
        Err(stderr.to_string()) 
    } 
}

pub fn disconnect_wifi(ssid: &str) -> Result<String, String> {
    let output = Command::new("nmcli")
        .args(["connection", "down", ssid])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = str::from_utf8(&output.stdout).map_err(|e| e.to_string())?;
        Ok(stdout.to_string())
    } else {
        let stderr = str::from_utf8(&output.stderr).unwrap_or("Unknown error");
        Err(stderr.to_string())
    }
}

pub fn forget_wifi(ssid: &str) -> Result<String, String> {
    let _ = Command::new("nmcli")
        .args(["connection", "down", ssid])
        .output();

    let output = Command::new("nmcli")
        .args(["connection", "delete", ssid])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = str::from_utf8(&output.stdout).map_err(|e| e.to_string())?;
        Ok(stdout.to_string())
    } else {
        let stderr = str::from_utf8(&output.stderr).unwrap_or("Unknown error");
        Err(stderr.to_string())
    }
}

pub fn modify_wifi_password(ssid: &str, password: &str) -> Result<String, String> {
    let output = Command::new("nmcli")
        .args(["connection", "modify", ssid, "802-11-wireless-security.psk", password])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let stdout = str::from_utf8(&output.stdout).map_err(|e| e.to_string())?;
        Ok(stdout.to_string())
    } else {
        let stderr = str::from_utf8(&output.stderr).unwrap_or("Unknown error");
        Err(stderr.to_string())
    }
}