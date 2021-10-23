<template>
    <div
        id="menu-mobile"
        class="uk-flex uk-flex-column uk-flex-middle uk-position-fixed uk-position-top"
        :class="{ 'uk-height-viewport': !collapsed, 'enable-animations': enableAnimations }"
        style="padding: 24px 12px; width: 100vw; box-sizing: border-box; z-index: 9999; overflow: hidden;"
        :style="{
            backgroundColor: secondaryBackgroundColor,
            minHeight: 0,
            height: !collapsed ? '70px' : '100vh',
            transition: enableAnimations ? 'min-height 40ms, height 400ms' : 'none',
        }"
    >
        <div class="uk-width-1-1 uk-flex uk-flex-middle" style="margin-bottom: 100px; padding: 0 14px; gap: 32px;">
            <div
                :style="{
                    transform: collapsed ? 'rotate(90deg)' : 'none',
                    transition: enableAnimations ? 'padding 500ms, transform 500ms' : 'none',
                }"
            >
                <font-awesome-icon class="button highlight" @click="toggleCollapsed()" icon="bars" />
            </div>
            <div class="uk-flex uk-flex-middle" style="gap: 12px;" v-if="!hideText">
                <router-link to="/" style="background: none !important;">
                    <img src="/img/pipedPlay.svg" style="height: 26px;" />
                </router-link>

                <router-link to="/" style="background: none !important;">
                    <img src="/img/piped.svg" style="height: 22px;" />
                </router-link>
            </div>
        </div>

        <nav class="uk-nav uk-flex-1 uk-width-1-1">
            <ul class="uk-flex uk-flex-column" style="gap: 20px;">
                <li>
                    <router-link to="/" @click="toggleCollapsed()" class="highlight sidebar-link uk-flex">
                        <font-awesome-icon icon="fire" />
                        <span v-t="'titles.trending'" />
                    </router-link>
                </li>
                <li v-if="authenticated">
                    <router-link to="/feed" @click="toggleCollapsed()" class="highlight sidebar-link uk-flex">
                        <font-awesome-icon icon="rss" />
                        <span v-t="'titles.feed'" />
                    </router-link>
                </li>
                <li v-if="authenticated">
                    <router-link to="/subscriptions" @click="toggleCollapsed()" class="highlight sidebar-link uk-flex">
                        <font-awesome-icon icon="heart" />
                        <span v-t="'titles.subscriptions'" />
                    </router-link>
                </li>
            </ul>
        </nav>

        <router-link
            to="/preferences"
            @click="toggleCollapsed()"
            class="highlight sidebar-link uk-width-1-1 uk-flex uk-flex-middle"
            style="text-decoration: none;"
        >
            <font-awesome-icon icon="cog" />
            <span v-t="'titles.preferences'" />
        </router-link>

        <button
            v-if="authenticated"
            class="highlight logout-button button sidebar-link uk-width-1-1 uk-flex uk-flex-center uk-flex-middle"
            :style="{ backgroundColor: backgroundColor }"
            style="border-radius: 9999px; border: none; margin-top: 20px;"
            @click="logout()"
        >
            <span v-if="!hideText" v-t="'actions.logout'" />
            <font-awesome-icon icon="sign-out-alt" />
        </button>

        <button
            v-if="!authenticated"
            class="highlight logout-button button sidebar-link uk-width-1-1 uk-flex uk-flex-center uk-flex-middle"
            :style="{ backgroundColor: backgroundColor }"
            style="border-radius: 9999px; border: none; margin-top: 20px;"
            @click="openLogin()"
        >
            <span v-if="!hideText" v-t="'actions.login_or_register'" />
            <font-awesome-icon icon="sign-out-alt" />
        </button>
    </div>
</template>

<script>
import { useMenuCollapsed } from "../store";

export default {
    setup() {
        const { menuCollapsed, toggleCollapsed } = useMenuCollapsed();
        return { collapsed: menuCollapsed, toggleCollapsed };
    },
    methods: {
        logout() {
            this.removePreference("authToken" + this.hashCode(this.apiUrl()));
            window.location = "/"; // done to bypass cache
        },
        openLogin() {
            window.location = "/login"; // done to bypass cache
        },
    },
    computed: {
        enableAnimations(_this) {
            return !_this.getPreferenceBoolean("disableAnimations", false);
        },
    },
};
</script>

<style>
@keyframes bump {
    /* heartbeat */
    /* 0% {
        transform: scale(1);
    }
    20% {
        transform: scale(1.25);
    }
    40% {
        transform: scale(1);
    }
    60% {
        transform: scale(1.25);
    }
    70% {
        transform: scale(1.25);
    }
    90% {
        transform: scale(1);
    } */

    /* right bump */
    0% {
        transform: translate3d(0, 0, 0);
    }
    45% {
        transform: translate3d(8px, 0, 0);
    }
    55% {
        transform: translate3d(8px, 0, 0);
    }
    100% {
        transform: translate3d(0, 0, 0);
    }
}

#menu-mobile.enable-animations .piped-play {
    animation: bump 300ms ease-in-out 500ms;
}
@media (prefers-reduced-motion) {
    #menu-mobile .piped-play {
        animation: none;
    }
}

#menu-mobile .logout-button {
    white-space: nowrap;
}

#menu-mobile .button:hover {
    cursor: pointer;
}

#menu-mobile .highlight {
    color: #abb2c6;
}

#menu-mobile .sidebar-link {
    gap: 14px !important;
    padding: 10px 12px;
    border-radius: 12px;
}
#menu-mobile.enable-animations .sidebar-link {
    transition: padding 400ms, gap 400ms;
}

#menu-mobile.enable-animations .sidebar-link span {
    transition: font-size 500ms, padding 500ms;
}
#menu-mobile.collapse-text .sidebar-link span {
    font-size: 0;
}

#menu-mobile .highlight:hover,
#menu-mobile .router-link-active {
    color: #fff;
}
#menu-mobile .router-link-active {
    background: linear-gradient(to right, #da22ff, #9733ee);
}
</style>
