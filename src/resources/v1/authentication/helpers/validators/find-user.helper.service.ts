import mongoose, { ClientSession, HydratedDocument, Model } from "mongoose";
import User from "@/database/users/users-db-model";
import { IUser } from "@/database/users/users-db-interface";
import { roleTypes } from "@/utils/definitions/constants/role-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../authentication.helper";
import { authenticationErrors } from "../../authentication.messages";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import bcrypt from "bcrypt";

class findUserHelperService {
    private readonly userRepository: Model<IUser>;

    constructor() {
        this.userRepository = User;
    }

    public async findAdminUser(
        email: string,
        session: ClientSession,
        status: mongoose.Types.ObjectId,
    ): Promise<HydratedDocument<IUser>> {
        try {
            const user = await this.userRepository
                .findOne({
                    email,
                    role: { $in: [roleTypes.SuperAdmin, roleTypes.Admin, roleTypes.Employee] },
                    // status: status,
                    is_deleted: false,
                    is_active: true,
                })
                .session(session)
                .exec();

            if (!user || !user.password) {
                const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
                    message: "User not found",
                    data: { email },
                    filler: { email },
                });

                throwError("user_not_found", response);
            }

            return user as HydratedDocument<IUser>;
        } catch (error) {
            rethrowIfKnown(error, "Error while fetching admin user", authenticationErrors);
        }
    }

    public async findUserByPhone(
        phone: string,
        requestedRole: string,
        session: ClientSession,
    ): Promise<HydratedDocument<IUser>> {
        try {
            const user = await this.userRepository
                .findOne({ phone, is_active: true })
                .session(session);

            if (!user) {
                throwError(
                    "user_not_found",
                    ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
                        message: "User not found",
                        data: { phoneNumber: phone },
                        filler: { phoneNumber: phone },
                    }),
                );
            }

            if (user!.role !== requestedRole) {
                throwError(
                    "role_mismatch",
                    ResponseBuilder.error(ErrorTypes.UNAUTHORIZED, {
                        message: "User role mismatch",
                        data: { requested: requestedRole, actual: user!.role },
                    }),
                );
            }

            return user as HydratedDocument<IUser>;
        } catch (error) {
            rethrowIfKnown(error, "Error validating user", authenticationErrors);
            return null as any;
        }
    }

    public async ensureUserDoesNotExist(
        phone: string,
        session: ClientSession,
    ): Promise<void> {
        try {
            const user = await this.userRepository
                .findOne({ phone, is_active: true })
                .session(session);
            if (user) {
                const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
                    message: "User with this phone number already exists",
                    data: { phoneNumber: phone },
                    filler: { phoneNumber: phone },
                });
                throwError("user_already_exists", response);
            }
        } catch (error) {
            rethrowIfKnown(error, "Error validating user", authenticationErrors);
        }
    }

    public async validatePassword(password: string, user: any): Promise<void> {
        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                const response = ResponseBuilder.error(ErrorTypes.UNAUTHORIZED, {
                    message: "Invalid credentials",
                    data: {},
                    filler: {},
                });

                throwError("invalid_credentials", response);
            }
        } catch (error) {
            rethrowIfKnown(error, "Error while validating password", authenticationErrors);
        }
    }
}

export default new findUserHelperService();
