<template>
    <div
        class="uk-container uk-container-expand uk-light uk-height-viewport"
        style="background: #0b0e0f"
    >
        <nav
            class="uk-navbar-container uk-container-expand uk-light"
            style="background: #0b0e0f"
            uk-navbar
        >
            <div class="uk-navbar-left">
                <router-link class="uk-navbar-item uk-logo uk-text-bold" to="/"
                    >Piped</router-link
                >
            </div>
            <div class="uk-navbar-right">
                <ul class="uk-navbar-nav">
                    <li>
                        <router-link to="/preferences">Preferences</router-link>
                    </li>
                    <li>
                        <router-link to="/login">Login</router-link>
                    </li>
                    <li>
                        <router-link to="/feed">Feed</router-link>
                    </li>
                </ul>
            </div>
        </nav>

        <router-view />
    </div>
</template>

<script>
export default {
    data() {
        return {};
    }
};
</script>

<style>
#app {
    background: #0b0e0f;
}

::-webkit-scrollbar {
    background-color: #15191a;
    color: #c5bcae;
}

::-webkit-scrollbar-thumb {
    background-color: #4b4f52;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #5b6469;
}

::-webkit-scrollbar-thumb:active {
    background-color: #485053;
}

::-webkit-scrollbar-corner {
    background-color: #0b0e0f;
}

* {
    scrollbar-color: #15191a #444a4e;
}
</style>
