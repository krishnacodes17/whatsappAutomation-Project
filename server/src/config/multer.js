const multer = require("multer")
const path = require("path")


//  storage configration 
const storage  = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, "uploads/")
    },
    filename:(req,file,cb)=>{
        cb(null , Date.now() + "-" + file.originalname)
    }
})


// File filter - only allow CSV
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files allowed"), false);
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload