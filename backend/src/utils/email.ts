const resendApiKey = process.env.RESEND_API_KEY;
const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
const emailFrom = process.env.EMAIL_FROM ?? process.env.SMTP_FROM ?? "Nini Pijamas <ventas@ninipijamas.ec>";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const sendPaymentReceiptEmail = async (order: any) => {
  if (order.payment?.method !== "transferencia" || !order.payment?.receiptUrl) {
    return { skipped: true };
  }

  if (!adminNotificationEmail) {
    console.info("ADMIN_NOTIFICATION_EMAIL no configurado. Notificacion de comprobante omitida.");
    return { skipped: true };
  }

  const itemsHtml = order.items
    .map(
      (item: any) =>
        `<li>${escapeHtml(item.name)} x${item.quantity} - ${escapeHtml(item.size)} / ${escapeHtml(item.color)}</li>`
    )
    .join("");

  const subject = `Nuevo comprobante de pago - ${order.number}`;
  const html = `
    <h2>Nuevo comprobante de transferencia</h2>
    <p><strong>Pedido:</strong> ${escapeHtml(order.number)}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(`${order.firstName} ${order.lastName}`)}</p>
    <p><strong>Email:</strong> ${escapeHtml(order.email)}</p>
    <p><strong>Telefono:</strong> ${escapeHtml(order.phone)}</p>
    <p><strong>Total:</strong> $${Number(order.total).toFixed(2)}</p>
    <p><strong>Estado:</strong> pendiente de revision</p>
    <p>El comprobante fue cargado en el panel admin del pedido.</p>
    <h3>Productos</h3>
    <ul>${itemsHtml}</ul>
  `;

  if (!resendApiKey) {
    console.info(`RESEND_API_KEY no configurado. Notificacion simulada para ${adminNotificationEmail}: ${subject}`);
    return { simulated: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`
    },
    body: JSON.stringify({
      from: emailFrom,
      to: adminNotificationEmail,
      subject,
      html
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`No se pudo enviar correo de comprobante: ${response.status} ${body}`);
  }

  return response.json();
};
