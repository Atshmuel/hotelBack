import { createProduct, deleteProduct, getTime, updateProduct } from "../../services/helpers";
import {
  Cabins,
  CabinUpdateData,
  ID,
  newCabinInt,
} from "../../interfaces/interfaces";
import { cabinModel } from "../models/models";
import { ObjectId } from "mongoose";

export const getCabins = async () => {
  const cabinsArr = await cabinModel.find();
  const hasFound = cabinsArr.length > 0 ? true : false;
  const message = hasFound ? "Found cabins data" : "Failed to find cabins data";
  return { hasFound, message, cabinsArr };
};
export const getCabin = async (id: ObjectId | string) => {
  return await cabinModel.findById(id);
};

export const createCabin = async (newCabin: newCabinInt) => {
  let message = `Cabin name already exist!`;
  let hasCreated = false;
  const sameCabinName = await cabinModel.findOne({
    name: newCabin?.name.trim(),
  });

  if (!sameCabinName) {
    const productId = await createProduct(newCabin.name.trim(), newCabin.regularPrice, newCabin.discount, newCabin.description)

    const createdCabin = await cabinModel.create({
      ...newCabin,
      name: newCabin.name.trim(),
      productId,
      createdAt: getTime(),
    });

    hasCreated = createdCabin === null ? false : true;
    message = hasCreated
      ? `Cabin successfully created !`
      : `Something went wrong, please try again in a moment !`;
    return { hasCreated, message };
  }
  return { hasCreated, message };
};

export const deleteCabin = async (id: ObjectId) => {
  const cabinData = await cabinModel.findById(id);
  const deleteStripeProduct = await deleteProduct(cabinData.productId)
  if (!deleteStripeProduct) return false
  const { deletedCount } = await cabinModel.deleteOne({ _id: id })
  return deletedCount
};

export const editCabinData = async (id: ObjectId, newCabinData: Cabins) => {
  let hasUpdated = false;

  const oldCabinData = await cabinModel.findById(id);
  if (!oldCabinData) {
    return { hasUpdated, message: "Could not find this cabin." };
  }

  const alreadyExists = await cabinModel.findOne({
    name: newCabinData?.name.trim(),
  });
  if (alreadyExists && newCabinData.name.trim() !== oldCabinData.name.trim()) {
    return { hasUpdated, message: "Cabin name already exists." };
  }

  const updates: CabinUpdateData = {};
  if (oldCabinData?.name.trim() !== newCabinData?.name.trim()) updates.name = newCabinData?.name.trim();
  if (oldCabinData?.maxCapacity !== newCabinData?.maxCapacity) updates.maxCapacity = newCabinData?.maxCapacity;
  if (oldCabinData?.regularPrice !== newCabinData?.regularPrice) updates.regularPrice = newCabinData?.regularPrice;
  if (oldCabinData?.discount !== newCabinData?.discount) updates.discount = newCabinData?.discount;
  if (oldCabinData?.description !== newCabinData?.description) updates.description = newCabinData?.description;
  if (oldCabinData?.imgsUrl !== newCabinData?.imgsUrl) updates.imgsUrl = newCabinData?.imgsUrl;
  if (Object.keys(updates).length === 0) {
    return { hasUpdated, message: "No changes detected." };
  }
  const updateStripeProduct = await updateProduct(oldCabinData?.productId, newCabinData.name, newCabinData.description, newCabinData.regularPrice, newCabinData.discount, oldCabinData.regularPrice, oldCabinData.discount)
  if (!updateStripeProduct) {
    return { hasUpdated, message: "Could not update prices in Stripe, therefore prevented update." };
  }
  updates.lastUpdate = getTime();
  await cabinModel.findByIdAndUpdate(id, updates);

  hasUpdated = true;
  return { hasUpdated, message: "Cabin has been updated successfully!" };

};
