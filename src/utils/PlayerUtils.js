export const shouldUseAudioOnlyElement = (preferListen, isLivestream) => {
    return preferListen && !isLivestream;
};

export const selectLegacyStream = (videoStreams, isAudioOnly) => {
    const legacyStreams = videoStreams.filter(stream => stream.codec == null);
    const audioCapableStream = isAudioOnly && legacyStreams.findLast(stream => !stream.videoOnly);
    return audioCapableStream || legacyStreams.at(-1);
};
