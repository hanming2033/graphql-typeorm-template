import * as yup from "yup";
import { PASSWORD_TOO_SHORT } from "./modules/user/register/errorMessages";

export const registerPasswordValidation = yup
  .string()
  .min(3, PASSWORD_TOO_SHORT)
  .max(255);
