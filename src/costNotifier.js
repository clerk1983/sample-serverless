import { IncomingWebhook } from '@slack/webhook'
import AWS from 'aws-sdk'
import moment from 'moment'

export async function handler(event, context) {
  const now = moment()
  const start = now.format('YYYY-MM-01')
  const end = now.add(1, 'months').format('YYYY-MM-01')
  const ce = new AWS.CostExplorer({ region: 'us-east-1' })
  const params = {
    TimePeriod: {
      Start: start,
      End: end,
    },
    Granularity: 'MONTHLY',
    Metrics: ['UnblendedCost'],
  }
  const constAndUsage = await ce.getCostAndUsage(params).promise()
  const usdCost = constAndUsage.ResultsByTime[0].Total.UnblendedCost.Amount
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
  const slackWebhook = new IncomingWebhook(slackWebhookUrl)
  await slackWebhook.send({
    text: `今月のAWS利用料(${start}-${end})：USD ${usdCost} `,
  })
}
