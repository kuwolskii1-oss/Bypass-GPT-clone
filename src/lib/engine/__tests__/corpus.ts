/**
 * Labelled benchmark for the detector.
 *
 * "ai" texts are model-written in the styles current assistants produce
 * (em-dash blog voice, reflective first person, markdown explainers, polished
 * academic prose, promotional copy). "human" texts are either public-domain
 * prose by named authors or informal modern writing in a deliberately uneven
 * human register (marked `imitation: true`; they were drafted for this
 * benchmark, not collected from real people, so treat them as style controls).
 */
export interface CorpusItem {
  id: string;
  label: "ai" | "human";
  note: string;
  imitation?: boolean;
  /** Held-out items were written after the detector's weights were frozen. */
  holdout?: boolean;
  text: string;
}

export const CORPUS: CorpusItem[] = [
  // ------------------------------------------------------------------ AI
  {
    id: "ai-emdash-blog",
    label: "ai",
    note: "Em-dash blog voice with contrast framing",
    text: `Most people think productivity is about doing more. It isn't — it's about doing less, better. The real shift happens when you stop treating your calendar as a to-do list and start treating it as a statement of priorities.

Here's the thing: your energy is finite. Every meeting you accept, every notification you answer, every "quick favor" you agree to — each one draws from the same limited reserve. The goal isn't to squeeze more into the day. The goal is to protect the hours that actually move the needle.

So where do you start? Begin with a simple audit. Track your time for one week — not to judge yourself, but to see clearly. You'll likely discover that the work that matters most gets the least attention. That's not a personal failing. It's a design problem, and design problems can be solved.`,
  },
  {
    id: "ai-reflective-first-person",
    label: "ai",
    note: "Reflective first person, no stock phrases, citations",
    text: `When I started university, I assumed that social media was a neutral tool, something I used rather than something that used me. Three years later, I am less sure. In this essay I examine how platforms such as Instagram and TikTok shape the way young people build a sense of who they are, drawing on my own experience alongside the research literature.

Turkle (2011) argues that digital spaces invite people to perform edited versions of themselves, and I recognise that pattern in my own habits. I choose which photos to post and which to delete, and I notice when a post receives fewer likes than I expected. Marwick and boyd (2014) describe this as managing an imagined audience, a phrase that captures the quiet calculation behind every post. A survey of 1,787 adults aged 19 to 32 found that heavy users were 2.7 times more likely to report depressive symptoms (Lin et al., 2016), and while correlation is not causation, the figure matches what I have seen among my friends.

I do not think the picture is entirely bleak. Online communities gave me access to people who shared my interests long before I found them offline, and Cho (2018) documents similar benefits for LGBTQ youth in rural areas. The problem is not connection itself but the incentives underneath it. As Zuboff (2019) shows, engagement is the product being sold, and the design choices follow from that.

My conclusion is a modest one. Social media did not invent the desire to be seen, but it has industrialised it, and I have learned to treat my feed with the same caution I would apply to any other advertisement.`,
  },
  {
    id: "ai-markdown-explainer",
    label: "ai",
    note: "Markdown headings with bold-label bullets",
    text: `## Benefits of Regular Exercise

Regular physical activity offers numerous advantages for both body and mind. Here are the key benefits:

1. **Improved cardiovascular health**: Exercise strengthens the heart and improves circulation.
2. **Better mental health**: Physical activity releases endorphins that reduce stress and anxiety.
3. **Weight management**: Consistent exercise helps maintain a healthy weight.
4. **Enhanced sleep quality**: People who exercise regularly tend to fall asleep faster.

## Getting Started

Begin with 20 minutes of moderate activity three times a week and gradually increase the duration. Remember, consistency matters more than intensity.`,
  },
  {
    id: "ai-academic-polished",
    label: "ai",
    note: "Polished third-person academic prose",
    text: `Urban green space has attracted growing attention as a determinant of public health. A substantial body of evidence suggests that access to parks and tree cover is associated with lower rates of cardiovascular disease, improved mental wellbeing, and greater social cohesion. These associations persist after adjustment for income and education, indicating that the relationship is not merely a reflection of neighbourhood affluence.

The mechanisms underlying these effects are multifaceted. Vegetation reduces ambient temperature and filters particulate matter, mitigating two well-established environmental risks. Green spaces also provide settings for physical activity and informal social contact, both of which contribute to resilience. While the relative importance of each pathway remains debated, the cumulative evidence points to a robust and policy-relevant effect.

Taken together, these findings underscore the value of treating urban greening not as an aesthetic amenity but as public health infrastructure, highlighting the need for planning frameworks that distribute its benefits equitably.`,
  },
  {
    id: "ai-fiction",
    label: "ai",
    note: "Literary short fiction",
    text: `The house had been empty for eleven years, but it had never been quiet. Wind moved through the broken shutters like breath, and the floorboards remembered every footstep they had ever carried. Mara stood in the doorway, her suitcase heavy in her hand, and felt the weight of everything she had not said.

She had come back to sell it. That was the plan — simple, practical, final. Yet as she stepped inside, the smell of dust and old lavender wrapped around her, and the plan began to dissolve. Her grandmother's chair still faced the window. A single teacup sat on the sill, as if waiting.

Mara set down the suitcase. Outside, the light was fading, painting the walls in shades of amber and gold. She realized, with a quiet ache, that some places are not just buildings. They are the keepers of who we used to be.`,
  },
  {
    id: "ai-advice-second-person",
    label: "ai",
    note: "Warm second-person advice",
    text: `Starting a new job can feel overwhelming, and that's completely normal. The first few weeks are less about proving yourself and more about learning how things actually work. Give yourself permission to ask questions — it shows engagement, not weakness.

Focus on building relationships early. Take the time to understand what your teammates care about, what frustrates them, and how they prefer to communicate. These small investments compound quickly, creating trust that makes everything else easier.

It's also worth setting clear expectations with your manager. Ask what success looks like at thirty, sixty, and ninety days. This isn't about impressing anyone; it's about making sure your effort is pointed in the right direction.

Finally, be patient with yourself. Confidence doesn't arrive on day one. It builds gradually, through small wins and honest reflection.`,
  },
  {
    id: "ai-travel-promo",
    label: "ai",
    note: "Promotional place description",
    text: `Nestled between rolling hills and the sparkling coastline, the town of Porto Vela offers a captivating blend of history, culture, and natural beauty. Its cobbled streets wind past centuries-old churches and vibrant markets, inviting visitors to slow down and savor every moment.

The old harbor stands as a testament to the town's rich maritime heritage, where colorful fishing boats bob gently beside modern cafes. Food lovers will delight in the local cuisine, which showcases fresh seafood, fragrant olive oil, and time-honored recipes passed down through generations.

Whether you're seeking adventure, relaxation, or a deeper connection with the past, Porto Vela has something for everyone. From sunrise hikes along the cliffs to sunset dinners by the water, it's a destination that lingers in the memory long after you've left.`,
  },
  {
    id: "ai-strategy-memo",
    label: "ai",
    note: "Business memo",
    text: `Our third-quarter results highlight both meaningful progress and clear areas for improvement. Revenue grew 12% year over year, driven primarily by expansion within existing accounts. However, new customer acquisition slowed, underscoring the need to revisit our go-to-market approach.

To address this, we propose three strategic priorities. First, we will streamline the onboarding experience to reduce time-to-value for new customers. Second, we will invest in targeted partnerships that extend our reach into underserved segments. Third, we will strengthen cross-functional alignment between sales, marketing, and product to ensure a consistent customer journey.

These initiatives are not without risk, but they position us to capture significant long-term value. By focusing on execution and maintaining a disciplined approach to investment, we can build a more resilient and scalable business.`,
  },
  {
    id: "ai-short-answer",
    label: "ai",
    note: "Short explainer answer",
    text: `Photosynthesis is the process by which plants convert light energy into chemical energy. It takes place primarily in the chloroplasts, where chlorophyll absorbs sunlight. Using this energy, the plant combines carbon dioxide and water to produce glucose and oxygen. In essence, photosynthesis not only sustains the plant itself but also provides the oxygen and food that support nearly all life on Earth.`,
  },
  {
    id: "ai-opinion-balanced",
    label: "ai",
    note: "Balanced opinion piece, restrained vocabulary",
    text: `The debate over remote work is often framed as a contest between freedom and accountability. That framing misses the point. The real question is not where people work but how organisations decide what good work looks like.

Offices made certain things easy. A manager could see who was at their desk, and presence became a stand-in for contribution. Remote work removed that shortcut, and many companies discovered they had never measured output in the first place. The discomfort that followed was less about distance than about clarity.

None of this means the office is obsolete. Some work benefits from proximity: mentoring, early-stage design, the kind of conversation that only happens by accident. The task for leaders is to be deliberate about which is which, rather than defaulting to habit in either direction.

The companies that get this right will not be the ones with the best policy. They will be the ones that know what they are trying to produce.`,
  },
  // --------------------------------------------------------------- HUMAN
  {
    id: "human-darwin",
    label: "human",
    note: "Charles Darwin, On the Origin of Species (1859), introduction",
    text: `When on board H.M.S. 'Beagle,' as naturalist, I was much struck with certain facts in the distribution of the inhabitants of South America, and in the geological relations of the present to the past inhabitants of that continent. These facts seemed to me to throw some light on the origin of species—that mystery of mysteries, as it has been called by one of our greatest philosophers. On my return home, it occurred to me, in 1837, that something might perhaps be made out on this question by patiently accumulating and reflecting on all sorts of facts which could possibly have any bearing on it. After five years' work I allowed myself to speculate on the subject, and drew up some short notes; these I enlarged in 1844 into a sketch of the conclusions, which then seemed to me probable: from that period to the present day I have steadily pursued the same object. I hope that I may be excused for entering on these personal details, as I give them to show that I have not been hasty in coming to a decision.`,
  },
  {
    id: "human-thoreau",
    label: "human",
    note: "Henry David Thoreau, Walden (1854)",
    text: `I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. I did not wish to live what was not life, living is so dear; nor did I wish to practise resignation, unless it was quite necessary. I wanted to live deep and suck out all the marrow of life, to live so sturdily and Spartan-like as to put to rout all that was not life, to cut a broad swath and shave close, to drive life into a corner, and reduce it to its lowest terms, and, if it proved to be mean, why then to get the whole and genuine meanness of it, and publish its meanness to the world; or if it were sublime, to know it by experience, and be able to give a true account of it in my next excursion.`,
  },
  {
    id: "human-twain",
    label: "human",
    note: "Mark Twain, Adventures of Huckleberry Finn (1884)",
    text: `You don't know about me without you have read a book by the name of The Adventures of Tom Sawyer; but that ain't no matter. That book was made by Mr. Mark Twain, and he told the truth, mainly. There was things which he stretched, but mainly he told the truth. That is nothing. I never seen anybody but lied one time or another, without it was Aunt Polly, or the widow, or maybe Mary. Aunt Polly—Tom's Aunt Polly, she is—and Mary, and the Widow Douglas is all told about in that book, which is mostly a true book, with some stretchers, as I said before.`,
  },
  {
    id: "human-federalist",
    label: "human",
    note: "Alexander Hamilton, The Federalist No. 1 (1787)",
    text: `After an unequivocal experience of the inefficacy of the subsisting federal government, you are called upon to deliberate on a new Constitution for the United States of America. The subject speaks its own importance; comprehending in its consequences nothing less than the existence of the Union, the safety and welfare of the parts of which it is composed, the fate of an empire in many respects the most interesting in the world. It has been frequently remarked that it seems to have been reserved to the people of this country, by their conduct and example, to decide the important question, whether societies of men are really capable or not of establishing good government from reflection and choice, or whether they are forever destined to depend for their political constitutions on accident and force.`,
  },
  {
    id: "human-austen",
    label: "human",
    note: "Jane Austen, Pride and Prejudice (1813)",
    text: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters. "My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?" Mr. Bennet replied that he had not. "But it is," returned she; "for Mrs. Long has just been here, and she told me all about it." Mr. Bennet made no answer. "Do not you want to know who has taken it?" cried his wife impatiently. "You want to tell me, and I have no objection to hearing it." This was invitation enough.`,
  },
  {
    id: "human-forum-post",
    label: "human",
    imitation: true,
    note: "Forum troubleshooting post",
    text: `ok so update on the dishwasher saga. turns out it wasn't the pump at all, which is annoying because I already ordered one (38 bucks, non refundable, great). pulled the bottom panel off last night and there was a chunk of glass wedged in the impeller housing, probably from the wine glass that broke back in march?? spun freely once I got it out with needle nose pliers. ran a rinse cycle and it drained fine. so if yours is humming but not draining check there FIRST before you buy parts like an idiot. also the youtube video everyone links is for the older model, the screws are torx on mine not phillips. t15 I think. anyway thanks to whoever suggested checking the filter, wasn't that but it got me looking in the right place`,
  },
  {
    id: "human-product-review",
    label: "human",
    imitation: true,
    note: "Product review with specifics and complaints",
    text: `Bought these for my dad who's 71 and has trouble with small buttons. Mixed feelings. Sound is honestly fine, better than I expected for the price, and the case charges fast. But the touch controls are a nightmare for him. He keeps pausing his audiobook every time he adjusts the left one, and there's no way to turn that off that I could find (I spent 20 min in the app). Battery got us about 5.5 hours, not the 8 they claim. One star off for that, one for the controls. Would I buy again? Probably not for him. For myself, maybe, if they go on sale. The return window was 30 days and we missed it by two, so he's stuck with them. He says they're "fine." He does not think they are fine.`,
  },
  {
    id: "human-work-email",
    label: "human",
    imitation: true,
    note: "Quick email to a coworker",
    text: `Hey Priya, quick one before I forget. The numbers in tab 3 of the Q3 sheet don't match what finance sent over on Tuesday, I think someone pasted last year's headcount in by mistake (it says 214, should be 241). Can you check with Dan before the 2pm? I'd do it myself but I'm stuck in the vendor thing until at least 1:30 and my laptop is at 9%. Also, did we ever hear back from legal about the Hartley contract? I pinged them Friday and got nothing. Not urgent but Maria asked me about it twice now and I'm running out of ways to say "soon". Thanks, sorry for the brain dump. Lunch Thursday still on?`,
  },
  {
    id: "human-student-reflection",
    label: "human",
    imitation: true,
    note: "Student reflective writing, uneven",
    text: `I didn't expect the placement to change how I think about teaching, but it did, mostly because of one kid. I'll call him J. He was in the Year 8 class I had on Wednesdays and for the first three weeks he did nothing. Not disruptive, just nothing. Head on desk. My mentor said leave him, he's like that with everyone, and I did leave him, which I regret a bit now. In week four we did the bridge-building task with spaghetti and I put him with two girls who talk a lot, thinking they'd carry him. Instead he quietly rebuilt their whole design while they argued. It held 1.2kg, the most in the class. He didn't say a word about it. I still don't really know what the lesson is here. Maybe that I'd decided who he was too early. Maybe just that spaghetti is more interesting than worksheets, which, fair.`,
  },
  {
    id: "human-nonnative",
    label: "human",
    imitation: true,
    note: "Non-native English, formal but imperfect",
    text: `I am writing to ask about the status of my application, which I have submitted on 3rd of September. Until now I did not receive any confirmation, only the automatic email. In the website it is written that the answer comes in four weeks, but now it is already seven weeks and I am a little worried, because my current contract finishes in the end of November and I must tell to my landlord if I stay or not. I understand you have many applications. However I would be very thankful if you can tell me at least if my documents were complete, because last time one paper was missing and nobody informed me for two months. I attach again my passport copy and the diploma translation for the case they are lost. Thank you for your patience with my English.`,
  },
  {
    id: "human-meeting-notes",
    label: "human",
    imitation: true,
    note: "Meeting notes as a list",
    text: `Notes from Thursday standup (Sam out sick, Lena late)

- deploy is blocked again, staging cert expired over the weekend. Raj is on it, says an hour, so probably three
- the search bug: can't reproduce on anything but Kofi's machine. he thinks it's locale related? turkish i problem maybe. parked until he has a failing test
- nobody has looked at the onboarding copy since June. marketing wants it by the 14th. I said no promises
- Lena wants to drop IE mode support for real this time. 0.3% of sessions last month. no objections but we said that in March too
- retro moved to Monday because of the offsite

Action: me to chase the cert thing at 11 if it's still broken. Kofi to write up the locale theory.`,
  },
  {
    id: "human-legal-clause",
    label: "human",
    imitation: true,
    note: "Lease clause, formal boilerplate",
    text: `The Tenant shall pay the Rent in advance on the first day of each calendar month by standing order to the account notified in writing by the Landlord. If any Rent remains unpaid for fourteen days after becoming due, whether formally demanded or not, interest shall accrue on the outstanding sum at four per cent above the base rate of the Bank from the due date until payment. The Tenant shall not assign, sublet or part with possession of the Premises or any part of them without the prior written consent of the Landlord, such consent not to be unreasonably withheld. However, nothing in this clause shall prevent the Tenant from having a lodger provided that the Landlord is informed in writing within seven days. Finally, the Tenant shall permit the Landlord to enter the Premises at reasonable hours on not less than twenty-four hours' notice to inspect their condition.`,
  },
  {
    id: "human-methods",
    label: "human",
    imitation: true,
    note: "Research write-up with discourse markers",
    text: `We ran the survey twice because the first batch of responses came back with the wrong date field. However, the second run took three weeks longer than planned. For instance, participation was lower than we had hoped, at 412 of the 900 invited, and the age skew is obvious in the raw counts. Finally, results should be read with that in mind. The main effect held up in both runs, which surprised us. Effect sizes were small but consistent across sites, and the one site where it reversed (Leeds) had a fire drill in the middle of session two, so we are not reading much into that.`,
  },
  {
    id: "human-news-report",
    label: "human",
    imitation: true,
    note: "Local news report",
    text: `A water main burst on Cartwright Road shortly after 6am on Tuesday, flooding the junction with Mill Lane and cutting supply to about 340 homes. Crews from the water company arrived at 7.15am and had the leak isolated by mid-morning, a spokesman said. Two cars parked outside the bakery were damaged. The owner, Denise Okafor, said she had opened as usual. "I had water up to the step and a queue out the door," she said. "People still want their bread." The road is expected to stay closed until Thursday while the surface is repaired. It is the third burst on the same stretch since 2022. The council said it had asked the company for a report on the condition of the pipe, which dates from the 1950s. Buses on the 14 and 62 routes are being diverted via Station Road.`,
  },
  // ------------------------------------------------------------ HELD OUT
  {
    id: "holdout-ai-personal-statement",
    label: "ai",
    holdout: true,
    note: "Personal statement",
    text: `From an early age, I have been fascinated by the way small systems produce large effects. Growing up in a household where my mother ran a pharmacy, I saw firsthand how a single prescription could change the course of someone's week. That experience sparked a curiosity about medicine that has only deepened over time.

During my undergraduate studies, I pursued this interest through both coursework and research. Working in a pharmacology lab taught me that discovery is rarely dramatic; it is patient, methodical, and often humbling. I learned to value precision, but I also learned to value doubt.

What draws me to this programme is not simply its reputation but its commitment to translating research into practice. I am eager to contribute to a community that treats rigour and compassion as complementary rather than competing values, and I am confident that my background has prepared me to do so.`,
  },
  {
    id: "holdout-ai-recipe-intro",
    label: "ai",
    holdout: true,
    note: "Recipe blog introduction",
    text: `There's something deeply comforting about a pot of soup simmering on the stove. This creamy tomato basil soup is the kind of recipe that feels like a warm hug — simple, nourishing, and ready in under thirty minutes.

What makes this version special isn't a secret ingredient. It's the technique. Roasting the tomatoes first brings out their natural sweetness, creating a depth of flavor that canned soup simply can't match. A splash of cream adds richness, while fresh basil keeps everything bright.

Whether you're cooking for a busy weeknight or a cozy weekend lunch, this soup delivers every time. Pair it with a grilled cheese sandwich, and you've got a meal the whole family will love.`,
  },
  {
    id: "holdout-ai-tech-prose",
    label: "ai",
    holdout: true,
    note: "Technical explanation in prose",
    text: `Database indexing is one of the most effective ways to improve query performance, but it comes with trade-offs that are easy to overlook. An index works much like the index of a book: instead of scanning every page, the database can jump directly to the relevant rows.

The benefit is speed. Queries that filter or sort on indexed columns can run orders of magnitude faster, particularly on large tables. The cost is paid on writes. Every insert, update, or delete must also update the index, increasing both latency and storage requirements.

The key is to index deliberately. Start by identifying the queries that matter most, then examine their execution plans to see where time is actually spent. Adding an index should be a response to evidence, not a reflex.`,
  },
  {
    id: "holdout-ai-news-summary",
    label: "ai",
    holdout: true,
    note: "Neutral news-style summary",
    text: `The city council voted on Tuesday to approve a new cycling network, marking a significant step toward its long-term sustainability goals. The plan includes 40 kilometres of protected lanes, with construction expected to begin next spring.

Supporters argue that the investment will reduce congestion, improve air quality, and make streets safer for all users. Critics, however, have raised concerns about the loss of parking and the potential impact on local businesses during construction.

The council has pledged to work closely with residents and business owners throughout the process, ensuring that disruption is kept to a minimum. If successful, the project could serve as a model for other mid-sized cities seeking to balance growth with livability.`,
  },
  {
    id: "holdout-human-lincoln",
    label: "human",
    holdout: true,
    note: "Abraham Lincoln, Gettysburg Address (1863)",
    text: `Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this. But, in a larger sense, we can not dedicate—we can not consecrate—we can not hallow—this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here.`,
  },
  {
    id: "holdout-human-melville",
    label: "human",
    holdout: true,
    note: "Herman Melville, Moby-Dick (1851)",
    text: `Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people's hats off—then, I account it high time to get to sea as soon as I can.`,
  },
  {
    id: "holdout-human-rant",
    label: "human",
    holdout: true,
    imitation: true,
    note: "Online complaint about a landlord",
    text: `Is it normal for a landlord to just show up?? Third time this month. Today he let himself in at 8:40 while I was in the shower, said he "texted" (he did, at 8:38). Lease says 24 hours notice, I checked. When I pointed that out he laughed and said it's his building. I've been here four years, never late on rent once, and I fixed the bathroom fan myself last winter because he wouldn't. I don't want to move, the place is cheap and it's ten minutes from work, but I also don't want to be standing there in a towel explaining tenancy law to a man holding a ladder. Has anyone actually had luck with a written complaint or does that just make things worse. Scotland if that matters.`,
  },
  {
    id: "holdout-human-bug-report",
    label: "human",
    holdout: true,
    imitation: true,
    note: "Bug report",
    text: `Export to CSV drops the last row when the table has exactly 500 entries. 499 is fine, 501 is fine. Found it because a customer's totals were off by one invoice and it took me most of yesterday to work out why. Steps: filter Invoices to any range that returns 500, hit Export, open the file, count. You get 499 plus the header. My guess is the pagination boundary, since page size is 500 and we probably check less-than instead of less-than-or-equal somewhere in the batch loop, but I haven't looked at the code. Happens on staging and prod, Chrome and Firefox. Doesn't happen with the PDF export. Not urgent for us since I've told the customer to add a dummy filter, but it's the kind of thing that will bite someone at month end.`,
  },
];
