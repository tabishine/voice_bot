"use strict";
// import { Telegraf } from "telegraf";
// import { message } from "telegraf/filters";
// import { code } from "telegraf/format";
// import { ogg } from "./ogg";
// import { removeFile } from "./utils";
// import { openai } from "./openai";
Object.defineProperty(exports, "__esModule", { value: true });
// const bot = new Telegraf("6660916718:AAG27NzmSg7opLkxMySu3nmCQNpzvnsipKc");
// bot.on(message("voice"), async (ctx) => {
//   try {
//     await ctx.reply(code("Аудио получено, ваше аудио обрабатывается.."));
//     const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
//     console.log(link);
//     const userId = String(ctx.message.from.id);
//     const oggPath = await ogg.create(link.href, userId);
//     const mp3Path = await ogg.toMp3(oggPath, userId);
//     removeFile(oggPath);
//     const text = await openai.transcribeAudio(mp3Path);
//     console.log(text);
//     await ctx.reply(code(`Транскрипция: ${text}`));
//     const messages = [
//       { role: "system", content: "You are a helpful assistant" },
//       { role: "user", content: text },
//     ];
//     const response = await openai.chat(messages);
//     if (response) {
//       await ctx.reply(response);
//     } else {
//       console.error(`Error while processing voice message: Response is null.`);
//     }
//   } catch (e: any) {
//     console.error(`Error while processing voice message`, e.message);
//   }
// });
// bot.launch();
// console.log("Bot is running...");
//тут код без условия с техническим заданием 
const telegraf_1 = require("telegraf");
const filters_1 = require("telegraf/filters");
const format_1 = require("telegraf/format");
const ogg_1 = require("./ogg");
const utils_1 = require("./utils");
const openai_1 = require("./openai");
const transcribeQueue_1 = require("../queues/transcribeQueue");
const bullmq_1 = require("bullmq");
const responseQueue_1 = require("../queues/responseQueue");
//queue processes, worker mode on 
transcribeQueue_1.transcribeAudioQueue.process(async (job) => {
    const { mp3Path } = job.data;
    const text = await openai_1.openai.transcribeAudio(mp3Path);
    return text;
});
//  Bull worker process to listen for and process jobs
const transcribeWorker = new bullmq_1.Worker("send-transcribe-jobdata", async (job) => {
    const { mp3Path } = job.data;
    const text = await openai_1.openai.transcribeAudio(mp3Path);
    return text;
});
transcribeWorker.on('completed', (job) => {
    console.log(`TRANSCRIBING AUDIO ${job.id} completed`);
});
//response queue
responseQueue_1.responseMessageQueue.process(async (job) => {
    const { messages } = job.data;
    const response = await openai_1.openai.chatWithChatgpt(messages);
    return response;
});
const responseWorker = new bullmq_1.Worker("send-transcribe-jobdata", async (job) => {
    const { messages } = job.data;
    const response = await openai_1.openai.chatWithChatgpt(messages);
    return response;
});
responseWorker.on('completed', (job) => {
    console.log(`CHAT WITH CHATGPT ${job.id} completed`);
});
const bot = new telegraf_1.Telegraf("6660916718:AAG27NzmSg7opLkxMySu3nmCQNpzvnsipKc");
// сохраняет сообщения пользователя
const userMessages = {};
bot.command("start", async (ctx) => {
    const userId = String(ctx.message.from.id);
    const userFirstName = ctx.message.from.first_name;
    if (!userMessages[userId]) {
        await ctx.reply(`Привет, ${userFirstName}! Я - бот-помощник, готовый принимать и обрабатывать аудио-сообщения. Просто отправь мне аудио-сообщение, и я постараюсь ответить на твой вопрос. Также у меня есть секретное слово - "создай техническое задание". Если ты произнесешь это слово, я помогу тебе создать Техническое Задание для разработчиков. Попробуй, и у тебя получится!`);
        userMessages[userId] = [];
    }
    else {
        await ctx.reply(`С возвращением, ${userFirstName}! Чем я могу вам помочь?`);
    }
});
bot.on((0, filters_1.message)("voice"), async (ctx) => {
    const userId = String(ctx.message.from.id);
    // если пользователь новый, создаем массив для его сообщений
    if (!userMessages[userId]) {
        userMessages[userId] = [];
    }
    try {
        await ctx.reply((0, format_1.code)("Аудио получено, ваше аудио обрабатывается.."));
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const userId = String(ctx.message.from.id);
        const oggPath = await ogg_1.ogg.create(link.href, userId);
        //конвертация аудио ogg формата в mp3
        const mp3Path = await ogg_1.ogg.toMp3(oggPath, userId);
        (0, utils_1.removeFile)(oggPath);
        const transcribeJob = await transcribeQueue_1.transcribeAudioQueue.add({ mp3Path });
        const text = await transcribeJob.finished();
        // const text = await openai.transcribeAudio(mp3Path);   //last version of 
        console.log(text, "transcribing audio in queue is finished");
        await ctx.reply((0, format_1.code)(`Ваш вопрос: ${text}`));
        userMessages[userId].push(text);
        if (text.toLowerCase().includes("создай техническое задание")) {
            const concatenatedText = userMessages[userId].join(" ");
            userMessages[userId] = [];
            const technicalTask = await generateTechnicalTaskFromTranscriptions([
                concatenatedText,
            ]);
            await ctx.reply((0, format_1.code)(`Техническое задание: ${technicalTask}`));
            clearUserMessages(userId);
        }
        else {
            if (userMessages[userId].length > 0) {
                const messages = userMessages[userId].map((userMessage) => ({
                    role: "user",
                    content: userMessage,
                }));
                const responseJob = await responseQueue_1.responseMessageQueue.add({ messages });
                const response = await responseJob.finished();
                console.log(response, "response in queue is finished");
                if (response) {
                    await ctx.reply(response);
                }
                else {
                    console.error(`Error while processing voice message: Response is null.`);
                }
            }
            else {
                const response = await openai_1.openai.chatWithChatgpt([
                    { role: "system", content: "You are a helpful assistant" },
                    { role: "user", content: text },
                ]);
                if (response) {
                    await ctx.reply(response);
                }
                else {
                    console.error(`Error while processing voice message: Response is null.`);
                }
            }
        }
    }
    catch (e) {
        // console.error(`Timeout Error: ${e.message}. Continuing...`);
        console.error(`Error while processing voice message (T)`, e.message);
    }
});
bot.launch();
console.log("Bot is running...");
//функция для очистки массива сообщений пользователя
function clearUserMessages(userId) {
    if (userMessages[userId]) {
        userMessages[userId] = [];
    }
}
async function generateTechnicalTaskFromTranscriptions(transcriptions) {
    const messages = transcriptions.map((transcription) => ({
        role: "user",
        content: transcription,
    }));
    messages.push({
        role: "system",
        content: "You should create a technical specification for the developer using all this data and divide into steps and format the answer beautifully on russian language",
    });
    const response = await Promise.race([
        openai_1.openai.chatWithChatgpt(messages),
        new Promise((_, reject) => setTimeout(() => reject("Timeout"), 180000))
    ]);
    return response;
}
//# sourceMappingURL=main.js.map