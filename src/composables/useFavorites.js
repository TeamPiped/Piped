import { ref, computed } from "vue";

const STORAGE_KEY = "favorites";

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

/**
 * "Loved" videos — a curated favourites list separate from queue/watch-later.
 */
export function useFavorites() {
    function toggle(video) {
        const id = video.url?.substr(-11);
        if (!id) return;
        if (_items.value.find(v => v.url === video.url)) {
            _items.value = _items.value.filter(v => v.url !== video.url);
        } else {
            _items.value = [{ ...video, lovedAt: Date.now() }, ..._items.value];
        }
        persist();
    }

    function isFavorite(url) {
        return _items.value.some(v => v.url === url);
    }

    function remove(url) {
        _items.value = _items.value.filter(v => v.url !== url);
        persist();
    }

    const count = computed(() => _items.value.length);

    return { items: _items, toggle, isFavorite, remove, count };
}
