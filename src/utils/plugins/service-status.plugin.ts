// plugins/defaultStatus.plugin.ts
import ServiceStatusModel from "@/database/service-status/service-status-db-model";
import { Schema } from "mongoose";

let cachedDefaultServiceStatusId: any = null;

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

export function defaultServiceStatusPlugin(schema: Schema) {
    schema.pre("validate", async function (this: any) {
        if (!this.status_id) {
            this.status_id = await getDefaultServiceStatusId();
        }
    });
}
