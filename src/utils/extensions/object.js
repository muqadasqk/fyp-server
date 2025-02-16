// entryAt: Safely retrieve an entry at a specific index
Object.defineProperty(Object.prototype, "entryAt", {
    value: function (index) {
        const entries = Object.entries(this);
        return index >= 0 && index < entries.length ? entries[index] : undefined;
    },
    enumerable: false,
    writable: true,
    configurable: true,
});

// only: Returns an object with only the specified fields
Object.defineProperty(Object.prototype, "only", {
    value: function (fields, isMongooseObject = false) {
        let obj = this;
        if (isMongooseObject && typeof obj.toObject === "function") {
            obj = obj.toObject();
        }

        return fields.reduce((acc, field) => {
            if (Object.hasOwn(obj, field)) {
                acc[field] = obj[field];
            }
            return acc;
        }, {});
    },
    enumerable: false,
    writable: true,
    configurable: true,
});

// except: Returns an object excluding the specified fields
Object.defineProperty(Object.prototype, "except", {
    value: function (fields, isMongooseObject = false) {
        let obj = this;
        if (isMongooseObject && typeof obj.toObject === "function") {
            obj = obj.toObject();
        }

        return Object.keys(obj).reduce((acc, field) => {
            if (!fields.includes(field)) {
                acc[field] = obj[field];
            }
            return acc;
        }, {});
    },
    enumerable: false,
    writable: true,
    configurable: true,
});

// available: Checks if a field exists and optionally if it's non-null
Object.defineProperty(Object.prototype, "available", {
    value: function (field, checkNull = false) {
        if (!Object.hasOwn(this, field)) return false;
        return checkNull ? this[field] !== null : true;
    },
    enumerable: false,
    writable: true,
    configurable: true,
});
