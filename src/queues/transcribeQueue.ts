
//transcribe user's audio in the Queue: 
import Queue, { QueueOptions } from "bull";
import { ConfigMod } from "../domains/config";


const redisUrl = ConfigMod.getRedisUrl();

export type sendTranscribeJobData = {
   mp3Path: string;
  };

export const queueOptions: QueueOptions = {
    redis: redisUrl,
  };

export const transcribeAudioQueue = new Queue<sendTranscribeJobData>("send-transcribe-jobdata", queueOptions );


