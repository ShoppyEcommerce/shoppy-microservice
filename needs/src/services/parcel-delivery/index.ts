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
  CategoryRepository,
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
  private categoryRepo: CategoryRepository;
  constructor() {
    this.repository = new ParcelDeliveryRepository();
    this.parcel = new ParcelRepository();
    this.wallet = new WalletRepository();
    this.Transaction = new TransactionRepository();
    this.payment = new PaymentRepository();
    this.userProfile = new ProfileRepository();
    this.categoryRepo = new CategoryRepository();
  }

  async create(input: ParcelDelivery, ownerId: string) {
    const { error, value } = ParceDeliverylValidation.validate(input, option);
    if (error) {
      throw new ValidationError(error.details[0].message, "");
    }
    const category = await this.categoryRepo.Find({ id: input.categoryId });
    if (!category) {
      throw new BadRequestError("category not found", "");
    }
    const profile = (await this.userProfile.getProfile({
      userId: ownerId,
    })) as unknown as Profile;
    if (!profile) {
      throw new BadRequestError("pls create a profile", "");
    }
    if (!profile.latitude || !profile.longitude) {
      throw new BadRequestError(
        "update your profile with latitude and longitude",
        ""
      );
    }
    let transaction = {} as Transaction;
    let payment = {} as Payment;
    let admin = {} as AdminPayment;
    if (input.whoIsPaying === "Sender") {
      if ((input.paymentMethod = PaymentDeliveryMethod.USER_WALLET)) {
        const wallet = await this.wallet.walletBalance({ ownerId });
        if (!wallet) {
          throw new BadRequestError("wallet not found", "");
        }
        const res = await new WalletService().debitWallet(
          input.deliveryFee,
          ownerId
        );
        admin = {
          id: uuid(),
          parcelDeliveryId: "",
          amount: input.deliveryFee,
          type: AdminType.CREDIT,
          status: AdminPaymentStatus.SUCCESS,
        };

        payment = this.createPayment(
          ownerId,
          input.deliveryFee,
          res.id,
          PaymentDeliveryMethod.USER_WALLET,
          PaymentType.USER_WALLET,
          Type.DEBIT,
          PaymentStatus.SUCCESS
        );
        const description = `you sent a parcel to ${input.receiver.name} and the delivery fee of ${input.deliveryFee} was deducted from your wallet`,
          transaction = this.createTransaction(
            ownerId,
            input.deliveryFee,
            res.id,
            description
          );
      } else if (
        input.paymentMethod === PaymentDeliveryMethod.CASH_ON_DELIVERY
      ) {
        const ref = await Utils.generatePaymentReference(ownerId);
        const description = `you sent a parcel to ${input.receiver.name}`;
        transaction = this.createTransaction(
          ownerId,
          input.deliveryFee,
          ref,
          description
        );
        payment = this.createPayment(
          ownerId,
          input.deliveryFee,
          ref,
          PaymentDeliveryMethod.CASH_ON_DELIVERY,
          PaymentType.CASH_ON_DELIVERY,
          Type.DEBIT,
          PaymentStatus.PENDING
        );
      } else {
        throw new BadRequestError("invalid payment delivery method", "");
      }
    }

    const payed = (await this.payment.create(payment)) as unknown as Payment;
    transaction.paymentId = payed.id;
    const transact = (await this.Transaction.create(
      transaction
    )) as unknown as Transaction;

    value.id = uuid();
    value.parcelDeliveryStatus = ParcelDeliveryStatus.PENDING;
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
    const data = (await this.repository.create(
      value
    )) as unknown as ParcelDelivery;
    if (input.paymentMethod === PaymentDeliveryMethod.USER_WALLET) {
      admin.parcelDeliveryId = data.id;

      await new AdminWalletService().creditWallet(input.deliveryFee);
      await new AdminPaymentService().create(admin);
    }

    // if (deliveryMan.length > 0) {
    //   deliveryMan.map((delivery) => {
    //     io.emit(DeliveryOrder, { data, delivery: delivery.deliveryManId });
    //   });
    // }

    return "parcel delivery created successfully";
  }
  private createPayment(
    ownerId: string,
    amount: number,
    ref: string,
    merchant: PaymentDeliveryMethod,
    paymentType: PaymentType,
    type: Type,
    status: PaymentStatus
  ) {
    return {
      id: uuid(),
      merchant,
      amount: amount,
      referenceId: ref,
      paymentType,
      userId: ownerId,
      status,
      type,
    };
  }
  private createTransaction(
    ownerId: string,
    amount: number,
    ref: string,
    description: string
  ) {
    return {
      id: uuid(),
      userId: ownerId,
      amount: amount,
      referenceId: ref,
      description,
      type: TransactionType.CASH_ON_DELIVERY,
      paymentId: "",
    };
  }

  async getAllParcelDelivery(ownerId: string) {
    return await this.repository.getAllParcelDelivery({ ownerId });
  }
  async getParcelDelivery(input: { ownerId: string; id: string }) {
    const parcel = await this.repository.getParcelDelivery(input);

    if (!parcel) {
      throw new BadRequestError("parcel delivery does not exist", "");
    }
  }

  async acceptOrder(riderId: string, id: string) {
    const delivery = (await this.repository.getParcelDelivery({
      id,
    })) as unknown as ParcelDelivery;
    if (!delivery) {
      throw new BadRequestError("delivery does not exist", "");
    }
    if (delivery.parcelDeliveryStatus === ParcelDeliveryStatus.COMPLETED) {
      throw new BadRequestError("This delivery  has been completed", "");
    }
    if (
      delivery.riderId ||
      delivery.parcelDeliveryStatus === ParcelDeliveryStatus.ONGOING
    ) {
      throw new BadRequestError(
        "this delivery has been assigned to a rider",
        ""
      );
    }

    await this.repository.updateDelivery(
      { parcelDeliveryStatus: ParcelDeliveryStatus.ONGOING, riderId },
      delivery.id
    );
  }

  
}
