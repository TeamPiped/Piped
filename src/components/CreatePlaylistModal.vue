<template>
    <ModalComponent @close="$emit('close')">
        <div class="flex flex-col">
            <h2 v-t="'actions.create_playlist'" />
            <input type="text" class="input mt-2" v-model="playlistName" />
            <div class="flex mt-3 ml-auto w-min">
                <button class="btn" v-t="'actions.cancel'" @click="$emit('close')" />
                <button class="btn ml-2" v-t="'actions.okay'" @click="onCreatePlaylist" />
            </div>
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: {
        ModalComponent,
    },
    emits: ["created", "close"],
    data() {
        return {
            playlistName: "",
        };
    },
    methods: {
        onCreatePlaylist() {
            if (!this.playlistName) return;

            this.createPlaylist(this.playlistName).then(response => {
                if (response.error) alert(response.error);
                else {
                    this.$emit("created");
                    this.$emit("close");
                }
            });
        },
    },
};
</script>
