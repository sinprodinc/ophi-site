/* This Season content, one block per month.
   The page shows the month it is in Vancouver (Pacific time), so it switches by itself at midnight on the 1st.
   If a month has no block yet, or its post is still "ready: false", the page keeps showing the most recent finished month.
   To write a month: replace the placeholder text in its block. Leave "ready: false" on a sign until its chapter is written;
   the card then shows the "being written" note instead of half-finished copy.
   Optional: risingIntro (the line above the twelve cards), closing.title + closing.body (a closing note under them),
   and per sign: house (shown on the chapter's top line) and note (a closing line shown in Bri's hand under "Remember").
   In any body, a paragraph that starts with "## " becomes a small heading.
   Fields: post.title (use *asterisks* for the italic, highlighted words), post.when, post.what, post.takeaway, post.body,
   and for each sign: title, body (paragraphs separated by a blank line), tries (up to three short lines in Bri's hand). */
window.OPHI_SEASON = {
  "2026-10": {
    label: "October 2026",
    post: {
      ready: true,
      title: "The Journey Towards Reclaiming Our *Collective Power*",
      when: "October 3: Venus stations retrograde in Scorpio, and Mars in Leo forms an exact opposition to Pluto in Aquarius. Venus stays in Scorpio until October 25, then returns to Libra. (Pacific time.)",
      what: "Venus retrograde in Scorpio, Mars opposes Pluto, and the courage to question out loud.",
      takeaway: "October is a time to observe. Pay attention to where you’ve surrendered your power, where your values are being compromised, and what might need to change. With so much uncertainty in the world, lean on your community, speak up against injustice, and remember that you don't have to navigate everything alone. Not everything needs to be resolved right now. Sometimes recognizing what needs to change is the first step toward reclaiming your power.",
      body: "October is asking some uncomfortable questions. Who holds the power? What is the power being used for? What are we willing to tolerate? And… How much of ourselves have we compromised?\n\nOn October 3rd, Venus stations retrograde in Scorpio, beginning a period of reflection on our relationships, values, desires, feminine resources, and sense of worth. Venus is traditionally associated with love, beauty, pleasure, money, and connection. Scorpio brings our attention to what lives beneath the surface, ie: vulnerability, intimacy, trust, control, and the complicated ways we share power… Or are supposed to.\n\nThis isn't necessarily comfortable territory.\n\nOn the same day, Mars in Leo forms an exact opposition to Pluto in Aquarius, bringing another layer of intensity to the conversation. Mars symbolizes our drive, courage, anger, and capacity to act. Pluto is associated with power, transformation, and the forces that shape our lives, both personally and collectively.\n\nTogether, these transits offer a potent symbol of the struggle to reclaim our voices and our agency, particularly when we feel unheard, restricted, or disconnected from our own authority (did someone say feminism?).\n\nThere is also a powerful invitation here to examine our relationship with feminine power: how it has been celebrated, controlled, silenced, or oppressed. Not that feminine power belongs to any one gender, but receptivity, desire, intuition, and the right to determine what happens to our bodies and lives deserve the same recognition and respect as celebrities, sports, male-led podcasts, politics, and the stock market (to name a few).\n\n## First We Observe, Then We Readjust.\n\nRetrogrades are traditionally understood as periods of revisiting, reconsidering, and reassessing. Venus retrograde asks us to look closely at what we value and whether our choices reflect those values.\n\nThe first part of this process may be about observation. Notice what feels out of balance. Where are you giving more than you receive? Where have you surrendered control that should belong to you? What are you no longer accepting?\n\nAs the month unfolds, reflection may begin to turn into readjustment."
    },
    risingIntro: "Read for your rising sign. These interpretations use whole-sign houses and focus on Venus's time in Scorpio, particularly October 3–25. As Venus returns to Libra later in the month, another area of life comes into focus.",
    closing: { title: "A final thought for *October*", body: "Not every disruption is a disaster. Not every uncomfortable feeling is a sign that something is wrong. Sometimes discomfort is information, asking us to pay closer attention to the choices, relationships, and structures shaping our lives.\n\nOctober's astrology invites us to get curious before getting reactive. To recognize what needs to change without demanding instant resolution. And to remember that our individual power grows stronger when it's supported by care, connection, and accountability.\n\nObserve what surfaces. Question what no longer fits. Then decide what deserves to come with you." },
    signs: {
      aries: { ready: true, house: "The Eighth House", title: "What do you owe, and what is owed to you?", body: "Shared finances, debts, inheritances, investments, and intimate partnerships come under review. This is an opportunity to examine the agreements that connect your resources to someone else's, including the emotional obligations that aren't written into any contract.\n\nAre you carrying responsibilities that should be shared? Are difficult conversations about money, intimacy, or trust being avoided?", note: "You don't need to solve everything at once, but you do deserve clarity about what you're agreeing to.", tries: [] },
      taurus: { ready: true, house: "The Seventh House", title: "Is there room for both of you in this relationship?", body: "Your committed partnerships take centre stage, whether romantic, professional, or client-based. Venus retrograde invites you to consider the balance between what you give, what you receive, and what you need.\n\nOld patterns may become easier to recognize, particularly where compromise has started looking more like self-abandonment.", note: "The goal isn't to find fault. It's to understand what a relationship needs to remain reciprocal, respectful, and sustainable.", tries: [] },
      gemini: { ready: true, house: "The Sixth House", title: "Who is your routine really working for?", body: "Your daily responsibilities, working conditions, habits, and relationship with your body are ready for reassessment.\n\nPerhaps your schedule has become a collection of everyone else's priorities. Perhaps productivity has quietly taken precedence over rest, nourishment, and the small things that make life enjoyable.", note: "Notice where your energy goes and what actually replenishes it. Your worth is not measured by how much you can accomplish before the day is done.", tries: [] },
      cancer: { ready: true, house: "The Fifth House", title: "When did having fun become another thing on the to-do list?", body: "Creativity, romance, children, pleasure, and play are at the heart of your Venus retrograde experience.\n\nThis may be a time to reconnect with an old creative interest, reconsider your romantic desires, or simply remember what it feels like to do something without needing it to become productive.\n\nYour younger self might have something worth reminding you of.", note: "Make room for joy that doesn't need to justify its existence.", tries: [] },
      leo: { ready: true, house: "The Fourth House", title: "What does feeling at home actually mean to you?", body: "Your home, family relationships, roots, and emotional foundations are asking for attention.\n\nYou may find yourself revisiting family dynamics, questioning inherited beliefs, or considering whether your living environment supports the person you're becoming.\n\nSome foundations are worth strengthening. Others may need to be rebuilt on your own terms.", note: "You can honour where you came from while deciding what you want to carry forward.", tries: [] },
      virgo: { ready: true, house: "The Third House", title: "Whose voice have you been hearing in your head?", body: "Your everyday environment, communication habits, siblings, close friends, learning, and thought patterns come into focus.\n\nPay attention to the conversations you keep replaying and the assumptions shaping your perspective. An old idea may deserve another look, or a familiar conversation may need a different approach.\n\nYour words carry weight, but so does your willingness to listen.", note: "Not every thought needs to become a belief. Not every opinion deserves a permanent home in your mind.", tries: [] },
      libra: { ready: true, house: "The Second House", title: "What is your worth when nobody is putting a price on it?", body: "Money, possessions, personal resources, skills, and self-worth become major themes.\n\nVenus, your ruling planet, invites you to reconsider how you earn, spend, save, and value what you bring to the table.\n\nWhere have you underestimated your abilities? Are your financial choices aligned with what matters to you? Have you confused being needed with being valued?", note: "Your resources deserve attention, and so do the beliefs that influence how you use them.", tries: [] },
      scorpio: { ready: true, house: "The First House", title: "Who are you becoming when you stop performing who you've been?", body: "This retrograde is especially personal. Venus is revisiting your first house of identity, self-presentation, and how you move through the world.\n\nYou may feel called to reconsider how you express yourself, the roles you've outgrown, or the version of yourself you've been maintaining for other people's comfort.\n\nYou don't have to reinvent your entire identity.", note: "Sometimes the most meaningful transformation is simply becoming more honest about who you already are.", tries: [] },
      sagittarius: { ready: true, house: "The Twelfth House", title: "What has been asking for your attention behind the scenes?", body: "The twelfth house brings us into the territory of solitude, dreams, fears, unconscious patterns, private experiences, and spiritual reflection.\n\nVenus retrograde may invite you to examine what you've kept hidden, including feelings or desires you haven't entirely acknowledged to yourself.\n\nYou may need more quiet than usual to hear what's happening beneath the noise.", note: "Privacy can be restorative. Give yourself space to process without turning every discovery into something you need to explain.", tries: [] },
      capricorn: { ready: true, house: "The Eleventh House", title: "Do your communities reflect your values?", body: "Friendships, group affiliations, networks, collective projects, and hopes for the future are up for reconsideration.\n\nYou may begin noticing where you feel genuinely supported and where belonging seems to require compromising something important.\n\nConsider the communities you contribute to and the causes you want to stand behind.", note: "Being part of something bigger doesn't mean making yourself smaller. The healthiest connections make room for individuality and shared responsibility.", tries: [] },
      aquarius: { ready: true, house: "The Tenth House", title: "What kind of legacy are you building, and for whom?", body: "Your career, public identity, reputation, and long-term ambitions are highlighted.\n\nThis is an opportunity to revisit how you define achievement and whether your professional path reflects your personal values.\n\nAre you pursuing recognition that genuinely matters to you, or following an idea of success you inherited from somewhere else?", note: "You are allowed to reconsider what success looks like. A meaningful legacy is built through choices, not appearances alone.", tries: [] },
      pisces: { ready: true, house: "The Ninth House", title: "What if there's more to discover than what you already know?", body: "Your beliefs, higher education, spirituality, travel, cultural exploration, and search for meaning come into focus.\n\nVenus retrograde invites you to revisit the philosophies guiding your decisions. A subject you once loved may call you back, or an unfamiliar perspective may challenge something you've always assumed to be true.\n\nCuriosity can be transformative, especially when it's paired with humility and a willingness to learn from other people's experiences.", note: "You don't need to have every answer to begin exploring a different possibility.", tries: [] }
    }
  },
  "2026-11": {
    label: "November 2026",
    post: {
      ready: false,
      title: "The headline of the *month.*",
      when: "Dates go here, in Pacific time.",
      what: "The main transit of the month, in one line.",
      takeaway: "What it asks of us, in two sentences, for anyone who only reads this far.",
      body: "Bri's breakdown of the month goes here."
    },
    signs: {
      aries: { ready: false, title: "", body: "", tries: [] },
      taurus: { ready: false, title: "", body: "", tries: [] },
      gemini: { ready: false, title: "", body: "", tries: [] },
      cancer: { ready: false, title: "", body: "", tries: [] },
      leo: { ready: false, title: "", body: "", tries: [] },
      virgo: { ready: false, title: "", body: "", tries: [] },
      libra: { ready: false, title: "", body: "", tries: [] },
      scorpio: { ready: false, title: "", body: "", tries: [] },
      sagittarius: { ready: false, title: "", body: "", tries: [] },
      capricorn: { ready: false, title: "", body: "", tries: [] },
      aquarius: { ready: false, title: "", body: "", tries: [] },
      pisces: { ready: false, title: "", body: "", tries: [] }
    }
  },
  "2026-12": {
    label: "December 2026",
    post: {
      ready: false,
      title: "The headline of the *month.*",
      when: "Dates go here, in Pacific time.",
      what: "The main transit of the month, in one line.",
      takeaway: "What it asks of us, in two sentences, for anyone who only reads this far.",
      body: "Bri's breakdown of the month goes here."
    },
    signs: {
      aries: { ready: false, title: "", body: "", tries: [] },
      taurus: { ready: false, title: "", body: "", tries: [] },
      gemini: { ready: false, title: "", body: "", tries: [] },
      cancer: { ready: false, title: "", body: "", tries: [] },
      leo: { ready: false, title: "", body: "", tries: [] },
      virgo: { ready: false, title: "", body: "", tries: [] },
      libra: { ready: false, title: "", body: "", tries: [] },
      scorpio: { ready: false, title: "", body: "", tries: [] },
      sagittarius: { ready: false, title: "", body: "", tries: [] },
      capricorn: { ready: false, title: "", body: "", tries: [] },
      aquarius: { ready: false, title: "", body: "", tries: [] },
      pisces: { ready: false, title: "", body: "", tries: [] }
    }
  },
  "2027-01": {
    label: "January 2027",
    post: {
      ready: false,
      title: "The headline of the *month.*",
      when: "Dates go here, in Pacific time.",
      what: "The main transit of the month, in one line.",
      takeaway: "What it asks of us, in two sentences, for anyone who only reads this far.",
      body: "Bri's breakdown of the month goes here."
    },
    signs: {
      aries: { ready: false, title: "", body: "", tries: [] },
      taurus: { ready: false, title: "", body: "", tries: [] },
      gemini: { ready: false, title: "", body: "", tries: [] },
      cancer: { ready: false, title: "", body: "", tries: [] },
      leo: { ready: false, title: "", body: "", tries: [] },
      virgo: { ready: false, title: "", body: "", tries: [] },
      libra: { ready: false, title: "", body: "", tries: [] },
      scorpio: { ready: false, title: "", body: "", tries: [] },
      sagittarius: { ready: false, title: "", body: "", tries: [] },
      capricorn: { ready: false, title: "", body: "", tries: [] },
      aquarius: { ready: false, title: "", body: "", tries: [] },
      pisces: { ready: false, title: "", body: "", tries: [] }
    }
  },
  "2027-02": {
    label: "February 2027",
    post: {
      ready: false,
      title: "The headline of the *month.*",
      when: "Dates go here, in Pacific time.",
      what: "The main transit of the month, in one line.",
      takeaway: "What it asks of us, in two sentences, for anyone who only reads this far.",
      body: "Bri's breakdown of the month goes here."
    },
    signs: {
      aries: { ready: false, title: "", body: "", tries: [] },
      taurus: { ready: false, title: "", body: "", tries: [] },
      gemini: { ready: false, title: "", body: "", tries: [] },
      cancer: { ready: false, title: "", body: "", tries: [] },
      leo: { ready: false, title: "", body: "", tries: [] },
      virgo: { ready: false, title: "", body: "", tries: [] },
      libra: { ready: false, title: "", body: "", tries: [] },
      scorpio: { ready: false, title: "", body: "", tries: [] },
      sagittarius: { ready: false, title: "", body: "", tries: [] },
      capricorn: { ready: false, title: "", body: "", tries: [] },
      aquarius: { ready: false, title: "", body: "", tries: [] },
      pisces: { ready: false, title: "", body: "", tries: [] }
    }
  },
  "2027-03": {
    label: "March 2027",
    post: {
      ready: false,
      title: "The headline of the *month.*",
      when: "Dates go here, in Pacific time.",
      what: "The main transit of the month, in one line.",
      takeaway: "What it asks of us, in two sentences, for anyone who only reads this far.",
      body: "Bri's breakdown of the month goes here."
    },
    signs: {
      aries: { ready: false, title: "", body: "", tries: [] },
      taurus: { ready: false, title: "", body: "", tries: [] },
      gemini: { ready: false, title: "", body: "", tries: [] },
      cancer: { ready: false, title: "", body: "", tries: [] },
      leo: { ready: false, title: "", body: "", tries: [] },
      virgo: { ready: false, title: "", body: "", tries: [] },
      libra: { ready: false, title: "", body: "", tries: [] },
      scorpio: { ready: false, title: "", body: "", tries: [] },
      sagittarius: { ready: false, title: "", body: "", tries: [] },
      capricorn: { ready: false, title: "", body: "", tries: [] },
      aquarius: { ready: false, title: "", body: "", tries: [] },
      pisces: { ready: false, title: "", body: "", tries: [] }
    }
  }
};
