export default {
    BASE_URL: localStorage.getItem("instance") || "https://pipedapi.kavin.rocks",
    AUTO_PLAY: localStorage.getItem("autoplay") || false,
};
