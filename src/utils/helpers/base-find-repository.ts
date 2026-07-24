import { Document, Model, QueryFilter } from "mongoose";
import { IBaseFindOptions } from "../interfaces/base-find-query.interface";

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) { }

  async findOne(query: QueryFilter<T>, options: IBaseFindOptions = {}) {
    const { lean = true, select, populate, sort, session } = options;

    let dbQuery = this.model.findOne(query);

    if (select) dbQuery.select(select);

    if (populate) {
      if (Array.isArray(populate)) {
        dbQuery.populate(populate);
      } else {
        dbQuery.populate(populate);
      }
    }

    if (sort) dbQuery.sort(sort);

    if (session) dbQuery.session(session);

    if (lean) dbQuery.lean();

    return dbQuery;
  }
}
