export async function getChannelGroups() {
    return new Promise(resolve => {
        let channelGroups = [];
        var tx = window.db.transaction("channel_groups", "readonly");
        var store = tx.objectStore("channel_groups");
        const cursor = store.index("groupName").openCursor();
        cursor.onsuccess = e => {
            const cursor = e.target.result;
            if (cursor) {
                const group = cursor.value;
                channelGroups.push({
                    groupName: group.groupName,
                    channels: JSON.parse(group.channels),
                });
                cursor.continue();
            } else {
                resolve(channelGroups);
            }
        };
    });
}

export function createOrUpdateChannelGroup(group) {
    var tx = window.db.transaction("channel_groups", "readwrite");
    var store = tx.objectStore("channel_groups");
    store.put({
        groupName: group.groupName,
        channels: JSON.stringify(group.channels),
    });
}

export function deleteChannelGroup(groupName) {
    var tx = window.db.transaction("channel_groups", "readwrite");
    var store = tx.objectStore("channel_groups");
    store.delete(groupName);
}
