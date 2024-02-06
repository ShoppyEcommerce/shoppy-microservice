import multer, { Multer, FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    console.log(file);
    const split = file.mimetype.split("/")[0];
    console.log(split);

    if (split !== "image") {
      return cb(new Error("invalid image"), "");
    }

    cb(null, file.originalname);
  },
});

const storages = multer.diskStorage({
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only image files are allowed."));
  }
};

const upload = multer({ storage: storage });
const uploads: Multer = multer({ storage: storages, fileFilter });

export { upload, uploads };
