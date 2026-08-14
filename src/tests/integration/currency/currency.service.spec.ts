import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { requestContext } from "@/utils/context/request-context";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { CurrencyModel } from "@/database/currencies/currencies-db-model";
import DocumentModel from "@/database/documents/documents-db-model";

import createCurrenciesService from "@/resources/v1/masters/currencies/services/create-currencies.service";
import listCurrenciesService from "@/resources/v1/masters/currencies/services/list-currencies.service";
import showCurrenciesService from "@/resources/v1/masters/currencies/services/show-currencies.service";
import updateCurrenciesService from "@/resources/v1/masters/currencies/services/update-currencies.service";
import deleteCurrenciesService from "@/resources/v1/masters/currencies/services/delete-currencies.service";
import enableCurrenciesService from "@/resources/v1/masters/currencies/services/enable-currencies.service";
import disableCurrenciesService from "@/resources/v1/masters/currencies/services/disable-currencies.service";

describe("Currencies Master Service (Integration)", () => {
  let testUser: any;
  let activeStatus: any;
  let dollarSymbol: any;

  beforeAll(async () => {
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await CurrencyModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
  });

  beforeEach(async () => {
    await CurrencyModel.deleteMany({});
    await DocumentModel.deleteMany({});
    await UserModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});

    activeStatus = await StatusModel.create({
      title: "Active",
      label: "active",
      color: "#00FF00",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    const defaultPriority = await PriorityModel.create({
      title: "High",
      label: "High priority",
      color: "#ff0000",
      is_default: true,
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: activeStatus._id,
      priority_id: defaultPriority._id,
    });

    dollarSymbol = await DocumentModel.create({
      name: "dollar.png",
      document_type: "image",
      content_type: "image/png",
      keys: { original: "usd-symbol-key" },
      status_id: activeStatus._id,
    });
  });

  it("should support complete CRUD operations and constraints validation for Currencies", async () => {
    const payload = {
      title: "US Dollar",
      label: "usd",
      code: "USD",
      symbol: dollarSymbol._id.toString(),
    };

    // 1. Create Currency
    let createResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createCurrenciesService.execute({ body: payload } as any);
    });

    expect(createResult.result.code).toBe(201);
    const currencyId = createResult.result.data[0].result.id;
    expect(currencyId).toBeDefined();

    // Duplicate test
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult = await createCurrenciesService.execute({ body: payload } as any);
    });
    expect(duplicateResult.result.code).toBe(409);

    // 2. List Currencies
    const listResult: any = await listCurrenciesService.execute({
      query: { code: "USD" },
    } as any);
    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.length).toBe(1);

    // 3. Show Currency
    const showResult: any = await showCurrenciesService.execute(currencyId);
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.code).toBe("USD");

    // 4. Update Currency
    let updateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateCurrenciesService.execute(currencyId, {
        body: { title: "United States Dollar" },
      } as any);
    });
    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.title).toBe("United States Dollar");

    // 5. Disable Currency
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disableCurrenciesService.execute(currencyId);
    });
    expect(disableResult.result.code).toBe(200);
    expect(disableResult.result.data[0].result.is_active).toBe(false);

    // 6. Enable Currency
    let enableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableResult = await enableCurrenciesService.execute(currencyId);
    });
    expect(enableResult.result.code).toBe(200);
    expect(enableResult.result.data[0].result.is_active).toBe(true);

    // 7. Delete Currency (with force option)
    let deleteResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteResult = await deleteCurrenciesService.execute(currencyId, testUser._id, true);
    });
    expect(deleteResult.result.code).toBe(200);

    // Verify soft-deleted
    const findDeleted = await CurrencyModel.findOne({ _id: currencyId, is_deleted: false });
    expect(findDeleted).toBeNull();
  });
});
