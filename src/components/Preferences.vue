<template>
    <h1 class="uk-text-bold uk-text-center">Preferences</h1>
    <hr />
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
                    <a :href="sslScore(instance.apiurl)" target="_blank"
                        >Click Here</a
                    >
                </td>
            </tr>
        </tbody>
    </table>

    <hr />

    <b>Instance Selection:</b>
    <select
        class="uk-select"
        v-model="selectedInstance"
        @change="onChange($event)"
    >
        <option
            v-bind:key="instance.name"
            v-for="instance in instances"
            v-bind:value="instance.apiurl"
        >
            {{ instance.name }}
        </option>
    </select>
</template>

<script>
export default {
    data() {
        return {
            selectedInstance: null,
            instances: []
        };
    },
    mounted() {
        fetch(
            "https://raw.githubusercontent.com/wiki/TeamPiped/Piped-Frontend/Instances.md"
        )
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
                            cdn: split[3].trim()
                        });
                    }
                });
            });

        if (localStorage)
            this.selectedInstance =
                localStorage.getItem("instance") ||
                "https://pipedapi.kavin.rocks";
    },
    methods: {
        onChange() {
            if (localStorage)
                localStorage.setItem("instance", this.selectedInstance);
        },
        sslScore(url) {
            return (
                "https://www.ssllabs.com/ssltest/analyze.html?d=" +
                new URL(url).host +
                "&latest"
            );
        }
    }
};
</script>
