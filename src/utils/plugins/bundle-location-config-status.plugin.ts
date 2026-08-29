// plugins/bundle-location-config-status.plugin.ts
import BundleLocationConfigStatusesModel from "@/database/bundle-location-config-status/bundle-location-config-status-db-model";
import { Schema } from "mongoose";

let cachedDefaultStatusId: any = null;
let cachedActiveStatusId: any = null;
let cachedUnlinkedStatusId: any = null;

async function getDefaultStatusId() {
    if (cachedDefaultStatusId) {
        const exists = await BundleLocationConfigStatusesModel.exists({
            _id: cachedDefaultStatusId,
            is_deleted: false,
            is_active: true,
        });
        if (exists) {
            return cachedDefaultStatusId;
        }
        cachedDefaultStatusId = null;
    }

    const defaultStatus = await BundleLocationConfigStatusesModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
    }).lean();

    if (!defaultStatus) {
        const newStatus = await BundleLocationConfigStatusesModel.create({
            title: "Waiting for area configuration",
            label: "waiting_for_area_configuration",
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
        const exists = await BundleLocationConfigStatusesModel.exists({
            _id: cachedActiveStatusId,
            is_deleted: false,
            is_active: true,
        });
        if (exists) {
            return cachedActiveStatusId;
        }
        cachedActiveStatusId = null;
    }

    const activeStatus = await BundleLocationConfigStatusesModel.findOne({
        label: "active",
        is_deleted: false,
        is_active: true,
    }).lean();

    if (!activeStatus) {
        const newStatus = await BundleLocationConfigStatusesModel.create({
            title: "Active",
            label: "active",
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

async function getUnlinkedStatusId() {
    if (cachedUnlinkedStatusId) {
        const exists = await BundleLocationConfigStatusesModel.exists({
            _id: cachedUnlinkedStatusId,
            is_deleted: false,
            is_active: true,
        });
        if (exists) {
            return cachedUnlinkedStatusId;
        }
        cachedUnlinkedStatusId = null;
    }

    const unlinkedStatus = await BundleLocationConfigStatusesModel.findOne({
        label: "unlinked",
        is_deleted: false,
        is_active: true,
    }).lean();

    if (!unlinkedStatus) {
        const newStatus = await BundleLocationConfigStatusesModel.create({
            title: "Unlinked",
            label: "unlinked",
            color: "#FFA500",
            is_active: true,
            is_deleted: false,
            is_default: false,
        });
        cachedUnlinkedStatusId = newStatus._id;
        return cachedUnlinkedStatusId;
    }

    cachedUnlinkedStatusId = unlinkedStatus._id;

    return cachedUnlinkedStatusId;
}

export function defaultBundleLocationConfigStatusPlugin(schema: Schema) {
    schema.pre("validate", async function (this: any) {
        if (!this.status_id) {
            this.status_id = await getDefaultStatusId();
        }
    });
}

export async function getDefaultBundleLocationStatusId() {
    return await getDefaultStatusId();
}

export async function getActiveBundleLocationStatusId() {
    return await getActiveStatusId();
}

export async function getUnlinkedBundleLocationStatusId() {
    return await getUnlinkedStatusId();
}


