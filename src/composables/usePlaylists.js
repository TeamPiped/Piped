import { fetchJson, apiUrl, authApiUrl, getAuthToken, isAuthenticated } from "./useApi.js";

export async function getLocalPlaylist(playlistId) {
    return await new Promise(resolve => {
        var tx = window.db.transaction("playlists", "readonly");
        var store = tx.objectStore("playlists");
        const req = store.openCursor(playlistId);
        let playlist = null;
        req.onsuccess = e => {
            playlist = e.target.result.value;
            playlist.videos = JSON.parse(playlist.videoIds).length;
            resolve(playlist);
        };
    });
}

export function createOrUpdateLocalPlaylist(playlist) {
    var tx = window.db.transaction("playlists", "readwrite");
    var store = tx.objectStore("playlists");
    store.put(playlist);
}

// needs to handle both, streamInfo items and streams items
export function createLocalPlaylistVideo(videoId, videoInfo) {
    if (videoInfo === undefined || videoId === null || videoInfo?.error) return;

    var tx = window.db.transaction("playlist_videos", "readwrite");
    var store = tx.objectStore("playlist_videos");
    const video = {
        videoId: videoId,
        title: videoInfo.title,
        type: "stream",
        shortDescription: videoInfo.shortDescription ?? videoInfo.description,
        url: `/watch?v=${videoId}`,
        thumbnail: videoInfo.thumbnail ?? videoInfo.thumbnailUrl,
        uploaderVerified: videoInfo.uploaderVerified,
        duration: videoInfo.duration,
        uploaderAvatar: videoInfo.uploaderAvatar,
        uploaderUrl: videoInfo.uploaderUrl,
        uploaderName: videoInfo.uploaderName ?? videoInfo.uploader,
    };
    store.put(video);
}

export async function getLocalPlaylistVideo(videoId) {
    return await new Promise(resolve => {
        var tx = window.db.transaction("playlist_videos", "readonly");
        var store = tx.objectStore("playlist_videos");
        const req = store.openCursor(videoId);
        req.onsuccess = e => {
            resolve(e.target.result?.value);
        };
    });
}

export async function getPlaylists() {
    if (!isAuthenticated()) {
        if (!window.db) return [];
        return await new Promise(resolve => {
            let playlists = [];
            var tx = window.db.transaction("playlists", "readonly");
            var store = tx.objectStore("playlists");
            const cursorRequest = store.openCursor();
            cursorRequest.onsuccess = e => {
                const cursor = e.target.result;
                if (cursor) {
                    let playlist = cursor.value;
                    playlist.videos = JSON.parse(playlist.videoIds).length;
                    playlists.push(playlist);
                    cursor.continue();
                } else {
                    resolve(playlists);
                }
            };
        });
    }

    return await fetchJson(authApiUrl() + "/user/playlists", null, {
        headers: {
            Authorization: getAuthToken(),
        },
    });
}

export async function getPlaylist(playlistId) {
    if (playlistId.startsWith("local")) {
        const playlist = await getLocalPlaylist(playlistId);
        const videoIds = JSON.parse(playlist.videoIds);
        const videosFuture = videoIds.map(videoId => getLocalPlaylistVideo(videoId));
        playlist.relatedStreams = (await Promise.all(videosFuture)).filter(video => video !== undefined);
        return playlist;
    }

    return await fetchJson(authApiUrl() + "/playlists/" + playlistId);
}

export async function createPlaylist(name) {
    if (!isAuthenticated()) {
        const uuid = crypto.randomUUID();
        const playlistId = `local-${uuid}`;
        createOrUpdateLocalPlaylist({
            playlistId: playlistId,
            // remapping needed for the playlists page
            id: playlistId,
            name: name,
            description: "",
            thumbnail: import.meta.env.VITE_PIPED_PROXY + "/?host=i.ytimg.com",
            videoIds: "[]", // empty list
        });
        return { playlistId: playlistId };
    }

    return await fetchJson(authApiUrl() + "/user/playlists/create", null, {
        method: "POST",
        body: JSON.stringify({
            name: name,
        }),
        headers: {
            Authorization: getAuthToken(),
            "Content-Type": "application/json",
        },
    });
}

export async function deletePlaylist(playlistId) {
    if (!isAuthenticated()) {
        const playlist = await getLocalPlaylist(playlistId);
        var tx = window.db.transaction("playlists", "readwrite");
        var store = tx.objectStore("playlists");
        store.delete(playlistId);
        // delete videos that don't need to be stored anymore
        const playlists = await getPlaylists();
        const usedVideoIds = playlists
            .filter(playlist => playlist.id != playlistId)
            .map(playlist => JSON.parse(playlist.videoIds))
            .flat();
        const potentialDeletableVideos = JSON.parse(playlist.videoIds);
        var videoTx = window.db.transaction("playlist_videos", "readwrite");
        var videoStore = videoTx.objectStore("playlist_videos");
        for (let videoId of potentialDeletableVideos) {
            if (!usedVideoIds.includes(videoId)) videoStore.delete(videoId);
        }
        return { message: "ok" };
    }

    return await fetchJson(authApiUrl() + "/user/playlists/delete", null, {
        method: "POST",
        body: JSON.stringify({
            playlistId: playlistId,
        }),
        headers: {
            Authorization: getAuthToken(),
            "Content-Type": "application/json",
        },
    });
}

export async function renamePlaylist(playlistId, newName) {
    if (!isAuthenticated()) {
        const playlist = await getLocalPlaylist(playlistId);
        playlist.name = newName;
        createOrUpdateLocalPlaylist(playlist);
        return { message: "ok" };
    }

    return await fetchJson(authApiUrl() + "/user/playlists/rename", null, {
        method: "POST",
        body: JSON.stringify({
            playlistId: playlistId,
            newName: newName,
        }),
        headers: {
            Authorization: getAuthToken(),
            "Content-Type": "application/json",
        },
    });
}

export async function changePlaylistDescription(playlistId, newDescription) {
    if (!isAuthenticated()) {
        const playlist = await getLocalPlaylist(playlistId);
        playlist.description = newDescription;
        createOrUpdateLocalPlaylist(playlist);
        return { message: "ok" };
    }

    return await fetchJson(authApiUrl() + "/user/playlists/description", null, {
        method: "PATCH",
        body: JSON.stringify({
            playlistId: playlistId,
            description: newDescription,
        }),
        headers: {
            Authorization: getAuthToken(),
            "Content-Type": "application/json",
        },
    });
}

export async function addVideosToPlaylist(playlistId, videoIds, videoInfos) {
    if (!isAuthenticated()) {
        const playlist = await getLocalPlaylist(playlistId);
        const currentVideoIds = JSON.parse(playlist.videoIds);
        currentVideoIds.push(...videoIds);
        playlist.videoIds = JSON.stringify(currentVideoIds);
        let streamInfos =
            videoInfos ?? (await Promise.all(videoIds.map(videoId => fetchJson(apiUrl() + "/streams/" + videoId))));
        playlist.thumbnail = streamInfos[0].thumbnail || streamInfos[0].thumbnailUrl;
        createOrUpdateLocalPlaylist(playlist);
        for (let i in videoIds) {
            if (streamInfos[i].error) continue;
            createLocalPlaylistVideo(videoIds[i], streamInfos[i]);
        }
        return { message: "ok" };
    }

    return await fetchJson(authApiUrl() + "/user/playlists/add", null, {
        method: "POST",
        body: JSON.stringify({
            playlistId: playlistId,
            videoIds: videoIds,
        }),
        headers: {
            Authorization: getAuthToken(),
            "Content-Type": "application/json",
        },
    });
}

export async function removeVideoFromPlaylist(playlistId, index) {
    if (!isAuthenticated()) {
        const playlist = await getLocalPlaylist(playlistId);
        const videoIds = JSON.parse(playlist.videoIds);
        videoIds.splice(index, 1);
        playlist.videoIds = JSON.stringify(videoIds);
        if (videoIds.length == 0) playlist.thumbnail = import.meta.env.VITE_PIPED_PROXY + "/?host=i.ytimg.com";
        createOrUpdateLocalPlaylist(playlist);
        return { message: "ok" };
    }

    return await fetchJson(authApiUrl() + "/user/playlists/remove", null, {
        method: "POST",
        body: JSON.stringify({
            playlistId: playlistId,
            index: index,
        }),
        headers: {
            Authorization: getAuthToken(),
            "Content-Type": "application/json",
        },
    });
}
