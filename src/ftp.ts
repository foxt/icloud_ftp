import { FileSystem } from "ftp-srv";
import { iCloudDriveItem } from "icloudjs/build/services/drive";
import { getItemByPath, getNodeByPath, icloudDrive } from "./icloud";
const Path = require("path");

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
        console.log("currentDirectory")
        return this.cwd;
    }
    chdir(path?: string): Promise<string> {
        console.log("chdir", path)
        this.cwd = Path.resolve(this.cwd, path);
        return Promise.resolve(this.cwd);
    }
    async get(path: string) {
        path = Path.resolve(this.cwd, path);
        console.log("stat", path)
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
        path = Path.resolve(this.cwd, path);
        var node = await getNodeByPath(path);
        return node.items.map(itemToStat);
    }
    write(filename, {append = false, start = undefined}) {
        console.log("write", filename, append, start)
        return {
            write: (data) => {
                console.log("write", data)
            }
        }
    }
    async read(path, {start = undefined}) {
        console.log(this.cwd,path)
        path = Path.resolve(this.cwd, path)
        console.log("read", path, start)
        if (start) throw new Error("Partial reads not supported");
        return icloudDrive.downloadFile(await getItemByPath(path));
    }
    async delete (filename) {
        console.log("delete", filename)
    }
    async mkdir(path: string): Promise<any> {
        console.log("mkdir", path)
    }
    async rename (oldPath, newPath) {
        console.log("rename", oldPath, newPath)
    }
    async chmod (path, mode) {
        console.log("chmod", path, mode)
    }
    getUniqueName(fileName: string): string {
        console.log("getUniqueName", fileName)
        return fileName;
    }



}
