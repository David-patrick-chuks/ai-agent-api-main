import TelegramBot from 'node-telegram-bot-api';
import { askAgent } from './agentApiService';

// Bot instances map per agent
const bots: Record<string, TelegramBot> = {};
const botStatus: Record<string, string> = {};

export function logMonitor(agentId: string, message: string) {
  console.log(`[Telegram][${agentId}] ${message}`);
}

// Create and configure bot instance
export function createBot(botToken: string, agentId: string): TelegramBot {
  const bot = new TelegramBot(botToken, {
    polling: false, // We use webhooks, not polling
    webHook: {
      port: 0 // We don't need the built-in webhook server
    }
  });

  // Add error handling
  bot.on('error', (error) => {
    logMonitor(agentId, `Bot error: ${error.message}`);
  });

  // Add response handling for debugging
  bot.on('response', (response) => {
    logMonitor(agentId, `Bot response: ${response.statusCode}`);
  });

  return bot;
}

// Set webhook for the bot
export async function setWebhook(bot: TelegramBot, webhookUrl: string): Promise<boolean> {
  try {
    await bot.setWebHook(webhookUrl, {
      allowed_updates: ['message', 'edited_message', 'callback_query']
    });
    logMonitor('system', `Webhook set to: ${webhookUrl}`);
    return true;
  } catch (error) {
    logMonitor('system', `Failed to set webhook: ${error}`);
    return false;
  }
}

// Delete webhook for the bot
export async function deleteWebhook(bot: TelegramBot): Promise<boolean> {
  try {
    await bot.deleteWebHook();
    logMonitor('system', 'Webhook deleted');
    return true;
  } catch (error) {
    logMonitor('system', `Failed to delete webhook: ${error}`);
    return false;
  }
}

// Send message with proper error handling
export async function sendTelegramMessage(bot: TelegramBot, chatId: number, text: string): Promise<boolean> {
  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
    return true;
  } catch (error) {
    logMonitor('system', `Failed to send message: ${error}`);
    return false;
  }
}

// Get bot instance
export function getBot(agentId: string): TelegramBot | null {
  return bots[agentId] || null;
}

// Store bot instance
export function storeBot(agentId: string, bot: TelegramBot): void {
  bots[agentId] = bot;
  botStatus[agentId] = 'active';
}

// Remove bot instance
export function removeBot(agentId: string): void {
  const bot = bots[agentId];
  if (bot) {
    bot.stopPolling();
    bot.close();
  }
  delete bots[agentId];
  delete botStatus[agentId];
}

// Get bot status
export function getBotStatus(agentId: string): string {
  return botStatus[agentId] || 'inactive';
}

// Handle incoming webhook message
export async function handleWebhookMessage(agentId: string, message: any, callback_query?: any): Promise<void> {
  const bot = getBot(agentId);
  if (!bot) {
    throw new Error('Bot instance not found');
  }

  // Handle incoming message
  if (message && message.text) {
    const chatId = message.chat.id;
    const text = message.text;
    
    logMonitor(agentId, `Received message: ${text} from chat ${chatId}`);

    try {
      // Call the agent API to get a response
      const askRes = await askAgent({
        agentId,
        question: text
      });
      
      const data = askRes.data as {
        reply?: string;
        sources?: any[];
      };
      
      let replyText = data.reply || 'No answer available.';
      if (data.sources && data.sources.length > 0) {
        replyText += `\n\nSources:\n` + data.sources.map(
          (s: any) => `- ${s.sourceMetadata?.title || s.source} (${s.sourceUrl})`
        ).join('\n');
      }
      
      await sendTelegramMessage(bot, chatId, replyText);
      logMonitor(agentId, `Replied to chat ${chatId}`);
    } catch (err) {
      logMonitor(agentId, `Error handling message: ${err}`);
      await sendTelegramMessage(bot, chatId, 'Sorry, there was an error processing your request.');
    }
  }

  // Handle callback query (button clicks)
  if (callback_query) {
    const chatId = callback_query.message.chat.id;
    const data = callback_query.data;
    
    logMonitor(agentId, `Received callback query: ${data} from chat ${chatId}`);
    
    // Answer callback query to remove loading state
    try {
      await bot.answerCallbackQuery(callback_query.id);
    } catch (error) {
      logMonitor(agentId, `Failed to answer callback query: ${error}`);
    }
    
    // Handle the callback data if needed
    // You can add custom logic here based on the callback data
  }
}

// Validate bot token
export async function validateBotToken(botToken: string): Promise<any> {
  const bot = new TelegramBot(botToken, { polling: false });
  return await bot.getMe();
}

// Get all active bots
export function getActiveBots(): string[] {
  return Object.keys(bots);
}

// Get bot info
export async function getBotInfo(agentId: string): Promise<any> {
  const bot = getBot(agentId);
  if (!bot) {
    return null;
  }
  
  try {
    return await bot.getMe();
  } catch (error) {
    logMonitor(agentId, `Failed to get bot info: ${error}`);
    return null;
  }
} 