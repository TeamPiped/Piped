<template>
    <div
        class="uk-height-viewport uk-flex uk-flex-column uk-flex-middle"
        :class="{ collapsed, 'narrow-sidebar': narrowSidebar }"
        style="transition: width 0.5s; padding: 48px 24px; height: 100vh;"
        :style="{ width: collapsed ? '78px' : '291px', backgroundColor: secondaryBackgroundColor }"
    >
        <div
            class="uk-width-1-1 uk-flex uk-flex-middle"
            style="margin-bottom: 100px; height: 50px;"
            :style="{ padding: narrowSidebar ? '0' : '0 14px' }"
            :class="{ 'uk-flex uk-flex-center': collapsed }"
        >
            <div style="flex: 0.50 0 0%;">
                <font-awesome-icon class="button highlight" @click="collapsed = !collapsed" icon="bars" />
            </div>
            <div class="uk-flex uk-flex-middle" style="gap: 16px; flex: 1;" v-if="!narrowSidebar">
                <img src="/img/pipedPlay.svg" :class="{ 'piped-play': !narrowSidebar }" />

                <img src="/img/piped.svg" />
            </div>
        </div>

        <nav class="uk-nav uk-flex-1 uk-width-1-1">
            <ul class="uk-flex uk-flex-column" :class="{ 'uk-flex-middle': narrowSidebar }" style="gap: 20px;">
                <li>
                    <router-link to="/" class="highlight sidebar-link uk-flex">
                        <font-awesome-icon icon="fire" />
                        <span v-if="!narrowSidebar">Trending</span>
                    </router-link>
                </li>
                <li>
                    <router-link to="/feed" class="highlight sidebar-link uk-flex">
                        <font-awesome-icon icon="rss" />
                        <span v-if="!narrowSidebar">My feed</span>
                    </router-link>
                </li>
                <li>
                    <router-link to="/subscriptions" class="highlight sidebar-link uk-flex">
                        <font-awesome-icon icon="heart" />
                        <span v-if="!narrowSidebar">Subscriptions</span>
                    </router-link>
                </li>
            </ul>
        </nav>

        <router-link to="/preferences" class="highlight sidebar-link uk-width-1-1 uk-flex uk-flex-middle">
            <font-awesome-icon icon="cog" />
            <span v-if="!narrowSidebar">Settings</span>
        </router-link>

        <button
            class="highlight logout-button button sidebar-link uk-width-1-1 uk-flex uk-flex-center uk-flex-middle"
            :class="{ 'uk-flex-center': collapsed }"
            :style="{ backgroundColor: backgroundColor }"
            style="border-radius: 9999px; border: none; margin-top: 20px;"
            @click="logout"
        >
            <span v-if="!narrowSidebar">Log out</span>
            <font-awesome-icon icon="sign-out-alt" />
        </button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            collapsed: false,
            narrowSidebar: false,
        };
    },
    methods: {
        logout() {
            alert("logging out");
        },
    },
    watch: {
        collapsed(collapsed) {
            if (collapsed)
                setTimeout(() => {
                    this.narrowSidebar = collapsed;
                }, 350);
            else this.narrowSidebar = collapsed;
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
    padding: 10px 14px;
    border-radius: 12px;
    transition: padding 0.5s;
}

.collapsed .sidebar-link {
    padding: 6px;
}
.narrow-sidebar .sidebar-link {
    width: fit-content;
}

.sidebar-link span {
    transition: font-size 500ms;
}
.collapsed .sidebar-link span {
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
