import mongoose from "mongoose";
import _isEqual from "lodash/isEqual";

export function updatedFields(
  newData: any,
  existingData: any,
): { field_name: string; field_old_value: any; field_new_value: any }[] {
  const changes: {
    field_name: string;
    field_old_value: any;
    field_new_value: any;
  }[] = [];

  // ✅ Fields to ignore globally
  const IGNORED_FIELDS = new Set([
    "_id",
    "$__",
    "$isNew",
    "__v",
    "_doc",
    "createdAt",
    "updatedAt",
    "deleted_at",
    "created_by",
    "updated_by",
    "deleted_by",
    "is_deleted",
  ]);

  function normalize(value: any, seen = new WeakSet()): any {
    if (value instanceof mongoose.Types.ObjectId) {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => normalize(item, seen));
    }

    if (value && typeof value === "object") {
      // ✅ prevent circular references
      if (seen.has(value)) {
        return "[Circular]";
      }

      seen.add(value);

      const result: Record<string, any> = {};

      // ✅ ONLY own enumerable keys
      for (const key of Object.keys(value)) {
        result[key] = normalize(value[key], seen);
      }

      return result;
    }

    return value;
  }

  function shouldIgnore(path: string[]): boolean {
    const field = path[path.length - 1];
    return IGNORED_FIELDS.has(field);
  }

  function compareFields(
    oldValue: any,
    newValue: any,
    path: string[] = [],
  ): void {
    // ✅ Skip ignored fields
    if (shouldIgnore(path)) return;

    // ✅ Skip if newValue is undefined (means not sent in update payload)
    if (newValue === undefined) return;

    const normalizedOld = normalize(oldValue);
    const normalizedNew = normalize(newValue);

    if (_isEqual(normalizedOld, normalizedNew)) return;

    // 🔹 Arrays
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      const maxLength = Math.max(oldValue.length, newValue.length);

      for (let i = 0; i < maxLength; i++) {
        compareFields(oldValue[i], newValue[i], [...path, `[${i}]`]);
      }
      return;
    }

    // 🔹 Objects
    if (
      oldValue &&
      newValue &&
      typeof oldValue === "object" &&
      typeof newValue === "object" &&
      !Array.isArray(oldValue) &&
      !Array.isArray(newValue)
    ) {
      const keys = new Set([
        ...Object.keys(oldValue),
        ...Object.keys(newValue),
      ]);

      keys.forEach((key) => {
        compareFields(oldValue[key], newValue[key], [...path, key]);
      });

      return;
    }

    // 🔹 Actual change
    changes.push({
      field_name: path.join(".").replace(".[", "["),
      field_old_value: oldValue,
      field_new_value: newValue,
    });
  }

  // ✅ Only iterate over newData keys (important fix)
  Object.keys(newData || {}).forEach((key) => {
    compareFields(existingData?.[key], newData?.[key], [key]);
  });

  return changes;
}
