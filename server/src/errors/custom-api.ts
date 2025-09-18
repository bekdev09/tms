export class CustomApiError extends Error {
    constructor(message: string) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = new.target.name;
        // console.dir(this, { depth: null });
        // console.dir(new.target, { depth: null });
    }
}