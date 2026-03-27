<template>
    <DialogRoot :open="true" @update:open="onOpenChange">
        <DialogPortal>
            <DialogOverlay class="fixed inset-0 z-50 bg-gray-500/80 transition-opacity dark:bg-dark-900/80" />
            <DialogContent
                class="fixed top-1/2 left-1/2 z-50 w-min min-w-[20vw] -translate-1/2 rounded-xl bg-white p-5 text-black focus:outline-none dark:bg-dark-700 dark:text-white"
            >
                <DialogClose as-child>
                    <button
                        type="button"
                        class="absolute top-1 right-2.5 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                    >
                        <i-fa6-solid-xmark />
                    </button>
                </DialogClose>
                <slot></slot>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<script setup>
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot } from "reka-ui";

const emit = defineEmits(["close"]);

function onOpenChange(open) {
    if (!open) {
        emit("close");
    }
}
</script>
