import { z } from "zod";
//password: z.string({ required_error: 'Password is required' }),
const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "name is required" }),
    phone: z.string({ required_error: "Phone number is unique" }),
    password: z.string({ required_error: "Password is required" }),
    email: z.string({ required_error: "Address is required" }),
  }),
});

export const UserValidation = { createUserZodSchema };

// req -> validation
//body -> object
// data -> object
