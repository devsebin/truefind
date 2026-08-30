import mongoose from "mongoose";
import {
  CategoryServiceModel,
  SubcategoryServiceModel,
  ServiceModel,
  BaseServiceModel,
} from "../../database/services/services-db-model";
import dotenv from "dotenv";
dotenv.config();

const verifyServices = async () => {
  await mongoose.connect(process.env.MONGO_PATH as string);

  const total = await BaseServiceModel.countDocuments();
  const categories = await CategoryServiceModel.countDocuments();
  const subcategories = await SubcategoryServiceModel.countDocuments();
  const services = await ServiceModel.countDocuments();

  const tree = await CategoryServiceModel.find({})
    .populate({
      path: "children",
      populate: {
        path: "children",
      },
    })
    .lean();

  console.log("SERVICES_SEEDED_SUMMARY:", JSON.stringify({
    total,
    categories,
    subcategories,
    services,
    structure: tree.map((c: any) => ({
      category: c.name,
      subcategories: (c.children || []).map((sub: any) => ({
        subcategory: sub.name,
        services: (sub.children || []).map((s: any) => s.name),
      })),
    })),
  }, null, 2));

  process.exit(0);
};

verifyServices();
