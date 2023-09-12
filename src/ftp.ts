import { FileSystem } from "ftp-srv";
import { iCloudDriveItem } from "icloudjs/build/services/drive";
import { getItemByPath, getNodeByPath, icloudDrive } from "./icloud";
const Path = require("path").posix;

function itemToStat(item: iCloudDriveItem) {
    return {
        name: item.name + (item.extension ? "." + item.extension : ""),
        isDirectory: () => item.type !== "FILE",
        size: item.size,
        mtime: item.dateChanged || item.dateCreated || item.dateCreated || 0,
        ctime:  item.dateChanged || item.dateCreated || 0,
        mode: item.type === "FILE" ? 0o100644 : 0o40644,
    }
}

export class FtpFS extends FileSystem {
    cwd = "/";
    currentDirectory(): string {
        console.log("[ftp-fs]","cwd     ");
        return this.cwd;
    }
    chdir(path?: string): Promise<string> {
        console.log("[ftp-fs]","chdir   ", path);
        this.cwd = Path.resolve(this.cwd, path);
        return Promise.resolve(this.cwd);
    }
    async get(path: string) {
        path = Path.resolve(this.cwd, path);
        console.log("[ftp-fs]","stat    ", path);
        
        if (path === "/") {
            return {
                name: "/",
                isDirectory: () => true,
                size: 0,
                mtime: 0,
                ctime: 0,
                mode: 0o40644,
            }
        }
        return itemToStat(await getItemByPath(path));
    }
    async list(path: string) {
        console.log("[ftp-fs]","list    ", path);
        path = Path.resolve(this.cwd, path);
        var node = await getNodeByPath(path);
        return node.items.map(itemToStat);
    }
    write(filename, {append = false, start = undefined}) {
        console.log("[ftp-fs]","write   ", filename, {append,start});
        console.log(filename,append,start);
        throw new Error("Writing files not supported");
    }
    async read(path, {start = undefined}) {
        console.log("[ftp-fs]","read    ", path, start);
        path = Path.resolve(this.cwd, path)
        if (start) throw new Error("Partial reads not supported");
        return icloudDrive.downloadFile(await getItemByPath(path));
    }
    async delete (path) {
        console.log("[ftp-fs]","delete  ", path);
        if (process.env["ICFTP_ALLOW_DELETE"] !== "true") throw new Error("Deleting files not enabled");
        path = Path.resolve(this.cwd, path);
        var item = await getItemByPath(path);
        await icloudDrive.del(item);
    }
    async mkdir(path: string): Promise<any> {
        console.log("[ftp-fs]","mkdir   ", path);
        path = Path.resolve(this.cwd, path);
        var item = await getItemByPath(Path.dirname(path));
        await icloudDrive.mkdir(item, Path.basename(path));
    }
    async rename (oldPath, newPath) {
        console.log("[ftp-fs]","rename  ", oldPath, newPath);
        throw new Error("Moving files not supported");
    }
    async chmod (path, mode) {
        console.log("[ftp-fs]","chmod   ", path,mode);
        throw new Error("Changing permissions not supported");
    }
    getUniqueName(fileName: string): string {
        console.log("[ftp-fs]","getUnqNm", fileName);
        return fileName;
    }



}
