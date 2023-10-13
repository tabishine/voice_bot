"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_1 = require("openai");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
class MyOpenAI {
    openai;
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.openai = new openai_1.OpenAI({ apiKey: this.apiKey });
    }
    async chatWithChatgpt(messages) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages,
            });
            return response.choices[0].message.content;
        }
        catch (error) {
            console.error("Error while chat", error.message);
            throw error;
        }
    }
    async transcribeAudio(filepath) {
        try {
            const form = new form_data_1.default();
            form.append("file", fs_1.default.createReadStream(filepath));
            form.append("model", "whisper-1");
            const response = await axios_1.default.post("https://api.openai.com/v1/audio/transcriptions", form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            const responseTranscribe = response.data.text;
            console.log("Transcription:", responseTranscribe);
            return responseTranscribe;
        }
        catch (error) {
            console.error("Error while transcribing audio:", error.message);
        }
    }
}
const apiKey = "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";
exports.openai = new MyOpenAI(apiKey);
//# sourceMappingURL=openai.js.map