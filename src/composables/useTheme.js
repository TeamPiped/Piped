import { ref, watch } from "vue";

const STORAGE_KEY = "accentColor";
const DEFAULT = "#fa4b4b";

const _color = ref(localStorage.getItem(STORAGE_KEY) || DEFAULT);

function applyAccent(hex) {
    document.documentElement.style.setProperty("--piped-accent", hex);
    // Derive lighter/darker variants for hover states
    const { r, g, b } = hexToRgb(hex);
    document.documentElement.style.setProperty("--piped-accent-rgb", `${r}, ${g}, ${b}`);
}

function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return {
        r: parseInt(h.substring(0, 2), 16),
        g: parseInt(h.substring(2, 4), 16),
        b: parseInt(h.substring(4, 6), 16),
    };
}

// Apply on import
applyAccent(_color.value);

watch(_color, val => {
    applyAccent(val);
    try {
        localStorage.setItem(STORAGE_KEY, val);
    } catch {
        // storage unavailable
    }
});

export function useTheme() {
    function setColor(hex) {
        _color.value = hex;
    }

    function resetColor() {
        _color.value = DEFAULT;
    }

    return { color: _color, setColor, resetColor, defaultColor: DEFAULT };
}
