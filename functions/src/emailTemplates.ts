export type SubmissionType = 'project_inquiry' | 'free_website_application'

export type ConfirmationEmailInput = {
  submissionType: SubmissionType
  name: string
  business: string
}

export type ConfirmationEmail = {
  templateKey: 'project-inquiry-confirmation-v1' | 'free-website-confirmation-v1'
  subject: string
  html: string
  text: string
}

const INSTAGRAM_URL = 'https://www.instagram.com/rafathedev/'
const WEBSITE_URL = 'https://rafathedev.com'

function cleanSingleLine(value: string, fallback: string) {
  const cleaned = value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned || fallback
}

function getFirstName(name: string) {
  return cleanSingleLine(name, 'there').split(' ')[0] ?? 'there'
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

type EmailLayoutInput = {
  preheader: string
  heading: string
  firstName: string
  paragraphs: string[]
  action?: {
    label: string
    url: string
  }
}

function renderEmailLayout({
  preheader,
  heading,
  firstName,
  paragraphs,
  action,
}: EmailLayoutInput) {
  const paragraphHtml = paragraphs
    .map((paragraph) => (
      `<p style="margin:0 0 20px;color:#343934;font-size:16px;line-height:1.7;">${paragraph}</p>`
    ))
    .join('')

  const actionHtml = action
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 30px;">
        <tr>
          <td style="border:1px solid #9ccc16;background:#111411;">
            <a href="${action.url}" style="display:inline-block;padding:13px 20px;color:#d2ff4d;font-size:14px;font-weight:700;text-decoration:none;">${action.label} &nbsp;↗</a>
          </td>
        </tr>
      </table>`
    : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f5f0;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f5f0;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #dfe3dc;">
            <tr>
              <td style="padding:24px 34px;background:#0d100d;border-bottom:3px solid #c8ff3d;">
                <a href="${WEBSITE_URL}" style="color:#f5f7f2;font-size:18px;font-weight:800;letter-spacing:.04em;text-decoration:none;">RAFA THE DEV</a>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 34px 34px;">
                <p style="margin:0 0 12px;color:#6b746c;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">Submission received</p>
                <h1 style="margin:0 0 26px;color:#111411;font-size:34px;line-height:1.12;">${heading}</h1>
                <p style="margin:0 0 20px;color:#343934;font-size:16px;line-height:1.7;">Hi ${firstName},</p>
                ${paragraphHtml}
                ${actionHtml}
                <p style="margin:30px 0 0;color:#111411;font-size:16px;line-height:1.7;">Talk soon,<br><strong>Rafa</strong><br>Rafa the Dev</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 34px;background:#f7f8f5;border-top:1px solid #e5e8e2;color:#737a73;font-size:12px;line-height:1.6;">
                This automatic confirmation was sent because a form was submitted at <a href="${WEBSITE_URL}" style="color:#4d5d31;">rafathedev.com</a>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function buildProjectInquiryEmail(name: string, business: string): ConfirmationEmail {
  const firstNameText = getFirstName(name)
  const firstName = escapeHtml(firstNameText)
  const businessName = cleanSingleLine(business, '')
  const projectReference = businessName
    ? ` about <strong>${escapeHtml(businessName)}</strong>`
    : ''

  const paragraphs = [
    `Thanks for reaching out and sharing your project${projectReference} with me. I’ve received your inquiry and will personally review the details.`,
    'After I review everything, I’ll follow up to clarify any open questions. If the project looks like a good fit, I’ll outline a recommended scope, timeline, and price before you decide whether to move forward.',
    'There’s no obligation, and I won’t begin work until we agree on the plan. If you want to add anything in the meantime, just reply to this email.',
  ]

  const textProjectReference = businessName ? ` about ${businessName}` : ''
  const text = `Hi ${firstNameText},

Thanks for reaching out and sharing your project${textProjectReference} with me. I’ve received your inquiry and will personally review the details.

After I review everything, I’ll follow up to clarify any open questions. If the project looks like a good fit, I’ll outline a recommended scope, timeline, and price before you decide whether to move forward.

There’s no obligation, and I won’t begin work until we agree on the plan. If you want to add anything in the meantime, just reply to this email.

Talk soon,
Rafa
Rafa the Dev
${WEBSITE_URL}`

  return {
    templateKey: 'project-inquiry-confirmation-v1',
    subject: `Thanks, ${firstNameText} — I received your project inquiry`,
    html: renderEmailLayout({
      preheader: 'Your project inquiry was received. Rafa will review it and follow up soon.',
      heading: 'Your project inquiry is in.',
      firstName,
      paragraphs,
    }),
    text,
  }
}

function buildFreeWebsiteEmail(name: string, business: string): ConfirmationEmail {
  const firstNameText = getFirstName(name)
  const firstName = escapeHtml(firstNameText)
  const businessName = cleanSingleLine(business, 'your project')
  const safeBusinessName = escapeHtml(businessName)

  const paragraphs = [
    `Thanks for applying for the Rafa the Dev free website promotion. I’ve received the information you shared about <strong>${safeBusinessName}</strong>.`,
    `There isn’t a winner announcement date yet. I’ll share promotion updates on Instagram at <a href="${INSTAGRAM_URL}" style="color:#4d6515;font-weight:700;">@rafathedev</a>.`,
    'If you’re selected, I’ll also contact you directly at this email address, so you won’t have to rely on seeing the Instagram announcement.',
    'There’s nothing else you need to do right now. If you need to update your entry, just reply to this email.',
  ]

  const text = `Hi ${firstNameText},

Thanks for applying for the Rafa the Dev free website promotion. I’ve received the information you shared about ${businessName}.

There isn’t a winner announcement date yet. I’ll share promotion updates on Instagram at @rafathedev: ${INSTAGRAM_URL}

If you’re selected, I’ll also contact you directly at this email address, so you won’t have to rely on seeing the Instagram announcement.

There’s nothing else you need to do right now. If you need to update your entry, just reply to this email.

Talk soon,
Rafa
Rafa the Dev
${WEBSITE_URL}`

  return {
    templateKey: 'free-website-confirmation-v1',
    subject: `Thanks, ${firstNameText} — your free website application is in`,
    html: renderEmailLayout({
      preheader: 'Your free website application was received. Winners will also be contacted by email.',
      heading: 'Your application is in.',
      firstName,
      paragraphs,
      action: {
        label: 'Follow @rafathedev',
        url: INSTAGRAM_URL,
      },
    }),
    text,
  }
}

export function buildConfirmationEmail(input: ConfirmationEmailInput): ConfirmationEmail {
  if (input.submissionType === 'free_website_application') {
    return buildFreeWebsiteEmail(input.name, input.business)
  }

  return buildProjectInquiryEmail(input.name, input.business)
}
