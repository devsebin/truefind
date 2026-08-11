import { statusCodes } from "@/utils/definitions/constants/common";

export const otpsErrors = {
    otp_not_found: {
        message: "OTP not found",
        status: statusCodes.NotFound,
    },
    otp_inactive: {
        message: "OTP is inactive.",
        status: statusCodes.BadRequest,
    },
    otp_expired: {
        message: "The provided OTP has expired.",
        status: statusCodes.BadRequest,
    },
    otp_attempt_limit_exceeded: {
        message: "Maximum OTP attempts exceeded.",
        status: statusCodes.TooManyRequests,
    },
    otp_not_valid: {
        message: "OTP is not matching.",
        status: statusCodes.BadRequest,
    },
    otp_already_used: {
        message: "The provided OTP has already been used.",
        status: statusCodes.BadRequest,
    },
};

export const otpsSuccess = {
    otp_verified_successfully: {
        message: "OTP verified successfully.",
        status: statusCodes.OK,
    },
};
