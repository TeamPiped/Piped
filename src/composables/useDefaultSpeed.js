import { ref, watch } from "vue";

const STORAGE_KEY = "defaultPlaybackSpeed";

function load() {
    const raw = parseFloat(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(raw) && raw >= 0.25 && raw <= 4 ? raw : 1;
}

const _speed = ref(load());

watch(_speed, val => {
    try {
        localStorage.setItem(STORAGE_KEY, String(val));
    } catch {
        // storage unavailable
    }
});

export function useDefaultSpeed() {
    return {
        speed: _speed,
        setSpeed: v => (_speed.value = v),
        presets: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3],
    };
}
