import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    /* prix */
    price: { type: Number, required: true },

    /* informations du vendeur */
    sellerType:  { type: String, enum: ["Professionnel", "Particulier"], required: true },
    sellerName:  { type: String, required: true },
    phone:       { type: String, required: true },
    email:       { type: String, required: true },
    city:        { type: String, required: true },
    address:     { type: String, required: true },

    /* informations de la voiture */
    brand:       { type: String, required: true },
    model:       { type: String, required: true },
    year:        { type: Number, min: 1980, max: 2030, required: true },
    month:       { type: Number, min: 1, max: 12, required: true },
    mileage:     { type: Number, required: true },
    carCity:     { type: String, required: true },

    /* photo */
    pictureUrl:  { type: String, required: true },

    /* lien vers le vendeur (user) */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Car", carSchema);