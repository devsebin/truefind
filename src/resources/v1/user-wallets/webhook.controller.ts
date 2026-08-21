import { Request, Response } from "express";
import { statusCodes } from "@/utils/definitions/constants/common";
import webhookService from "./services/webhook.service";

class WebhookController {
    /**
     * Handle Stripe webhook.
     * Stripe sends the signature in the `stripe-signature` header.
     * The raw body (Buffer) is required for signature verification.
     */
    async handleStripeWebhook(req: Request, res: Response): Promise<void> {
        try {
            const signature = req.headers["stripe-signature"] as string;
            if (!signature) {
                res.status(statusCodes.BadRequest).json({
                    success: false,
                    message: "Missing stripe-signature header",
                });
                return;
            }

            // req.body should be the raw Buffer (configured via express.raw)
            const payload = (req as any).rawBody || req.body;

            const result = await webhookService.processWebhook({
                provider: "stripe",
                payload,
                signature,
            });

            res.status(statusCodes.OK).json({
                success: true,
                message: "Webhook processed",
                data: { event_id: result.event_id, status: result.status },
            });
        } catch (error) {
            const message = (error as Error).message;

            if (message === "WEBHOOK_SIGNATURE_INVALID") {
                res.status(statusCodes.BadRequest).json({
                    success: false,
                    message: "Invalid webhook signature",
                });
                return;
            }

            console.error("[Stripe Webhook Error]", message);

            // Always return 200 to Stripe to prevent retries on application errors
            // (Stripe retries on non-2xx responses)
            res.status(statusCodes.OK).json({
                success: false,
                message: "Webhook received but processing failed",
                error: message,
            });
        }
    }

    /**
     * Handle PayPal webhook.
     * PayPal sends verification headers for signature validation.
     */
    async handlePayPalWebhook(req: Request, res: Response): Promise<void> {
        try {
            // PayPal sends multiple headers for verification
            const paypalHeaders = JSON.stringify({
                "paypal-auth-algo": req.headers["paypal-auth-algo"],
                "paypal-cert-url": req.headers["paypal-cert-url"],
                "paypal-transmission-id": req.headers["paypal-transmission-id"],
                "paypal-transmission-sig": req.headers["paypal-transmission-sig"],
                "paypal-transmission-time": req.headers["paypal-transmission-time"],
            });

            const payload = JSON.stringify(req.body);

            const result = await webhookService.processWebhook({
                provider: "paypal",
                payload,
                signature: paypalHeaders,
            });

            res.status(statusCodes.OK).json({
                success: true,
                message: "Webhook processed",
                data: { event_id: result.event_id, status: result.status },
            });
        } catch (error) {
            const message = (error as Error).message;

            if (message === "WEBHOOK_SIGNATURE_INVALID") {
                res.status(statusCodes.BadRequest).json({
                    success: false,
                    message: "Invalid webhook signature",
                });
                return;
            }

            console.error("[PayPal Webhook Error]", message);

            res.status(statusCodes.OK).json({
                success: false,
                message: "Webhook received but processing failed",
                error: message,
            });
        }
    }
}

export default new WebhookController();
