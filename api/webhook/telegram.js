import 'dotenv/config';
import { Telegraf } from 'telegraf';
import redis from 'redis';

// import logger from '../../src/utlis/logger.js';
import * as poll from '../../src/services/poll.js';
import * as meme from '../../src/services/meme.js';
import * as time from '../../src/services/time.js';
import * as help from '../../src/services/help.js';
import * as quote from '../../src/services/quote.js';
import * as covid from '../../src/services/covid.js';
import * as snap from '../../src/services/snap.js';
import * as blidingej from '../../src/services/bliding-ej.js';
import * as evalBot from '../../src/services/eval.js';

const webhookEndpoint = '/api/webhook/telegram';

const bot = new Telegraf(process.env.BOT_TOKEN);

try {
  const cache = redis.createClient(String(process.env.REDIS_URL));

  // Handle bot error globally
  // Register it first before register any other commands
  bot.catch((err) => {
    // TODO: Format the error
    console.error(err);

    // We doesn't need sentry again.
    // logger.captureException(err);
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
    const hookEndpoint = `${process.env.VERCEL_URL}${webhookEndpoint}`;
    console.info(`Setting Telegram webhook to ${hookEndpoint}`);
    bot.telegram.setWebhook(hookEndpoint);
  }
} catch (error) {
  console.error(error);
}

export default bot.webhookCallback(webhookEndpoint);
