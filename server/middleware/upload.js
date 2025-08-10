import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Create upload directories
const createUploadDirs = () => {
  const dirs = [
    'uploads/products',
    'uploads/categories',
    'public/images'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Product upload storage
const productStorage = multer.diskStorage({
  destination: 'uploads/products',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `product-${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// Category upload storage
const categoryStorage = multer.diskStorage({
  destination: 'uploads/categories',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `category-${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// General upload storage (for backward compatibility)
const generalStorage = multer.diskStorage({
  destination: 'public/images',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

export const uploadProduct = multer({ storage: productStorage });
export const uploadCategory = multer({ storage: categoryStorage });
export const upload = multer({ storage: generalStorage });

export default upload;
