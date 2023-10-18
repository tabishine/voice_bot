// import { Telegraf } from "telegraf";
// import { message } from "telegraf/filters";
// import { code } from "telegraf/format";
// import { ogg } from "./ogg";
// import { removeFile } from "./utils";
// import { openai } from "./openai";

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

import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { code } from "telegraf/format";
import { ogg } from "./ogg";
import { removeFile } from "./utils";
import { openai } from "./openai";
import { TimeoutError } from "p-timeout";

const bot = new Telegraf("6660916718:AAG27NzmSg7opLkxMySu3nmCQNpzvnsipKc");
// сохраняет сообщения пользователя
const userMessages: { [key: string]: string[] } = {};

bot.command("start", async (ctx) => {
  // const userId = String(ctx.message.from.id);
  const userFirstName = ctx.message.from.first_name;
  await ctx.reply(`Привет, ${userFirstName}! Я - бот-помощник, готовый принимать и обрабатывать аудио-сообщения. Просто отправь мне аудио-сообщение, и я постараюсь ответить на твой вопрос. Также у меня есть секретное слово - "создай техническое задание". Если ты произнесешь это слово, я помогу тебе создать Техническое Задание для разработчиков. Попробуй, и у тебя получится!`);

})

bot.on(message("voice"), async (ctx) => {
  const userId = String(ctx.message.from.id);
  // если пользователь новый, создаем массив для его сообщений
  if (!userMessages[userId]) {
    userMessages[userId] = [];
  }

  try {
    await ctx.reply(code("Аудио получено, ваше аудио обрабатывается.."));
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    //конвертация аудио ogg формата в mp3

    const mp3Path = await ogg.toMp3(oggPath, userId);
    removeFile(oggPath);
    const text = await openai.transcribeAudio(mp3Path);
    console.log(text);
    await ctx.reply(code(`Ваш вопрос: ${text}`));

    userMessages[userId].push(text);

    if ( text.toLowerCase().includes("создай техническое задание")) {
      const concatenatedText = userMessages[userId].join(" ");
      userMessages[userId] = [];
      const technicalTask = await generateTechnicalTaskFromTranscriptions([
        concatenatedText,
      ]);
      await ctx.reply(code(`Техническое задание: ${technicalTask}`));
      clearUserMessages(userId);
    } else {
      if (userMessages[userId].length > 0) {
        const messages = userMessages[userId].map((userMessage) => ({
          role: "user",
          content: userMessage,
        }));
        
        const response = await openai.chatWithChatgpt(messages);
        if (response) {
          await ctx.reply(response);
        } else {
          console.error(`Error while processing voice message: Response is null.`);
        }
      } else {
        const response = await openai.chatWithChatgpt([
          { role: "system", content: "You are a helpful assistant" },
          { role: "user", content: text },
        ]);
        if (response) {
          await ctx.reply(response);
        } else {
          console.error(`Error while processing voice message: Response is null.`);
        }
      }
    }
  } catch (e: any) {
    if (e instanceof TimeoutError) {
      console.error(`Timeout Error: ${e.message}. Continuing...`);
    } else {
      console.error(`Error while processing voice message`, e.message);
    }

  }
});
  
bot.launch();
console.log("Bot is running...");

//функция для очистки массива сообщений пользователя
function clearUserMessages(userId: string) {
    if (userMessages[userId]) {
      userMessages[userId] = [];
    }
  }

  async function generateTechnicalTaskFromTranscriptions(transcriptions: string[]) {
    const messages = transcriptions.map((transcription) => ({
      role: "user",
      content: transcription,
    }));

    messages.push({
      role: "system",
      content: "You should create a technical specification for the developer using all this data and divide into steps and format the answer beautifully on russian language",
    });
  
    const response = await Promise.race([
        openai.chatWithChatgpt(messages),
        new Promise((_, reject) => setTimeout(() => reject("Timeout"), 1800000),)
      ]);
  
    return response;
}

  