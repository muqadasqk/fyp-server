// equals: Checks if two strings are strictly equal
Object.defineProperty(String.prototype, "equals", {
    value: function (target) {
        return String(this) === String(target);
    },
    enumerable: false,
    writable: true,
    configurable: true,
});

// cap: Capitalizes the first letter of a string
Object.defineProperty(String.prototype, "cap", {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false,
    writable: true,
    configurable: true,
});

// capEach: Capitalizes the first letter of each word in a string
Object.defineProperty(String.prototype, "capEach", {
    value: function () {
        return this.split(/\s+/g).map((word) => word.cap()).join(" ");
    },
    enumerable: false,
    writable: true,
    configurable: true,
});

// concat: Concatenates the given arguments to the string
Object.defineProperty(String.prototype, "concat", {
    value: function (...args) {
        return args.reduce((acc, current) => acc + String(current), this);
    },
    enumerable: false,
    writable: true,
    configurable: true,
});

// slug: Converts a string into a URL-friendly slug
Object.defineProperty(String.prototype, "slug", {
    value: function () {
        return this.trim().toLowerCase().replace(/\s+/g, "-");
    },
    enumerable: false,
    writable: true,
    configurable: true,
});

// splitCamelCase: Splits camelCase words into separate words
Object.defineProperty(String.prototype, "splitCamelCase", {
    value: function () {
        return this.replace(/([a-z])([A-Z])/g, "$1 $2").trim();
    },
    enumerable: false,
    writable: true,
    configurable: true,
});
