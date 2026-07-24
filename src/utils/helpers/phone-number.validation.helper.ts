const { parsePhoneNumberFromString } = require("libphonenumber-js");

const validatePhoneNumber = (value: string, countryCode: string) => {
  if (!countryCode) {
    return {
      isValid: false,
      message: "countryCode is required for phone validation",
    };
  }

  let phoneNumber;

  try {
    phoneNumber = value.startsWith("+")
      ? parsePhoneNumberFromString(value)
      : parsePhoneNumberFromString(value, countryCode);
  } catch (err) {
    return {
      isValid: false,
      message: "Invalid phone format",
    };
  }

  if (!phoneNumber || !phoneNumber.isValid()) {
    return {
      isValid: false,
      message: `Invalid phone number for country ${countryCode}`,
    };
  }

  return {
    isValid: true,
    value,
  };
};

module.exports = validatePhoneNumber;
