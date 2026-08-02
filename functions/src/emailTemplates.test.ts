import assert from 'node:assert/strict'
import test from 'node:test'
import { buildConfirmationEmail } from './emailTemplates.js'

test('project inquiry email sets a clear review and proposal expectation', () => {
  const email = buildConfirmationEmail({
    submissionType: 'project_inquiry',
    name: 'Jamie Rivera',
    business: 'Rivera Bakery',
  })

  assert.equal(email.templateKey, 'project-inquiry-confirmation-v1')
  assert.match(email.subject, /Jamie/)
  assert.match(email.text, /scope, timeline, and price/)
  assert.match(email.text, /won’t begin work until we agree on the plan/)
  assert.doesNotMatch(email.text, /preview/i)
})

test('free website email explains both announcement channels without a date', () => {
  const email = buildConfirmationEmail({
    submissionType: 'free_website_application',
    name: 'Taylor Morgan',
    business: 'Morgan Floral',
  })

  assert.equal(email.templateKey, 'free-website-confirmation-v1')
  assert.match(email.text, /There isn’t a winner announcement date yet/)
  assert.match(email.text, /@rafathedev/)
  assert.match(email.text, /contact you directly at this email address/)
  assert.match(email.html, /https:\/\/www\.instagram\.com\/rafathedev\//)
})

test('dynamic customer content is escaped in HTML and flattened in headers', () => {
  const email = buildConfirmationEmail({
    submissionType: 'project_inquiry',
    name: 'Alex\r\nBcc: attacker@example.com',
    business: '<script>alert("nope")</script>',
  })

  assert.doesNotMatch(email.subject, /\r|\n/)
  assert.doesNotMatch(email.html, /<script>/)
  assert.match(email.html, /&lt;script&gt;/)
})
