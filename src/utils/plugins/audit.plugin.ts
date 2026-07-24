import { Schema, Types } from "mongoose";
import { getContextUserId } from "../context/request-context";

export function auditPlugin(schema: Schema): void {
  // Pre-validate hook to set audit fields on new documents and updates via .save()
  schema.pre("validate", function (this: any) {
    const userId = getContextUserId();

    if (userId) {
      const userObjectId = new Types.ObjectId(userId);

      // Handle creation: set created_by
      if (this.isNew) {
        if (schema.paths.created_by && !this.created_by) {
          this.created_by = userObjectId;
        }
      }

      // Handle update: set updated_by
      if (schema.paths.updated_by && !this.isNew) {
        this.updated_by = userObjectId;
      }

      // Handle soft-delete check: set deleted_by and deleted_at
      if (schema.paths.deleted_by && this.isModified("is_deleted") && this.is_deleted && !this.deleted_by) {
        this.deleted_by = userObjectId;
        this.deleted_at = new Date();
      }
    }
  });

  // Pre-update hooks for query-based updates (updateOne, updateMany, findOneAndUpdate)
  const queryUpdateHooks = ["updateOne", "findOneAndUpdate", "update", "updateMany"];

  queryUpdateHooks.forEach((hookName) => {
    schema.pre(hookName as any, function (this: any) {
      const userId = getContextUserId();
      if (userId) {
        const userObjectId = new Types.ObjectId(userId);
        const update = this.getUpdate();

        if (update) {
          if (update.$set) {
            update.$set.updated_by = userObjectId;
            if (update.$set.is_deleted) {
              update.$set.deleted_by = userObjectId;
              update.$set.deleted_at = new Date();
            }
          } else {
            // If the update object itself doesn't contain $operators
            const hasOperators = Object.keys(update).some(key => key.startsWith("$"));
            if (!hasOperators) {
              update.updated_by = userObjectId;
              if (update.is_deleted) {
                update.deleted_by = userObjectId;
                update.deleted_at = new Date();
              }
            } else {
              // If it has other operators but no $set, initialize $set
              update.$set = update.$set || {};
              update.$set.updated_by = userObjectId;
              if (update.$set.is_deleted) {
                update.$set.deleted_by = userObjectId;
                update.$set.deleted_at = new Date();
              }
            }
          }
        }
      }
    });
  });
}
