export const DocumentSuccessMessages = {
    FileUploadToS3: {
        message: "File uploaded successfully",
        status: 200,
    },
    file_upload_success: {
        message: "File upload successful",
        status: 200,
    },
    file_fetched: {
        message: "File fetched successfully",
        status: 200,
    },
    file_deleted: {
        message: "File deleted successfully",
        status: 200,
    },
};

export const DocumentErrorMessages = {
    SomethingWentWrong: {
        message: "Something went wrong",
        status: 500,
    },
    file_upload_failed: {
        message: "File upload failed",
        status: 500,
    },
    invalid_id: {
        message: "Invalid ID",
        status: 400,
    },
    file_not_found: {
        message: "File not found",
        status: 404,
    },
    status_not_found: {
        message: "Deleted status not found",
        status: 404,
    },
    file_key_missing: {
        message: "File key is missing",
        status: 400,
    },
    file_too_large: {
        message: "File is too large. Maximum allowed is 1000 rows.",
        status: 400,
    },
    file_invalid: {
        message: "File contains invalid data",
        status: 400,
    },
    data_fetch_error: {
        message: "Error fetching data from signed URL",
        status: 500,
    },
    empty_file: {
        message: "File is empty",
        status: 400,
    },
    invalid_data: {
        message: "File contains invalid data",
        status: 400,
    },
};
