/* This Season content, one block per month.
   The page shows the month it is in Vancouver (Pacific time), so it switches by itself at midnight on the 1st.
   If a month has no block yet, the page keeps showing the most recent month that does.
   To write a month: replace the placeholder text in its block. Leave "ready: false" on a sign until its chapter is written;
   the card then shows the "being written" note instead of half-finished copy.
   Fields: post.title (use *asterisks* for the italic, highlighted words), post.when, post.what, post.takeaway, post.body,
   and for each sign: title, body (paragraphs separated by a blank line), tries (up to three short lines in Bri's hand). */
window.OPHI_SEASON = {
  "2026-10": {
    label: "October 2026",
    post: {
      ready: true,
      title: "Venus goes underground. *Speak up anyway.*",
      when: "Venus turns retrograde in Scorpio on October 2–3. Mars in Leo opposes Pluto on October 3. Pluto turns direct on October 15. Mercury turns retrograde in Scorpio on October 23. Venus slips back into Libra on October 25 and turns direct on November 13. (Pacific time.)",
      what: "Venus retrograde in Scorpio, opened by Mars in Leo facing off with Pluto in Aquarius.",
      takeaway: "Watch first, then readjust. Speak up for what you feel is unjust, in your own life and in your community, and lean on each other while things feel shaky.",
      body: "The biggest story this month is Venus turning retrograde in Scorpio. Venus is how we love, what we value and what we let ourselves receive. In Scorpio she goes underground, into power, intimacy and everything we usually keep quiet.\n\nShe starts her retrograde right as Mars opposes Pluto, while Pluto is still retrograde. It's a symbol of feminine power, or the lack of it: of having to channel our divine flame, speak up for what we feel is wrong, and readjust the places in our life where we feel we've lost control.\n\nIt comes in two phases. First we observe: we notice where things feel off. Then we readjust. It can feel shaky, which is why we need to rely on each other, because the world is going through a lot. Speak up for what you feel is unjust, within your own life and within your community.\n\nFind your rising sign below to see where this lands for you."
    },
    signs: {
      aries: { ready: true, title: "Venus in your *8th house*", body: "This retrograde moves through your eighth house: other people's resources, debts, inheritances, close business partnerships, and the topics that are hard to talk about.\n\nNotice where power sits in what you share with others. Who holds the purse strings, who owes whom, what's been left unsaid. Observe first. Then renegotiate what no longer feels fair.", tries: ["Look honestly at what you share", "Have the money talk you've been avoiding", "Name what feels unequal"] },
      taurus: { ready: true, title: "Venus in your *7th house*", body: "This retrograde moves through your seventh house: marriage, partnerships, relationships, client-to-practitioner relationships and every other committed partnership.\n\nOld patterns in your closest relationships come up to be seen. Notice where you give more than you receive, or where you've stayed quiet to keep the peace. Speak up gently, and adjust the agreement.", tries: ["Notice who you shrink around", "Ask for what you need, out loud", "Revisit an old agreement"] },
      gemini: { ready: true, title: "Venus in your *6th house*", body: "This retrograde moves through your sixth house: lifestyle, daily work, effort, routines, hustle, health and care for the body.\n\nYour body and your schedule are asking for a review. Where are you pushing past your limits, or working in a way that doesn't feel good anymore? Observe your days, then readjust the routines that drain you.", tries: ["Track how your body feels this week", "Drop one habit that drains you", "Make rest part of the routine"] },
      cancer: { ready: true, title: "Venus in your *5th house*", body: "This retrograde moves through your fifth house: art, creativity, children, your inner child, love affairs and playtime.\n\nWhat used to bring you joy may need tending. Old creative projects, past romances or inner-child wounds can come back around. Observe what lights you up and what doesn't anymore, then make room for play again.", tries: ["Return to an old creative project", "Play with no goal", "Listen to your inner child"] },
      leo: { ready: true, title: "Venus in your *4th house*", body: "This retrograde moves through your fourth house: home, roots, foundational stability, your psychological foundation and your parents.\n\nHome and family take centre stage. Old family dynamics or the way you were raised may surface. Notice where you feel safe and where you don't, then readjust the foundations you're building on.", tries: ["Notice what home means to you now", "Reflect on what you inherited", "Tend to your space"] },
      virgo: { ready: true, title: "Venus in your *3rd house*", body: "This retrograde moves through your third house: your daily environment, communication, networking with the people and places around you, siblings, besties, learning, thinking and ideation.\n\nWords matter this month. Old conversations, unanswered messages and friendships may need a second look. Observe how you speak and how you're spoken to, then say what needs saying.", tries: ["Reread before you send", "Reach out to a sibling or bestie", "Write down your ideas before acting"] },
      libra: { ready: true, title: "Venus in your *2nd house*", body: "This retrograde moves through your second house: money, resources, assets, skills, self-value, worth and beliefs.\n\nYour sense of worth is up for review. Where are you undercharging, overgiving, or believing you have to earn your place? Observe your relationship with money and with yourself, then readjust what you accept.", tries: ["Look at what you charge, and why", "Name a belief about worth you've outgrown", "Spend on what you truly value"] },
      scorpio: { ready: true, title: "Venus in your *1st house*", body: "This retrograde happens in your house of identity: who you are, how you're seen in the world, the mark you leave, your personality and your direction. It's very personal.\n\nYou may feel like you're shedding a skin. Notice how you show up and whether it still feels like you. Observe before you reinvent, then step forward as who you're becoming.", tries: ["Notice how you present yourself", "Let an old version of you go", "Choose your direction, slowly"] },
      sagittarius: { ready: true, title: "Venus in your *12th house*", body: "This retrograde moves through your twelfth house: secrets and mysteries, what's hidden or taboo, death and the other side, what happens in private and within yourself, transcendence and your connection to your higher self. It also deals with fears.\n\nThis is an inward month. Old fears or private feelings may rise to the surface. Give them space to be seen, without rushing to fix them. Rest, reflect and reconnect with your higher self.", tries: ["Journal what you keep to yourself", "Give your fears a name", "Make time for quiet"] },
      capricorn: { ready: true, title: "Venus in your *11th house*", body: "This retrograde moves through your eleventh house: community, gatherings, affiliations, groups of people and friends, social life and being one among the many.\n\nNotice which circles feed you and which ones drain you. Old friends may come back around. Observe where you belong, then speak up for your community, and let it hold you too.", tries: ["Check in with an old friend", "Notice where you truly belong", "Show up for your community"] },
      aquarius: { ready: true, title: "Venus in your *10th house*", body: "This retrograde moves through your tenth house: public reputation, career, legacy and being seen.\n\nYour career and how you're seen are up for review. Notice where you feel undervalued, or where your work no longer reflects who you are. Observe first, then readjust your direction and the way you show up publicly.", tries: ["Review what you want to be known for", "Speak up for your worth at work", "Revisit an old goal"] },
      pisces: { ready: true, title: "Venus in your *9th house*", body: "This retrograde moves through your ninth house: travel and discovery, adventure, higher thinking and learning, spirituality, culture, new adventures and blessings.\n\nYour beliefs and your big-picture plans want a second look. Old teachings, journeys or dreams may come back around. Observe what you truly believe now, then readjust the path toward your next adventure.", tries: ["Question a belief you inherited", "Revisit a dream trip or course", "Count your blessings"] }
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
