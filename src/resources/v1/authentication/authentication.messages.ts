import { statusCodes } from "@/utils/definitions/constants/common";

export const authenticationErrors = {
    notFound: {
        message: "tokenErrorMessages.TokenNotFound,",
        status: statusCodes.NotFound,
    },
    SomethingWentWrong: {
        message: "Something went wrong. Please try again later.",
        status: statusCodes.InternalServerError,
    },
    UserCreated: {
        message: "User created successfully. Please verify your email.",
        status: statusCodes.Created,
    },
    user_already_exists: {
        message: "User with this phone number already exists.",
        status: statusCodes.Conflict,
    },
    UserNotFound: {
        message: "User with this phone number does not exist.",
        status: statusCodes.NotFound,
    },
    country_not_found: {
        message: "Country with this code does not exist.",
        status: statusCodes.NotFound,
    },
    country_not_active: {
        message: "Country with this code is not active.",
        status: statusCodes.BadRequest,
    },
    otp_not_supported: {
        message: "OTP authentication is not supported in this country.",
        status: statusCodes.BadRequest,
    },
    invalid_phone_number: {
        message: "The provided phone number is invalid.",
        status: statusCodes.BadRequest,
    },
    phone_country_mismatch: {
        message: "The provided phone number does not match the selected country.",
        status: statusCodes.BadRequest,
    },
    invalid_otp: {
        message: "The provided OTP is invalid.",
        status: statusCodes.BadRequest,
    },
    otp_expired: {
        message: "The provided OTP has expired.",
        status: statusCodes.BadRequest,
    },
    otp_already_used: {
        message: "The provided OTP has already been used.",
        status: statusCodes.BadRequest,
    },
    invalid_otp_format: {
        message: "The provided OTP is invalid.",
        status: statusCodes.BadRequest,
    },
    otp_rate_limit_exceeded: {
        message: "Too many OTP requests. Please try again later.",
        status: statusCodes.TooManyRequests,
    },
    otp_cooldown_active: {
        message: "OTP was recently sent. Please wait before requesting another.",
        status: statusCodes.TooManyRequests,
    },
    invalid_token: {
        message: "The provided token is invalid.",
        status: statusCodes.BadRequest,
    },
    invalid_credentials: {
        message: "The provided credentials are invalid.",
        status: statusCodes.Unauthorized,
    },
    user_not_found: {
        message: "User not found.",
        status: statusCodes.NotFound,
    },
    otp_not_found: {
        message: "OTP not found for the given id {0}.",
        status: statusCodes.NotFound,
    },
    otp_not_valid: {
        message: "OTP is not matching.",
        status: statusCodes.NotFound,
    },
    otp_inactive: {
        message: "OTP is inactive.",
        status: statusCodes.NotFound,
    },
    otp_attempt_limit_exceeded: {
        message: "Maximum OTP attempts exceeded.",
        status: statusCodes.TooManyRequests,
    },
    invalid_declaimer_ids: {
        message: "The provided declaimer ids are invalid.",
        status: statusCodes.BadRequest,
    },
    role_not_found: {
        message: "Role not found for the given type {0}.",
        status: statusCodes.NotFound,
    },
    error_while_creating_user: {
        message: "Error while creating user.",
        status: statusCodes.InternalServerError,
    },
    auth_session_not_created: {
        message: "Error while creating auth session.",
        status: statusCodes.InternalServerError,
    },
    session_already_exists: {
        message: "Session already exists.",
        status: statusCodes.BadRequest,
    },
    declaimer_not_found: {
        message: "Declaimer not found for the given id {0}.",
        status: statusCodes.NotFound,
    },
    invalid_declaimer_id: {
        message: "The provided declaimer id is invalid.",
        status: statusCodes.BadRequest,
    },
    tokens_not_defined: {
        message: "Tokens not defined.",
        status: statusCodes.BadRequest,
    },
    invalid_refresh_token: {
        message: "The provided refresh token is invalid.",
        status: statusCodes.BadRequest,
    },
    invalid_access_token: {
        message: "The provided access token is invalid.",
        status: statusCodes.BadRequest,
    },
    session_not_found: {
        message: "Session not found for the given id {0}.",
        status: statusCodes.NotFound,
    },
    session_revoked: {
        message: "Session has been revoked.",
        status: statusCodes.BadRequest,
    },
    role_mismatch: {
        message: "User role mismatch.",
        status: statusCodes.Unauthorized,
    },
    registration_role_restricted: {
        message: "Registration is not permitted for the requested role.",
        status: statusCodes.BadRequest,
    },
    declaimer_required: {
        message: "Declaimers are required for registration.",
        status: statusCodes.BadRequest,
    },
};

export const authenticationSuccess = {
    UserCreated: {
        message: "User created successfully. Please verify your email.",
        status: statusCodes.Created,
    },
    otp_sent_successfully: {
        message: "OTP sent successfully.",
        status: statusCodes.OK,
    },
    admin_login: {
        message: "Admin logged in successfully.",
        status: statusCodes.OK,
    },
    otp_verified_successfully: {
        message: "OTP verified successfully.",
        status: statusCodes.OK,
    },
    token_refreshed: {
        message: "Token refreshed successfully.",
        status: statusCodes.OK,
    },
    logout_successful: {
        message: "Logout successful.",
        status: statusCodes.OK,
    },
    logout_successful_from_all_devices: {
        message: "Logout successful from all devices.",
        status: statusCodes.OK,
    },
};
