// plugins/defaultStatus.plugin.ts
import BundleStatusesModel from "@/database/bundle-statuses/bundle-statuses-db-model";
import { Schema } from "mongoose";

let cachedDefaultStatusId: any = null;
let cachedActiveStatusId: any = null;
let cachedClearedStatusId: any = null;

async function getDefaultStatusId() {
    if (cachedDefaultStatusId) {
        const exists = await BundleStatusesModel.exists({
            _id: cachedDefaultStatusId,
            is_deleted: false,
            is_active: true,
        });
        if (exists) {
            return cachedDefaultStatusId;
        }
        cachedDefaultStatusId = null;
    }

    const defaultStatus = await BundleStatusesModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
    }).lean();

    if (!defaultStatus) {
        const newStatus = await BundleStatusesModel.create({
            title: "Pending",
            label: "pending",
            description: "Bundle is waiting for service items to be added",
            color: "#808080",
            is_active: true,
            is_deleted: false,
            is_default: true,
        });
        cachedDefaultStatusId = newStatus._id;
        return cachedDefaultStatusId;
    }

    cachedDefaultStatusId = defaultStatus._id;

    return cachedDefaultStatusId;
}

async function getActiveStatusId() {
    if (cachedActiveStatusId) {
        const exists = await BundleStatusesModel.exists({
            _id: cachedActiveStatusId,
            is_deleted: false,
            is_active: true,
        });
        if (exists) {
            return cachedActiveStatusId;
        }
        cachedActiveStatusId = null;
    }

    const activeStatus = await BundleStatusesModel.findOne({
        label: "active",
        is_deleted: false,
        is_active: true,
    }).lean();

    if (!activeStatus) {
        const newStatus = await BundleStatusesModel.create({
            title: "Active",
            label: "active",
            description: "Bundle is active and has at least one active service item",
            color: "#00FF00",
            is_active: true,
            is_deleted: false,
            is_default: false,
        });
        cachedActiveStatusId = newStatus._id;
        return cachedActiveStatusId;
    }

    cachedActiveStatusId = activeStatus._id;

    return cachedActiveStatusId;
}

async function getClearedStatusId() {
    if (cachedActiveStatusId) {
        const exists = await BundleStatusesModel.exists({
            _id: cachedClearedStatusId,
            is_deleted: false,
            is_active: true,
        });
        if (exists) {
            return cachedClearedStatusId;
        }
        cachedClearedStatusId = null;
    }

    const activeStatus = await BundleStatusesModel.findOne({
        label: "cleared",
        is_deleted: false,
        is_active: true,
    }).lean();

    if (!activeStatus) {
        const newStatus = await BundleStatusesModel.create({
            title: "Cleared",
            label: "cleared",
            description: "Bundle is cleared and waiting for approval",
            color: "#66e9cfff",
            is_active: true,
            is_deleted: false,
            is_default: false,
        });
        cachedClearedStatusId = newStatus._id;
        return cachedClearedStatusId;
    }

    cachedClearedStatusId = activeStatus._id;

    return cachedClearedStatusId;
}

export function defaultBundleStatusPlugin(schema: Schema) {
    schema.pre("validate", async function (this: any) {
        if (!this.status_id) {
            this.status_id = await getDefaultStatusId();
        }
    });
}

export async function getDefaultBundleStatusId() {
    return await getDefaultStatusId();
}

export async function getActiveBundleStatusId() {
    return await getActiveStatusId();
}

export async function getClearedBundleStatusId() {
    return await getClearedStatusId();
}   
