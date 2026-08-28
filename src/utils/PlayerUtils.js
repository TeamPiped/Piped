export const shouldUseAudioOnlyElement = (preferListen, isLivestream) => {
    return preferListen && !isLivestream;
};
