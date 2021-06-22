<template>
    <h1 class="uk-text-bold uk-text-center">Preferences</h1>
    <hr />
    <h2>SponsorBlock</h2>
    <p>Uses the API from <a href="https://sponsor.ajay.app/">sponsor.ajay.app</a></p>
    <b>Enable Sponsorblock</b>
    <br />
    <input class="uk-checkbox" v-model="sponsorBlock" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Sponsors</b>
    <br />
    <input class="uk-checkbox" v-model="skipSponsor" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Intermission/Intro Animation</b>
    <br />
    <input class="uk-checkbox" v-model="skipIntro" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Endcards/Credits</b>
    <br />
    <input class="uk-checkbox" v-model="skipOutro" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Interaction Reminder (Subscribe)</b>
    <br />
    <input class="uk-checkbox" v-model="skipInteraction" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Unpaid/Self Promotion</b>
    <br />
    <input class="uk-checkbox" v-model="skipSelfPromo" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Music: Non-Music Section</b>
    <br />
    <input class="uk-checkbox" v-model="skipMusicOffTopic" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Theme</b>
    <br />
    <select class="uk-select uk-width-auto" v-model="selectedTheme" @change="onChange($event)">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
    </select>
    <br />
    <b>Autoplay Video</b>
    <br />
    <input class="uk-checkbox" v-model="autoPlayVideo" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Audio Only</b>
    <br />
    <input class="uk-checkbox" v-model="audioOnly" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Default Quality</b>
    <br />
    <select class="uk-select uk-width-auto" v-model="defaultQuality" @change="onChange($event)">
        <option value="0">Auto</option>
        <option :key="resolution" v-for="resolution in resolutions" :value="resolution">{{ resolution }}p</option>
    </select>
    <br />
    <b>Buffering Goal</b>
    <br />
    <input class="uk-input uk-width-auto" v-model="bufferingGoal" @change="onChange($event)" type="text" />
    <h2>Instances List</h2>
    <table class="uk-table">
        <thead>
            <tr>
                <th>Instance Name</th>
                <th>Instance Locations</th>
                <th>Has CDN?</th>
                <th>SSL Score</th>
            </tr>
        </thead>
        <tbody v-bind:key="instance.name" v-for="instance in instances">
            <tr>
                <td>{{ instance.name }}</td>
                <td>{{ instance.locations }}</td>
                <td>{{ instance.cdn }}</td>
                <td>
                    <a :href="sslScore(instance.apiurl)" target="_blank">Click Here</a>
                </td>
            </tr>
        </tbody>
    </table>

    <hr />

    <b>Instance Selection:</b>
    <br />
    <select class="uk-select uk-width-auto" v-model="selectedInstance" @change="onChange($event)">
        <option v-bind:key="instance.name" v-for="instance in instances" v-bind:value="instance.apiurl">
            {{ instance.name }}
        </option>
    </select>
</template>

<script>
export default {
    data() {
        return {
            selectedInstance: null,
            instances: [],
            sponsorBlock: true,
            skipSponsor: true,
            skipIntro: false,
            skipOutro: false,
            skipInteraction: true,
            skipSelfPromo: true,
            skipMusicOffTopic: true,
            selectedTheme: "dark",
            autoPlayVideo: true,
            audioOnly: false,
            resolutions: [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320],
            defaultQuality: 0,
            bufferingGoal: 10,
        };
    },
    mounted() {
        fetch("https://raw.githubusercontent.com/wiki/TeamPiped/Piped-Frontend/Instances.md")
            .then(resp => resp.text())
            .then(body => {
                var skipped = 0;
                const lines = body.split("\n");
                lines.map(line => {
                    const split = line.split("|");
                    if (split.length == 4) {
                        if (skipped < 2) {
                            skipped++;
                            return;
                        }
                        this.instances.push({
                            name: split[0].trim(),
                            apiurl: split[1].trim(),
                            locations: split[2].trim(),
                            cdn: split[3].trim(),
                        });
                    }
                });
            });

        if (localStorage) {
            this.selectedInstance = localStorage.getItem("instance") || "https://pipedapi.kavin.rocks";

            this.sponsorBlock = localStorage.getItem("sponsorblock") || true;
            if (localStorage.getItem("selectedSkip") !== null) {
                var skipList = localStorage.getItem("selectedSkip").split(",");
                this.skipSponsor = this.skipIntro = this.skipOutro = this.skipInteraction = this.skipSelfPromo = this.skipMusicOffTopic = false;
                skipList.forEach(skip => {
                    switch (skip) {
                        case "sponsor":
                            this.skipSponsor = true;
                            break;
                        case "intro":
                            this.skipIntro = true;
                            break;
                        case "outro":
                            this.skipOutro = true;
                            break;
                        case "interaction":
                            this.skipInteraction = true;
                            break;
                        case "selfpromo":
                            this.skipSelfPromo = true;
                            break;
                        case "music_offtopic":
                            this.skipMusicOffTopic = true;
                            break;
                        default:
                            console.log("Unknown sponsor type: " + skip);
                            break;
                    }
                });
            }

            this.selectedTheme = localStorage.getItem("theme") || "dark";
            this.autoPlayVideo =
                localStorage.getItem("playerAutoPlay") === null || localStorage.getItem("playerAutoPlay") === "true";
            this.audioOnly = localStorage.getItem("audioOnly") === "true";
            this.defaultQuality = Number(localStorage.getItem("quality"));
            this.bufferingGoal = Math.max(Number(localStorage.getItem("bufferGoal")), 10);
        }
    },
    methods: {
        onChange() {
            if (localStorage) {
                localStorage.setItem("instance", this.selectedInstance);
                localStorage.setItem("sponsorblock", this.sponsorBlock);

                var sponsorSelected = [];
                if (this.skipSponsor) sponsorSelected.push("sponsor");
                if (this.skipIntro) sponsorSelected.push("intro");
                if (this.skipOutro) sponsorSelected.push("outro");
                if (this.skipInteraction) sponsorSelected.push("interaction");
                if (this.skipSelfPromo) sponsorSelected.push("selfpromo");
                if (this.skipMusicOffTopic) sponsorSelected.push("music_offtopic");
                localStorage.setItem("selectedSkip", sponsorSelected);

                localStorage.setItem("theme", this.selectedTheme);
                localStorage.setItem("playerAutoPlay", this.autoPlayVideo);
                localStorage.setItem("audioOnly", this.audioOnly);
                localStorage.setItem("quality", this.defaultQuality);
                localStorage.setItem("bufferGoal", this.bufferingGoal);
            }
        },
        sslScore(url) {
            return "https://www.ssllabs.com/ssltest/analyze.html?d=" + new URL(url).host + "&latest";
        },
    },
};
</script>
