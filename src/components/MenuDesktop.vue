<template>
    <div
        id="menu-desktop"
        class="uk-height-viewport uk-flex uk-flex-column uk-flex-middle"
        :class="{ 'collapse-text': collapseText, 'enable-animations': enableAnimations }"
        style="padding: 32px 24px; height: 100vh;"
        :style="{
            width: collapsed ? '78px' : '270px',
            backgroundColor: secondaryBackgroundColor,
            transition: enableAnimations ? 'width 400ms' : 'none',
        }"
    >
        <div
            class="uk-width-1-1 uk-flex uk-flex-middle uk-flex-between"
            style="margin-bottom: 100px; height: 50px;"
            :style="{
                padding: collapseText ? '0' : '0 26px 0 14px',
                transition: enableAnimations ? 'padding 400ms;' : '',
            }"
            :class="{ 'uk-flex uk-flex-center': collapsed }"
        >
            <div
                style="flex: 1 0 30px;"
                :style="{ padding: collapseText ? '0 8px' : '', transition: enableAnimations ? 'padding 400ms;' : '' }"
            >
                <font-awesome-icon class="button highlight" @click="toggleCollapsed()" icon="bars" />
            </div>
            <div
                class="uk-flex uk-flex-middle"
                :style="{
                    transform: collapseText ? 'scale3d(0, 0, 0)' : 'none',
                    gap: collapseText ? '0' : '16px',
                    transitionDelay: !collapseText && enableAnimations ? '170ms' : 'none',
                    transition: enableAnimations ? 'transform 300ms, gap 300ms' : 'none',
                }"
                v-if="!hideText"
            >
                <router-link to="/" style="background: none !important;">
                    <img
                        src="/img/pipedPlay.svg"
                        :class="{ 'piped-play': !hideText, 'enable-animations': enableAnimations }"
                    />
                </router-link>

                <router-link to="/" style="background: none !important;">
                    <img src="/img/piped.svg" />
                </router-link>
            </div>
        </div>

        <nav class="uk-nav uk-flex-1 uk-width-1-1">
            <ul class="uk-flex uk-flex-column" style="gap: 20px;">
                <li>
                    <router-link
                        to="/"
                        class="highlight sidebar-link uk-flex"
                        :style="collapseText ? 'padding: 6px 8px;' : {}"
                    >
                        <font-awesome-icon icon="fire" />
                        <span v-if="!hideText" v-t="'titles.trending'" />
                    </router-link>
                </li>
                <li v-if="authenticated">
                    <router-link to="/feed" class="highlight sidebar-link uk-flex">
                        <font-awesome-icon icon="rss" />
                        <span v-if="!hideText" v-t="'titles.feed'" />
                    </router-link>
                </li>
                <li v-if="authenticated">
                    <router-link to="/subscriptions" class="highlight sidebar-link uk-flex">
                        <font-awesome-icon icon="heart" />
                        <span v-if="!hideText" v-t="'titles.subscriptions'" />
                    </router-link>
                </li>
            </ul>
        </nav>

        <router-link
            to="/preferences"
            class="highlight sidebar-link uk-width-1-1 uk-flex uk-flex-middle"
            style="text-decoration: none;"
        >
            <font-awesome-icon icon="cog" />
            <span v-if="!hideText" v-t="'titles.preferences'" />
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
    data() {
        return {
            collapseText: this.collapsed,
            hideText: this.collapsed,
        };
    },
    mounted() {
        if (this.getPreferenceBoolean("menuCollapse", false)) {
            this.collapsed = true;
            this.hideText = true;
            this.collapseText = true;
        } else {
            this.collapsed = false;
            this.hideText = false;
            this.collapseText = false;
        }
    },
    setup() {
        const { menuCollapsed, toggleCollapsed } = useMenuCollapsed();
        return { collapsed: menuCollapsed, toggleCollapsed };
    },
    watch: {
        collapsed(_collapsed) {
            this.setPreference("menuCollapse", _collapsed);
            if (this.enableAnimations) {
                if (_collapsed) {
                    this.collapseText = true;
                    setTimeout(() => {
                        this.hideText = true;
                    }, 450);
                } else {
                    this.hideText = false;
                    setTimeout(() => {
                        this.collapseText = false;
                    }, 0);
                }
            } else {
                this.hideText = _collapsed;
                this.collapseText = _collapsed;
            }
        },
    },
    methods: {
        logout() {
            this.removePreference("authToken" + this.hashCode(this.apiUrl()));
            window.location = "/"; // done to bypass cache
        },
        openLogin() {
            this.$router.push("/login");
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

#menu-desktop.enable-animations .piped-play {
    animation: bump 300ms ease-in-out;
    animation-delay: 700ms !important;
}
@media (prefers-reduced-motion) {
    #menu-desktop .piped-play {
        animation: none;
    }
}

#menu-desktop .logout-button {
    white-space: nowrap;
}

#menu-desktop .button:hover {
    cursor: pointer;
}

#menu-desktop .highlight {
    color: #abb2c6;
}

#menu-desktop .sidebar-link {
    gap: 14px !important;
    padding: 10px 12px;
    border-radius: 12px;
}
#menu-desktop.enable-animations .sidebar-link {
    transition: padding 400ms, gap 400ms;
}

#menu-desktop.collapse-text .sidebar-link {
    padding: 6px;
    gap: 0px !important;
}

#menu-desktop.enable-animations .sidebar-link span {
    transition: font-size 400ms;
}
.collapse-text .sidebar-link span {
    font-size: 0;
}

#menu-desktop .highlight:hover,
#menu-desktop .router-link-active {
    color: #fff;
}
#menu-desktop .router-link-active {
    background: linear-gradient(to right, #da22ff, #9733ee);
}
</style>
