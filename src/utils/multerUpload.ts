import crypto from 'crypto';
import GridFsStorage from 'multer-gridfs-storage';
import multer from 'multer';
import path from 'path';
import config from '../config';

const storage = new GridFsStorage({
  url: config.databaseURL,
  options: { useUnifiedTopology: true },
  file: (_, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});

const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb('Error: File upload only supports the following filetypes - ' + filetypes);
};

export default multer({
  fileFilter: (_, file, cb) => checkFileType(file, cb),
  limits: { fileSize: 5 * 1024 * 1024 },
  storage,
}).array('image', 1);
