import { Request, Response } from 'express';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { Client, RemoteAuth } from 'whatsapp-web.js';
import { MongoStore } from 'wwebjs-mongo';
import WhatsappAuth from '../models/WhatsappAuth';
import { askAgent } from '../services/agentApiService';

// In-memory client map per agent
const clients: Record<string, Client> = {};
const qrCodes: Record<string, string> = {};
const reconnectAttempts: Record<string, number> = {};

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 5000; // 5 seconds

function logMonitor(agentId: string, message: string) {
  console.log(`[WhatsApp][${agentId}] ${message}`);
}

async function reconnectClient(agentId: string) {
  reconnectAttempts[agentId] = (reconnectAttempts[agentId] || 0) + 1;
  if (reconnectAttempts[agentId] > MAX_RECONNECT_ATTEMPTS) {
    logMonitor(agentId, 'Max reconnect attempts reached. Giving up.');
    return;
  }
  const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts[agentId] - 1);
  logMonitor(agentId, `Attempting to reconnect in ${delay / 1000}s (attempt ${reconnectAttempts[agentId]})...`);
  setTimeout(async () => {
    try {
      await deployWhatsapp({ params: { agentId } } as any, { json: () => {} } as any);
      logMonitor(agentId, 'Reconnected successfully.');
      reconnectAttempts[agentId] = 0;
    } catch (err) {
      logMonitor(agentId, 'Reconnect failed. Will retry.');
      await reconnectClient(agentId);
    }
  }, delay);
}

export async function deployWhatsapp(req: Request, res: Response) {
  const { agentId } = req.params;
  try {
    // Check for existing session
    const existing = await WhatsappAuth.findOne({ agentId });
    const store = new MongoStore({ mongoose });
    let qrDataUrl: string | null = null;
    let responded = false;

    const client = new Client({
      authStrategy: new RemoteAuth({
        store,
        backupSyncIntervalMs: 300000,
        clientId: agentId,
      }),
    });

    // Attach agentId to the client instance
    (client as any).agentId = agentId;

    client.on('qr', async (qr) => {
      qrDataUrl = await QRCode.toDataURL(qr);
      qrCodes[agentId] = qrDataUrl;
      logMonitor(agentId, 'QR code generated.');
      if (!responded) {
        res.json({ status: 'qr', qr: qrDataUrl });
        responded = true;
      }
    });

    client.on('ready', async () => {
      logMonitor(agentId, 'Client is ready and connected.');
      // Save session if not already
      if (!existing) {
        const session = (client as any).authStrategy?.session;
        if (session) {
          await WhatsappAuth.create({ agentId, session });
        }
      }
      if (!responded) {
        res.json({ status: 'connected' });
        responded = true;
      }
    });

    client.on('authenticated', async () => {
      logMonitor(agentId, 'Client authenticated.');
      // Save session on auth
      const session = (client as any).authStrategy?.session;
      if (session) {
        await WhatsappAuth.findOneAndUpdate({ agentId }, { session }, { upsert: true });
      }
      delete qrCodes[agentId];
    });

    client.on('disconnected', async (reason) => {
      logMonitor(agentId, `Client disconnected: ${reason}`);
      await WhatsappAuth.deleteOne({ agentId });
      delete clients[agentId];
      delete qrCodes[agentId];
      // Auto-reconnect logic
      await reconnectClient(agentId);
    });

    // Autonomous WhatsApp bot: handle incoming messages
    client.on('message', async (message) => {
      // Retrieve agentId from the client instance
      const agentId = (client as any).agentId;
      try {
        if (!message.body) return;
        logMonitor(agentId, `Received message: ${message.body}`);
        logMonitor(agentId, `Calling askAgent with agentId: ${agentId}`);
        const askRes = await askAgent({
          agentId,
          question: message.body
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
        await message.reply(replyText);
      } catch (err: any) {
        if (err instanceof AggregateError) {
          logMonitor(agentId, `AggregateError in message handler: ${err}`);
          for (const e of err.errors) {
            logMonitor(agentId, `  Inner error: ${e && e.stack ? e.stack : e}`);
          }
        } else if (err.isAxiosError) {
          logMonitor(agentId, `AxiosError: ${err.message}`);
          logMonitor(agentId, `AxiosError config: ${JSON.stringify(err.config)}`);
          if (err.response) {
            logMonitor(agentId, `AxiosError response data: ${JSON.stringify(err.response.data)}`);
          }
        } else {
          logMonitor(agentId, `Error handling message: ${err && err.stack ? err.stack : err}`);
        }
        await message.reply('Sorry, there was an error processing your request.');
      }
    });

    await client.initialize();
    clients[agentId] = client;
    reconnectAttempts[agentId] = 0;

    // Remove setTimeout and rely on event handlers to respond
  } catch (err) {
    res.status(500).json({ error: 'Failed to deploy WhatsApp', details: err });
  }
}

export async function restartWhatsapp(req: Request, res: Response) {
  const { agentId } = req.params;
  try {
    if (clients[agentId]) {
      await clients[agentId].destroy();
      delete clients[agentId];
      delete qrCodes[agentId];
    }
    // Re-deploy
    await deployWhatsapp(req, res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to restart WhatsApp', details: err });
  }
}

export async function disconnectWhatsapp(req: Request, res: Response) {
  const { agentId } = req.params;
  try {
    if (clients[agentId]) {
      await clients[agentId].destroy();
      delete clients[agentId];
      delete qrCodes[agentId];
    }
    await WhatsappAuth.deleteOne({ agentId });
    res.json({ status: 'disconnected' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect WhatsApp', details: err });
  }
}

export async function whatsappStatus(req: Request, res: Response) {
  const { agentId } = req.params;
  try {
    const client = clients[agentId];
    if (!client) {
      return res.json({ status: 'not_initialized' });
    }
    const state = (client as any).info ? 'connected' : 'connecting';
    res.json({
      status: state,
      qr: qrCodes[agentId] || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get WhatsApp status', details: err });
  }
}

export async function whatsappWebhook(req: Request, res: Response) {
  // This is a placeholder for receiving WhatsApp events/messages
  // You can process or forward the payload as needed
  console.log('[WhatsApp Webhook] Received:', req.body);
  res.json({ received: true });
} 