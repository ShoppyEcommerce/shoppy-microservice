import axios from "axios";
import { BadRequestError } from "../utils/ErrorHandler";

export const sendSMS = async (code: number, to: string) => {
  console.log(`sending sms to ${to} with code ${code}`);

  const data = {
    api_key: process.env.API_KEY,
    message_type: process.env.MESSAGE_TYPE,
    from: process.env.SENDER_ID,
    to,
    channel: process.env.CHANNEL,
    pin_attempts: process.env.PIN_ATTEMPTS,
    pin_time_to_live: process.env.PIN_TIME_TO_LIVE,
    pin_length: process.env.PIN_LENGTH,
    pin_placeholder: `< ${code} >`,
    message_text: `Your pin is ${code}`,
    pin_type: process.env.MESSAGE_TYPE,
  };
  const options = {
    method: "POST",
    url: process.env.SMS_PATH,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };
  let response = await axios(options)
    .then((response) => {
      console.log(response.data);
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
