<template>
    <ModalComponent @close="$emit('close')">
        <div class="min-w-[50vw] flex flex-col">
            <div class="h-[70vh] overflow-y-scroll pr-4">
                <span v-t="'actions.add_to_group'" class="mb-3 inline-block w-max text-2xl" />
                <div v-for="(group, index) in channelGroups" :key="group.groupName" class="px-1">
                    <div class="flex items-center justify-between">
                        <span>{{ group.groupName }}</span>
                        <input
                            type="checkbox"
                            :checked="group.channels.includes(channelId)"
                            @change="onCheckedChange(index, group)"
                        />
                    </div>
                    <hr class="h-1 w-full" />
                </div>
            </div>
            <button v-t="'actions.create_group'" class="btn ml-auto w-max" @click="showCreateGroupModal = true" />
        </div>
    </ModalComponent>

    <CreateGroupModal
        v-if="showCreateGroupModal"
        :on-create-group="onCreateGroup"
        @close="showCreateGroupModal = false"
    />
</template>
<script>
import ModalComponent from "./ModalComponent.vue";
import CreateGroupModal from "./CreateGroupModal.vue";

export default {
    components: {
        ModalComponent,
        CreateGroupModal,
    },
    props: {
        channelId: {
            type: String,
            required: true,
        },
    },
    emits: ["close"],
    data() {
        return {
            showCreateGroupModal: false,
            channelGroups: [],
        };
    },
    mounted() {
        this.loadChannelGroups();
    },
    methods: {
        async loadChannelGroups() {
            const groups = await this.getChannelGroups();
            this.channelGroups.push(...groups);
        },
        onCheckedChange(index, group) {
            if (group.channels.includes(this.channelId)) {
                group.channels.splice(index, 1);
            } else {
                group.channels.push(this.channelId);
            }
            this.createOrUpdateChannelGroup(group);
        },
        onCreateGroup(newGroupName) {
            if (!newGroupName || this.channelGroups.some(group => group.groupName == newGroupName)) return;

            const newGroup = {
                groupName: newGroupName,
                channels: [],
            };
            this.channelGroups.push(newGroup);
            this.createOrUpdateChannelGroup(newGroup);

            this.showCreateGroupModal = false;
        },
    },
};
</script>
