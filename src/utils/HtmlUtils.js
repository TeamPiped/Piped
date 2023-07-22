import DOMPurify from "dompurify";

export const purifyHTML = html => {
    return DOMPurify.sanitize(html);
};

export const urlify = string => {
    if (!string) return "";
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    const emailRegex = /([\w-\\.]+@(?:[\w-]+\.)+[\w-]{2,4})/g;
    return string
        .replace(urlRegex, url => {
            if (url.endsWith("</a>") || url.endsWith("<a")) return url;
            return `<a href="${url}" target="_blank">${url}</a>`;
        })
        .replace(emailRegex, email => {
            return `<a href="mailto:${email}">${email}</a>`;
        });
};

export const rewriteDescription = text => {
    return urlify(text)
        .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm, "$1")
        .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm, "/watch?v=$1")
        .replaceAll("\n", "<br>");
};
