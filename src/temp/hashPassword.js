import bcrypt from "bcryptjs";

async function hash() {
  const hashed = await bcrypt.hash("admin123", 10);
  console.log(hashed);
}

hash();