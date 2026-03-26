<template>
    <div class="text-center">
        <form>
            <div>
                <input ref="fileSelector" type="file" @change="fileChange" />
            </div>
            <div>
                <strong v-text="`${$t('info.selected_subscriptions')}: ${selectedSubscriptions}`" />
            </div>
            <div>
                <strong
                    ><span v-t="'actions.override'" />: <input v-model="override" class="checkbox" type="checkbox"
                /></strong>
            </div>
            <div>
                <a v-t="'actions.import'" class="btn w-auto" @click="handleImport" />
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

<script setup>
import { ref, computed, onActivated } from "vue";
import { useI18n } from "vue-i18n";
import { fetchJson, authApiUrl, getAuthToken, isAuthenticated } from "@/composables/useApi.js";
import { getLocalSubscriptions } from "@/composables/useSubscriptions.js";

const { t } = useI18n();

const fileSelector = ref(null);
const subscriptions = ref([]);
const override = ref(false);

const selectedSubscriptions = computed(() => subscriptions.value.length);

onActivated(() => {
    document.title = "Import - Piped";
});

function fileChange() {
    const file = fileSelector.value.files[0];
    file.text().then(text => {
        subscriptions.value = [];

        // Invidious
        if (text.indexOf("opml") != -1) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            xmlDoc.querySelectorAll("outline[xmlUrl]").forEach(item => {
                const url = item.getAttribute("xmlUrl");
                const id = url.slice(-24);
                subscriptions.value.push(id);
            });
        }
        // NewPipe
        else if (text.indexOf("subscriptions") != -1) {
            const json = JSON.parse(text);
            json.subscriptions
                // if service_id is undefined, chances are it's a freetube export
                .filter(item => item.service_id == 0 || item.service_id == undefined)
                .forEach(item => {
                    const url = item.url;
                    const id = url.slice(-24);
                    subscriptions.value.push(id);
                });
        }
        // Invidious JSON
        else if (text.indexOf("thin_mode") != -1) {
            const json = JSON.parse(text);
            subscriptions.value = json.subscriptions;
        }
        // FreeTube DB
        else if (text.indexOf("allChannels") != -1) {
            const lines = text.split("\n");
            for (let line of lines) {
                if (line === "") continue;
                const json = JSON.parse(line);
                json.subscriptions.forEach(item => {
                    subscriptions.value.push(item.id);
                });
            }
        }
        // Google Takeout JSON
        else if (text.indexOf("contentDetails") != -1) {
            const json = JSON.parse(text);
            json.forEach(item => {
                const id = item.snippet.resourceId.channelId;
                subscriptions.value.push(id);
            });
        }

        // Google Takeout CSV
        else if (file.name.length >= 5 && file.name.slice(-4).toLowerCase() == ".csv") {
            const lines = text.split("\n");
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                const id = line.slice(0, line.indexOf(","));
                if (id.length === 24) subscriptions.value.push(id);
            }
        }
    });
}

function handleImport() {
    if (isAuthenticated()) {
        fetchJson(
            authApiUrl() + "/import",
            {
                override: override.value,
            },
            {
                method: "POST",
                headers: {
                    Authorization: getAuthToken(),
                },
                body: JSON.stringify(subscriptions.value),
            },
        ).then(json => {
            if (json.message === "ok") window.location = "/feed";
        });
    } else {
        importSubscriptionsLocally(subscriptions.value);
        window.location = "/feed";
    }
}

function importSubscriptionsLocally(newChannels) {
    const subs = override.value
        ? [...new Set(newChannels)]
        : [...new Set((getLocalSubscriptions() ?? []).concat(newChannels))];
    // Sort for better cache hits
    subs.sort();
    try {
        localStorage.setItem("localSubscriptions", JSON.stringify(subs));
    } catch (e) {
        alert(t("info.local_storage"));
    }
}
</script>
