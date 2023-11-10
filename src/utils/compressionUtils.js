export const compressGzip = async data => {
    // Firefox does not support CompressionStream yet
    if (typeof CompressionStream !== "undefined") {
        let bytes = new TextEncoder().encode(data);
        // eslint-disable-next-line no-undef
        const cs = new CompressionStream("gzip");
        const writer = cs.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const compAb = await new Response(cs.readable).arrayBuffer();
        bytes = new Uint8Array(compAb);

        return bytes;
    } else {
        const pako = await import("pako");
        return pako.gzip(data);
    }
};

export const decompressGzip = async compressedData => {
    // Firefox does not support DecompressionStream yet
    if (typeof DecompressionStream !== "undefined") {
        // eslint-disable-next-line no-undef
        const ds = new DecompressionStream("gzip");
        const writer = ds.writable.getWriter();
        writer.write(compressedData);
        writer.close();
        const decompAb = await new Response(ds.readable).arrayBuffer();
        const bytes = new Uint8Array(decompAb);

        return new TextDecoder().decode(bytes);
    } else {
        const pako = await import("pako");
        const inflated = pako.inflate(compressedData, { to: "string" });

        return inflated;
    }
};
