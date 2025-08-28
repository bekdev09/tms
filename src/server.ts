import app from "./app.ts";
import { env } from "./configs/env.ts";

app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});