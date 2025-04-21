import { AnyFunction } from "./GeneralTypes";


type TimerOptions = {
    func: AnyFunction;
    time: number;
}

export class Timer {
    private _code: ReturnType<typeof setTimeout> | undefined;
    private _target: number | undefined;
    private _remain: number = -1;

    constructor(options: TimerOptions | undefined) {
        if (options !== undefined) {
            this._code = setTimeout(options.func, options.time);
            this._target = options.time + Date.now();
            this._remain = options.time;
        }
    }

    isRunning(): boolean { return this._code !== undefined }

    clearTimer() {
        clearTimeout(this._code);
        this._code = undefined;
    }

    pause() {
        if (this._code !== undefined) {
            this.clearTimer();
            this._remain = this._target! - Date.now();
        }
    }

    resume() {

    }
}