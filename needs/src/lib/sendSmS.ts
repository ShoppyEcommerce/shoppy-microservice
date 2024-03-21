import axios from "axios";
import { BadRequestError } from "../utils/ErrorHandler";

export const sendSMS = async (code: number, to: string) => {


  const data = {
    api_key: process.env.API_KEY,
    from: process.env.SENDER_ID,
    to,
    sms: `Your pin is - ${code} expires in 5 minutes `,
    type: "plain",
    channel: "generic",
 
  };
  const options = {
    method: "POST",
    url: process.env.SMS_PATH,
    headers: {
      'Content-Type': ['application/json', 'application/json']
    },
    data: data,
  };
  let response = await axios(options)
    .then((response) => {
   
    })
    .catch((error) => {
   

      const data = {
        status: error.response.status,
        message: error.response.data.message,
      };
      return data;
    });
  return response;
};
