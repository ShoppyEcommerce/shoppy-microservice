import {
  AdminPaymentModel,
  ParcelDelivery,
  ParcelDeliveryModel,
} from "../model";

export class ParcelDeliveryRepository {
  async create(input: ParcelDelivery) {
    return await ParcelDeliveryModel.create(input);
  }
  async getAllParcelDelivery(input: Partial<ParcelDelivery>) {
    return await ParcelDeliveryModel.findAll({
      where: input,
      include: [{ model: AdminPaymentModel }],
    });
  }
  async getParcelDelivery(input: Partial<ParcelDelivery>) {
    return await ParcelDeliveryModel.findOne({
      where: input,
      include: [{ model: AdminPaymentModel }],
    });
  }
}
