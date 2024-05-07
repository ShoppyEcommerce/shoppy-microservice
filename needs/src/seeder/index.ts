import { ModuleModel } from "../database";
import { v4 as uuid } from "uuid";

const modules = [
  {
    name: "SuperMarkets",
    caption: "",
  },
  {
    name: "Food",
    caption: "",
  },
  {
    name: "Pharmacy",
    caption: "",
  },
  {
    name: "Parcel Delivery",
    caption: "",
  },
  {
    name: "Services",
    caption: "",
  },
  {
    name: "Gadget",
    caption: "",
  },
];

export const createModule = async () => {
  await Promise.all(
    modules.map(async (module) => {
      const Name = await ModuleModel.findOne({
        where: {
          name: module.name,
        },
      });
      if (!Name) {
        await ModuleModel.create({
          name: module.name,
          id: uuid(),
          caption: module.caption,
          image: "",
          active: true,
        });
      }
    })
  );
};
