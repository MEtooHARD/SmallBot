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

const delaySec = (sec: number) => new Promise(resolve => setTimeout(resolve, sec * 1000));

export {
  doAfterSec,
  delaySec
}