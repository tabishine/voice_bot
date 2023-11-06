"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ogg = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const path_1 = require("path");
const https_1 = __importDefault(require("https"));
const fs_1 = require("fs");
const path_2 = require("path");
class OggConverter {
    constructor() {
        fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
    }
    async toMp3(input, output) {
        try {
            const outputPath = (0, path_1.resolve)((0, path_2.dirname)(input), `${output}.mp3`);
            return new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(input)
                    .inputOption("-t 30")
                    .output(outputPath)
                    .on("end", () => resolve(outputPath))
                    .on("error", (err) => reject(err.message))
                    .run();
            });
        }
        catch (e) {
            console.log("Error while creating mp3", e);
            throw e;
        }
    }
    async create(url, filename) {
        try {
            const directoryPath = "/Users/tabishine/Desktop/voice_bot/build/src/voices/";
            (0, fs_1.mkdirSync)(directoryPath, { recursive: true });
            const oggPath = (0, path_1.resolve)(directoryPath, `${filename}.oga`);
            return new Promise((resolve, reject) => {
                const fileStream = (0, fs_1.createWriteStream)(oggPath);
                const request = https_1.default.get(url, (response) => {
                    response.pipe(fileStream);
                    fileStream.on("finish", () => {
                        fileStream.close();
                        resolve(oggPath);
                    });
                });
                request.on("error", (err) => {
                    fileStream.close();
                    reject(err);
                });
            });
        }
        catch (err) {
            console.error("Error while creating ogg", err.message);
            throw err;
        }
    }
}
exports.ogg = new OggConverter();
//# sourceMappingURL=ogg.js.map