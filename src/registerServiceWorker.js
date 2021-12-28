/* eslint-disable no-console */

import { registerSW } from "virtual:pwa-register";

if (process.env.NODE_ENV === "production") {
    registerSW();
}
