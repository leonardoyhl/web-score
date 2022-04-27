import debounce from "lodash-es/debounce";
import { EventDispatcher } from "./EventDispatcher";

const isOSX = /(Mac)? OS X/i.test(navigator?.userAgent || "");

export interface KeyboardShortcut {
    command: string;
    key: string;
    /**
     * 忽略大小写, 默认`true`
     */
    ignoreCase?: boolean;
    // when?: string;
}

function unique(shortcuts: KeyboardShortcut[]) {
    const commands: string[] = [];
    return shortcuts.reduce((prev, cur) => {
        if (commands.indexOf(cur.command) >= 0) {
            return prev;
        }
        commands.push(cur.command);
        prev.push(cur);
        return prev;
    }, [] as KeyboardShortcut[]);
}

/**
 * redeclare
 */
export interface KeyBinding extends EventDispatcher<KeyboardEvent> {
    /**
     * register handler for special/designative command
     * @param command 
     * @param handler 
     */
    on(command: string, handler: (e: KeyboardEvent) => any): void;

    /**
     * remove handler for special/designative command
     * @param command 
     * @param handler 
     * @returns 
     */
    off(command: string, handler: (e: KeyboardEvent) => any): void;
}

/**
 * Hot Keys, Keyboard shortcuts
 */
export class KeyBinding extends EventDispatcher<KeyboardEvent> {
    private shortcuts: KeyboardShortcut[] = [];

    constructor(
        private hostElement: HTMLElement,
    ) {
        super();
    }

    /**
     * begin to listen keyboard event
     */
    listen() {
        this.hostElement.addEventListener("keydown", this.debouncedOnKeyDown);
    }

    /**
     * stop to listen keyboard event
     */
    unlisten() {
        this.debouncedOnKeyDown.cancel();
        this.hostElement.removeEventListener("keydown", this.debouncedOnKeyDown);
    }

    /**
     * bind keyboard shortcuts config
     * @param shortcuts 
     */
    bind(shortcuts: KeyboardShortcut[]) {
        const all = this.shortcuts.concat(shortcuts);
        this.shortcuts = unique(all);
    }

    /**
     * clear all cached handlers, and keyboard shortcuts config
     */
    clear() {
        super.clear();
        this.shortcuts = [];
    }

    private onKeyDown = (e: KeyboardEvent) => {
        // TODO：支持类似VS Code的组合快捷键，两次连续操作
        if (this.handlers.size < 1) return;
        const key = this.analysis(e);
        const commands = this.shortcuts.filter(item => {
            // 大小写敏感
            if (item.ignoreCase === false) {
                return item.key === key;
            }
            return item.key.toUpperCase() === key.toUpperCase();
        }).map(item => item.command);
        commands.forEach(command => {
            this.dispatch(command, e);
        });
    }

    private debouncedOnKeyDown = debounce(this.onKeyDown, 200);

    private analysis(e: KeyboardEvent) {
        let keys = [];
        if (e.ctrlKey) {
            keys.push("Ctrl");
        }
        if (e.altKey) {
            keys.push("Alt");
        }
        if (e.shiftKey) {
            keys.push("Shift");
        }
        if (e.metaKey) {
            if (isOSX) {
                keys.push("Cmd");
            } else {
                keys.push("Win");
            }
        }
        if (e.key !== "Control" && e.key !== "Meta" && keys.indexOf(e.key) < 0) {
            keys.push(e.key);
        }
        return keys.join("+");
    }
}
