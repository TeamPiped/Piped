export default {
    timeFormat: function (duration) {
        var pad = function (num, size) {
            return ("000" + num).slice(size * -1);
        };

        var time = parseFloat(duration).toFixed(3),
            hours = Math.floor(time / 60 / 60),
            minutes = Math.floor(time / 60) % 60,
            seconds = Math.floor(time - minutes * 60);

        var str = "";

        if (hours > 0) str += pad(hours, 2) + ":";

        str += pad(minutes, 2) + ":" + pad(seconds, 2);

        return str;
    }
}
