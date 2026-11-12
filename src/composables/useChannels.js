function normalizeId(channelId) {
    return channelId.replace("/channel/", "");
}

export function isChannelBlocked(channelUrl) {
    return new Promise(resolve => {
        var tx = window.db.transaction("blocked_channels", "readonly");
        var store = tx.objectStore("blocked_channels");
        store.count(normalizeId(channelUrl)).onsuccess = e => {
            const result = e.target.result;
            resolve(result > 0);
        };
    });
}

export function addBlockedChannel(channelId, name) {
    var tx = window.db.transaction("blocked_channels", "readwrite");
    var store = tx.objectStore("blocked_channels");
    store.add({ channelId, name });
}

export function removeBlockedChannel(channelId) {
    var tx = window.db.transaction("blocked_channels", "readwrite");
    var store = tx.objectStore("blocked_channels");
    store.delete(channelId);
}

export function getBlockedChannels() {
    return new Promise(resolve => {
        let blockedChannels = [];
        var tx = window.db.transaction("blocked_channels", "readonly");
        var store = tx.objectStore("blocked_channels");
        const cursor = store.index("channelId").openCursor();
        cursor.onsuccess = e => {
            const cursor = e.target.result;
            if (cursor) {
                blockedChannels.push(cursor.value);
                cursor.continue();
            } else {
                resolve(blockedChannels);
            }
        };
    });
}

export async function toggleChannelBlock(channelUrl, name) {
    const channelId = normalizeId(channelUrl);
    return new Promise(resolve => {
        var tx = window.db.transaction("blocked_channels", "readwrite");
        var store = tx.objectStore("blocked_channels");
        store.count(channelId).onsuccess = e => {
            const result = e.target.result;
            if (result > 0) {
                store.delete(channelId);
            } else {
                store.add({ channelId, name });
            }
            resolve(result === 0);
        };
    });
}
