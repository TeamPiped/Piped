<template>
    <ErrorHandler v-if="playlist && playlist.error" :message="playlist.message" :error="playlist.error" />

    <LoadingIndicatorPage v-show="!playlist?.error" :show-content="playlist">
        <h1 class="mb-1 ml-1 mt-4 text-3xl!" v-text="playlist.name" />

        <CollapsableText v-if="playlist?.description" :text="playlist.description" />

        <div class="mt-1 flex justify-between <md:flex-col md:items-center">
            <div>
                <router-link class="link flex items-center gap-3" :to="playlist.uploaderUrl || '/'">
                    <img loading="lazy" :src="playlist.uploaderAvatar" class="h-12 rounded-full" />
                    <strong v-text="playlist.uploader" />
                </router-link>
            </div>
            <div class="flex flex-wrap items-center gap-1">
                <strong
                    v-text="
                        `${playlist.videos} ${$t('video.videos')} - ${timeFormat(totalDuration)}${playlist.nextpage ? '+' : ''}`
                    "
                />
                <button v-t="'playlist_stats.stats'" class="btn mx-1" @click="showStats = true"></button>
                <ModalComponent v-if="stats !== null && showStats" @close="showStats = false">
                    <h2 v-t="'playlist_stats.playlist_stats'"></h2>
                    <h3 v-t="'playlist_stats.general'"></h3>
                    <ul>
                        <li>
                            <strong>{{ $t("video.videos") }}:</strong>
                            <span
                                v-if="stats.watchedStatus.watched > 0 && stats.watchedStatus.watched < playlist.videos"
                                class="ml-1"
                                >{{ stats.watchedStatus.watched }} / {{ playlist.videos }}</span
                            >
                            <span v-else>{{ playlist.videos }}</span>
                        </li>
                        <li>
                            <strong>{{ $t("playlist_stats.total_duration") }}:</strong>
                            <span
                                v-if="stats.watchedStatus.duration > 0 && stats.watchedStatus.duration < totalDuration"
                                class="ml-1"
                                >{{ timeFormat(stats.watchedStatus.duration) }} / {{ timeFormat(totalDuration) }}</span
                            >
                            <span v-else>{{ timeFormat(totalDuration) }}</span>
                            <span v-if="playlist.nextpage">+</span>
                        </li>
                        <li>
                            <strong>{{ $t("playlist_stats.types") }}:</strong>
                            <span class="ml-2 inline-flex">
                                <span
                                    v-for="(count, type) of stats.types"
                                    :key="type"
                                    :class="`rounded bg-gray px-1 py-0.5 text-sm text-dark tag-video-type-${type}`"
                                >
                                    <strong>
                                        <i v-if="type === 'livestream'" class="i-fa6-solid:tower-broadcast w-3"></i>
                                        {{ type }}:
                                    </strong>
                                    {{ count }}
                                </span>
                            </span>
                        </li>
                        <li v-if="stats.categories.length">
                            <strong>{{ $t("playlist_stats.categories") }}:</strong>
                            <span class="ml-2 inline-flex">
                                <span
                                    v-for="(count, category) of stats.categories"
                                    :key="category"
                                    class="rounded bg-gray px-1 py-0.5 text-sm text-dark"
                                >
                                    <strong>{{ category }}:</strong> {{ count }}
                                </span>
                            </span>
                        </li>
                        <li v-if="stats.tags.size">
                            <strong>{{ $t("playlist_stats.tags") }}:</strong>
                            <span class="ml-2 inline-flex">
                                <span
                                    v-for="tag of stats.tags"
                                    :key="tag"
                                    class="rounded bg-gray px-1 py-0.5 text-sm text-dark"
                                >
                                    {{ tag }}
                                </span>
                            </span>
                        </li>
                        <li>
                            <strong>{{ $t("titles.channel_groups") }}:</strong>
                            <span class="ml-2 inline-flex">
                                <span
                                    v-for="(count, group) of stats.byChannelGroups"
                                    :key="group"
                                    class="rounded bg-gray px-1 py-0.5 text-sm text-dark"
                                >
                                    <strong>{{ group }}:</strong> {{ count }}
                                </span>
                            </span>
                        </li>
                    </ul>

                    <h3 v-t="'playlist_stats.by_channel_subscription_status'" class="mt-3"></h3>
                    <details
                        v-for="(channels, subscriptionStatus) of stats.byChannelSubscriptionStatus"
                        :key="subscriptionStatus"
                        class="flex items-center gap-1"
                        name="channels-by-subscription"
                        :open="subscriptionStatus === 'unsubscribed'"
                    >
                        <summary class="cursor-pointer">
                            {{ $t(`playlist_stats.${subscriptionStatus}`) }} ({{ Object.keys(channels).length }})
                        </summary>
                        <ul>
                            <li v-for="channel of channels" :key="channel.name" class="flex items-center gap-1">
                                <router-link :to="channel.url">
                                    <img
                                        v-if="channel.avatar"
                                        loading="lazy"
                                        :src="channel.avatar"
                                        class="mr-0.5 mt-0.5 h-32px w-32px rounded-full"
                                        width="68"
                                        height="68"
                                    />
                                </router-link>
                                <strong>
                                    <router-link
                                        v-if="channel.url && channel.name"
                                        class="link-secondary block overflow-hidden text-sm"
                                        :to="channel.url"
                                        :title="channel.name"
                                    >
                                        <span v-text="`${channel.name}:`" />
                                        <i v-if="channel.erified" class="i-fa6-solid:check ml-1.5" />
                                    </router-link>
                                </strong>
                                {{ channel.count }}
                            </li>
                        </ul>
                    </details>
                </ModalComponent>
                <button v-if="!isPipedPlaylist" class="btn mx-1" @click="bookmarkPlaylist">
                    {{ $t(`actions.${isBookmarked ? "playlist_bookmarked" : "bookmark_playlist"}`)
                    }}<i class="i-fa6-solid:bookmark ml-3" />
                </button>
                <button v-if="authenticated && !isPipedPlaylist" class="btn mr-1" @click="clonePlaylist">
                    {{ $t("actions.clone_playlist") }}<i class="i-fa6-solid:clone ml-3" />
                </button>
                <button class="btn mr-1" @click="downloadPlaylistAsTxt">
                    {{ $t("actions.download_as_txt") }}
                </button>
                <a class="btn mr-1" :href="getRssUrl">
                    <i class="i-fa6-solid:rss" />
                </a>
                <WatchOnButton :link="`https://www.youtube.com/playlist?list=${$route.query.list}`" />
            </div>
        </div>

        <hr />

        <div class="video-grid">
            <VideoItem
                v-for="(video, index) in playlist.relatedStreams"
                :key="video.url"
                :item="video"
                :index="index"
                :playlist-id="$route.query.list"
                :admin="admin"
                height="94"
                width="168"
                @remove="removeVideo(index)"
            />
        </div>
    </LoadingIndicatorPage>
</template>

<script>
import ErrorHandler from "./ErrorHandler.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import CollapsableText from "./CollapsableText.vue";
import VideoItem from "./VideoItem.vue";
import WatchOnButton from "./WatchOnButton.vue";
import ModalComponent from "./ModalComponent.vue";

export default {
    components: {
        ErrorHandler,
        VideoItem,
        WatchOnButton,
        LoadingIndicatorPage,
        CollapsableText,
        ModalComponent,
    },
    data() {
        return {
            playlist: null,
            totalDuration: 0,
            admin: false,
            isBookmarked: false,
            showStats: false,
            stats: null,
            subscriptions: null,
            channelGroups: null,
        };
    },
    computed: {
        getRssUrl: _this => {
            return _this.authApiUrl() + "/rss/playlists/" + _this.$route.query.list;
        },
        isPipedPlaylist: _this => {
            // regex to determine whether it's a Piped plalylist
            return /[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}/.test(
                _this.$route.query.list,
            );
        },
    },
    mounted() {
        const playlistId = this.$route.query.list;
        if (this.authenticated && playlistId?.length == 36)
            this.getPlaylists().then(json => {
                if (json.error) alert(json.error);
                else if (json.some(playlist => playlist.id === playlistId)) this.admin = true;
            });
        else if (playlistId.startsWith("local")) this.admin = true;
        this.isPlaylistBookmarked();
    },
    activated() {
        this.getPlaylistData();
        window.addEventListener("scroll", this.handleScroll);
        if (this.playlist) this.updateTitle();
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async getPlaylistData() {
            this.getPlaylist(this.$route.query.list)
                .then(data => (this.playlist = data))
                .then(async () => {
                    this.updateTitle();
                    this.updateTotalDuration();
                    await this.updateWatched(this.playlist.relatedStreams);
                    this.fetchDeArrowContent(this.playlist.relatedStreams);
                    this.subscriptions = await this.fetchSubscriptions();
                    this.channelGroups = await this.getChannelGroups();
                    this.updateStats();
                });
        },
        async updateTitle() {
            document.title = this.playlist.name + " - Piped";
        },
        handleScroll() {
            if (this.loading || !this.playlist || !this.playlist.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(this.authApiUrl() + "/nextpage/playlists/" + this.$route.query.list, {
                    nextpage: this.playlist.nextpage,
                }).then(json => {
                    this.playlist.nextpage = json.nextpage;
                    this.loading = false;
                    this.playlist.relatedStreams.push(...json.relatedStreams);
                    this.updateTotalDuration();
                    this.fetchDeArrowContent(json.relatedStreams);
                });
            }
        },
        removeVideo(index) {
            this.playlist.relatedStreams.splice(index, 1);
        },
        updateTotalDuration() {
            this.totalDuration = this.playlist.relatedStreams.map(video => video.duration).reduce((a, b) => a + b);
        },
        updateStats() {
            this.stats = {
                types: this.playlist.relatedStreams.reduce((groups, stream) => {
                    let type = stream.type;

                    if (stream.isShort) {
                        type = "short";
                    } else if (stream.duration == 0) {
                        type = "livestream";
                    }

                    if (!(type in groups)) {
                        groups[type] = 0;
                    }

                    groups[type]++;

                    return groups;
                }, {}),
                categories: this.playlist.relatedStreams.reduce((groups, stream) => {
                    if (typeof stream.category === "undefined") {
                        return groups;
                    }

                    if (!(stream.category in groups)) {
                        groups[stream.category] = 0;
                    }

                    groups[stream.category]++;

                    return groups;
                }, {}),
                tags: this.playlist.relatedStreams.reduce((tags, stream) => {
                    if (typeof stream.tags === "undefined") {
                        return tags;
                    }

                    for (const tag of stream.tags) {
                        tags.set(tag);
                    }

                    return tags;
                }, new Set()),
                watchedStatus: this.playlist.relatedStreams.reduce(
                    (groups, stream) => {
                        if ("watched" in stream && stream.watched === true) {
                            groups.watched++; // what about partially watched?
                            groups.duration += stream.currentTime;
                        }

                        return groups;
                    },
                    { watched: 0, duration: 0 },
                ),
                byChannelSubscriptionStatus: this.playlist.relatedStreams.reduce(
                    (groups, stream) => {
                        const hasSubscribed = this.subscriptions.some(
                            subscription => subscription.name === stream.uploaderName,
                        );
                        const subscriptionStatus = hasSubscribed ? "subscribed" : "unsubscribed";
                        if (!(stream.uploaderName in groups[subscriptionStatus])) {
                            groups[subscriptionStatus][stream.uploaderName] = {
                                name: stream.uploaderName,
                                avatar: stream.uploaderAvatar,
                                url: stream.uploaderUrl,
                                verified: stream.uploaderVerified,
                                count: 0,
                            };
                        }

                        groups[subscriptionStatus][stream.uploaderName].count++;

                        return groups;
                    },
                    { subscribed: {}, unsubscribed: {} },
                ),
                byChannelGroups: this.playlist.relatedStreams.reduce((groups, stream) => {
                    const channelGroups = this.channelGroups.filter(group =>
                        group.channels.includes(stream.uploaderUrl.split("/").filter(Boolean)[1]),
                    );
                    for (const group of channelGroups) {
                        if (!(group.groupName in groups)) {
                            groups[group.groupName] = 0;
                        }

                        groups[group.groupName]++;
                    }

                    return groups;
                }, {}),
            };
        },
        async clonePlaylist() {
            this.fetchJson(this.authApiUrl() + "/import/playlist", null, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthToken(),
                },
                body: JSON.stringify({
                    playlistId: this.$route.query.list,
                }),
            }).then(resp => {
                if (!resp.error) {
                    alert(this.$t("actions.clone_playlist_success"));
                } else alert(resp.error);
            });
        },
        downloadPlaylistAsTxt() {
            const data = this.playlist.relatedStreams
                .map(video => {
                    return "https://piped.video" + video.url;
                })
                .join("\n");
            this.download(data, this.playlist.name + ".txt", "text/plain");
        },
        async bookmarkPlaylist() {
            if (!this.playlist) return;

            if (this.isBookmarked) {
                this.removePlaylistBookmark();
                return;
            }

            if (window.db) {
                const playlistId = this.$route.query.list;
                var tx = window.db.transaction("playlist_bookmarks", "readwrite");
                var store = tx.objectStore("playlist_bookmarks");
                store.put({
                    playlistId: playlistId,
                    name: this.playlist.name,
                    uploader: this.playlist.uploader,
                    uploaderUrl: this.playlist.uploaderUrl,
                    thumbnail: this.playlist.thumbnailUrl,
                    uploaderAvatar: this.playlist.uploaderAvatar,
                    videos: this.playlist.videos,
                });
                this.isBookmarked = true;
            }
        },
        async removePlaylistBookmark() {
            var tx = window.db.transaction("playlist_bookmarks", "readwrite");
            var store = tx.objectStore("playlist_bookmarks");
            store.delete(this.$route.query.list);
            this.isBookmarked = false;
        },
        async isPlaylistBookmarked() {
            // needed in order to change the is bookmarked var later
            const App = this;
            const playlistId = this.$route.query.list;
            var tx = window.db.transaction("playlist_bookmarks", "readwrite");
            var store = tx.objectStore("playlist_bookmarks");
            var req = store.openCursor(playlistId);
            req.onsuccess = function (e) {
                var cursor = e.target.result;
                App.isBookmarked = cursor ? true : false;
            };
        },
    },
};
</script>

<style scoped>
.tag-video-type-livestream {
    @apply bg-red-600;
}
</style>
