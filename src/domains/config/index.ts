export class ConfigMod{
    
    private static redis = 'redis://127.0.0.1:6379';
      public static getRedisUrl(): string{
         return ConfigMod.redis;
      }
 }
 