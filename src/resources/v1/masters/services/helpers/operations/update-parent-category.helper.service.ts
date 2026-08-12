import { IBaseServiceDocument } from "@/database/services/services-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { servicesErrorsMessages } from "../../services.messages";

class updateParentCategoryHelperService {
  public async execute(
    parentCategory: IBaseServiceDocument,
    childId: mongoose.Types.ObjectId,
    session: mongoose.ClientSession,
  ): Promise<void> {
    try {
      parentCategory.children.push(childId as any);
      await parentCategory.save({ session });
    } catch (err: any) {
      rethrowIfKnown(err, "Error updating parent category", servicesErrorsMessages);
    }
  }
}

export default new updateParentCategoryHelperService();
