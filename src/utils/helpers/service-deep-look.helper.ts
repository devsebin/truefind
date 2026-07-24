import { ClientSession, Model, Types } from "mongoose";
import { rethrowIfKnown } from "../responses/error.response";
import { serviceTypes } from "../definitions/constants/service-types";

export interface WithChildren {
  _id: Types.ObjectId | string;
  type?: string;
  children?: (Types.ObjectId | WithChildren)[];
  is_active?: boolean;

  // NEW FIELD
  is_selected?: boolean;
}

export async function deepPopulate<T extends WithChildren>(
  documents: T[],
  model: Model<any>,
  session: ClientSession,
  activeServiceIds?: Set<string>,
  showInactive: boolean = true,
  removeEmptyCategories: boolean = true,
  selectedServiceIds?: Set<string>, // NEW PARAM
  is_admin?: boolean,
): Promise<T[]> {
  try {
    const populatedDocs = await Promise.all(
      documents.map(async (doc) => {
        // If document has children -> populate recursively
        if (doc.children && doc.children.length > 0) {
          const populatedChildren = (await model
            .find({
              _id: { $in: doc.children },
            })
            .populate("icon")
            .session(session)
            .lean()) as WithChildren[];

          // Preserve original order
          const childMap = new Map(
            populatedChildren.map((child) => [child._id.toString(), child]),
          );

          const orderedChildren = doc.children
            .map((id) => childMap.get(id.toString()))
            .filter(Boolean) as WithChildren[];

          // Recursive populate
          let recursiveChildren = await deepPopulate(
            orderedChildren,
            model,
            session,
            activeServiceIds,
            showInactive,
            removeEmptyCategories,
            selectedServiceIds,
            is_admin,
          );

          // Filter + enrich data
          recursiveChildren = recursiveChildren.filter((child) => {
            // TASK TYPE
            if (child.type === serviceTypes.Task) {
              const isActive =
                activeServiceIds?.has(child._id.toString()) ?? false;

              child.is_active = isActive;

              if (is_admin === false) {
                if (selectedServiceIds) {
                  child.is_selected = selectedServiceIds.has(
                    child._id.toString(),
                  );
                } else {
                  child.is_selected = false;
                }
              }
              // Add user selected flag

              // Show inactive or not
              return showInactive ? true : isActive;
            }

            // CATEGORY / SUBCATEGORY
            return child.children && child.children.length > 0;
          });

          doc.children = recursiveChildren;
        }

        return doc;
      }),
    );

    // Remove empty categories if enabled
    if (!removeEmptyCategories) {
      return populatedDocs;
    }

    return populatedDocs.filter((doc) => {
      // Always keep tasks
      if (doc.type === serviceTypes.Task) {
        return true;
      }

      // Keep categories only if they contain children
      return doc.children && doc.children.length > 0;
    });
  } catch (error) {
    rethrowIfKnown(error, "Error while deep populating", {});
  }
}
