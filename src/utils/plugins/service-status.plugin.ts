// plugins/defaultStatus.plugin.ts
import ServiceStatusModel from "@/database/service-status/service-status-db-model";
import { Schema } from "mongoose";

let cachedDefaultServiceStatusId: any = null;
let cachedActiveStatusId: any = null;

async function getDefaultServiceStatusId() {
    if (cachedDefaultServiceStatusId) {
        const exists = await ServiceStatusModel.exists({
            _id: cachedDefaultServiceStatusId,
            is_deleted: false,
            is_active: true,
        });
        if (exists) {
            return cachedDefaultServiceStatusId;
        }
        cachedDefaultServiceStatusId = null;
    }

    const defaultStatus = await ServiceStatusModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
    }).lean();

    if (!defaultStatus) {
        const newStatus = await ServiceStatusModel.create({
            title: "In Progress",
            label: "in_progress",
            color: "#429676ff",
            is_default: true,
            is_active: true,
            is_deleted: false,
        });
        cachedDefaultServiceStatusId = newStatus._id;
        return cachedDefaultServiceStatusId;
    }

    cachedDefaultServiceStatusId = defaultStatus._id;

    return cachedDefaultServiceStatusId;
}

async function getActiveStatusId() {
    if (cachedActiveStatusId) {
        const exists = await ServiceStatusModel.exists({
            _id: cachedActiveStatusId,
            is_deleted: false,
            is_active: true,
        });
        if (exists) {
            return cachedActiveStatusId;
        }
        cachedActiveStatusId = null;
    }

    const activeStatus = await ServiceStatusModel.findOne({
        label: "active",
        is_deleted: false,
        is_active: true,
    }).lean();

    if (!activeStatus) {
        const newStatus = await ServiceStatusModel.create({
            title: "Active",
            label: "active",
            color: "#08ffa0ff",
            is_default: false,
            is_active: true,
            is_deleted: false,
        });
        cachedActiveStatusId = newStatus._id;
        return cachedActiveStatusId;
    }

    cachedActiveStatusId = activeStatus._id;

    return cachedActiveStatusId;
}

export function defaultServiceStatusPlugin(schema: Schema) {
    schema.pre("validate", async function (this: any) {
        if (!this.status_id) {
            this.status_id = await getDefaultServiceStatusId();
        }
    });
}

export async function getActiveServiceStatusId() {
    return await getActiveStatusId();
}
