import { ref, computed, onUnmounted } from "vue";

const _timerEnd = ref(null); // unix ms when timer fires
const _action = ref("pause"); // 'pause' | 'close-tab'
let _interval = null;
const _now = ref(Date.now());

function tick() {
    _now.value = Date.now();
    if (_timerEnd.value && _now.value >= _timerEnd.value) {
        const action = _action.value;
        _timerEnd.value = null;
        if (action === "pause") {
            document.querySelectorAll("video").forEach(v => v.pause());
        } else if (action === "close-tab") {
            window.close();
        }
    }
}

function ensureInterval() {
    if (_interval) return;
    _interval = setInterval(tick, 1000);
}

export function useSleepTimer() {
    ensureInterval();

    function setTimer(minutes, action = "pause") {
        _timerEnd.value = Date.now() + minutes * 60 * 1000;
        _action.value = action;
    }

    function cancel() {
        _timerEnd.value = null;
    }

    const remaining = computed(() => {
        if (!_timerEnd.value) return 0;
        return Math.max(0, Math.floor((_timerEnd.value - _now.value) / 1000));
    });

    const active = computed(() => _timerEnd.value !== null);

    onUnmounted(() => {
        // keep the global interval running even if a component unmounts
    });

    return { setTimer, cancel, remaining, active, action: _action };
}
