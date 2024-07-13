import { OrderTimeline, OrderTimelineModel } from "../model";

export class OrderTimelineRepository {
  async create(input: OrderTimeline) {
    await OrderTimelineModel.create(input);
  }
}
