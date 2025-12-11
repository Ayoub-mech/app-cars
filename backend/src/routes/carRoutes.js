import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Car from "../models/Car.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

/* ----------  CREATE  ---------- */
router.post("/", protectRoute, async (req, res) => {
  try {
    // de-structure the NEW fields sent by mobile
    const {
      price,
      sellerType,
      sellerName,
      phone,
      email,
      city,
      address,
      brand,
      model,
      year,
      month,
      mileage,
      carCity,
      pictureUrl,   // base64 data-uri from mobile
    } = req.body;

    // quick validation
    if (!pictureUrl || !price || !sellerName || !phone || !email || !address || !brand || !model || !year || !month || !mileage) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // upload base64 to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(pictureUrl, {
      folder: "cars",
    });
    const imageUrl = uploadResponse.secure_url;

    const newCar = new Car({
      price: Number(price),
      sellerType,
      sellerName,
      phone,
      email,
      city,
      address,
      brand,
      model,
      year: Number(year),
      month: Number(month),
      mileage: Number(mileage),
      carCity,
      pictureUrl: imageUrl,
      user: req.user._id,
    });

    await newCar.save();
    res.status(201).json(newCar);
  } catch (error) {
    console.log("Error creating car", error);
    res.status(500).json({ message: error.message });
  }
});

/* ----------  LIST (paginated)  ---------- */
router.get("/", protectRoute, async (req, res) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 2;
    const skip  = (page - 1) * limit;

    const cars = await Car.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalCars = await Car.countDocuments();

    res.json({
      cars,
      currentPage: page,
      totalCars,
      totalPages: Math.ceil(totalCars / limit),
    });
  } catch (error) {
    console.log("Error in get all cars route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ----------  USER CARS  ---------- */
router.get("/user", protectRoute, async (req, res) => {
  try {
    const cars = await Car.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    console.error("Get user cars error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/* ----------  DELETE  ---------- */
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (car.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    // remove from Cloudinary
    if (car.pictureUrl && car.pictureUrl.includes("cloudinary")) {
      try {
        const publicId = car.pictureUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.log("Cloudinary delete error", e);
      }
    }

    await car.deleteOne();
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.log("Error deleting car", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;