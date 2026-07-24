import mongoose, { ClientSession, Model } from "mongoose";

import { rethrowIfKnown } from "@/utils/responses/error.response";

import { IPriorities } from "@/database/priority/priority-db-interface";
import PriorityModel from "@/database/priority/priority-db-model";
import StatusModel from "@/database/status/status-db-model";
import { IStatus } from "@/database/status/status-db-interface";

export interface IBaseFindOptions {
  setDefault?: boolean;
  session?: ClientSession;
}
class findStatusDefaultHelperService {
  private readonly statusRepository: Model<IStatus>;

  constructor() {
    this.statusRepository = StatusModel;
  }

  public async execute(
    body: Partial<IStatus>,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<Partial<IStatus>> {
    const { setDefault = false, session } = options;

    try {
      let dbQuery = this.statusRepository.findOne({
        is_default: true,
        is_active: true,
        is_deleted: false,
      });

      if (session) {
        dbQuery = dbQuery.session(session);
      }

      const document = await dbQuery;

      if (setDefault && !document) {
        body.is_default = true;
      }

      return body as Partial<IStatus>;
    } catch (error) {
      rethrowIfKnown(error, "Error while finding default status", errorMap);
    }
  }
}

export default new findStatusDefaultHelperService();
