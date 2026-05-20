import { ref, computed } from "vue";

const STORAGE_KEY = "watchLater";

const _items = ref(load());

function load() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch {
        return [];
    }
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_items.value));
    } catch {
        // storage unavailable
    }
}

export function useWatchLater() {
    function addLater(video) {
        const id = video.url?.substr(-11);
        if (!id) return;
        if (_items.value.find(v => v.url === video.url)) return;
        _items.value = [{ ...video, savedAt: Date.now() }, ..._items.value];
        persist();
    }

    function removeLater(url) {
        _items.value = _items.value.filter(v => v.url !== url);
        persist();
    }

    function clearLater() {
        _items.value = [];
        persist();
    }

    function isLater(url) {
        return _items.value.some(v => v.url === url);
    }

    const laterSize = computed(() => _items.value.length);

    return { items: _items, addLater, removeLater, clearLater, isLater, laterSize };
}
