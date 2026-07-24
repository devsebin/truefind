export enum successMessages {
  // general messages
  Success = "Success",
  EmailSent = "Email sent successfully",
  EmailVerified = "Email verified successfully",
  PasswordReset = "Password reset successfully",
  ChangeNotFound = "Change not found",
  PDFGenerated = "PDF generated successfully",
  DocumentUptoDate = "Document already upto date",
}

export enum errorMessages {
  // general messages
  InvalidInput = "Invalid input",
  InvalidToken = "Invalid token",
  InvalidID = "Invalid ID",
  InvalidIDFormat = "Invalid ID format",
  InvalidDate = "Invalid date",
  InvalidDateRange = "Invalid date range",
  InvalidStatus = "Invalid status",
  InvalidType = "Invalid type",
  InvalidRole = "Invalid role",
  InvalidPermission = "Invalid permission",
  InvalidPage = "Invalid page",
  InvalidLimit = "Invalid limit",
  InvalidSort = "Invalid sort",
  InvalidSortOrder = "Invalid sort order",
  InvalidFile = "Invalid file",
  InvalidFileType = "Invalid file type",
  InvalidFileSize = "Invalid file size",
  InvalidFileCount = "Invalid file count",
  InvalidPasswordFormat = "Invalid password format",
  InvalidEmailFormat = "Invalid email format",
  AuthenticationFailed = "Authentication failed",
  AuthenticationExpired = "Authentication expired",
  AuthenticationRequired = "Authentication required",
  SomethingWentWrong = "Something went wrong",
  InvalidCredentials = "Invalid credentials",
  EmailNotSent = "Email not sent",
  ApiNotFound = "API not found",
  UserNotLoggedIn = "User not logged in",
  UserNotFound = "User not found",
  NoDataFound = "No data found",

  // authentication messages
}
export enum statusCodes {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  Gone = 410,
  InternalServerError = 500,
  TooManyRequests = 429,
}
