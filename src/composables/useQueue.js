import { ref, computed } from "vue";

const _queue = ref(
    (() => {
        try {
            return JSON.parse(localStorage.getItem("watchQueue")) ?? [];
        } catch {
            return [];
        }
    })(),
);

function persist() {
    try {
        localStorage.setItem("watchQueue", JSON.stringify(_queue.value));
    } catch {
        // localStorage unavailable
    }
}

export function useQueue() {
    function addToQueue(video) {
        if (!_queue.value.find(v => v.url === video.url)) {
            _queue.value = [..._queue.value, video];
            persist();
        }
    }

    function removeFromQueue(url) {
        _queue.value = _queue.value.filter(v => v.url !== url);
        persist();
    }

    function clearQueue() {
        _queue.value = [];
        persist();
    }

    function moveUp(url) {
        const idx = _queue.value.findIndex(v => v.url === url);
        if (idx > 0) {
            const copy = [..._queue.value];
            [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
            _queue.value = copy;
            persist();
        }
    }

    function shiftNext() {
        if (_queue.value.length === 0) return null;
        const next = _queue.value[0];
        _queue.value = _queue.value.slice(1);
        persist();
        return next;
    }

    const queueSize = computed(() => _queue.value.length);

    return { queue: _queue, addToQueue, removeFromQueue, clearQueue, moveUp, shiftNext, queueSize };
}
