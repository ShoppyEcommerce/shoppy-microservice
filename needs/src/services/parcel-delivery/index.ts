import { Op, Sequelize } from "sequelize";
import {

  ParcelDelivery,
  ParcelDeliveryRepository,
  ParcelDeliveryStatus,
  ParcelRepository,
  Payment,
  PaymentDeliveryMethod,
  PaymentRepository,
  PaymentStatus,
  PaymentType,
  Profile,
  ProfileRepository,
  Transaction,
  TransactionRepository,
  TransactionType,
  Type,
  WalletRepository,

  AdminType,
  AdminPaymentStatus,
  AdminPayment,
} from "../../database";
import { io } from "../../config/socket";
import * as geolib from "geolib";
import { Utils } from "../../utils";
import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
import { WalletService } from "../wallet";
import { ParceDeliverylValidation, option } from "./validation";
import { v4 as uuid } from "uuid";
import { DeliveryOrder } from "../../config/constant";
import { AdminPaymentService } from "../admin-payment";
import { AdminWalletService } from "../admin-wallet";

export class ParcelDeliveryService {
  private repository: ParcelDeliveryRepository;
  private parcel: ParcelRepository;
  private wallet: WalletRepository;
  private Transaction: TransactionRepository;
  private payment: PaymentRepository;
  private userProfile: ProfileRepository;
;

  constructor() {
    this.repository = new ParcelDeliveryRepository();
    this.parcel = new ParcelRepository();
    this.wallet = new WalletRepository();
    this.Transaction = new TransactionRepository();
    this.payment = new PaymentRepository();
    this.userProfile = new ProfileRepository();
 
  }

  async create(input: ParcelDelivery, ownerId: string) {
    const { error, value } = ParceDeliverylValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const parcel = await this.parcel.find({ id: input.parcelId });
    if (!parcel) {
      throw new BadRequestError("parcel not found", "");
    }
    let transaction = {} as Transaction;
    let payment = {} as Payment;
    let admin = {} as AdminPayment
    if (input.whoIsPaying === "Sender") {
      if ((input.paymentMethod = PaymentDeliveryMethod.USER_WALLET)) {
        const wallet = await this.wallet.walletBalance({ ownerId });
        if (!wallet) {
          throw new BadRequestError("wallet not found", "");
        }
        const res = await new WalletService().debitWallet(
          input.amount,
          ownerId
        );
        admin = {
          id:uuid(),
          parcelDeliveryId:"",
          amount:input.amount,
          type:AdminType.CREDIT,
          status:AdminPaymentStatus.SUCCESS

        }
        payment = {
          id: uuid(),
          merchant: PaymentDeliveryMethod.USER_WALLET,
          amount: input.amount,
          referenceId: res.id,
          paymentType: PaymentType.USER_WALLET,
          userId: ownerId,
          status: PaymentStatus.SUCCESS,
          type: Type.DEBIT,
        };
        transaction = {
          id: uuid(),
          amount: input.amount,
          referenceId: res.id,
          userId: ownerId,
          type: TransactionType.CREDIT_WALLET,
          description: `you sent a parcel to ${input.receiver.name} and the amount of ${input.amount} was deducted from your wallet`,
          paymentId: "",
        };
      } else if (
        input.paymentMethod === PaymentDeliveryMethod.CASH_ON_DELIVERY
      ) {
        transaction = {
          id: uuid(),
          userId: ownerId,
          amount: input.amount,
          referenceId: await Utils.generatePaymentReference(ownerId),
          description: `you sent a parcel to ${input.receiver.name}`,
          type: TransactionType.CASH_ON_DELIVERY,
          paymentId: "",
        };
        payment = {
          id: uuid(),
          merchant: PaymentDeliveryMethod.CASH_ON_DELIVERY,
          amount: input.amount,
          referenceId: await Utils.generatePaymentReference(ownerId),
          paymentType: PaymentType.CASH_ON_DELIVERY,
          userId: ownerId,
          status: PaymentStatus.PENDING,
          type: Type.DEBIT,
        };
      } else {
        throw new BadRequestError("invalid payment delivery method", "");
      }
    }
    const profile = (await this.userProfile.getProfile({
      ownerId,
    })) as unknown as Profile;
    if (!profile) {
      throw new BadRequestError("pls create a profile", "");
    }
    if (!profile.latitude || !profile.longitude) {
      throw new BadRequestError(
        "update your profile with latitude ans longitude",
        ""
      );
    }
    const payed = (await this.payment.create(payment)) as unknown as Payment;
    transaction.paymentId = payed.id;
    const transact = (await this.Transaction.create(
      transaction
    )) as unknown as Transaction;
 
    value.id = uuid();
    value.parcelDeliveryStatus = ParcelDeliveryStatus.ONGOING;
    value.ownerId = ownerId;
    value.transactionId = transact.id;
    // let deliveryMan: DeliveryProfile[] = [];

    // const deliveries = (await DeliveryProfileModel.findAll({
    //   include: DeliveryModel,
    // })) as unknown as DeliveryProfile[];
    // deliveries.map((delivery: DeliveryProfile) => {
    //   const valid = geolib.isPointWithinRadius(
    //     { latitude: delivery.latitude, longitude: delivery.longitude },
    //     { latitude: delivery.latitude, longitude: delivery.longitude },
    //     10000
    //   );

    //   valid && deliveryMan.push(delivery);
    // });
    // const data = await this.repository.create(value) as unknown as ParcelDelivery
    // admin.parcelDeliveryId =  data.id

    // await new AdminWalletService().creditWallet(input.amount)
    // await new AdminPaymentService().create(admin)

    // if (deliveryMan.length > 0) {
    //   deliveryMan.map((delivery) => {
    //     io.emit(DeliveryOrder, { data, delivery: delivery.deliveryManId });
    //   });
    // }

    return "parcel delivery created successfully"
  }

  async getAllParcelDelivery(ownerId:string){

    return await this.repository.getAllParcelDelivery({ownerId})

  }
  async getParcelDelivery(input:{ownerId:string, id:string}){
    const parcel =  await this.repository.getParcelDelivery(input)

    if(!parcel){
      throw new BadRequestError("parcel delivery does not exist","")
    }
  }

  async acceptOrder(){
    
  }

}
