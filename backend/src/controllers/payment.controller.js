import { paymentContext } from '../services/payment/payment.context.js';
import { paymentEvents } from '../services/payment/sepay.webhook.js';
import { sendSuccess, sendError } from '../utils/response.js';
import prisma from '../config/prisma.js';
import dotenv from 'dotenv';
dotenv.config();

export const getPlans = async (req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
    return sendSuccess(res, plans);
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { planId } = req.body; // 1: 1 tháng, 2: 1 năm
    const gateway = process.env.PAYMENT_GATEWAY || 'vietqr';
    
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error('Invalid plan ID');

    const paymentData = await paymentContext.generatePayment(gateway, userId, plan.price, planId);
    
    return sendSuccess(res, paymentData);
  } catch (error) {
    next(error);
  }
};

import fs from 'fs';
import path from 'path';

export const handleSePayWebhook = async (req, res) => {
  try {
    // ─── Log toàn bộ request để debug ───────────────────────────────
    const logData = `[${new Date().toISOString()}] HEADERS: ${JSON.stringify(req.headers)}\nBODY: ${JSON.stringify(req.body)}\n\n`;
    fs.appendFileSync(path.join(process.cwd(), 'webhook.log'), logData);

    console.log('[Webhook] ⬇️  Received headers:', JSON.stringify(req.headers));
    console.log('[Webhook] ⬇️  Received body:', JSON.stringify(req.body));

    // SePay Webhook header verify
    const apiKey = req.headers['authorization'];
    if (apiKey !== `Apikey ${process.env.SEPAY_API_KEY}`) {
      console.error('[Webhook] ❌ Unauthorized — expected:', `Apikey ${process.env.SEPAY_API_KEY}`, '— got:', apiKey);
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id, transferAmount, content } = req.body;
    console.log(`[Webhook] 📝 content="${content}", amount=${transferAmount}`);

    // Parse content để tìm "EMVIP userId planId"
    const regex = /EMVIP\s+(\d+)\s+(\d+)/i;
    const match = content?.match(regex);

    if (match) {
      const userId = parseInt(match[1]);
      const planId = parseInt(match[2]);
      console.log(`[Webhook] ✅ Parsed: userId=${userId}, planId=${planId}`);

      paymentEvents.emit('PAYMENT_SUCCESS', {
        userId,
        planId,
        amount: transferAmount,
        transactionCode: id
      });
    } else {
      console.error(`[Webhook] ❌ Regex không khớp content: "${content}"`);
    }

    // SePay yêu cầu trả về status 200
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook Error]', error.message);
    return res.status(500).json({ success: false });
  }
};
