import { z } from "zod";

const newChat = z.object({
  name: z.string().trim().min(3, {
    message: "Chat name must contain at least 3 characters",
  }),
  members: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .min(1, {
      message: "Chat must contain at least 2 members",
    }),
});

export { newChat };
