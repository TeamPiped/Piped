<template>
    <ModalComponent @close="$emit('close')">
        <div class="flex min-w-[50vw] flex-col">
            <div class="h-[70vh] overflow-y-scroll pr-4">
                <span v-t="'actions.add_to_group'" class="mb-3 inline-block w-max text-2xl" />
                <div v-for="(group, index) in channelGroups" :key="group.groupName" class="px-1">
                    <div class="flex items-center justify-between">
                        <span>{{ group.groupName }}</span>
                        <UiCheckbox
                            :model-value="group.channels.includes(channelId)"
                            @update:model-value="onCheckedChange(index, group)"
                        />
                    </div>
                    <hr class="h-1 w-full" />
                </div>
            </div>
            <button
                v-t="'actions.create_group'"
                class="ml-auto inline-block w-max cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="showCreateGroupModal = true"
            />
        </div>
    </ModalComponent>

    <CreateGroupModal
        v-if="showCreateGroupModal"
        :on-create-group="onCreateGroup"
        @close="showCreateGroupModal = false"
    />
</template>
<script setup>
import { ref, onMounted } from "vue";
import ModalComponent from "./ModalComponent.vue";
import CreateGroupModal from "./CreateGroupModal.vue";
import UiCheckbox from "./ui/Checkbox.vue";
import { getChannelGroups, createOrUpdateChannelGroup } from "@/composables/useChannelGroups.js";

const props = defineProps({
    channelId: {
        type: String,
        required: true,
    },
});

defineEmits(["close"]);

const showCreateGroupModal = ref(false);
const channelGroups = ref([]);

async function loadChannelGroups() {
    const groups = await getChannelGroups();
    channelGroups.value.push(...groups);
}

onMounted(() => {
    loadChannelGroups();
});

function onCheckedChange(index, group) {
    if (group.channels.includes(props.channelId)) {
        group.channels.splice(index, 1);
    } else {
        group.channels.push(props.channelId);
    }
    createOrUpdateChannelGroup(group);
}

function onCreateGroup(newGroupName) {
    if (!newGroupName || channelGroups.value.some(group => group.groupName == newGroupName)) return;

    const newGroup = {
        groupName: newGroupName,
        channels: [],
    };
    channelGroups.value.push(newGroup);
    createOrUpdateChannelGroup(newGroup);

    showCreateGroupModal.value = false;
}
</script>
