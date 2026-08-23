import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import createCarouselsService from "@/resources/v1/masters/carousels/services/create-carousels.service";
import listCarouselsService from "@/resources/v1/masters/carousels/services/list-carousels.service";
import showCarouselsService from "@/resources/v1/masters/carousels/services/show-carousels.service";
import updateCarouselsService from "@/resources/v1/masters/carousels/services/update-carousels.service";
import deleteCarouselsService from "@/resources/v1/masters/carousels/services/delete-carousels.service";
import enableCarouselsService from "@/resources/v1/masters/carousels/services/enable-carousels.service";
import disableCarouselsService from "@/resources/v1/masters/carousels/services/disable-carousels.service";
import CarouselModel from "@/database/carousels/carousels-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildCarouselPayload } from "../../factories/carousels.factory";
import { carouselInputValidator } from "@/resources/v1/masters/carousels/carousels.validator";

describe("Carousels Master Service (Integration)", () => {
  let testUser: any;
  let defaultStatus: any;
  let defaultPriority: any;

  beforeAll(async () => {
    try {
      await CarouselModel.collection.dropIndexes();
    } catch (e) {}
    await CarouselModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    await CarouselModel.deleteMany({});
    await UserModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});

    defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    defaultPriority = await PriorityModel.create({
      title: "High",
      label: "High priority",
      color: "#ff0000",
      is_default: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });
  });

  it("should validate that both button and redeemCode cannot be present simultaneously in the payload", () => {
    const invalidPayload = {
      slideType: "promotion",
      title: "Conflict Promo",
      button: {
        text: "Click Me",
        url: "https://example.com",
      },
      redeemCode: "PROMO2026",
    };

    const validationResult = carouselInputValidator.validate(invalidPayload);
    expect(validationResult.error).toBeDefined();
    expect(validationResult.error?.message).toContain("must not exist simultaneously with [redeemCode]");

    // Valid with only button
    const validWithButton = {
      slideType: "promotion",
      title: "Valid Button",
      button: {
        text: "Click Me",
        url: "https://example.com",
      },
    };
    expect(carouselInputValidator.validate(validWithButton).error).toBeUndefined();

    // Valid with only redeemCode
    const validWithRedeemCode = {
      slideType: "coupon",
      title: "Valid Coupon",
      redeemCode: "PROMO2026",
    };
    expect(carouselInputValidator.validate(validWithRedeemCode).error).toBeUndefined();
  });

  it("should successfully execute CRUD and state operations on carousels", async () => {
    // 1. Create Carousel with button
    const payload = buildCarouselPayload({
      slideType: "promotion",
      title: "Summer Bonanza",
      description: "Huge discounts",
      button: {
        text: "Check Now",
        action: "navigate",
        url: "https://example.com/summer",
      },
    });
    delete (payload as any).redeemCode;

    let createResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createCarouselsService.execute({
        body: payload,
        originalUrl: "/api/v1/masters/carousels",
        method: "POST",
      } as any, payload);
    });

    expect(createResult.result.code).toBe(201);
    const carouselId = createResult.result.data[0].result.id;
    expect(carouselId).toBeDefined();
    expect(createResult.result.data[0].result.title).toBe("Summer Bonanza");
    expect(createResult.result.data[0].result.slideType).toBe("promotion");

    // 2. List Carousels
    const listResult: any = await listCarouselsService.execute({
      query: { page: "1", limit: "10" },
      originalUrl: "/api/v1/masters/carousels",
      method: "GET",
    } as any);
    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.rows.length).toBe(1);
    expect(listResult.result.data[0].result.totalCount).toBe(1);

    // 3. Show Carousel
    const showResult: any = await showCarouselsService.execute(carouselId);
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.title).toBe("Summer Bonanza");

    // 3.5 Show 404
    const fakeId = new mongoose.Types.ObjectId();
    const show404Result: any = await showCarouselsService.execute(fakeId);
    expect(show404Result.result.code).toBe(404);

    // 4. Update Carousel
    const updatePayload = {
      title: "Mega Summer Bonanza",
      description: "Even bigger discounts",
    };
    let updateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateCarouselsService.execute(carouselId, { body: updatePayload } as any, updatePayload);
    });
    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.title).toBe("Mega Summer Bonanza");

    // 4.5 Update with no changes
    let updateNoChangeResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateNoChangeResult = await updateCarouselsService.execute(carouselId, { body: updatePayload } as any, updatePayload);
    });
    expect(updateNoChangeResult.result.code).toBe(400);

    // 5. Disable Carousel
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disableCarouselsService.execute(carouselId, testUser._id);
    });
    expect(disableResult.result.code).toBe(200);

    // 5.5 Disable already inactive
    let disableAgainResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableAgainResult = await disableCarouselsService.execute(carouselId, testUser._id);
    });
    expect(disableAgainResult.result.code).toBe(400);

    // 6. Enable Carousel
    let enableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableResult = await enableCarouselsService.execute(carouselId, testUser._id);
    });
    expect(enableResult.result.code).toBe(200);

    // 6.5 Enable already active
    let enableAgainResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableAgainResult = await enableCarouselsService.execute(carouselId, testUser._id);
    });
    expect(enableAgainResult.result.code).toBe(400);

    // 7. Delete Carousel (with force)
    let deleteForceResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteForceResult = await deleteCarouselsService.execute(carouselId, testUser._id, true);
    });
    expect(deleteForceResult.result.code).toBe(200);

    // Verify soft-deleted
    const findDeleted = await CarouselModel.findOne({ _id: carouselId, is_deleted: false });
    expect(findDeleted).toBeNull();
  });
});
