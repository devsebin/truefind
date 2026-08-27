// plugins/defaultStatus.plugin.ts
import BundleLocationConfigStatusesModel from "@/database/bundle-location-config-status/bundle-location-config-status-db-model";
import { Schema } from "mongoose";

let cachedDefaultStatusId: any = null;
let cachedActiveStatusId: any = null;

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



export async function defaultBundleLocationConfigStatusPlugin() {
    return await getDefaultStatusId();
}

