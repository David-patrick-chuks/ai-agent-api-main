import { Request, Response } from 'express';
import TelegramAuth from '../models/TelegramAuth';
import {
  createBot,
  deleteWebhook,
  getBot,
  getBotInfo,
  getBotStatus,
  handleWebhookMessage,
  logMonitor,
  removeBot,
  setWebhook,
  storeBot,
  validateBotToken
} from '../services/telegramService';

// Deploy Telegram bot for an agent
export async function deployTelegram(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const { botToken } = req.body;
    const userId = (req.user as any)?.userId;

    console.log('Deploy Telegram - agentId:', agentId);
    console.log('Deploy Telegram - req.params:', req.params);
    console.log('Deploy Telegram - req.body:', req.body);

    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }

    if (!botToken) {
      return res.status(400).json({ error: 'Bot token is required' });
    }

    // Validate bot token
    try {
      const botInfo = await validateBotToken(botToken);
      logMonitor(agentId, `Bot validated: ${botInfo.username}`);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid bot token' });
    }

    // Check if bot is already deployed
    const existingAuth = await TelegramAuth.findOne({ agentId });
    if (existingAuth && existingAuth.isActive) {
      return res.status(400).json({ error: 'Bot is already deployed for this agent' });
    }

    // Create webhook URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const webhookUrl = `${baseUrl}/api/agents/${agentId}/telegram/webhook`;
    
    console.log('Deploy Telegram - webhookUrl:', webhookUrl);

    // Create bot instance
    const bot = createBot(botToken, agentId);
    
    // Set webhook
    const webhookSet = await setWebhook(bot, webhookUrl);
    if (!webhookSet) {
      return res.status(500).json({ error: 'Failed to set webhook' });
    }

    // Store bot instance
    storeBot(agentId, bot);

    // Save to database
    const telegramAuth = new TelegramAuth({
      agentId,
      botToken,
      webhookUrl,
      isActive: true
    });
    await telegramAuth.save();

    logMonitor(agentId, 'Bot deployed successfully');

    res.json({
      success: true,
      message: 'Telegram bot deployed successfully',
      botInfo: await getBotInfo(agentId),
      webhookUrl
    });

  } catch (error) {
    console.error('Deploy Telegram error:', error);
    res.status(500).json({ error: 'Failed to deploy Telegram bot' });
  }
}

// Restart Telegram bot
export async function restartTelegram(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const userId = (req.user as any)?.userId;

    // Get existing auth
    const telegramAuth = await TelegramAuth.findOne({ agentId });
    if (!telegramAuth || !telegramAuth.isActive) {
      return res.status(404).json({ error: 'No active Telegram bot found for this agent' });
    }

    // Remove existing bot
    removeBot(agentId);

    // Create new bot instance
    const bot = createBot(telegramAuth.botToken, agentId);
    
    // Set webhook
    const webhookSet = await setWebhook(bot, telegramAuth.webhookUrl!);
    if (!webhookSet) {
      return res.status(500).json({ error: 'Failed to set webhook' });
    }

    // Store new bot instance
    storeBot(agentId, bot);

    logMonitor(agentId, 'Bot restarted successfully');

    res.json({
      success: true,
      message: 'Telegram bot restarted successfully',
      botInfo: await getBotInfo(agentId)
    });

  } catch (error) {
    console.error('Restart Telegram error:', error);
    res.status(500).json({ error: 'Failed to restart Telegram bot' });
  }
}

// Disconnect Telegram bot
export async function disconnectTelegram(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const userId = (req.user as any)?.userId;

    // Get existing auth
    const telegramAuth = await TelegramAuth.findOne({ agentId });
    if (!telegramAuth) {
      return res.status(404).json({ error: 'No Telegram bot found for this agent' });
    }

    // Get bot instance and delete webhook
    const bot = getBot(agentId);
    if (bot) {
      await deleteWebhook(bot);
      removeBot(agentId);
    }

    // Update database
    telegramAuth.isActive = false;
    await telegramAuth.save();

    logMonitor(agentId, 'Bot disconnected successfully');

    res.json({
      success: true,
      message: 'Telegram bot disconnected successfully'
    });

  } catch (error) {
    console.error('Disconnect Telegram error:', error);
    res.status(500).json({ error: 'Failed to disconnect Telegram bot' });
  }
}

// Get Telegram bot status
export async function telegramStatus(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const userId = (req.user as any)?.userId;

    console.log('Telegram Status - agentId:', agentId);

    // Get auth from database
    const telegramAuth = await TelegramAuth.findOne({ agentId });
    console.log('Telegram Status - telegramAuth:', telegramAuth);
    if (!telegramAuth) {
      console.log('Telegram Status - Not deployed');
      return res.json({
        deployed: false,
        status: 'not_deployed'
      });
    }

    // Get bot instance status
    const bot = getBot(agentId);
    const botStatus = getBotStatus(agentId);
    console.log('Telegram Status - botStatus:', botStatus);

    // Get bot info if available
    let botInfo = null;
    if (bot) {
      try {
        botInfo = await getBotInfo(agentId);
      } catch (error) {
        logMonitor(agentId, `Failed to get bot info: ${error}`);
      }
    }

    const response = {
      deployed: telegramAuth.isActive,
      status: botStatus,
      botInfo,
      webhookUrl: telegramAuth.webhookUrl,
      createdAt: telegramAuth.createdAt,
      updatedAt: telegramAuth.updatedAt
    };
    console.log('Telegram Status - response:', response);
    res.json(response);

  } catch (error) {
    console.error('Telegram status error:', error);
    res.status(500).json({ error: 'Failed to get Telegram bot status' });
  }
}

// Handle Telegram webhook
export async function telegramWebhook(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const update = req.body;

    // Verify this is a valid Telegram update
    if (!update || (!update.message && !update.callback_query)) {
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Check if bot is active
    const telegramAuth = await TelegramAuth.findOne({ agentId, isActive: true });
    if (!telegramAuth) {
      return res.status(404).json({ error: 'Bot not found or inactive' });
    }

    // Handle the webhook message
    await handleWebhookMessage(agentId, update.message, update.callback_query);

    // Always return 200 to Telegram
    res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    // Always return 200 to Telegram even on error
    res.status(200).json({ ok: true });
  }
} 