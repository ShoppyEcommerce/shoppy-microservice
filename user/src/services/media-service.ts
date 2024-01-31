import cloudinary from "../lib/cloudinary";
import { Utils } from "../utils";
import { ValidationError } from "../utils/ErrorHandler";


export class MediaService {

    async uploadSingle(input:any){
        console.log(typeof input)
        if (!input) {
          throw new ValidationError("No file uploaded" ,"validation error")
          }
          console.log(input)
          const image = await cloudinary.uploader.upload(input.path)

          return Utils.FormatData(image.secure_url)

    }
}