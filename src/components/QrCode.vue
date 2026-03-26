<template>
    <canvas ref="qrCodeCanvas" class="mx-auto my-2" />
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import QRCode from "qrcode";

const props = defineProps({
    text: {
        type: String,
        required: true,
    },
});

const qrCodeCanvas = ref(null);

function generateQrCode() {
    QRCode.toCanvas(qrCodeCanvas.value, props.text, error => {
        if (error) console.error(error);
    });
}

watch(() => props.text, generateQrCode);

onMounted(() => {
    generateQrCode();
});
</script>
