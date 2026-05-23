import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

export interface OrderEmailData {
  orderNumber: string
  userEmail: string
  userName: string
  items: {
    productName: string
    productImg: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  shippingAddress: string
  total: number
  placedAt: Date
}

export const sendOrderConfirmation = async (data: OrderEmailData): Promise<void> => {
  const deliveryDate = new Date(data.placedAt.getTime() + 5 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const html = buildOrderEmailHTML(data, deliveryDate)

  await resend.emails.send({
    from: `EasyShop <${FROM}>`,
    to: data.userEmail,
    subject: `✅ Order Confirmed! #${data.orderNumber} — EasyShop`,
    html,
  })
}

function buildOrderEmailHTML(data: OrderEmailData, deliveryDate: string): string {
  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; vertical-align:middle;">
        <div style="font-size:14px; color:#212121; font-weight:500; line-height:1.4;">${item.productName}</div>
        <div style="font-size:12px; color:#878787; margin-top:2px;">Qty: ${item.quantity}</div>
      </td>
      <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; text-align:right; vertical-align:middle;">
        <div style="font-size:14px; font-weight:600; color:#212121;">${formatPrice(item.totalPrice)}</div>
        ${item.quantity > 1 ? `<div style="font-size:11px; color:#878787;">${formatPrice(item.unitPrice)} each</div>` : ''}
      </td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed — EasyShop</title>
</head>
<body style="margin:0; padding:0; background:#f1f3f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f3f6; padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#2874f0; padding:20px 32px; border-radius:8px 8px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="color:#ffffff; font-size:24px; font-weight:800; letter-spacing:-0.5px;">EasyShop</div>
                    <div style="color:#FFE500; font-size:11px; font-style:italic; margin-top:2px;">Explore Plus ✦</div>
                  </td>
                  <td align="right">
                    <div style="background:rgba(255,255,255,0.15); color:#ffffff; font-size:12px; padding:6px 14px; border-radius:20px;">
                      Order Confirmed ✅
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero banner -->
          <tr>
            <td style="background:#388e3c; padding:24px 32px; text-align:center;">
              <div style="font-size:40px; margin-bottom:8px;">🎉</div>
              <div style="color:#ffffff; font-size:22px; font-weight:700;">Your order is confirmed!</div>
              <div style="color:rgba(255,255,255,0.85); font-size:14px; margin-top:6px;">
                Hi ${data.userName.split(' ')[0]}, thank you for shopping with us!
              </div>
            </td>
          </tr>

          <!-- Order details card -->
          <tr>
            <td style="background:#ffffff; padding:24px 32px;">

              <!-- Order meta -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff; border-radius:8px; margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="color:#878787; font-size:13px;">Order ID</span><br/>
                          <span style="color:#2874f0; font-size:15px; font-weight:700;">#${data.orderNumber}</span>
                        </td>
                        <td style="padding:4px 0;" align="right">
                          <span style="color:#878787; font-size:13px;">Placed On</span><br/>
                          <span style="color:#212121; font-size:13px; font-weight:500;">
                            ${new Date(data.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:12px; border-top:1px solid #e0e3ff; margin-top:8px;">
                          <span style="color:#878787; font-size:13px;">Estimated Delivery</span><br/>
                          <span style="color:#388e3c; font-size:14px; font-weight:700;">📦 ${deliveryDate}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Items section -->
              <div style="font-size:15px; font-weight:700; color:#212121; margin-bottom:12px;">
                Order Summary (${data.items.length} item${data.items.length > 1 ? 's' : ''})
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0; border-radius:8px; overflow:hidden; margin-bottom:20px;">
                ${itemRows}
                <!-- Total row -->
                <tr style="background:#f8f9fa;">
                  <td style="padding:14px 16px; font-size:15px; font-weight:700; color:#212121;">Total Amount</td>
                  <td style="padding:14px 16px; text-align:right; font-size:17px; font-weight:800; color:#2874f0;">${formatPrice(data.total)}</td>
                </tr>
              </table>

              <!-- Payment -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6; border-radius:8px; margin-bottom:20px;">
                <tr>
                  <td style="padding:12px 20px;">
                    <span style="color:#878787; font-size:12px;">Payment Method</span><br/>
                    <span style="color:#ff9f00; font-size:14px; font-weight:600;">💳 Cash on Delivery</span>
                  </td>
                </tr>
              </table>

              <!-- Delivery address -->
              <div style="font-size:14px; font-weight:700; color:#212121; margin-bottom:8px;">📍 Delivery Address</div>
              <div style="background:#f8f9fa; border-radius:8px; padding:12px 16px; font-size:13px; color:#444; line-height:1.6; margin-bottom:24px;">
                ${data.shippingAddress}
              </div>

              <!-- CTA -->
              <div style="text-align:center; margin-top:8px;">
                <a href="http://localhost:3000/orders"
                   style="background:#fb641b; color:#ffffff; text-decoration:none; font-size:14px; font-weight:700; padding:14px 36px; border-radius:4px; display:inline-block; letter-spacing:0.3px;">
                  VIEW MY ORDERS →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#172337; padding:20px 32px; border-radius:0 0 8px 8px; text-align:center;">
              <p style="color:#8899aa; font-size:12px; margin:0 0 6px 0;">
                You're receiving this because you placed an order on EasyShop.
              </p>
              <p style="color:#8899aa; font-size:12px; margin:0;">
                © 2026 EasyShop Private Limited. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
