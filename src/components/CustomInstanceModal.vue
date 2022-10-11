<template>
    <ModalComponent>
        <h3 v-t="'Custom Instance'" class="font-bold my-4" />
        <hr />
        <div class="text-center">
            <select v-model="selectedInstance">
                <option
                    v-for="(instance, pointer) in custominstance"
                    :key="pointer"
                    :value="pointer"
                    v-text="instance.name"
                />
            </select>
            <div class="flex justify-end">
                <button @click="remove" v-t="'Remove'" />
            </div>
            <form class="children:pb-3">
                <div>
                    <input
                        v-model="name"
                        class="input w-full"
                        type="text"
                        :placeholder="'Name'"
                        :aria-label="'Name'"
                        v-on:keyup.enter="add"
                    />
                </div>
                <div>
                    <input
                        v-model="url"
                        class="input w-full"
                        type="text"
                        :placeholder="'Instance Api URL'"
                        :aria-label="'Instance Api URL'"
                        v-on:keyup.enter="add"
                    />
                </div>
                <div class="flex justify-end">
                    <button @click="add" v-t="'Add'" />
                </div>
            </form>
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";
export default {
    data() {
        return {
            custominstance: [],
        };
    },
    mounted() {
        if (this.testLocalStorage) {
            if (localStorage.getItem("custominstance") === null) {
                localStorage.setItem("custominstance", "[]");
            }
            this.custominstance = JSON.parse(localStorage.getItem("custominstance"));
        }
    },
    methods: {
        add() {
            if (this.testLocalStorage) {
                this.custominstance.push({
                    name: this.name,
                    api_url: this.url,
                });
                localStorage.setItem("custominstance", JSON.stringify(this.custominstance));
            }
        },
        remove() {
            if (this.testLocalStorage) {
                this.custominstance.splice(this.selectedInstance);
                localStorage.setItem("custominstance", JSON.stringify(this.custominstance));
                window.location = "/preferences";
            }
        },
    },
    components: { ModalComponent },
};
</script>
