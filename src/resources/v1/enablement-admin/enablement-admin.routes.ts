import { Router } from "express";
import enablementAdminController from "./enablement-admin.controller";

const router = Router();

// Condition metadata
router.get("/conditions", (req, res) => enablementAdminController.listConditions(req, res));

// Policy queries & audits
router.get("/audits", (req, res) => enablementAdminController.getAudits(req, res));
router.get("/policies/:entityType", (req, res) => enablementAdminController.getPolicies(req, res));
router.get("/policies/:entityType/:version", (req, res) => enablementAdminController.getPolicies(req, res));
router.get("/policy/:id", (req, res) => enablementAdminController.getPolicyById(req, res));

// Policy management & lifecycle
router.post("/policies", (req, res) => enablementAdminController.createPolicy(req, res));
router.put("/policies/:id", (req, res) => enablementAdminController.updatePolicy(req, res));
router.post("/policies/:id/validate", (req, res) => enablementAdminController.validatePolicy(req, res));
router.post("/policies/:id/publish", (req, res) => enablementAdminController.publishPolicy(req, res));
router.post("/policies/:id/rollback", (req, res) => enablementAdminController.rollbackPolicy(req, res));

// Evaluation endpoint
router.post("/policies/:entityType/evaluate/:entityId", (req, res) => enablementAdminController.evaluateEntity(req, res));

export default router;
