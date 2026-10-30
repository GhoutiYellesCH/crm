use std::fs;
use std::io::Read;
use std::path::PathBuf;
use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

fn get_aegisflow_dir() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".into());
    let dir = PathBuf::from(home).join(".config").join("aegisflow");
    let _ = fs::create_dir_all(&dir);
    let _ = fs::create_dir_all(dir.join("backups"));
    dir
}

#[tauri::command]
fn get_db_info() -> Result<serde_json::Value, String> {
    let dir = get_aegisflow_dir();
    let db_path = dir.join("crm.db");
    let exists = db_path.exists();
    let size_bytes = if exists {
        fs::metadata(&db_path).map(|m| m.len()).unwrap_or(0)
    } else {
        0
    };

    Ok(serde_json::json!({
        "configDir": dir.to_str().unwrap_or(""),
        "dbPath": db_path.to_str().unwrap_or(""),
        "exists": exists,
        "sizeBytes": size_bytes,
        "backupDir": dir.join("backups").to_str().unwrap_or(""),
    }))
}

#[tauri::command]
fn open_data_dir() -> Result<(), String> {
    let dir = get_aegisflow_dir();
    std::process::Command::new("xdg-open")
        .arg(&dir)
        .spawn()
        .map_err(|e| format!("Failed to open directory: {}", e))?;
    Ok(())
}

#[tauri::command]
fn create_backup(custom_dest_dir: Option<String>) -> Result<String, String> {
    let dir = get_aegisflow_dir();
    let db_path = dir.join("crm.db");
    if !db_path.exists() {
        return Err("Database file does not exist yet".into());
    }

    let timestamp = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let filename = format!("aegisflow-backup-{}.db", timestamp);

    let target_dir = match custom_dest_dir {
        Some(d) if !d.trim().is_empty() => PathBuf::from(d.trim()),
        _ => dir.join("backups"),
    };

    let _ = fs::create_dir_all(&target_dir);
    let dest_file = target_dir.join(&filename);

    fs::copy(&db_path, &dest_file)
        .map_err(|e| format!("Failed to copy database: {}", e))?;

    Ok(dest_file.to_str().unwrap_or("").to_string())
}

#[tauri::command]
fn restore_backup(backup_file_path: String) -> Result<String, String> {
    let src = PathBuf::from(&backup_file_path);
    if !src.exists() {
        return Err(format!("Backup file does not exist: {}", backup_file_path));
    }

    // Validate SQLite magic header: first 16 bytes must equal "SQLite format 3\0"
    let mut file = fs::File::open(&src).map_err(|e| e.to_string())?;
    let mut header = [0u8; 16];
    file.read_exact(&mut header)
        .map_err(|e| format!("Cannot read backup file: {}", e))?;
    if &header != b"SQLite format 3\0" {
        return Err("Invalid backup file: not a valid SQLite database header".into());
    }

    let dir = get_aegisflow_dir();
    let db_path = dir.join("crm.db");

    // Preserve safety backup before restoring
    if db_path.exists() {
        let safety_file = dir.join("backups").join("pre-restore-safety.db");
        let _ = fs::copy(&db_path, safety_file);
    }

    fs::copy(&src, &db_path).map_err(|e| format!("Failed to restore database: {}", e))?;

    Ok(format!("Database restored successfully from {}", backup_file_path))
}

#[tauri::command]
fn detect_usb_drives() -> Result<Vec<serde_json::Value>, String> {
    let mut drives = Vec::new();
    let username = std::env::var("USER").unwrap_or_else(|_| "gotoro".into());

    let candidates = [
        format!("/media/{}", username),
        format!("/run/media/{}", username),
        "/mnt".into(),
    ];

    for base in &candidates {
        let p = PathBuf::from(base);
        if let Ok(entries) = fs::read_dir(p) {
            for entry in entries.flatten() {
                if let Ok(ft) = entry.file_type() {
                    if ft.is_dir() {
                        let path = entry.path();
                        let name = entry.file_name().to_string_lossy().to_string();
                        if !name.starts_with('.') {
                            drives.push(serde_json::json!({
                                "name": name,
                                "path": path.to_str().unwrap_or(""),
                            }));
                        }
                    }
                }
            }
        }
    }

    Ok(drives)
}

pub fn run() {
    let aegisflow_dir = get_aegisflow_dir();
    let db_path = aegisflow_dir.join("crm.db");

    // Migrate from previous locations if new directory is empty
    if !db_path.exists() {
        let home = std::env::var("HOME").unwrap_or_else(|_| ".".into());
        let old1 = PathBuf::from(&home).join(".config").join("com.aegisflow.crm").join("crm.db");
        let old2 = PathBuf::from(&home).join(".config").join("com.personal.crm").join("crm.db");
        if old1.exists() {
            let _ = fs::copy(&old1, &db_path);
        } else if old2.exists() {
            let _ = fs::copy(&old2, &db_path);
        }
    }

    let db_url = format!("sqlite:{}", db_path.to_str().expect("valid path"));

    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_schema",
            sql: include_str!("../migrations/001_initial.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_recurring_revenue",
            sql: include_str!("../migrations/002_recurring_revenue.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(
            SqlBuilder::default()
                .add_migrations(&db_url, migrations)
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_db_info,
            open_data_dir,
            create_backup,
            restore_backup,
            detect_usb_drives
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
