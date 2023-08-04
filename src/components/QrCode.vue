<template>
    <canvas ref="qrCodeCanvas" class="mx-auto my-2" />
</template>
<script>
import QRCode from "qrcode";

export default {
    props: {
        text: {
            type: String,
            required: true,
        },
    },
    watch: {
        text() {
            this.generateQrCode();
        },
    },
    mounted() {
        this.generateQrCode();
    },
    methods: {
        generateQrCode() {
            QRCode.toCanvas(this.$refs.qrCodeCanvas, this.text, error => {
                if (error) console.error(error);
            });
        },
    },
};
</script>
