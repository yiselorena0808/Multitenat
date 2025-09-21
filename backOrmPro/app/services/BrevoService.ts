import SibApiV3Sdk from 'sib-api-v3-sdk'

const apiKey = process.env.BREVO_API_KEY || ''
const client = SibApiV3Sdk.ApiClient.instance
const apiKeyInstance = client.authentications['api-key']
apiKeyInstance.apiKey = apiKey

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi()

export async function sendBrevoEmail({ to, subject, text }: { to: string, subject: string, text: string }) {
  const sender = { email: 'miguelanmartinez717@gmail.com', name: 'Tu Sistema' }
  const receivers = [{ email: to }]
  await emailApi.sendTransacEmail({
    sender,
    to: receivers,
    subject,
    textContent: text,
  })
}
