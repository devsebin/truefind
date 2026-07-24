import multer, { FileFilterCallback } from "multer";

// Allowed MIME types
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];

// File filter function
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Allowed: images, PDFs, Excel."));
  }
};

export const upload = multer({
  storage: multer.diskStorage({}), // stores temp file in /tmp
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});
