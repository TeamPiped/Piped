<template>
    <ModalComponent @close="$emit('close')">
        <h3 v-t="'titles.custom_instances'" class="my-4 font-bold" />
        <hr />
        <div class="text-center">
            <div>
                <div v-for="(customInstance, index) in customInstances" :key="customInstance.name">
                    <div class="flex items-center justify-between">
                        <span>{{ customInstance.name }} - {{ customInstance.api_url }}</span>
                        <button class="pp-square" style="padding: 0" @click="removeInstance(customInstance, index)">
                            <i class="i-fa6-solid:circle-minus m-0" />
                        </button>
                    </div>
                    <hr />
                </div>
            </div>
            <form class="flex flex-col items-end gap-2">
                <input
                    v-model="name"
                    type="text"
                    :placeholder="$t('preferences.instance_name')"
                    style="max-width: unset"
                />
                <input
                    v-model="url"
                    type="text"
                    :placeholder="$t('preferences.api_url')"
                    style="max-width: unset; margin: var(--efy_gap) 0"
                    @keyup.enter="addInstance"
                />
                <button v-t="'actions.add'" @click.prevent="addInstance" />
            </form>
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";
export default {
    components: { ModalComponent },
    emits: ["close"],
    data() {
        return {
            customInstances: [],
            name: "",
            url: "",
        };
    },
    mounted() {
        this.customInstances = this.getCustomInstances();
    },
    methods: {
        async addInstance() {
            const newInstance = {
                name: this.name,
                api_url: this.url,
            };

            if (!newInstance.name || !newInstance.api_url) {
                return;
            }
            if (!this.isValidInstanceUrl(newInstance.api_url)) {
                alert(this.$t("actions.invalid_url"));
                return;
            }

            this.addCustomInstance(newInstance);
            this.name = "";
            this.url = "";
        },
        removeInstance(instance, index) {
            this.customInstances.splice(index, 1);

            this.removeCustomInstance(instance);
        },
        isValidInstanceUrl(str) {
            var a = document.createElement("a");
            a.href = str;
            return a.host && a.host != window.location.host;
        },
    },
};
</script>
