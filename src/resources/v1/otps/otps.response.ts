export const otpResponse = (otp: any) => {
    return {
        id: otp._id,
        phoneNumber: otp.phoneNumber,
        expires_at: otp.expires_at,
        is_active: otp.is_active,
    };
};
