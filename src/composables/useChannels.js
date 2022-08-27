export function isChannelBlocked(channelId) {
    const blockedChannels = localStorage.getItem("blockedChannels");
    if (!blockedChannels) return false;
    return blockedChannels.split(",").includes(channelId.replace("/channel/", ""));
}
