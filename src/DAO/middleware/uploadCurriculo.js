import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/curriculos");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

function fileFilter(req, file, cb) {
  if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
    return cb(new Error("Envie apenas arquivos PDF"));
  }
  cb(null, true);
}

export const uploadCurriculo = multer({ storage, fileFilter });
