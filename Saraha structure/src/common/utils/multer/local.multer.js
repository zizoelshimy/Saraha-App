import multer from "multer";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BASE_UPLOADS_DIR = resolve(__dirname, "../../../../../../uploads");

export const localFileUpload = ({ customPath = "general" } = {}) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fullPath = customPath
        ? resolve(BASE_UPLOADS_DIR, customPath)
        : BASE_UPLOADS_DIR;
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const uniqueFileName = randomUUID() + "-" + file.originalname;
      file.finalPath='/'+customPath+'/'+uniqueFileName;
      cb(null, uniqueFileName);
    },
  });
  return multer({ storage: storage });
};
