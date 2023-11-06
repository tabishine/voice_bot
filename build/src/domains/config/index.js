"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigMod = void 0;
class ConfigMod {
    static redis = 'redis://127.0.0.1:6379';
    static getRedisUrl() {
        return ConfigMod.redis;
    }
}
exports.ConfigMod = ConfigMod;
//# sourceMappingURL=index.js.map