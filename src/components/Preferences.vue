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
    <b>Autoplay Video</b>
    <br />
    <input class="uk-checkbox" v-model="autoPlayVideo" @change="onChange($event)" type="checkbox" />
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
    <select class="uk-select" v-model="selectedInstance" @change="onChange($event)">
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
            autoPlayVideo: true,
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

            this.autoPlayVideo =
                localStorage.getItem("playerAutoPlay") === null || localStorage.getItem("playerAutoPlay") === "true";
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

                localStorage.setItem("playerAutoPlay", this.autoPlayVideo);
            }
        },
        sslScore(url) {
            return "https://www.ssllabs.com/ssltest/analyze.html?d=" + new URL(url).host + "&latest";
        },
    },
};
</script>
