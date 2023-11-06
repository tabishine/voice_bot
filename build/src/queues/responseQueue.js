"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseMessageQueue = exports.queueOptions = void 0;
//transcribe user's audio in the Queue: 
const bull_1 = __importDefault(require("bull"));
const config_1 = require("../domains/config");
const redisUrl = config_1.ConfigMod.getRedisUrl();
exports.queueOptions = {
    redis: redisUrl,
};
exports.responseMessageQueue = new bull_1.default("send-message-jobdata", exports.queueOptions);
//# sourceMappingURL=responseQueue.js.map