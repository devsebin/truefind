// plugins/defaultStatus.plugin.ts
import BundleUserMappingStatusModel from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-model";
import { Schema } from "mongoose";

let cachedDefaultStatusId: any = null;
let cachedActiveStatusId: any = null;

async function getDefaultStatusId() {
    if (cachedDefaultStatusId) {
        const exists = await BundleUserMappingStatusModel.exists({
            _id: cachedDefaultStatusId,
            is_deleted: false,
            is_active: true,
        });
        if (exists) {
            return cachedDefaultStatusId;
        }
        cachedDefaultStatusId = null;
    }

    const defaultStatus = await BundleUserMappingStatusModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
    }).lean();

    if (!defaultStatus) {
        const newStatus = await BundleUserMappingStatusModel.create({
            title: "Pending",
            label: "pending",
            color: "#FFA500",
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



export function defaultBundleUserMappingStatusPlugin(schema: Schema) {
    schema.pre("validate", async function (this: any) {
        if (!this.status_id) {
            this.status_id = await getDefaultStatusId();
        }
    });
}

