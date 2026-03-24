export const fileFilter = (validation = []) => {
  return function (req, file, cb) {
    if (!validation.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type", { cause: { status: 400 } }),
        false,
      );
    }
    return cb(null, true);
  };
};
export const fileFieldValidation = {
  image: ["image/jpeg", "image/png", "image/jpg"],
  video: ["video/mp4", "video/mkv", "video/avi"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
};
