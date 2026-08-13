import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+593979543962";
const deliveryNumber = process.env.NEXT_PUBLIC_DELIVERY_WHATSAPP_NUMBER ?? "+593969283493";
const accessToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
const version = process.env.WHATSAPP_CLOUD_API_VERSION ?? "v20.0";

const createMessage = (order: any) => {
  const itemsText = order.items
    .map((item: any) => `- ${item.name} x${item.quantity} (${item.size}, ${item.color})`)
    .join("\n");
  const receiptText = order.payment?.receiptUrl ? "Recibido en el panel admin" : "No disponible";

  return `*Nuevo pedido*\nNumero: ${order.number}\nCliente: ${order.firstName} ${order.lastName}\nTelefono: ${order.phone}\nEmail: ${order.email}\nDireccion: ${order.address}, ${order.city}, ${order.postalCode}\n\n*Productos*\n${itemsText}\n\n*Total:* $${order.total.toFixed(2)}\n*Estado:* ${order.status}\n*Pago:* ${order.payment?.method ?? "No disponible"}\n*Comprobante:* ${receiptText}`;
};

const createDeliveryMessage = (order: any) => {
  const itemsText = order.items.map((item: any) => `- ${item.name} x${item.quantity}`).join("\n");

  return `*Pedido para entrega*\nNumero: ${order.number}\nCliente: ${order.firstName} ${order.lastName}\nTelefono: ${order.phone}\nDireccion: ${order.address}, ${order.city}\n\n*Productos*\n${itemsText}\n\n*Total:* $${order.total.toFixed(2)}\n*Notas:* ${order.notes ?? "Ninguna"}\n*Estado de entrega:* ${order.shipment?.status}`;
};

export const sendOrderWhatsApp = async (order: any) => {
  const message = createMessage(order);
  return sendWhatsappMessage(whatsappNumber, message);
};

export const sendDeliveryWhatsApp = async (order: any) => {
  const message = createDeliveryMessage(order);
  return sendWhatsappMessage(deliveryNumber, message);
};

export const sendWhatsappMessage = async (phone: string, message: string) => {
  if (!accessToken || !phoneNumberId) {
    return { simulated: true, phone, message };
  }

  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: message }
    })
  });

  return response.json();
};

export const sendOrderMessageController = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true, shipment: true }
  });

  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  const message = createMessage(order);
  const result = await sendWhatsappMessage(whatsappNumber, message);

  res.json({ success: true, result });
};

export const sendDeliveryMessageController = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, shipment: true }
  });

  if (!order) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  const message = createDeliveryMessage(order);
  const result = await sendWhatsappMessage(deliveryNumber, message);

  res.json({ success: true, result });
};
