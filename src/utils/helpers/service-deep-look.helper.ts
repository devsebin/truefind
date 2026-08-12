import { ClientSession, Model, Types } from "mongoose";
import { rethrowIfKnown } from "../responses/error.response";
import { serviceTypes } from "../definitions/constants/service-types";

export interface WithChildren {
  _id: Types.ObjectId | string;
  type?: string;
  children?: (Types.ObjectId | WithChildren)[];
  is_active?: boolean;
  is_deleted?: boolean;

  // NEW FIELD
  is_selected?: boolean;
}

export async function deepPopulate<T extends WithChildren>(
  documents: T[],
  model: Model<any>,
  session: ClientSession,
  activeServiceIds?: Set<string>,
  showInactiveSubcategories: boolean = true,
  showInactiveServices: boolean = true,
  removeEmptyCategories: boolean = true,
  removeEmptySubCategory: boolean = true,
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
            showInactiveSubcategories,
            showInactiveServices,
            removeEmptyCategories,
            removeEmptySubCategory,
            selectedServiceIds,
            is_admin,
          );

          // Filter + enrich data
          recursiveChildren = recursiveChildren.filter((child) => {
            // TASK TYPE (Service)
            if (child.type === serviceTypes.Service) {
              const isActiveInDb = child.is_active !== false && child.is_deleted !== true;
              const isActiveInLocations = activeServiceIds?.has(child._id.toString()) ?? false;

              child.is_active = isActiveInLocations;

              if (is_admin === false) {
                if (selectedServiceIds) {
                  child.is_selected = selectedServiceIds.has(
                    child._id.toString(),
                  );
                } else {
                  child.is_selected = false;
                }
              }

              if (!showInactiveServices) {
                return isActiveInDb;
              }
              return true;
            }

            // SUBCATEGORY
            if (child.type === serviceTypes.Subcategory) {
              const isActiveInDb = child.is_active !== false && child.is_deleted !== true;
              if (!showInactiveSubcategories && !isActiveInDb) {
                return false;
              }
              if (removeEmptySubCategory && (!child.children || child.children.length === 0)) {
                return false;
              }
              return true;
            }

            // CATEGORY (Nested categories if any)
            if (child.type === serviceTypes.Category) {
              const isActiveInDb = child.is_active !== false && child.is_deleted !== true;
              if (!showInactiveSubcategories && !isActiveInDb) {
                return false;
              }
              if (removeEmptyCategories && (!child.children || child.children.length === 0)) {
                return false;
              }
              return true;
            }

            return true;
          });

          doc.children = recursiveChildren;
        }

        return doc;
      }),
    );

    // Filter out empty categories/subcategories based on their respective flags
    return populatedDocs.filter((doc) => {
      if (doc.type === serviceTypes.Category) {
        if (removeEmptyCategories && (!doc.children || doc.children.length === 0)) {
          return false;
        }
      }
      if (doc.type === serviceTypes.Subcategory) {
        if (removeEmptySubCategory && (!doc.children || doc.children.length === 0)) {
          return false;
        }
      }
      return true;
    });
  } catch (error) {
    rethrowIfKnown(error, "Error while deep populating", {});
  }
}
