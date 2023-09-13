export const isEmail = input => {
    // Taken from https://emailregex.com
    const result = input.match(
        //eslint-disable-next-line
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
    return result;
};

export const parseTimeParam = time => {
    let start = 0;
    if (/^[\d]*$/g.test(time)) {
        start = time;
    } else {
        const hours = /([\d]*)h/gi.exec(time)?.[1];
        const minutes = /([\d]*)m/gi.exec(time)?.[1];
        const seconds = /([\d]*)s/gi.exec(time)?.[1];
        if (hours) {
            start += parseInt(hours) * 60 * 60;
        }
        if (minutes) {
            start += parseInt(minutes) * 60;
        }
        if (seconds) {
            start += parseInt(seconds);
        }
    }
    return start;
};
