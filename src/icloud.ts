import iCloud from "icloudjs";
import { iCloudDriveItem, iCloudDriveNode, iCloudDriveService } from "icloudjs/build/services/drive";
const Path = require("path")

const input = require("input");
export let icloudDrive: iCloudDriveService;

const iCloudCache = {
    nodes: new Map<string, iCloudDriveNode>(),
    items: new Map<string, iCloudDriveItem>(),
    pathToId: new Map<string, string>(),
}
global.cache = iCloudCache;

function requestNode(nodeId: string, path?: string) {
    console.log("requestNode", nodeId, path)
    return icloudDrive.getNode(nodeId).then((node) => {
        if (path) cacheNode(node, path);
        return node;
    })
}

function cacheNode(node: iCloudDriveNode, path: string) {
    iCloudCache.nodes.set(node.nodeId, node);
    iCloudCache.pathToId.set(path, node.nodeId);
    for (var child of node.items.filter((a) => a.type !== "APP_LIBRARY")) {
        iCloudCache.pathToId.set(Path.join(path, child.name + (child.extension ? "." + child.extension : "")), child.drivewsid);
        iCloudCache.items.set(child.drivewsid, child);
    }
}

export async function getParentNodeByPath(path) { 
    //console.log("getParentNode", path)
    let parentPath = path.split("/").slice(0, -1).join("/")
    if (!parentPath.startsWith("/")) parentPath = "/" + parentPath;
    const parent = await getNodeByPath(parentPath);
    cacheNode(parent, parentPath);
    return parent;
}

export async function getNodeByPath(path): Promise<iCloudDriveNode> {
    //console.log("getNode", path);
    var id = iCloudCache.pathToId.get(path);
    if (id) {
        if (!iCloudCache.nodes.has(id)) await requestNode(id,path);
        return iCloudCache.nodes.get(id);
    } else {
        await getParentNodeByPath(path);
        var id = iCloudCache.pathToId.get(path);
        if (!id) throw new Error("Path not found");
        var dir = await requestNode(id,path);
        return dir;
    }
}

export async function getItemByPath(path) {
    console.log("getItem", path);
    var id = iCloudCache.pathToId.get(path);
    if (id && iCloudCache.items.has(id)) {
        return iCloudCache.items.get(id);
    } else {
        await getParentNodeByPath(path);
        var id = iCloudCache.pathToId.get(path);
        if (!id) throw new Error("Path not found");
        return iCloudCache.items.get(id);
    }
}


export async function init() {
    //const username = await input.text("Apple ID");
    //const password = username ? await input.password("Password") : null;
    const icloud = new iCloud({
      //  username: username ? username : undefined,
       // password: password ? password : undefined,
        saveCredentials: true,
        trustDevice: true
    });
    await icloud.authenticate();
    console.log(icloud.status);
    if (icloud.status === "MfaRequested") {
        const mfa = await input.text("MFA Code");
        await icloud.provideMfaCode(mfa);
    }
    await icloud.awaitReady;
    console.log(icloud.status);
    console.log("Hello, " + icloud.accountInfo.dsInfo.fullName);
    
    icloudDrive = icloud.getService("drivews");

    await requestNode("FOLDER::com.apple.CloudDocs::root","/");
}

   
