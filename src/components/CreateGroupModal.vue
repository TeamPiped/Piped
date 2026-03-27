<template>
    <ModalComponent @close="$emit('close')">
        <h2 v-t="'actions.create_group'" />
        <div class="flex flex-col">
            <input
                v-model="groupName"
                class="my-4 h-8 rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                type="text"
                :placeholder="$t('actions.group_name')"
            />
            <button
                v-t="'actions.create_group'"
                class="ml-auto inline-block w-max cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="createGroup()"
            />
        </div>
    </ModalComponent>
</template>

<script setup>
import ModalComponent from "./ModalComponent.vue";
import { ref } from "vue";

const props = defineProps({
    onCreateGroup: {
        required: true,
        type: Function,
    },
});

const emit = defineEmits(["close"]);

const groupName = ref("");

function createGroup() {
    props.onCreateGroup(groupName.value);
    emit("close");
}
</script>
