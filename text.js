/* eslint-disable no-unused-vars */
// Take a string argument 'description' and format it by replacing various HTML tags and whitespace characters
function formatDescription (description) {
  return description
    .replace(/<br>+/g, '<br>')
    .replace(/<p>\s+/g, '<p>')
    .replace(/<br><p>/g, '<p>')
    .replace(/<br><\/p>/g, '</p>')
    .replace(/^<p>\s/g, '<p>')
    .replace(/\s<\/p>/g, '</p>')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\s+/g, ' ')
}

// Take an event object as an argument and generate a formatted description string for the event
function calDescription (event) {
  const info = `<strong>More Info and RSVP:</strong><br><a href="${event.browser_url}">${event.browser_url}</a><br><br>`
  const description = `<strong>Description:</strong><br>${formatDescription(event.description)}<br>`
  const footer = (typeof customEventDescriptionFooter === 'function') // if customEventDescriptionFooter is defined, append it. otherwise nothing.
    ? customEventDescriptionFooter(event.description)
    : ''

  return info + description + footer
}

// This function takes a location object as an argument and generates a string with the venue, address, locality, region, and postal code
const formatLocation = (location) => {
  if (location.postal_code === '') {
    return ''
  }
  const { venue, address_lines: addressLines, locality, region, postal_code: zipCode } = location
  return `${venue}, ${addressLines.join()}, ${locality}, ${region} ${zipCode}`
}

// This function takes an event object as an argument and returns a formatted string for use in a newsletter
function formatEvent (event) {
  const startDate = getStartTime(event)
  const endDate = getEndTime(event)

  const templateTitle = `<h2>${event.title.trim()}</h2>`
  const eventDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: '2-digit'
  })
  const startTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
  const endTime = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
  const templateTimeAndLink = `
    <h3><time datetime=${startDate.toISOString()}>${eventDate}</time> | ${startTime} - ${endTime}</h3>
    <h3><a href="${encodeURI(event.browser_url)}" target="_blank">SIGN ME UP</a></h3>`
  const imageURL = event.featured_image_url
    ? `
      <a href="${encodeURI(event.browser_url)}" target="_blank">
        <img class="embed-image" src="${encodeURI(event.featured_image_url)}" alt="Event Promo Image">
      </a>
    `
    : ''
  const buttonRSVP = `
    <a href="${encodeURI(event.browser_url)}" target="_blank">
      <button type="button">RSVP Here</button>
    </a>
    <br>
  `

  return `
    <article class="event_article">
      ${templateTitle}
      ${templateTimeAndLink}
      ${imageURL}
      ${formatDescription(event.description)}
    </article>
    <br>
    <hr class="rounded">
    `
}

function getUpcomingEventLimitFilter (nextdays) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + nextdays)
  const queryFutureDate = `start_date lt '${Utilities.formatDate(futureDate, 'UTC', 'yyyy-MM-dd')}'`
  return [queryFutureDate]
}

function getCssStyles () {
  // TO-DO - separate CSS into separate file or wrapper
  // TO-DO - get better design for CSS emails
  
  return `
    <style type="text/css">
      h1, a {
        color: #F04C53 ;
        text-align: center;
      }
      h2 {
        text-align: center;
        font-weight: bold;
      }
      h3 {
        text-align: center;
        font-weight: bold;
      }
      a {
        font-weight: bold;
      }
      img {
        display: block;
        margin: auto;
      }
      img.embed-image {
        width: 75%;
        max-width: 300px;
        display: block;
        margin: auto;
      }
      button {
        display: block;
        margin: auto;
      }
    </style>
  `
}

function getHTMLEmailHeader () {
  // TO-DO - break in-line CSS into class or something and put into CSS document
  
  return `
    <br>
    <hr class="rounded">
    <div>
      <img src="https://can2-prod.s3.amazonaws.com/uploads/data/001/075/913/original/email_logo.jpg" width="300" style="width: 100%; max-width: 300px; display: block; margin: auto;" alt="Southeast Minnesota DSA logo" title="" align="center">
    </div>
    <h1>Southeast Minnesota<br>Democratic Socialists of America</h1>
  `
}

function getHTMLGeneralMeetingAnnouncement () {
  // TO-DO - automate grabbing correct general meeting link
  // TO-DO - automate getting correct GM date and time
  
  const generalMeetingLink = "https://actionnetwork.org/events/july-general-meeting-44?source=direct_link&"
  const generalMeetingDate = "Wednesday July 8th"
  const generalMeetingTime = "6:00pm - 8:00pm"

  return `
    <br><hr class="rounded"><br>
    <div class="announcement">
      <h1>General Meeting</h1>
      <h3>${generalMeetingDate} | ${generalMeetingTime}</h3>
      <h3><a href="${generalMeetingLink}" target="_blank">RSVP HERE</a></h3>
      <br>
      <p>Description of General Meeting announcement.</p>
      <p> We hope you can make it in person, but otherwise, we now support hybrid meetings, so a Zoom link will be provided upon RSVPing!</p>
      <a href="${generalMeetingLink}" target="_blank">
        <img class="embed-image" src="https://can2-prod.s3.amazonaws.com/events/photos/003/136/282/original/open-uri20260509-1461963-1ypheb1" alt="General Meeting Banner">
      </a>
    </div>
    `
}

function getEventDescBody (event) {
  return event.status !== 'cancelled' ? formatEvent(event) : ''
}

function getHTMLEvents (events) {
  let doc = `
    <br>
    <hr class="rounded">
    `
  if (typeof customNewsletterEventHeaderText === 'function') {
    doc += customNewsletterEventHeaderText(events)
  }
  const eventBodies = events.map((event) => getEventDescBody(event))
  doc += `
    <div class="events">
      <h1>Upcoming Events</h1>
      <b>
      ${eventBodies.join('')}
    </div>
  `
  return doc
}

function getHTMLAnnouncements () {
  let doc = ''
  if (typeof customAnnouncements === 'function') {
    doc += customAnnouncements()
  }
  return doc
}

function getHTMLSocialMedia () {
  return `
    <div class="social-media">
      <h1>Keep in Touch</h1>
      <p style="line-height: 150%;">We're especially active on the Discord, where we chat about current events, discuss our projects, and plan out book club. But please follow us on our other social platforms to see what we're up to!</p>
      <li><a href="https://discord.gg/8zGKGHP6gz">Discord</a></li>
      <li><a href="https://www.facebook.com/groups/516523298686729">Facebook</a></li>
      <li><a href="https://bsky.app/profile/semndsa.bsky.social">Bluesky</a></li>
      <li><a href="https://www.instagram.com/semndsa/">Instagram</a></li>
    </div>
    <br>
    <hr class="rounded">
  `
}

function getHTMLMeetingMinutes () {
  // TO-DO - some way to automate Minutes and Agenda gathering
  const meetingMinutesLink = "https://docs.google.com/document/d/1hXOlKs-vuzcCkC0DX4P0n_lHewYEoWHzZXffSYLcnb4/edit?tab=t.0"
  const lastMonth = "June"
  // TO-DO - some way to automate message change if no agenda
  // TO-DO - some way to automate last month selection
  return `
    <div class="meeting-minutes">
      <h1>Meeting Minutes</h1>
      <p>As a member of SEMN DSA, you have access to last month's General Meeting Minutes! Please find here the Google Doc link.</p>
      <li><a href="${meetingMinutesLink}">${lastMonth} General Meeting Minutes</a></li>
    </div>
  `
}

function getHTMLJoinDsa () {
  // TO-DO - find way to automate DSA member total
  
  return `
    <div class="join-dsa">
      <h1>Learn More / Join the DSA</h1>
      <p>You don't need to be a DSA member to join the Discord and get involved there, but we do encourage you to learn more about the DSA and consider joining us and the <strong>120K</strong> (and growing!) members across all 50 states in working to build a dignified, just, and thriving life for all.</p>
      <br>
      <li><a href="https://www.dsausa.org/about-us/what-is-democratic-socialism/">What is Democratic Socialism?</a></li>
      <li><a href="https://platform.dsausa.org/">DSA Political Platform</a></li>
      <li><a href="https://act.dsausa.org/donate/membership/">Join the DSA!</a></li>
    </div>
  `
}

function getHTMLMinutesFilter () {

  const minutesSection = getHTMLMeetingMinutes()
  const joinDsaSection = getHTMLJoinDsa()

  return `
    {% capture membership %}{{ 'actionkit_user_memb_status' | form_value | default: "N"}}{% endcapture %}
    {% assign membership = membership %}
    {% if membership == 'M'%}
    ${minutesSection}
    {% else %}
    ${joinDsaSection}
    {% endif %}
    <hr class="rounded">
  `
}

// Compile an HTML message of upcoming events and return it as a string
function compileHTMLEmail (events) {
  return ( 
    getCssStyles() + getHTMLEmailHeader() + getHTMLGeneralMeetingAnnouncement()
    + getHTMLAnnouncements() + getHTMLEvents(events) + getHTMLSocialMedia()
    + getHTMLMinutesFilter()
  )
}

// Consolidate event title and start time into a multi-line formatted string
function formatEventAnnouncementMessage (event) {
  const startstring = getStartTime(event).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit'
  })
  return `*${event.title.trim()}*\n${startstring}`
}
