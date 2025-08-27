import app from "./app.ts";
import { env } from "./configs/env.ts";
console.log("env::::::", env);

// Start the server
app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});