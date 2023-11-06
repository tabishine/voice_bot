//transcribe user's audio in the Queue: 
import Queue, { QueueOptions } from "bull";
import { ConfigMod } from "../domains/config";


const redisUrl = ConfigMod.getRedisUrl();

export type sendMessageJobData = {
   messages: any[];
  };

export const queueOptions: QueueOptions = {
    redis: redisUrl,
  };

export const responseMessageQueue = new Queue<sendMessageJobData>("send-message-jobdata", queueOptions );
