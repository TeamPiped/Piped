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
