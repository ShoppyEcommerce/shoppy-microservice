// import { VendorProfile } from "../../database/model/vendor-profile";
// import {
//   VendorProfileRepository,
//   VendorRepository,
// } from "../../database/Repository";
// import { Utils } from "../../utils";
// import { BadRequestError, ValidationError } from "../../utils/ErrorHandler";
// import {
//   option,
//   profileSchema,
//   UpdateBankDetails,
//   UpdateprofileSchema,
// } from "./validation";
// import { v4 as uuid } from "uuid";

// export class VendorProfileService {
//   private repository: VendorProfileRepository;
//   constructor() {
//     this.repository = new VendorProfileRepository();
//   }
//   async createVendorProfile(input: VendorProfile, vendor: string) {
//     const { error, value } = profileSchema.validate(input, option);
//     if (error) {
//       throw new ValidationError(error.details[0].message, "");
//     }
//     const profile = await this.repository.findOne({ vendorId: vendor });
//     if (profile) {
//       throw new BadRequestError("you already have a profile", "");
//     }
//     input.id = uuid();
//     input.vendorId = vendor;

//     return await this.repository.create({
//       ...input,
//     });
//   }
//   async getVendorProfile(vendorId: string) {
   
//     const profile = await this.repository.findOne({ vendorId });
//     if (!profile) {
//       throw new BadRequestError("no vendor profile found", "");
//     }
//     return Utils.FormatData(profile);
//   }
//   async getVendorsProfile() {
//     return this.repository.findAll();
//   }
//   async updateVendorProfile(vendorId: string, input: Partial<VendorProfile>) {
//     const { error, value } = UpdateprofileSchema.validate(input, option);
//     if (error) {
//       throw new ValidationError(error.details[0].message, "");
//     }
//     const profile = (await this.repository.findOne({
//       vendorId,
//     })) as unknown as VendorProfile;
//     if (!profile) {
//       throw new BadRequestError("no vendor profile found", "");
//     }
//     const updated = await this.repository.update({ id: profile.id }, input);
//     return updated[1][0].dataValues;
//   }
//   async deleteVendorProfile(vendorId: string) {
//     const profile = (await this.repository.findOne({
//       vendorId,
//     })) as unknown as VendorProfile;
//     if (!profile) {
//       throw new BadRequestError("no vendor profile found", "");
//     }
//     return await this.repository.delete({ id: profile.id });
//   }
//   async getMyProfile(vendorId: string) {
//     const profile = await this.repository.getVendorProfile(vendorId);
//     if (!profile) {
//       throw new BadRequestError("you do not have a profile yet", "");
//     }
//     return Utils.FormatData(profile);
//   }
//   async updateBankDetails(input: Partial<VendorProfile>, vendorId: string) {
//     const { error } = UpdateBankDetails.validate(input, option);
//     if (error) {
//       throw new ValidationError(error.details[0].message, "");
//     }
//   }
// }
