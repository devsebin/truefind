import { Router } from "express";
import express from "express";
import webhookController from "./webhook.controller";

/**
 * Webhook routes — NO authentication middleware.
 * These endpoints receive events from external payment providers.
 *
 * IMPORTANT: Stripe requires raw body (Buffer) for signature verification.
 * PayPal sends JSON which can be parsed normally.
 */
const WebhookRouter = Router();

// Stripe webhook — uses raw body parser for signature verification
WebhookRouter.post(
    "/stripe",
    express.raw({ type: "application/json" }),
    webhookController.handleStripeWebhook
);

// PayPal webhook — uses standard JSON parser
WebhookRouter.post(
    "/paypal",
    express.json(),
    webhookController.handlePayPalWebhook
);

export default WebhookRouter;
