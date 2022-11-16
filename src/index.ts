import { FtpSrv } from "ftp-srv";
import { FtpFS } from "./ftp";
import { init } from "./icloud";

console.log("Logging into iCloud")
init().then(() => {
    console.log("Starting FTP server...");
    const server = new FtpSrv({
        url: "ftp://127.0.0.1:9102",
        anonymous: true,
    })
    server.on("login", (data, resolve) => {
        console.log("login", data)
        resolve({fs : new FtpFS(data.connection) })
    })
    server.listen()
})