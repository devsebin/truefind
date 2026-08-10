import { tableName } from "@/utils/definitions/constants/table-names";
import mongoose, { Schema } from "mongoose";
import { IDeclaimerInput, IOtp } from "./otps-db-interface";



const DeclaimerSchema = new Schema<IDeclaimerInput>(
    {
        declaimer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Declaimers,
            required: true,
        },
        accepted: { type: Boolean, required: true, default: false },
    },
    {
        _id: false,
        timestamps: true,
    },
);
const OtpSchema: Schema = new Schema<IOtp>(
    {
        phoneNumber: {
            type: String,
            required: true,
            index: true,
        },
        country_code: {
            type: String,
            required: true,
        },
        device_id: {
            type: String,
            required: true,
        },
        otp_hash: {
            type: String,
            required: true,
        },
        otp_type: {
            type: String,
            required: true,
            enum: ["login", "register"],
        },
        user_type: {
            type: String,
            required: true,
            enum: ["user", "admin", "employee"],
        },
        expires_at: {
            type: Date,
            required: true,
            index: { expires: 0 }, // TTL index
        },
        attempts: {
            type: Number,
            default: 0,
        },
        is_used: {
            type: Boolean,
            default: false,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        last_seen_at: {
            type: Date,
            default: Date.now,
        },
        declaimers: {
            type: [DeclaimerSchema],
            default: [],
            required: true,
        },
    },
    {
        timestamps: true,
    },
);
// OtpSchema.plugin(auditPlugin);

// 🔥 Optimized index
OtpSchema.index({ phoneNumber: 1, is_active: 1, is_used: 1 });

const OtpModel = mongoose.model<IOtp>(tableName.Otp, OtpSchema);
export default OtpModel;
