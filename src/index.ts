import { FtpSrv } from "ftp-srv";
import { FtpFS } from "./ftp";
import { init } from "./icloud";

if (process.argv.includes("--help")) {
    console.log("Usage: icftp [options]");
    console.log("Options:");
    console.log("  --help\t\tShow this help message");
    console.log("Environment variables:");
    console.log("  ICFTP_USERNAME\tApple ID to use for authentication (if not specified, will be prompted, use 'saved' to use saved credentials)");
    console.log("  ICFTP_PASSWORD\tPassword to use for authentication (if not specified, will be prompted, use 'saved' to use saved credentials)");
    console.log(" ICFTP_SAVE_CREDENTIALS\tSet to false to not try to save credentials to OS secret store (default: true)");
    console.log("  ICFTP_TRUST_DEVICE\tSet to false to not store Trust Token (stored in ~/.icloud) (default: true)");
    console.log("  ICFTP_HOST\t\tHost to listen on (default: ftp://127.0.0.1:9102. Be careful to not expose this, as there is no authentication)");
    console.log("  ICFTP_ALLOW_DELETE\tSet to true to allow deleting files (default: false)");
    console.log("  ICFTP_DEBUG\t\tSet to true to enable debug logging (default: false)");
    process.exit(0);
}
function logC(severity, prefix) {
    return (...args) => {
        if (severity == "debug" && process.env["ICFTP_DEBUG"] !== "true") return;
        console[severity](prefix, ...args)
    }
}
let logShim = {
    trace: logC("debug", "[ftpsrv]"),
    debug: logC("debug", "[ftpsrv]"),
    info: logC("log", "[ftpsrv]"),
    warn: logC("warn", "[ftpsrv]"),
    error: logC("error", "[ftpsrv]"),
    fatal: logC("error", "[ftpsrv]"),
    child: () => logShim,
}


console.log("[  init]", "Logging into iCloud")
init().then(() => {
    let url = process.env["ICFTP_HOST"] || "ftp://127.0.0.1:9102";
    console.log("[  init]", "Starting FTP server on", url);
    const server = new FtpSrv({
        greeting: ["☁️ iCloud FTP Server","by https://github.com/foxt"," Licensed under a MIT license - and provided as is, with no warranty."],
        log: logShim,
        url,
        anonymous: true,
    })
    server.on("login", (data, resolve) => {
        console.log("[  init]", "Client connected");
        resolve({fs : new FtpFS(data.connection) })
    })
    server.listen()
})