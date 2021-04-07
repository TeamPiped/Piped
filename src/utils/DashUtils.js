// Based of https://github.com/GilgusMaximus/yt-dash-manifest-generator/blob/master/src/DashGenerator.js

const xml = require("xml-js");

const DashUtils = {
    generate_dash_file_from_formats(VideoFormats, VideoLength) {
        const generatedJSON = this.generate_xmljs_json_from_data(VideoFormats, VideoLength);
        return xml.json2xml(generatedJSON);
    },
    generate_xmljs_json_from_data(VideoFormatArray, VideoLength) {
        const convertJSON = {
            declaration: {
                attributes: {
                    version: "1.0",
                    encoding: "utf-8",
                },
            },
            elements: [
                {
                    type: "element",
                    name: "MPD",
                    attributes: {
                        xmlns: "urn:mpeg:dash:schema:mpd:2011",
                        profiles: "urn:mpeg:dash:profile:full:2011",
                        minBufferTime: "PT1.5S",
                        type: "static",
                        mediaPresentationDuration: `PT${VideoLength}S`,
                    },
                    elements: [
                        {
                            type: "element",
                            name: "Period",
                            elements: this.generate_adaptation_set(VideoFormatArray),
                        },
                    ],
                },
            ],
        };
        return convertJSON;
    },
    generate_adaptation_set(VideoFormatArray) {
        const adaptationSets = [];
        const mimeTypes = [];
        const mimeObjects = [[]];
        // sort the formats by mime types
        VideoFormatArray.forEach(videoFormat => {
            // the dual formats should not be used
            if (videoFormat.mimeType.indexOf("video") != -1 && !videoFormat.videoOnly) {
                return;
            }
            // if these properties are not available, then we skip it because we cannot set these properties
            //if (!(videoFormat.hasOwnProperty('initRange') && videoFormat.hasOwnProperty('indexRange'))) {
            //   return
            //}
            const mimeType = videoFormat.mimeType;
            const mimeTypeIndex = mimeTypes.indexOf(mimeType);
            if (mimeTypeIndex > -1) {
                mimeObjects[mimeTypeIndex].push(videoFormat);
            } else {
                mimeTypes.push(mimeType);
                mimeObjects.push([]);
                mimeObjects[mimeTypes.length - 1].push(videoFormat);
            }
        });
        // for each MimeType generate a new Adaptation set with Representations as sub elements
        for (let i = 0; i < mimeTypes.length; i++) {
            let isVideoFormat = false;
            const adapSet = {
                type: "element",
                name: "AdaptationSet",
                attributes: {
                    id: i,
                    mimeType: mimeTypes[i],
                    startWithSAP: "1",
                    subsegmentAlignment: "true",
                },
                elements: [],
            };
            if (!mimeTypes[i].includes("audio")) {
                adapSet.attributes.scanType = "progressive";
                isVideoFormat = true;
            }
            mimeObjects[i].forEach(format => {
                if (isVideoFormat) {
                    adapSet.elements.push(this.generate_representation_video(format));
                } else {
                    adapSet.elements.push(this.generate_representation_audio(format));
                }
            });
            adaptationSets.push(adapSet);
        }
        return adaptationSets;
    },
    generate_representation_audio(Format) {
        const representation = {
            type: "element",
            name: "Representation",
            attributes: {
                id: Format.itag,
                codecs: Format.codec,
                bandwidth: Format.bitrate,
            },
            elements: [
                {
                    type: "element",
                    name: "AudioChannelConfiguration",
                    attributes: {
                        schemeIdUri: "urn:mpeg:dash:23003:3:audio_channel_configuration:2011",
                        value: "2",
                    },
                },
                {
                    type: "element",
                    name: "BaseURL",
                    elements: [
                        {
                            type: "text",
                            text: Format.url,
                        },
                    ],
                },
                {
                    type: "element",
                    name: "SegmentBase",
                    attributes: {
                        indexRange: `${Format.indexStart}-${Format.indexEnd}`,
                    },
                    elements: [
                        {
                            type: "element",
                            name: "Initialization",
                            attributes: {
                                range: `${Format.initStart}-${Format.initEnd}`,
                            },
                        },
                    ],
                },
            ],
        };
        return representation;
    },
    generate_representation_video(Format) {
        const representation = {
            type: "element",
            name: "Representation",
            attributes: {
                id: Format.itag,
                codecs: Format.codec,
                bandwidth: Format.bitrate,
                width: Format.width,
                height: Format.height,
                maxPlayoutRate: "1",
                frameRate: Format.fps,
            },
            elements: [
                {
                    type: "element",
                    name: "BaseURL",
                    elements: [
                        {
                            type: "text",
                            text: Format.url,
                        },
                    ],
                },
                {
                    type: "element",
                    name: "SegmentBase",
                    attributes: {
                        indexRange: `${Format.indexStart}-${Format.indexEnd}`,
                    },
                    elements: [
                        {
                            type: "element",
                            name: "Initialization",
                            attributes: {
                                range: `${Format.initStart}-${Format.initEnd}`,
                            },
                        },
                    ],
                },
            ],
        };
        return representation;
    },
};

export default DashUtils;
