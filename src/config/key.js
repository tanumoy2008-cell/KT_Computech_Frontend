import { z } from "zod";

const KeySchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_RAZORPAY_KEY: z.string().min(1, "Razorpay Key is required"),
  VITE_USER_TOKEN_NAME: z.string().min(1, "USER_TOKEN_NAME is required"),
  VITE_ADMIN_TOKEN_NAME: z.string().min(1, "ADMIN_TOKEN_NAME is required"),
  VITE_DELIVERY_TOKEN_NAME: z.string().min(1, "DELIVERY_TOKEN_NAME is required"),
});

const parsedEnv = KeySchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error("❌ Environment validation failed:");

  parsedEnv.error.issues.forEach((err) => {
    console.error(`- ${err.path.join(".")}: ${err.message}`);
  });

  throw new Error("Environment validation failed");
}

console.log("✅ Environment variables validated successfully");
export const env = parsedEnv.data;
