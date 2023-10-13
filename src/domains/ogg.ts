import ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";
import { resolve } from "path";
import { WriteStream } from "fs";
import https from "https";
import { createWriteStream, mkdirSync } from "fs";
import { dirname } from "path";

class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  async toMp3(input: string, output: string): Promise<string> {
    try {
      const outputPath = resolve(dirname(input), `${output}.mp3`);
      return new Promise<string>((resolve, reject) => {
        ffmpeg(input)
          .inputOption("-t 30")
          .output(outputPath)
          .on("end", () => resolve(outputPath))
          .on("error", (err: Error) => reject(err.message))
          .run();
      });
    } catch (e) {
      console.log("Error while creating mp3", e);
      throw e;
    }
  }

  async create(url: string, filename: string): Promise<string> {
    try {
      const directoryPath =
        "/Users/tabishine/Desktop/voice_bot/build/src/voices/";
      mkdirSync(directoryPath, { recursive: true });
      const oggPath = resolve(directoryPath, `${filename}.oga`);
      return new Promise<string>((resolve, reject) => {
        const fileStream: WriteStream = createWriteStream(oggPath);
        const request = https.get(url, (response) => {
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
    } catch (err: any) {
      console.error("Error while creating ogg", err.message);
      throw err;
    }
  }
}

export const ogg = new OggConverter();
