// These functions accept and return Uint8Arrays

export async function encryptAESGCM(plaintext, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const algorithm = { name: "AES-GCM", iv: iv };
    const keyMaterial = await crypto.subtle.importKey("raw", key, algorithm, false, ["encrypt"]);
    const ciphertext = await crypto.subtle.encrypt(algorithm, keyMaterial, plaintext);

    return new Uint8Array([...iv, ...new Uint8Array(ciphertext)]);
}

export async function decryptAESGCM(ciphertextArray, key) {
    const iv = new Uint8Array(ciphertextArray.slice(0, 12));
    const algorithm = { name: "AES-GCM", iv: iv };
    const keyMaterial = await crypto.subtle.importKey("raw", key, algorithm, false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt(algorithm, keyMaterial, new Uint8Array(ciphertextArray.slice(12)));

    return decrypted;
}

export async function generateKey() {
    const algorithm = { name: "AES-GCM", length: 256 };
    const key = await crypto.subtle.generateKey(algorithm, true, ["encrypt", "decrypt"]);

    return await crypto.subtle.exportKey("raw", key);
}

export function encodeArrayToBase64(array) {
    const chars = String.fromCharCode.apply(null, array);
    return btoa(chars);
}

export function decodeBase64ToArray(base64) {
    const chars = atob(base64);
    return new Uint8Array(chars.split("").map(c => c.charCodeAt(0)));
}
