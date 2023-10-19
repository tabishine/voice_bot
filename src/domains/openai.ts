import { OpenAI } from "openai";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { text } from "telegraf/typings/button";

class MyOpenAI {
  private openai: OpenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.openai = new OpenAI({ apiKey: this.apiKey });
  }

  async chatWithChatgpt(messages: any[]) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
      });
      return response.choices[0].message.content;
    } catch (error: any) {
      console.error("Error while chat", error.message);
      throw error;
    } 
  }

  async transcribeAudio(filepath: string) {
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(filepath));
      form.append("model", "whisper-1");

      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );
 
      const responseTranscribe = await Promise.race([
        response.data.text,
        new Promise((_, reject) => setTimeout(() => reject("Timeout"), 1800000),)
       ]);
       
      console.log("Transcription:", responseTranscribe);
      return responseTranscribe;
    } catch (error: any) {
      console.error("Error while transcribing audio:", error.message);
    }
  }
}

const apiKey = "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";
export const openai = new MyOpenAI(apiKey);
