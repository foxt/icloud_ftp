import iCloud from "icloudjs";
import { iCloudDriveItem, iCloudDriveNode, iCloudDriveService } from "icloudjs/build/services/drive";
import Path from "path/posix";


const input = require("input");
export let icloudDrive: iCloudDriveService;


const iCloudCache = {
    nodes: new Map<string, iCloudDriveNode>(),
    items: new Map<string, iCloudDriveItem>(),
    pathToId: new Map<string, string>(),
}
global.cache = iCloudCache;

function requestNode(nodeId: string, path?: string) {
    console.log("[icloud]", "Requesting node listing ", nodeId, "(" + path + ") from iCloud")

    return icloudDrive.getNode(nodeId).then((node) => {
        console.log("[icloud]", "Node ", nodeId, "(" + path + ") has", node.items.length, "items");
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
    let parent;
    try {
        parent = await getNodeByPath(parentPath,false);
    } catch (e) {
        parent = await getNodeByPath(parentPath,true);
    }
    cacheNode(parent, parentPath);
    return parent;
}

export async function getNodeByPath(path, refresh: boolean = true): Promise<iCloudDriveNode> {
    //console.log("getNode", path);
    var id = iCloudCache.pathToId.get(path);
    if (id) {
        if (refresh || !iCloudCache.nodes.has(id)) await requestNode(id,path);
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
    //console.log("getItem", path);
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
    console.log("[icauth]", "Welcome! Please enter your Apple ID and password to login to iCloud. (you can also press ENTER if you have saved credentials)");
    let username = process.env["ICFTP_USERNAME"] || await input.text("Apple ID");
    let password = username ? process.env["ICFTP_USERNAME"] || await input.password("Password") : null;
    if (username == "saved") username = null;
    if (password == "saved") password = null;

    const icloud = new iCloud({
       username: username ? username : undefined,
       password: password ? password : undefined,
       saveCredentials: process.env["ICFTP_SAVE_CREDENTIALS"] !== "false",
       trustDevice: process.env["ICFTP_TRUST_DEVICE"] !== "false",
    });
    await icloud.authenticate();
    console.log("[icauth]", "First authentication stage - ", icloud.status);
    if (icloud.status === "MfaRequested") {
        const mfa = await input.text("MFA Code");
        await icloud.provideMfaCode(mfa);
        console.log("[icauth]", "MFA completed, waiting on cloud ready");
    }
    await icloud.awaitReady;
    console.log("[icauth]", "Cloud is ready (" + icloud.status + "), logged in as " + icloud.accountInfo.dsInfo.fullName);
    
    icloudDrive = icloud.getService("drivews");
    console.log("[icauth]", "Initialised iCloud Drive service");

    await requestNode("FOLDER::com.apple.CloudDocs::root","/");
}

   
