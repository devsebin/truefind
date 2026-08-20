import RolesModel from "@/database/roles/roles-db-model";
import IRole from "@/database/roles/roles-db-interface";

let rolesCache: Record<string, IRole> | null = null;

export const getRoleById = async (id: string): Promise<IRole | null> => {
    if (!rolesCache) {
        rolesCache = {};
        const roles = await RolesModel.find({}).lean();
        roles.forEach((role: any) => {
            rolesCache![role._id.toString()] = role;
        });
    }

    return rolesCache[id] || null;
};

export const refreshRolesCache = () => {
    rolesCache = null;
};
