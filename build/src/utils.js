"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFile = void 0;
const promises_1 = require("fs/promises");
async function removeFile(path) {
    try {
        await (0, promises_1.unlink)(path);
    }
    catch (e) {
        console.log("Error while removing file", e.message);
    }
}
exports.removeFile = removeFile;
//# sourceMappingURL=utils.js.map