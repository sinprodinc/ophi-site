"""Book a Reading: the FAQ, the cancellation policy and the structured data for search (2 Nov 2026).

One source for both the questions people read on /book/ and the FAQPage data search engines read, so the two can
never disagree. Answers are drafted from Bri's own notes of 2 Nov 2026; she approves the final wording.
Links in answers are written as [text](/path/). No em dashes in client copy.
"""
import html, re

SITE = 'https://ophibybri.com'

# The three readings as they are sold today (Cal.com + Stripe). Prices before GST, in CAD.
# Bri, 2 Nov: Growth & Redirection ($99, 45 min + 5 min Q&A) replaces Here To Help.
READINGS = [
    ('Meet Yourself', 129, 'Your foundational natal chart reading: Sun, Moon and Rising, your chart ruler, your major aspects and the patterns that tie them together.',
     'https://cal.com/sin-prod-entertainment-inc-djqrpb/meet-yourself'),
    ('Quickie', 69, 'A short, focused natal chart reading on a few key placements, with time for your questions.',
     'https://cal.com/sin-prod-entertainment-inc-djqrpb/quickie'),
    ('Growth & Redirection', 99, 'A focused reading to help you navigate growth and big changes, such as a Saturn return, a breakup, a job loss or a career change: your birth chart and current transits, read for the timing and possibilities at play.',
     'https://cal.com/ophibybri/plot-twist'),
]
TOPIC = 'Growth & Redirection'

# (anchor, question, answer). Paragraphs in an answer are separated by a blank line.
FAQ = [
    ('faq-which', 'Which reading should I book?',
     "Start with Meet Yourself if you've never had your chart read. It's the full foundation: your Sun, Moon and Rising, "
     "your chart ruler, your major aspects and the patterns that tie them together.\n\n"
     "Book {topic} when you're navigating a major change, like a Saturn return, a breakup, a job loss or a career change, "
     "and want your chart and current transits read through that lens.\n\n"
     "Book a Quickie when you want a short, focused look at a few placements."),
    ('faq-birth-time', "I don't know my birth time. Now what?",
     "Check your birth certificate first, or call the hospital where you were born. Either one can usually give you the "
     "exact time, and an exact time always leads to a more detailed reading. A parent or relative may know it too.\n\n"
     "If none of that works, book anyway. We'll leave out the parts that depend on the time and cover everything else, "
     "which is still a full, meaningful reading. We may even work out your rising together during the session."),
    ('faq-send', 'What do I need to send you?',
     "Your date of birth, your time of birth (as exact as you can find it) and the city and country you were born in. "
     "You'll enter them when you book. Booking a {topic}? Add the topic you'd like to focus on in the booking notes."),
    ('faq-session', 'How does the session work?',
     "Every reading is one-on-one and virtual. Pick a time on the booking page and you'll receive a link to join by email. "
     "Meet Yourself is a 50-minute reading plus 10 minutes for your questions. Growth & Redirection is 45 minutes plus 5. "
     "The Quickie is 25 minutes plus 5. "
     "Come as you are, with any questions you'd like to bring."),
    ('faq-record', 'Can I record it?',
     "Please don't record the session yourself. I record every reading and send you the full recording afterward, "
     "so you can listen back without taking notes and your reading is handled with care."),
    ('faq-takeaways', 'What are the digital takeaways?',
     "Every reading comes with the full session recording and personalized takeaways.\n\n"
     "Meet Yourself also includes a full transcript of your reading and curated digital copies of the major highlights in your chart. "
     "{topic} includes highlights on the topics we discussed. "
     "The Quickie includes a one-page PDF overview of the placements we covered.\n\n"
     "The deeper the reading, the more you get to keep. Everything arrives in a private folder that only your email can open."),
    ('faq-predict', "Will you tell me what's going to happen?",
     "No. Astrology shows patterns, timing and tendencies, not a fixed script. I'll talk about what a placement or a "
     "transit may bring up for you and how you can work with it. What you do with it is always yours."),
    ('faq-therapy', 'Is this therapy?',
     "No. A reading is reflective, spiritual guidance. It can sit alongside therapy, but it isn't a substitute for "
     "therapy or for medical advice. If you're going through something serious, please reach out to a qualified "
     "professional as well."),
    ('faq-privacy', 'What happens to my birth details?',
     "They're used only to prepare and give your reading, and they're never shared or posted. Your reading materials "
     "go into a private folder that only your email can open.\n\n"
     "The [free chart](/chart/) on this site works entirely in your browser: the birth details you type there are not "
     "sent to me or stored. The [Privacy Policy](/privacy/) has the details."),
    ('faq-gift', 'Can I gift a reading?',
     "Yes. Buy the gift, and the person receiving it gets a gift card by email with their own gift number and a "
     "link to book. They choose a time that suits them and enter their birth details when they book, so you don't "
     "need to know their birth time.\n\n"
     "If they don't know their own birth time, their birth certificate or the hospital they were born in can usually "
     "tell them. If it can't be found, the reading still goes ahead and we cover everything we can."),
]

POLICY_TITLE = 'Cancelling or rescheduling'
POLICY = (
    "Rescheduling is free up to 24 hours before your reading.\n\n"
    "Cancelling more than 24 hours before your reading? You choose. If you're not planning to book with Ophi for a "
    "while, you'll get a full refund. If you'd like to rebook within the next 3 months, your reading stays credited to "
    "your account so your next booking is processed quicker. A credit that isn't used within 3 months expires.\n\n"
    "Cancelling with less than 24 hours' notice? Ophi by Bri may keep 50% of the payment."
)


def _esc(t):
    return html.escape(t, quote=False)


def _links(t):
    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', t)


def _paras(t):
    return ''.join('<p>%s</p>' % _links(_esc(p.strip())) for p in t.split('\n\n') if p.strip())


def _plain(t):
    return re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t).replace('\n\n', ' ')


def faq_items():
    return [(a, q.format(topic=TOPIC), ans.format(topic=TOPIC)) for a, q, ans in FAQ]


def faq_html():
    items = ''.join(
        '<details class="faq-q" id="%s" name="faq"><summary><span>%s</span><i aria-hidden="true">+</i></summary>'
        '<div class="faq-a">%s</div></details>' % (a, _esc(q), _paras(ans)) for a, q, ans in faq_items())
    return ('<section class="faq flow-sec" id="faq" aria-labelledby="faq-h">\n'
            '  <div class="sec-row center"><h2 class="flow-h faq-h" id="faq-h">FAQ</h2></div>\n'
            '  <div class="faq-list">%s</div>\n'
            '  <aside class="faq-policy" id="cancellation" aria-labelledby="pol-h">\n'
            '    <h3 id="pol-h">%s</h3>%s\n'
            '  </aside>\n'
            '</section>') % (items, POLICY_TITLE, _paras(POLICY))


def ld_faq():
    return {'@context': 'https://schema.org', '@type': 'FAQPage',
            'mainEntity': [{'@type': 'Question', 'name': q,
                            'acceptedAnswer': {'@type': 'Answer', 'text': _plain(ans)}} for a, q, ans in faq_items()]}


def ld_offers():
    return [{'@context': 'https://schema.org', '@type': 'Service', 'name': n, 'serviceType': 'Astrology reading',
             'description': d, 'areaServed': 'Worldwide (online)',
             'provider': {'@type': 'ProfessionalService', 'name': 'Ophi by Bri', 'url': SITE + '/'},
             'offers': {'@type': 'Offer', 'price': '%d.00' % p, 'priceCurrency': 'CAD', 'url': u,
                        'availability': 'https://schema.org/InStock'}} for n, p, d, u in READINGS]


LD_PERSON = {'@context': 'https://schema.org', '@type': 'Person', '@id': SITE + '/#bri', 'name': 'Bri Godard',
             'jobTitle': 'Astrologer', 'url': SITE + '/', 'image': SITE + '/assets/bri-portrait.webp',
             'worksFor': {'@id': SITE + '/#ophi'},
             'sameAs': ['https://www.instagram.com/brigodard/', 'https://www.linkedin.com/in/bri-godard-15874915a/']}

LD_BUSINESS = {'@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': SITE + '/#ophi',
               'name': 'Ophi by Bri', 'slogan': 'Awakening Astrology', 'url': SITE + '/',
               'logo': SITE + '/assets/apple-touch-icon.png', 'image': SITE + '/assets/og/ophi-share.jpg',
               'founder': {'@id': SITE + '/#bri'}, 'areaServed': ['Canada', 'Worldwide (online)'],
               'priceRange': '$69 to $129 CAD',
               'sameAs': ['https://www.instagram.com/brigodard/']}


def ld_article(D, key, canon, desc):
    M = D[key]; P = M.get('post') or {}
    return {'@context': 'https://schema.org', '@type': 'Article',
            'headline': ('%s: %s' % (M.get('label'), re.sub(r'\*', '', P.get('title') or '')))[:110],
            'description': desc, 'url': canon, 'mainEntityOfPage': canon,
            'datePublished': key + '-01', 'dateModified': key + '-01',
            'author': {'@id': SITE + '/#bri', '@type': 'Person', 'name': 'Bri Godard', 'url': SITE + '/'},
            'publisher': {'@id': SITE + '/#ophi', '@type': 'Organization', 'name': 'Ophi by Bri',
                          'logo': {'@type': 'ImageObject', 'url': SITE + '/assets/apple-touch-icon.png'}},
            'image': SITE + '/assets/og/ophi-share.jpg'}


def ld_crumbs(trail):
    items = [('Home', SITE + '/')] + list(trail)
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList',
            'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(items)]}
