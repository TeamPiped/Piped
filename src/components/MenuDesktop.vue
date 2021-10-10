<template>
    <div
        class="uk-height-viewport uk-flex uk-flex-column uk-flex-middle"
        :class="{ 'collapse-text': collapseText }"
        style="transition: width 400ms; padding: 32px 24px; height: 100vh;"
        :style="{ width: collapsed ? '78px' : '291px', backgroundColor: secondaryBackgroundColor }"
    >
        <div
            class="uk-width-1-1 uk-flex uk-flex-middle uk-flex-between"
            style="margin-bottom: 100px; height: 50px; transition: padding 400ms; padding: 0 14px;"
            :style="collapseText ? 'padding: 0;' : {}"
            :class="{ 'uk-flex uk-flex-center': collapsed }"
        >
            <div style="transition: padding 400ms; flex: 1 0 30px;" :style="collapseText ? 'padding: 0 8px;' : {}">
                <font-awesome-icon class="button highlight" @click="toggleCollapsed()" icon="bars" />
            </div>
            <div
                class="uk-flex uk-flex-middle"
                style="gap: 16px; transition: transform 300ms, gap 300ms;"
                :style="collapseText ? 'transform: scale(0); gap: 0;' : 'transition-delay: 150ms'"
                v-if="!hideText"
            >
                <img src="/img/pipedPlay.svg" :class="{ 'piped-play': !hideText }" />

                <img src="/img/piped.svg" />
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
                <li>
                    <router-link to="/feed" class="highlight sidebar-link uk-flex">
                        <font-awesome-icon icon="rss" />
                        <span v-if="!hideText" v-t="'titles.feed'" />
                    </router-link>
                </li>
                <li>
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
            class="highlight logout-button button sidebar-link uk-width-1-1 uk-flex uk-flex-center uk-flex-middle"
            :style="{ backgroundColor: backgroundColor }"
            style="border-radius: 9999px; border: none; margin-top: 20px;"
            @click="logout"
        >
            <span v-if="!hideText">Log out</span>
            <font-awesome-icon icon="sign-out-alt" />
        </button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            collapseText: this.collapsed,
            hideText: this.collapsed,
        };
    },
    props: {
        collapsed: Boolean,
        toggleCollapsed: Function,
    },
    methods: {
        logout() {
            alert("logging out");
        },
    },
    watch: {
        collapsed(collapsed) {
            if (collapsed) {
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

.piped-play {
    animation: bump 300ms ease-in-out 600ms;
}
@media (prefers-reduced-motion) {
    .piped-play {
        animation: none;
    }
}

.logout-button {
    white-space: nowrap;
}

.button:hover {
    cursor: pointer;
}

.highlight {
    color: #abb2c6;
}

.sidebar-link {
    gap: 14px !important;
    padding: 10px 12px;
    border-radius: 12px;
    transition: padding 400ms, gap 400ms;
}

.collapse-text .sidebar-link {
    padding: 6px;
    gap: 0px !important;
}

.sidebar-link span {
    transition: font-size 400ms, padding 400ms;
}
.collapse-text .sidebar-link span {
    font-size: 0;
}

.highlight:hover,
.router-link-active {
    color: #fff;
}
.router-link-active {
    background: linear-gradient(#da22ff, #9733ee);
}
</style>
