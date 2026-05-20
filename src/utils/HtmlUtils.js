import DOMPurify from "dompurify";

export const purifyHTML = html => {
    if (typeof html !== "string") return "";
    return DOMPurify.sanitize(html);
};

import linkifyHtml from "linkify-html";

// Pre-compiled regex patterns for better performance
const YOUTUBE_COM_PATTERN = /(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm;
const YOUTUBE_BE_PATTERN = /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm;

export const rewriteDescription = text => {
    if (typeof text !== "string") return "";
    return linkifyHtml(text)
        .replaceAll(YOUTUBE_COM_PATTERN, "$1")
        .replaceAll(YOUTUBE_BE_PATTERN, "/watch?v=$1")
        .replaceAll("\n", "<br>");
};
