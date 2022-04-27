
export class EventDispatcher<E = Event> {
    protected handlers = new Map<string, ((e: E) => any)[]>();

    /**
     * register handler for special/designative event type
     * @param type 
     * @param handler 
     */
     on(type: string, handler: (e: E) => any) {
        if(!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }
        const handlersOfThis = this.handlers.get(type)!;
        // avoid duplication
        if (handlersOfThis.indexOf(handler) < 0) {
            handlersOfThis.push(handler);
        }
    }

    /**
     * remove handler for special/designative event type
     * @param type 
     * @param handler 
     * @returns 
     */
    off(type: string, handler: (e: E) => any) {
        if(!this.handlers.has(type)) return;
        const handlersOfThis = this.handlers.get(type)!;
        const index = handlersOfThis.indexOf(handler);
        if (index >= 0) {
            handlersOfThis.splice(index, 1);
        }
    }

    /**
     * clear all cached event handlers
     */
    clear() {
        this.handlers.clear();
    }

    /**
     * dispatch event when the type of event happended
     * @param type 
     * @param e 
     * @returns 
     */
    protected dispatch(type: string, e: E) {
        if(!this.handlers.has(type)) return;
        const handlersOfThis = this.handlers.get(type)!;
        handlersOfThis.forEach(handler => {
            handler.call(this, e);
        });
    }
}
