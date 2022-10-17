<template>
    <ModalComponent>
        <h3 v-t="'Custom Instance'" class="font-bold my-4" />
        <hr />
        <div class="text-center">
            <div v-if="customInstances.length" class="remove">
                <select v-model="selectedInstance">
                    <option
                        v-for="(instance, index) in customInstances"
                        :key="index"
                        :value="index"
                        v-text="instance.name"
                    />
                </select>
                <div class="flex justify-end">
                    <button @click="removeInstance" v-t="'Remove'" />
                </div>
            </div>
            <form class="children:pb-3">
                <div>
                    <input v-model="name" class="input w-full" type="text" :placeholder="'Name'" :aria-label="'Name'" />
                </div>
                <div>
                    <input
                        v-model="url"
                        class="input w-full"
                        type="text"
                        :placeholder="'Instance Api URL'"
                        :aria-label="'Instance Api URL'"
                        v-on:keyup.enter="addInstance"
                    />
                </div>
                <div class="flex justify-end">
                    <button @click.prevent="addInstance" v-t="'Add'" />
                </div>
            </form>
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";
function isUrl(string) {
    try {
        return Boolean(new URL(string));
    } catch (e) {
        return false;
    }
}
export default {
    emits: ["removeInstance", "addInstance"],
    data() {
        return {
            name: "",
            url: "",
            selectedInstance: -1,
        };
    },
    methods: {
        addInstance() {
            if (this.testLocalStorage === null) {
                alert("Local storage problem");
                return null;
            }
            const newInstance = {
                name: this.name,
                api_url: this.url,
            };
            if (newInstance.name.length === 0) {
                alert("Name cannot be empty");
                return null;
            }
            if (!isUrl(newInstance.api_url)) {
                alert("Not a valid URL");
                return null;
            }
            fetch(newInstance.url + "/healthcheck")
                .then(res => {
                    if (!res.ok) {
                        alert("Error Backend URL");
                        return null;
                    }
                    this.$emit("addInstance", newInstance);
                })
                .catch(() => {
                    alert("Cannot find URL");
                    return null;
                })
                .finally(() => {
                    return null;
                });
            return null;
        },
        removeInstance() {
            if (this.testLocalStorage === null) {
                alert("Local storage problem");
                return null;
            }
            if (this.selectedInstance === -1) {
                alert("SelectedInstance problem");
                return null;
            }
            this.$emit("removeInstance", this.selectedInstance);
        },
    },
    props: {
        customInstances: [],
    },
    components: { ModalComponent },
};
</script>
