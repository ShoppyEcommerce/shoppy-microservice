// import { databaseConnection } from "../connection";
// import { Model, DataTypes, Sequelize } from "sequelize";
// import { UserModel } from "./user";
// import { VendorModel } from "./vendor";

// export interface VendorProfile {
//   id: string;
//   image: string;
//   logo: string;
//   latitude: number;
//   longitude: number;
//   location: any;
//   createdAt?: Date;
//   updatedAt?: Date;
//   vendorId: string;
//   bankName?: string;
//   accountNumber?: number;
//   accountName?: string;
//   recipient?: string;
//   processingTime?:string
// }
// export class VendorProfileModel extends Model<VendorProfile> {}
// VendorProfileModel.init(
//   {
//     id: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       primaryKey: true,
//     },

//     image: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     logo: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     latitude: {
//       type: DataTypes.DECIMAL,
//       allowNull: false,
//     },
//     longitude: {
//       type: DataTypes.DECIMAL,
//       allowNull: false,
//     },
//     vendorId: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       onDelete: "CASCADE",
//     },
//     location: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     processingTime:{
//       type:DataTypes.STRING,
//       allowNull:true
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     bankName: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     accountName: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     accountNumber: {
//       type: DataTypes.FLOAT,
//       allowNull: true,
//     },
//     recipient: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//   },
//   {
//     sequelize: databaseConnection,
//     tableName: "vendor_profiles",
//     timestamps: true,
//     underscored: true,
//   }
// );

// VendorModel.hasOne(VendorProfileModel, { foreignKey: "vendorId" });
// VendorProfileModel.belongsTo(VendorModel, { foreignKey: "vendorId" });
