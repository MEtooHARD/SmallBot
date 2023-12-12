const doAfterSec = async (callback: Function, sec: number) => {
    setTimeout(async () => {
        switch (Object.prototype.toString.call(callback)) {
            case '[object Function]':
                callback();
                break;
            case '[object AsyncFunction]':
                await callback();
                break;
        }
    }, sec * 1000);
    return null;
}

export {
    doAfterSec,
}