<template>
    <div v-if="playlist">
        <h1 class="uk-text-center">
            <img v-bind:src="playlist.avatarUrl" />{{ playlist.name }}
        </h1>

        <b
            ><router-link
                class="uk-text-justify"
                v-bind:to="playlist.uploaderUrl || '/'"
            >
                <img v-bind:src="playlist.uploaderAvatar" />
                {{ playlist.uploader }}</router-link
            ></b
        >

        <b class="uk-align-right">{{ playlist.videos }} Videos</b>

        <hr />

        <div class="uk-grid-xl" uk-grid="parallax: 0">
            <div
                class="uk-width-1-2 uk-width-1-3@m uk-width-1-4@l uk-width-1-5@xl"
                v-bind:key="item.url"
                v-for="item in this.playlist.relatedStreams"
            >
                <router-link
                    class="uk-link-muted uk-text-justify"
                    v-bind:to="item.url || '/'"
                >
                    <img style="width: 100%" v-bind:src="item.thumbnail" />
                    <a>{{ item.title }}</a>
                </router-link>
                <br />
                <div>
                    <b class="uk-text-small uk-align-left">
                        <router-link
                            class="uk-text-justify"
                            v-bind:to="item.uploaderUrl || '/'"
                            >{{ item.uploaderName }}</router-link
                        >
                    </b>
                    <b class="uk-text-small uk-align-right">
                        {{ timeFormat(item.duration) }}
                    </b>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Constants from "@/Constants.js";

export default {
    data() {
        return {
            playlist: null
        };
    },
    mounted() {
        this.getPlaylistData();
        window.addEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async fetchPlaylist() {
            return await (
                await fetch(
                    Constants.BASE_URL + "/playlists/" + this.$route.query.list
                )
            ).json();
        },
        async getPlaylistData() {
            this.fetchPlaylist()
                .then(data => (this.playlist = data))
                .then(() => (document.title = this.playlist.name + " - Piped"));
        },
        handleScroll() {
            if (this.loading || !this.playlist || !this.playlist.nextpage)
                return;
            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - window.innerHeight
            ) {
                this.loading = true;
                fetch(
                    Constants.BASE_URL +
                        "/nextpage/playlists/" +
                        this.$route.query.list +
                        "?url=" +
                        encodeURIComponent(this.playlist.nextpage)
                )
                    .then(body => body.json())
                    .then(json => {
                        this.playlist.relatedStreams.concat(
                            json.relatedStreams
                        );
                        this.playlist.nextpage = json.nextpage;
                        this.loading = false;
                        json.relatedStreams.map(stream =>
                            this.playlist.relatedStreams.push(stream)
                        );
                    });
            }
        }
    }
};
</script>
