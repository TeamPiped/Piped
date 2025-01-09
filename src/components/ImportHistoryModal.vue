<template>
    <ModalComponent>
        <div class="text-center">
            <h2 v-t="'actions.import_history'" class="mb-4 text-center text-xl font-bold" />
            <form>
                <br />
                <div>
                    <input ref="fileSelector" class="btn mb-2 ml-2" type="file" @change="fileChange" />
                </div>
                <div>
                    <strong
                        ><i18n-t keypath="info.found_n_items">{{ itemsLength }}</i18n-t></strong
                    >
                </div>
                <div>
                    <strong class="flex items-center justify-center gap-2">
                        <span v-t="'actions.override'" />: <input v-model="override" class="checkbox" type="checkbox" />
                    </strong>
                </div>
                <br />
                <div>
                    <progress :value="index" :max="itemsLength" />
                    <div
                        v-text="
                            `${$t('info.success')}: ${success} ${$t('info.error')}: ${error} ${$t('info.skipped')}: ${skipped}`
                        "
                    />
                </div>
                <br />
                <div>
                    <a class="btn w-auto" @click="handleImport" v-text="$t('actions.import')" />
                </div>
            </form>
        </div>
    </ModalComponent>
</template>
<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: { ModalComponent },
    data() {
        return {
            items: [],
            override: false,
            index: 0,
            success: 0,
            error: 0,
            skipped: 0,
        };
    },
    computed: {
        itemsLength() {
            return this.items.length;
        },
    },
    methods: {
        fileChange() {
            const file = this.$refs.fileSelector.files[0];
            file.text().then(text => {
                this.items = [];
                const json = JSON.parse(text);
                const items = json.watchHistory.map(video => {
                    return {
                        ...video,
                        watchedAt: video.watchedAt ?? 0,
                        currentTime: video.currentTime ?? 0,
                    };
                });
                this.items = items.sort((a, b) => b.watchedAt - a.watchedAt);
            });
        },
        handleImport() {
            if (window.db) {
                var tx = window.db.transaction("watch_history", "readwrite");
                var store = tx.objectStore("watch_history");
                this.items.forEach(item => {
                    const dbItem = store.get(item.videoId);
                    dbItem.onsuccess = () => {
                        if (dbItem.result && dbItem.result.videoId === item.videoId) {
                            if (!this.override) {
                                this.index++;
                                this.skipped++;
                                return;
                            }
                        }
                        try {
                            const request = store.put(JSON.parse(JSON.stringify(item))); // prevent "Symbol could not be cloned." error
                            request.onsuccess = () => {
                                this.index++;
                                this.success++;
                            };
                            request.onerror = () => {
                                this.index++;
                                this.error++;
                            };
                        } catch (error) {
                            console.error(error);
                            this.index++;
                            this.error++;
                        }
                    };
                });
            }
        },
    },
};
</script>
