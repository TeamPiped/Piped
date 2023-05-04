<template>
    <div class="text-center">
        <form>
            <div>
                <input ref="fileSelector" type="file" @change="fileChange" />
            </div>
            <div>
                <strong v-text="`Selected Subscriptions: ${selectedSubscriptions}`" />
            </div>
            <div>
                <strong>Override: <input v-model="override" class="checkbox" type="checkbox" /></strong>
            </div>
            <div>
                <a class="btn w-auto" @click="handleImport">Import</a>
            </div>
        </form>
        <br />
        <strong>Importing Subscriptions from YouTube</strong>
        <br />
        <div>
            Open
            <a href="https://takeout.google.com/takeout/custom/youtube">takeout.google.com/takeout/custom/youtube</a>
            <br />
            In "Select data to include", click on "All YouTube data included" and select only "subscriptions".
            <br />
            Create the export and download the zip file.
            <br />
            Extract subscriptions.csv from the zip file.
            <br />
            Select and import the file above.
        </div>
        <br />
        <strong>Importing Subscriptions from Invidious</strong>
        <br />
        <div>
            Open
            <a href="https://invidio.us/data_control">invidiou.us/data_control</a>
            <br />
            Click on any of the export options.
            <br />
            Select and import the file above.
        </div>
        <br />
        <strong>Importing Subscriptions from NewPipe</strong>
        <br />
        <div>
            Go to the Feed tab.
            <br />
            Click on the arrow on where it says "Subscriptions".
            <br />
            Save the file somewhere.
            <br />
            Select and import the file above.
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            subscriptions: [],
            override: false,
        };
    },
    computed: {
        selectedSubscriptions() {
            return this.subscriptions.length;
        },
    },
    activated() {
        document.title = "Import - Piped";
    },
    methods: {
        fileChange() {
            const file = this.$refs.fileSelector.files[0];
            file.text().then(text => {
                this.subscriptions = [];

                // Invidious
                if (text.indexOf("opml") != -1) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, "text/xml");
                    xmlDoc.querySelectorAll("outline[xmlUrl]").forEach(item => {
                        const url = item.getAttribute("xmlUrl");
                        const id = url.slice(-24);
                        this.subscriptions.push(id);
                    });
                }
                // NewPipe
                else if (text.indexOf("app_version") != -1) {
                    const json = JSON.parse(text);
                    json.subscriptions
                        .filter(item => item.service_id == 0)
                        .forEach(item => {
                            const url = item.url;
                            const id = url.slice(-24);
                            this.subscriptions.push(id);
                        });
                }
                // Invidious JSON
                else if (text.indexOf("thin_mode") != -1) {
                    const json = JSON.parse(text);
                    this.subscriptions = json.subscriptions;
                }
                // FreeTube DB
                else if (text.indexOf("allChannels") != -1) {
                    const json = JSON.parse(text);
                    json.subscriptions.forEach(item => {
                        this.subscriptions.push(item.id);
                    });
                }
                // Google Takeout JSON
                else if (text.indexOf("contentDetails") != -1) {
                    const json = JSON.parse(text);
                    json.forEach(item => {
                        const id = item.snippet.resourceId.channelId;
                        this.subscriptions.push(id);
                    });
                }

                // Google Takeout CSV
                else if (file.name.length >= 5 && file.name.slice(-4).toLowerCase() == ".csv") {
                    const lines = text.split("\n");
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i];
                        const id = line.slice(0, line.indexOf(","));
                        if (id.length === 24) this.subscriptions.push(id);
                    }
                }
            });
        },
        handleImport() {
            if (this.authenticated) {
                this.fetchJson(
                    this.authApiUrl() + "/import",
                    {
                        override: this.override,
                    },
                    {
                        method: "POST",
                        headers: {
                            Authorization: this.getAuthToken(),
                        },
                        body: JSON.stringify(this.subscriptions),
                    },
                ).then(json => {
                    if (json.message === "ok") window.location = "/feed";
                });
            } else {
                this.importSubscriptionsLocally(this.subscriptions);
                window.location = "/feed";
            }
        },
        importSubscriptionsLocally(newChannels) {
            const subscriptions = this.override
                ? [...new Set(newChannels)]
                : [...new Set((this.getLocalSubscriptions() ?? []).concat(newChannels))];
            // Sort for better cache hits
            subscriptions.sort();
            try {
                localStorage.setItem("localSubscriptions", JSON.stringify(subscriptions));
            } catch (e) {
                alert(this.$t("info.local_storage"));
            }
        },
    },
};
</script>
