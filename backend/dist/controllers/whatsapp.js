"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDeliveryMessageController = exports.sendOrderMessageController = exports.sendWhatsappMessage = exports.sendDeliveryWhatsApp = exports.sendOrderWhatsApp = void 0;
const prisma_1 = require("../utils/prisma");
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+593979543962";
const deliveryNumber = process.env.NEXT_PUBLIC_DELIVERY_WHATSAPP_NUMBER ?? "+593969283493";
const accessToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
const version = process.env.WHATSAPP_CLOUD_API_VERSION ?? "v20.0";
const createMessage = (order) => {
    const itemsText = order.items
        .map((item) => `- ${item.name} x${item.quantity} (${item.size}, ${item.color})`)
        .join("\n");
    const receiptText = order.payment?.receiptUrl ? "Recibido en el panel admin" : "No disponible";
    return `*Nuevo pedido*\nNumero: ${order.number}\nCliente: ${order.firstName} ${order.lastName}\nTelefono: ${order.phone}\nEmail: ${order.email}\nDireccion: ${order.address}, ${order.city}, ${order.postalCode}\n\n*Productos*\n${itemsText}\n\n*Total:* $${order.total.toFixed(2)}\n*Estado:* ${order.status}\n*Pago:* ${order.payment?.method ?? "No disponible"}\n*Comprobante:* ${receiptText}`;
};
const createDeliveryMessage = (order) => {
    const itemsText = order.items.map((item) => `- ${item.name} x${item.quantity}`).join("\n");
    return `*Pedido para entrega*\nNumero: ${order.number}\nCliente: ${order.firstName} ${order.lastName}\nTelefono: ${order.phone}\nDireccion: ${order.address}, ${order.city}\n\n*Productos*\n${itemsText}\n\n*Total:* $${order.total.toFixed(2)}\n*Notas:* ${order.notes ?? "Ninguna"}\n*Estado de entrega:* ${order.shipment?.status}`;
};
const sendOrderWhatsApp = async (order) => {
    const message = createMessage(order);
    return (0, exports.sendWhatsappMessage)(whatsappNumber, message);
};
exports.sendOrderWhatsApp = sendOrderWhatsApp;
const sendDeliveryWhatsApp = async (order) => {
    const message = createDeliveryMessage(order);
    return (0, exports.sendWhatsappMessage)(deliveryNumber, message);
};
exports.sendDeliveryWhatsApp = sendDeliveryWhatsApp;
const sendWhatsappMessage = async (phone, message) => {
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
exports.sendWhatsappMessage = sendWhatsappMessage;
const sendOrderMessageController = async (req, res) => {
    const { orderId } = req.params;
    const order = await prisma_1.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true, shipment: true }
    });
    if (!order) {
        return res.status(404).json({ error: "Pedido no encontrado" });
    }
    const message = createMessage(order);
    const result = await (0, exports.sendWhatsappMessage)(whatsappNumber, message);
    res.json({ success: true, result });
};
exports.sendOrderMessageController = sendOrderMessageController;
const sendDeliveryMessageController = async (req, res) => {
    const { orderId } = req.params;
    const order = await prisma_1.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, shipment: true }
    });
    if (!order) {
        return res.status(404).json({ error: "Pedido no encontrado" });
    }
    const message = createDeliveryMessage(order);
    const result = await (0, exports.sendWhatsappMessage)(deliveryNumber, message);
    res.json({ success: true, result });
};
exports.sendDeliveryMessageController = sendDeliveryMessageController;
