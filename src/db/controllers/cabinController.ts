import { getTime } from "../../services/helpers";
import { Cabins, CabinUpdateData, ID } from "../../interfaces/interfaces";
import { cabinModel } from "../models/models";

export const getCabins = async () => {
  const cabinsArr = await cabinModel.find();
  const hasFound = cabinsArr.length > 0 ? true : false;
  const message = hasFound ? "Found cabins data" : "Failed to find cabins data";
  return { hasFound, message, cabinsArr };
};
export const getCabin = async (id: ID) => {
  return await cabinModel.findById(id);
};

export const createCabin = async (newCabin: Cabins) => {
  let message = `Cabin name already exist !`;
  let hasCreated = false;
  const sameCabinName = await cabinModel.findOne({
    name: newCabin?.name,
  });
  if (!sameCabinName) {
    const createdCabin = await cabinModel.create({
      ...newCabin,
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

export const deleteCabin = async (id: ID) => {
  const deletedCabinData = await cabinModel.findByIdAndDelete(id);
  return deletedCabinData === null ? false : true;
};

export const editCabinData = async (id: ID, newCabinData: Cabins) => {
  let hasUpdated = true;
  let message;
  const oldCabinData = await cabinModel.findById(id);
  const newData = await cabinModel.findOne({
    name: newCabinData?.name,
  });

  if (!oldCabinData) {
    hasUpdated = false;
    message = "Could not find this cabin.";
    return { hasUpdated, message };
  }

  const {
    name: oldName,
    maxCapacity: oldMaxCapacity,
    regularPrice: oldRegularPrice,
    discount: oldDiscount,
    description: oldDescription,
    imgUrl: oldImgUrl,
  } = oldCabinData;
  const {
    name: newName,
    maxCapacity: newMaxCapacity,
    regularPrice: newRegularPrice,
    discount: newDiscount,
    description: newDescription,
    imgUrl: newImgUrl,
  } = newCabinData;

  const alreadyExits = newData !== null;
  if (
    alreadyExits &&
    newData!._id.toString() !== oldCabinData?._id.toString()
  ) {
    hasUpdated = false;
    message = "This cabin name already exist !";
    return { hasUpdated, message };
  }
  const updates: CabinUpdateData = {};
  if (oldName !== newName) updates.name = newName;
  if (oldMaxCapacity !== newMaxCapacity) updates.maxCapacity = newMaxCapacity;
  if (oldRegularPrice !== newRegularPrice)
    updates.regularPrice = newRegularPrice;
  if (oldDiscount !== newDiscount) updates.discount = newDiscount;
  if (oldDescription !== newDescription) updates.description = newDescription;
  if (oldImgUrl !== newImgUrl) updates.imgUrl = newImgUrl;
  if (Object.keys(updates).length > 0) {
    updates.lastUpdate = getTime();
    await cabinModel.findByIdAndUpdate(id, updates);
    message = "Cabin has updated successfully !";
    return { hasUpdated, message };
  } else {
    hasUpdated = false;
    message = "Found nothing to update !";
    return { hasUpdated, message };
  }
};
