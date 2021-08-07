import { generateImage } from './utils.js';

function mentionOrFullname(user) {
  return user.username ? `@${user.username}` : `${user.first_name} ${user.from.last_name}`;
}

/**
 * Send daily quote.
 * @param {import('telegraf').Context} context
 * @returns {Promise<void>}
 */
async function snap(context) {
  if (context.message.reply_to_message) {
    const replyMessage = context.message.reply_to_message;
    const isOwner = context.message.from.id === replyMessage.from.id;

    if (!replyMessage.text) {
      await context.reply('`/snap` can only be used on plain texts', { parse_mode: 'MarkdownV2' });
      return;
    }

    const code = replyMessage.text;

    await context.replyWithPhoto(
      {
        source: await generateImage(code),
      },
      {
        caption: `From ${mentionOrFullname(replyMessage.from)}${
          isOwner ? '' : `, Snapped by ${mentionOrFullname(context.message.from)}.`
        }`,
        reply_to_message_id: !isOwner && replyMessage.message_id,
      },
    );

    // Snap message
    await context.deleteMessage(context.message.message_id);

    if (isOwner) {
      // Target message to snap
      await context.deleteMessage(replyMessage.message_id);
    }
  }
}

/**
 * Send daily quote.
 * @param {import('telegraf').Telegraf} bot
 */
export function register(bot) {
  bot.command('snap', snap);

  return [
    {
      command: 'snap',
      description: 'Screenshot the code in the reply message.',
    },
  ];
}
