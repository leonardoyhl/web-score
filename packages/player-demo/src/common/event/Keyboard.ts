
export enum KeyCode {
    Backspace = 8,
    Tab = 9,
    Clear = 12,
    Enter = 13,
    Shift = 16,
    Control = 17,
    Alt = 18,
    /** 大小写切换 */
    CapsLock = 20,
    /** Escape */
    Esc = 27,
    Space = 32,
    PageUp = 33,
    PageDown = 34,
    End = 35,
    Home = 36,
    ArrowLeft = 37,
    ArrowUp = 38,
    ArrowRight = 39,
    ArrowDown = 40,
    Delete = 46,
    /**
     * `Windows`
     */
    Meta = 91,
    NumLock = 144,
    Process = 229,
}

class KeyBoard {
    constructor(
        public key: string,
        public keyCode: number,
    ) { }
}

export const Keyboard = {
    Enter: new KeyBoard("Enter", 13),
}
