import multer from "multer";

export const upload = multer({ dest: 'uploads/' }); // Temp directory for uploads
