<template>
    <div class="pp-chapters max-h-75vh">
        <h6 class="efy_trans_filter efy_shadow_trans title">{{ $t("video.chapters") }} - {{ chapters.length }}</h6>
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="chapter efy_anim_pulse flex"
            :class="isCurrentChapter(index) ? 'pp-chapter-active' : 'efy_shadow_trans efy_trans_filter'"
            @click="$emit('seek', chapter.start)"
        >
            <img :src="chapter.image" :alt="chapter.title" />
            <span
                :title="chapter.title"
                class="text font-bold"
                v-text="timeFormat(chapter.start) + ' - ' + chapter.title"
            />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    chapters: {
        type: Object,
        default: () => null,
    },
    playerPosition: {
        type: Number,
        default: () => 0,
    },
});

const isCurrentChapter = index => {
    return (
        props.playerPosition >= props.chapters[index].start &&
        props.playerPosition < (props.chapters[index + 1]?.start ?? Infinity)
    );
};

defineEmits(["seek"]);
</script>

<style>
.pp-chapters {
    flex-direction: column;
    margin: -15rem 0 0 0;
    padding: var(--efy_gap);
    min-width: 400rem;
    max-width: 400rem;
    gap: var(--efy_gap);
    border-radius: var(--efy_radius);
    overflow: auto;
    .title {
        background: var(--efy_bg1);
        border: var(--efy_border);
        padding: 10rem;
        border-radius: var(--efy_radius);
        line-height: 1;
    }
    .chapter {
        display: flex;
        position: relative;
        width: 100%;
        padding: 0;
        margin: 0;
        border-radius: var(--efy_radius);
        border: var(--efy_border);
        align-items: center;
        place-content: start;
        cursor: pointer;
        & img {
            border-radius: var(--efy_radius) 0 0 var(--efy_radius);
            max-width: 132rem;
            height: 100%;
        }
        .text {
            padding: 15rem;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            place-content: start;
            border-radius: 0 var(--efy_radius) var(--efy_radius) 0;
        }
    }
}
:is(.pp-chapter-active, .pp-chapters .chapter:hover) .text {
    background: var(--efy_color);
    color: var(--efy_text2);
    margin: 0;
}
@media (max-width: 1023px) {
    .pp-chapters {
        flex-direction: row;
        margin: var(--efy_gap) 0 0 0;
        max-width: 100%;
        padding: 0 0 var(--efy_gap) 0;
        .title {
            display: none;
        }
        .chapter {
            flex-direction: column;
            & img {
                border-radius: var(--efy_radius) var(--efy_radius) 0 0;
                max-width: 100%;
            }
            .text {
                padding: 7rem 8rem 5rem 8rem;
                display: inline-block;
                width: 160rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                border-radius: 0 0 var(--efy_radius) var(--efy_radius);
            }
        }
    }
}
</style>
