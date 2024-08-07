import dotenv from "dotenv";
dotenv.config();
import Jwt from "jsonwebtoken";
// import amqplib, { Channel } from "amqplib";
import { BadRequestError, UnAuthorized } from "./ErrorHandler";
import bcryptjs, { genSaltSync } from "bcryptjs";
import {
  User,
  UserModel,
  ProfileModel,
  ShopModel,
  Shop,
  RiderModel,
} from  "../database";
export class Utils {
  static async Encoded(input: { id: string }) {
    try {
      return Jwt.sign(input, process.env.JWT_SECRET!);
    } catch (error) {
      throw new BadRequestError("invalid data", "bad request");
    }
  }
  static async Decoded(token: string): Promise<string | Jwt.JwtPayload> {
    try {
      const verify = Jwt.verify(token, process.env.JWT_SECRET!);
      return verify;
    } catch (error) {
      const customErr = error as Jwt.JsonWebTokenError;

      throw new UnAuthorized(customErr.message, "");
    }
  }
  // static async CreateChannel() {
  //   try {
  //     const connection = await amqplib.connect(process.env.MSG_QUEUE_URL!);
  //     const channel = await connection.createChannel();
  //     await channel.assertQueue(process.env.EXCHANGE_NAME!, { durable: true });
  //     return channel;
  //   } catch (err) {
  //     throw err;
  //   }
  // }
  static async generatePaymentReference(userId: string) {
    const timestamp = Date.now().toString();
    const randomString = Math.random().toString(36).substring(2, 8); // Adjust length as needed
    return `${userId}_${timestamp}_${randomString}`;
  }
  static async HashPassword(password: string) {
    const hashedPassword = bcryptjs.hashSync(password, genSaltSync());
    return hashedPassword;
  }
  static async ComparePassword(password: string, comparePassword: string) {
    const compare = bcryptjs.compareSync(password, comparePassword);
    return compare;
  }

  // static async PublishMessage(channel: Channel, service: any, msg: any) {
  //   channel.publish(process.env.EXCHANGE_NAME!, service, Buffer.from(msg));
  //   console.log("Sent: ", msg);
  // }
  // static async SubscribeMessage(channel: Channel, service: any) {
  //   await channel.assertExchange(process.env.EXCHANGE_NAME!, "direct", {
  //     durable: true,
  //   });
  //   const q = await channel.assertQueue("", { exclusive: true });
  //   console.log(` Waiting for messages in queue: ${q.queue}`);

  //   channel.bindQueue(
  //     q.queue,
  //     process.env.EXCHANGE_NAME!,
  //     process.env.USER_SERVICE!
  //   );

  //   channel.consume(
  //     q.queue,
  //     (msg) => {
  //       if (msg?.content) {
  //         console.log("the message is:", msg.content.toString());
  //         service.SubscribeEvents(msg.content.toString());
  //       }
  //       console.log("[X] received");
  //     },
  //     {
  //       noAck: true,
  //     }
  //   );
  // }
  static Capitalizeword(input: string) {
    const array = input.split(" ");
    const word = [];
    for (let i = 0; i < array.length; i++) {
      const first =
        array[i].slice(0, 1).toUpperCase() + array[i].slice(1, array[i].length);
      word.push(first);
    }

    return word.join(" ").trimEnd();
  }
  static async FormatData(data: any) {
    if (data) {
      return { data };
    } else {
      throw new Error("Data Not found!");
    }
  }

  static intertionalizePhoneNumber(telephone: string, code = "234") {
    const arrangenumber = telephone
      .split("")
      .reverse()
      .join("")
      .substring(0, 10)
      .split("")
      .reverse()
      .join("");
    console.log(arrangenumber);
    return `${code}${arrangenumber}`;
  }
  static generateTrackingCode() {
    return Math.floor(100000 + Math.random() * 900000);
  }
  static generateRandomNumber() {
    const time = Date.now();
    const OTP = Math.floor(100000 + Math.random() * 900000);
    return { OTP, time };
  }
  static generatePassword(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
 
    return result;

  }
  static generateVerification() {
    const time = Date.now();
    const OTP = Math.floor(1000 + Math.random() * 9000);
    return { OTP, time };
  }
  static async getModel(id: string) {
    const user = (await UserModel.findByPk(id, {
      include: {
        model: ProfileModel,
        attributes: ["location", "country", "state", "city", "image"],
      },
      attributes: {
        exclude: ["password", "confirmPassword"],
      },
    })) as unknown as User;
    if (user) {
      return this.transformUser(user);
    }

    const shop = await ShopModel.findByPk(id);
    if (shop) {
      return this.transformShop(shop);
    }

    const rider = await RiderModel.findByPk(id);
    if (rider) {
      return this.transformRider(rider);
    } else {
      throw new BadRequestError("unAuthorized pls kindly login", "");
    }
  }

  static transformUser(data: any) {
    return {
      id: data?.dataValues?.id,
      profile: data?.dataValues?.ProfileModel?.dataValues,
    };
  }
  static transformVendor(data: any) {
    return {
      id: data.dataValues.id,
      profile: data.dataValues.VendorProfileModel,
    };
  }
  static transformDelivery(data: any) {
    return {
      id: data.dataValues.id,
      profile: data.dataValues.DeliveryProfileModel,
    };
  }
  static transformShop(data: any) {
    return {
      id: data.dataValues.id,
    };
  }
  static transformRider(data: any) {
    return {
      id: data.dataValues.id,
    };
  }
}
