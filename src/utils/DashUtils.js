// Based of https://github.com/GilgusMaximus/yt-dash-manifest-generator/blob/master/src/DashGenerator.js
import { XMLBuilder } from "fast-xml-parser";

export function generate_dash_file_from_formats(VideoFormats, VideoLength) {
    const generatedJSON = generate_xmljs_json_from_data(VideoFormats, VideoLength);
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        suppressBooleanAttributes: false,
        attributeNamePrefix: "_",
    });
    return builder.build(generatedJSON);
}

function generate_xmljs_json_from_data(VideoFormatArray, VideoLength) {
    const convertJSON = {
        "?xml": {
            _version: "1.0",
            _encoding: "utf-8",
            MPD: {
                _xmlns: "urn:mpeg:dash:schema:mpd:2011",
                _profiles: "urn:mpeg:dash:profile:full:2011",
                _minBufferTime: "PT1.5S",
                _type: "static",
                _mediaPresentationDuration: `PT${VideoLength}S`,
                Period: {
                    AdaptationSet: generate_adaptation_set(VideoFormatArray),
                },
            },
        },
    };
    return convertJSON;
}

function generate_adaptation_set(VideoFormatArray) {
    const adaptationSets = [];

    let mimeAudioObjs = [];

    VideoFormatArray.forEach(videoFormat => {
        // the dual formats should not be used
        if (
            (videoFormat.mimeType.includes("video") && !videoFormat.videoOnly) ||
            videoFormat.mimeType.includes("application")
        ) {
            return;
        }

        const audioTrackId = videoFormat.audioTrackId;
        const mimeType = videoFormat.mimeType;

        for (let i = 0; i < mimeAudioObjs.length; i++) {
            const mimeAudioObj = mimeAudioObjs[i];

            if (mimeAudioObj.audioTrackId == audioTrackId && mimeAudioObj.mimeType == mimeType) {
                mimeAudioObj.videoFormats.push(videoFormat);
                return;
            }
        }

        mimeAudioObjs.push({
            audioTrackId,
            mimeType,
            videoFormats: [videoFormat],
        });
    });

    mimeAudioObjs.forEach(mimeAudioObj => {
        const adapSet = {
            _id: mimeAudioObj.audioTrackId,
            _lang: mimeAudioObj.audioTrackId?.substr(0, 2),
            _mimeType: mimeAudioObj.mimeType,
            _startWithSAP: "1",
            _subsegmentAlignment: "true",
            Representation: [],
        };

        let isVideoFormat = false;

        if (mimeAudioObj.mimeType.includes("video")) {
            isVideoFormat = true;
            adapSet["_scanType"] = "progressive";
        }

        for (var i = 0; i < mimeAudioObj.videoFormats.length; i++) {
            const videoFormat = mimeAudioObj.videoFormats[i];
            if (isVideoFormat) {
                adapSet.Representation.push(generate_representation_video(videoFormat));
            } else {
                adapSet.Representation.push(generate_representation_audio(videoFormat));
            }
        }

        adaptationSets.push(adapSet);
    });
    return adaptationSets;
}

function generate_representation_audio(Format) {
    const representation = {
        _id: Format.itag,
        _codecs: Format.codec,
        _bandwidth: Format.bitrate,
        AudioChannelConfiguration: {
            _schemeIdUri: "urn:mpeg:dash:23003:3:audio_channel_configuration:2011",
            _value: "2",
        },
        BaseURL: Format.url,
        SegmentBase: {
            _indexRange: `${Format.indexStart}-${Format.indexEnd}`,
            Initialization: {
                _range: `${Format.initStart}-${Format.initEnd}`,
            },
        },
    };
    return representation;
}

function generate_representation_video(Format) {
    const representation = {
        _id: Format.itag,
        _codecs: Format.codec,
        _bandwidth: Format.bitrate,
        _width: Format.width,
        _height: Format.height,
        _maxPlayoutRate: "1",
        _frameRate: Format.fps,
        BaseURL: Format.url,
        SegmentBase: {
            _indexRange: `${Format.indexStart}-${Format.indexEnd}`,
            Initialization: {
                _range: `${Format.initStart}-${Format.initEnd}`,
            },
        },
    };
    return representation;
}
