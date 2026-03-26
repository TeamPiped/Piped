<template>
    <ModalComponent>
        <div class="min-w-max flex flex-col">
            <h2 v-t="'actions.export_history'" class="mb-4 text-center text-xl font-bold" />
            <form>
                <div>
                    <label v-t="'actions.file_format'" class="mr-2" for="export-format" />
                    <select id="export-format" v-model="exportAs" class="select">
                        <option
                            v-for="option in exportOptions"
                            :key="option"
                            :value="option"
                            v-text="formatField(option)"
                        />
                    </select>
                </div>
                <div v-if="exportAs === 'history'">
                    <label v-for="field in fields" :key="field" class="flex items-center gap-2">
                        <input
                            v-model="selectedFields"
                            class="checkbox"
                            type="checkbox"
                            :value="field"
                            :disabled="field === 'videoId'"
                        />
                        <span v-text="formatField(field)" />
                    </label>
                </div>
            </form>
            <button class="btn mt-4" @click="handleExport" v-text="$t('actions.export')" />
        </div>
    </ModalComponent>
</template>

<script setup>
import { ref } from "vue";
import ModalComponent from "./ModalComponent.vue";
import { download } from "@/composables/useMisc.js";

const exportOptions = ["playlist", "history"];
const exportAs = ref("playlist");
const fields = ["videoId", "title", "uploaderName", "uploaderUrl", "duration", "thumbnail", "watchedAt", "currentTime"];
const selectedFields = ref([
    "videoId",
    "title",
    "uploaderName",
    "uploaderUrl",
    "duration",
    "thumbnail",
    "watchedAt",
    "currentTime",
]);

let exportVideos = [];

async function fetchAllVideos() {
    if (window.db) {
        var tx = window.db.transaction("watch_history", "readonly");
        var store = tx.objectStore("watch_history");
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            (request.onsuccess = e => {
                const videos = e.target.result;
                exportVideos = videos;
                resolve();
            }),
                (request.onerror = e => {
                    reject(e);
                });
        });
    }
}

function handleExport() {
    if (exportAs.value === "playlist") {
        fetchAllVideos()
            .then(() => {
                exportAsPlaylist();
            })
            .catch(e => {
                console.error(e);
            });
    } else if (exportAs.value === "history") {
        fetchAllVideos()
            .then(() => {
                exportAsHistory();
            })
            .catch(e => {
                console.error(e);
            });
    }
}

function exportAsPlaylist() {
    const dateStr = new Date().toISOString().split(".")[0];
    let json = {
        format: "Piped",
        version: 1,
        playlists: [
            {
                name: `Piped History ${dateStr}`,
                type: "history",
                visibility: "private",
                videos: exportVideos.map(video => "https://youtube.com" + video.url),
            },
        ],
    };
    download(JSON.stringify(json), `piped_history_${dateStr}.json`, "application/json");
}

function exportAsHistory() {
    const dateStr = new Date().toISOString().split(".")[0];
    let json = {
        format: "Piped",
        version: 1,
        watchHistory: exportVideos.map(video => {
            let obj = {};
            selectedFields.value.forEach(field => {
                obj[field] = video[field];
            });
            return obj;
        }),
    };
    download(JSON.stringify(json), `piped_history_${dateStr}.json`, "application/json");
}

function formatField(field) {
    // camelCase to Title Case
    return field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
}
</script>
