// first: Returns the first element of an array, or undefined if empty
Object.defineProperty(Array.prototype, "first", {
    value: function () {
        return this.length > 0 ? this[0] : undefined;
    },
    enumerable: false,
    writable: true,
    configurable: true,
});

// last: Returns the last element of an array, or undefined if empty
Object.defineProperty(Array.prototype, "last", {
    value: function () {
        return this.length > 0 ? this[this.length - 1] : undefined;
    },
    enumerable: false,
    writable: true,
    configurable: true,
});

// unique: Returns a new array with only unique values
Object.defineProperty(Array.prototype, "unique", {
    value: function () {
        return [...new Set(this)];
    },
    enumerable: false,
    writable: true,
    configurable: true,
});
