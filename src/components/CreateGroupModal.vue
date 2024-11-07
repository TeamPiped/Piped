<template>
    <ModalComponent @close="$emit('close')">
        <h2 v-t="'actions.create_group'" />
        <div class="flex flex-col">
            <input v-model="groupName" class="input my-4" type="text" :placeholder="$t('actions.group_name')" />
            <button v-t="'actions.create_group'" class="btn ml-auto w-max" @click="createGroup()" />
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: { ModalComponent },
    props: {
        onCreateGroup: {
            required: true,
            type: Function,
        },
    },
    emits: ["close"],
    data() {
        return {
            groupName: "",
        };
    },
    methods: {
        createGroup() {
            this.onCreateGroup(this.groupName);
            this.$emit("close");
        },
    },
};
</script>
