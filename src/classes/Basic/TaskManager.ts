

class TaskManager<State, Task> {
    private _state: State;

    constructor(state: State) {
        this._state = state;
    }

    get state(): State {
        return this._state;
    }

    set state(state: State) {
        this._state = state;
    }

}