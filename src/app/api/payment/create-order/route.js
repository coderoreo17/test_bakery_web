import Razorpay from "razorpay";

export async function POST(req) {
  const { amount } = await req.json();

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: amount * 100, // rupees → paise
    currency: "INR",
    receipt: "order_receipt",
  };

  const order = await razorpay.orders.create(options);

  return Response.json(order);
}