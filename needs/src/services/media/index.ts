import cloudinary from "../../lib/cloudinary";
import { Utils } from "../../utils";
import { ValidationError } from "../../utils/ErrorHandler";

export class MediaService {
  async uploadSingle(input: any) {

    if (!input) {
      throw new ValidationError("No file uploaded", "validation error");
    }
 
    const image = await cloudinary.uploader.upload(input.path);

    return Utils.FormatData(image.secure_url);
  }
  async uploadMultiple(inputs: any[]) {
    if (!inputs || inputs.length === 0) {
      throw new ValidationError("No files uploaded", "validation error");
    }

    const uploadedImages = [];
    for (const input of inputs) {
      const image = await cloudinary.uploader.upload(input.path);
      uploadedImages.push(image.secure_url);
    }

    return uploadedImages;
  }
}
