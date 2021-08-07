import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import redis from 'redis';

import logger from './utlis/logger.js';
import * as poll from './services/poll.js';
import * as meme from './services/meme.js';
import * as time from './services/time.js';
import * as help from './services/help.js';
import * as quote from './services/quote.js';
import * as covid from './services/covid.js';
import * as snap from './services/snap.js';
import * as blidingej from './services/bliding-ej.js';
import * as evalBot from './services/eval.js';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env');
dotenv.config({ path: envPath });

const bot = new Telegraf(process.env.BOT_TOKEN);
const cache = redis.createClient(String(process.env.REDIS_URL));

// Handle bot error globally
// Register it first before register any other commands
bot.catch((err) => {
  logger.captureException(err);
});

const commands = [
  meme.register(bot),
  time.register(bot),
  help.register(bot),
  quote.register(bot),
  covid.register(bot, cache),
  poll.register(cache, bot),
  snap.register(bot),
  blidingej.register(bot),
  evalBot.register(bot),
]
  .filter((v) => Array.isArray(v))
  .flat();

bot.telegram.setMyCommands(commands);

// TODO: Handle command not found

if (process.env.NODE_ENV === 'development') {
  // We don't need this again in production
  bot.launch();
} else {
  bot.telegram.setWebhook(process.env.VERCEL_URL);
}

export default bot.webhookCallback('/');
