import User from "../../../database/users/users-db-model";
import { generateUserData } from "../data-source/user.data";
export const seedUser = async () => {
  //user apis

  await User.deleteMany({});
  const user = await generateUserData();
  await User.insertMany(user);
};
