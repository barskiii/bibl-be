import { extname } from "path";

// Parameters for multer diskStorage()
export const diskStorageParams = {
    destination: './uploads',
    filename: (req, file, cb) => {
      const ext = extname(file.originalname)
      const uniqueSufix = Array(16).fill(null).map(() => (Math.round(Math.random() * 16).toString(16))).join('')
      const filename = `${uniqueSufix}-${file.originalname}`
      cb(null, filename);
    }
}