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
        const pako = require("pako");
        return pako.gzip(data);
    }
};
