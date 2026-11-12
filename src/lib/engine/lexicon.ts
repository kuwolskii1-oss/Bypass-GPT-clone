/**
 * Curated lexical data shared by the detector and the humanizer:
 * LLM tell-phrases, transitional openers, contraction rules, intensifiers,
 * hedges, formal-to-plain simplifications and casual (human) markers.
 *
 * All patterns are case-insensitive and word-bounded. Spaces inside a phrase
 * match any run of horizontal whitespace; straight apostrophes also match the
 * typographic ones.
 */

/** Weight 3 = classic LLM tell, 2 = strong hint, 1 = mild / common in formal prose. */
export type PhraseWeight = 1 | 2 | 3;

export interface AiPhrase {
  /** Global, case-insensitive, word-bounded. Reset `lastIndex` before reuse. */
  pattern: RegExp;
  weight: PhraseWeight;
  /** Human-readable name shown in signals, e.g. "delve into". */
  label: string;
  /** Plainer alternatives; "" means the phrase can simply be dropped. Empty = detect only. */
  replacements: string[];
}

export interface TransitionOpener {
  word: string;
  /** Anchored at the start of a sentence (opening quotes already stripped). */
  pattern: RegExp;
  /** Alternatives; "" drops the opener. Entries ending in "," keep a comma. */
  alternatives: string[];
  /** 3 = strongest tell (Furthermore, Moreover...), 1 = common in human prose. */
  tier: PhraseWeight;
}

export type ContractionRule = readonly [RegExp, string];

export interface SimplifyRule {
  pattern: RegExp;
  /** Lower-cased forms, parallel to `to`. */
  from: string[];
  to: string[];
}

/**
 * Turns a phrase into regex source: escapes literal metacharacters (but keeps
 * the `(?:a|b)?` grouping syntax some entries use), lets straight apostrophes
 * match curly ones and lets spaces match any horizontal whitespace run.
 */
function toSource(text: string): string {
  return text
    .replace(/[.*+^${}[\]\\]/g, "\\$&")
    .replace(/'/g, "['’]")
    .replace(/ /g, "[^\\S\\n]+");
}

function phrase(source: string, weight: PhraseWeight, replacements: string[], label?: string): AiPhrase {
  const readable = label ?? source.replace(/\(\?:[^)]*\)\??/g, "").replace(/\s+/g, " ").trim();
  return {
    pattern: new RegExp(`\\b${toSource(source)}\\b`, "gi"),
    weight,
    label: readable,
    replacements,
  };
}

// ---------------------------------------------------------------------------
// AI tell-phrases
// ---------------------------------------------------------------------------

const RAW_PHRASES: AiPhrase[] = [
  // --- weight 3: classic tells -------------------------------------------
  phrase("delve into", 3, ["look into", "explore", "dig into", "get into"]),
  phrase("delves into", 3, ["looks into", "explores", "digs into"], "delve into"),
  phrase("delved into", 3, ["looked into", "explored", "dug into"], "delve into"),
  phrase("delving into", 3, ["looking into", "exploring", "digging into"], "delve into"),
  phrase("let's delve into", 3, ["let's look at", "let's get into", "here's a look at"]),
  phrase("delve", 3, ["dig", "look"], "delve"),
  phrase("in today's fast-paced world", 3, ["today", "these days", "right now", ""]),
  phrase("in today's (?:digital|modern|ever-changing|rapidly evolving|dynamic|competitive|interconnected|globalized) (?:world|age|era|landscape|society|economy|market)", 3, ["today", "these days", "now"], "in today's ... world"),
  phrase("in today's world", 3, ["today", "these days", "now"]),
  phrase("in the ever-changing", 3, ["in the changing", "in today's", "in the shifting"]),
  phrase("in the ever-evolving", 3, ["in the changing", "in today's", "in the shifting"]),
  phrase("in the digital age", 3, ["today", "online", "these days", ""]),
  phrase("in the modern era", 3, ["today", "now", "these days", ""]),
  phrase("it is important to note that", 3, ["", "note that", "keep in mind that"]),
  phrase("it's important to note that", 3, ["", "note that", "keep in mind that"]),
  phrase("it is important to (?:remember|recognize|understand|acknowledge) that", 3, ["", "remember that", "keep in mind that"], "it is important to remember that"),
  phrase("it is worth noting that", 3, ["", "notably,", "one thing to note:"]),
  phrase("it's worth noting that", 3, ["", "notably,", "one thing to note:"]),
  phrase("it is worth noting", 3, ["", "notably"]),
  phrase("it's worth noting", 3, ["", "notably"]),
  phrase("it is worth mentioning that", 3, ["", "also,", "by the way,"]),
  phrase("it's worth mentioning that", 3, ["", "also,", "by the way,"]),
  phrase("it is essential to acknowledge that", 3, ["", "granted,", "to be fair,"]),
  phrase("it is essential to", 3, ["you need to", "we must", "you have to"]),
  phrase("it's essential to", 3, ["you need to", "we must", "you have to"]),
  phrase("it is crucial to", 3, ["you need to", "we must", "you have to"]),
  phrase("it's crucial to", 3, ["you need to", "we must", "you have to"]),
  phrase("it is crucial that", 3, ["we need", "it matters that", "make sure"]),
  phrase("it is imperative (?:to|that)", 3, ["you must", "we need to", "it's vital to"], "it is imperative"),
  phrase("it is evident that", 3, ["clearly,", "obviously,", ""]),
  phrase("it is (?:widely )?(?:recognized|acknowledged|accepted) that", 3, ["most people agree that", "we know that", ""], "it is recognized that"),
  phrase("a testament to", 3, ["proof of", "a sign of", "evidence of"]),
  phrase("testament", 2, ["proof", "sign", "evidence"]),
  phrase("rich tapestry", 3, ["mix", "blend", "patchwork"]),
  phrase("tapestry", 3, ["mix", "blend", "web", "patchwork"]),
  phrase("navigate the complexities of", 3, ["handle", "deal with", "work through", "manage"]),
  phrase("navigating the complexities of", 3, ["handling", "dealing with", "working through"]),
  phrase("navigate the (?:ever-changing|evolving|complex|intricate|modern|shifting) (?:landscape|world|terrain|waters)", 3, ["keep up", "cope", "adapt"], "navigate the ... landscape"),
  phrase("navigate", 2, ["handle", "work through", "make sense of", "manage"]),
  phrase("navigating", 2, ["handling", "working through", "making sense of"]),
  phrase("(?:business|digital|marketing|technological|competitive|economic|political|media|professional|educational|healthcare|financial|modern|current|evolving|ever-changing|changing|global|corporate|cultural|social) landscape", 3, ["world", "space", "environment"], "... landscape"),
  phrase("landscape", 1, [], "landscape"),
  phrase("in the realm of", 3, ["in", "within", "in the world of"]),
  phrase("the realm of", 3, ["the world of", "the area of", "the field of"]),
  phrase("realm", 2, ["area", "world", "field", "space"]),
  phrase("embark on", 3, ["start", "begin", "set out on"]),
  phrase("embarked on", 3, ["started", "began"], "embark on"),
  phrase("embarking on", 3, ["starting", "beginning"], "embark on"),
  phrase("embarks on", 3, ["starts", "begins"], "embark on"),
  phrase("a plethora of", 3, ["plenty of", "lots of", "many", "a lot of"]),
  phrase("plethora", 3, ["abundance", "lot", "range"]),
  phrase("a myriad of", 3, ["many", "countless", "lots of", "all sorts of"]),
  phrase("myriad", 3, ["many", "countless", "all kinds of"]),
  phrase("game(?:-| )changer", 3, ["big deal", "big shift", "turning point"], "game-changer"),
  phrase("game(?:-| )changing", 3, ["major", "big", "important"], "game-changing"),
  phrase("cutting-edge", 3, ["advanced", "modern", "new"]),
  phrase("ever-evolving", 3, ["changing", "shifting", "growing"]),
  phrase("ever-changing", 3, ["changing", "shifting", "fast-moving"]),
  phrase("rapidly evolving", 3, ["fast-changing", "changing fast", "shifting"]),
  phrase("revolutionize", 3, ["change", "transform", "reshape", "overhaul"]),
  phrase("revolutionizes", 3, ["changes", "transforms", "reshapes"], "revolutionize"),
  phrase("revolutionizing", 3, ["changing", "transforming", "reshaping"], "revolutionize"),
  phrase("revolutionized", 3, ["changed", "transformed", "reshaped"], "revolutionize"),
  phrase("unlock the (?:full )?potential", 3, ["make the most", "get the best out"], "unlock the potential"),
  phrase("unlock the power of", 3, ["use", "get the most from", "tap into"]),
  phrase("unlock", 2, ["open up", "free up", "tap into", "reveal"]),
  phrase("unlocking", 2, ["opening up", "freeing up", "tapping into"], "unlock"),
  phrase("unleash", 3, ["release", "set loose", "bring out"]),
  phrase("unleashing", 3, ["releasing", "setting loose", "bringing out"], "unleash"),
  phrase("a beacon of", 3, ["a source of", "a symbol of"]),
  phrase("shed light on", 3, ["explain", "clarify", "show", "reveal"]),
  phrase("sheds light on", 3, ["explains", "clarifies", "shows"], "shed light on"),
  phrase("shedding light on", 3, ["explaining", "clarifying", "showing"], "shed light on"),
  phrase("deep dive", 3, ["close look", "detailed look", "closer look"]),
  phrase("dive deep into", 3, ["look closely at", "dig into", "explore"]),
  phrase("dive into", 2, ["get into", "look at", "start on"]),
  phrase("cannot be overstated", 3, ["is huge", "matters a lot", "is hard to overstate", "really matters"]),
  phrase("can't be overstated", 3, ["is huge", "matters a lot", "really matters"]),
  phrase("as an ai language model", 3, [""]),
  phrase("i hope this helps", 3, [""]),
  phrase("i'd be happy to (?:help|assist)", 3, [""], "I'd be happy to help"),
  phrase("feel free to", 2, ["", "go ahead and", "you can"]),
  phrase("let's explore", 3, ["let's look at", "here's", "consider"]),
  phrase("let's dive in", 3, ["here goes", "let's start", "let's get going"]),
  phrase("in a nutshell", 3, ["in short", "briefly", "put simply", ""]),
  phrase("it goes without saying that", 3, ["obviously,", "clearly,", "of course,", ""]),
  phrase("needless to say", 3, ["obviously", "of course", "clearly", ""]),
  phrase("the fact of the matter is", 3, ["the truth is", "honestly", "in fact", ""]),
  phrase("with that being said", 3, ["that said", "still", "even so", "but"]),
  phrase("that being said", 3, ["that said", "still", "even so"]),
  phrase("last but not least", 3, ["finally", "lastly", "and finally"]),
  phrase("first and foremost", 3, ["first", "above all", "mainly"]),
  phrase("at this point in time", 3, ["now", "right now", "currently", "at this point"]),
  phrase("due to the fact that", 3, ["because", "since", "as"]),
  phrase("in the event that", 3, ["if", "should", "in case"]),
  phrase("plays a (?:crucial|vital|pivotal|key|significant|critical|essential|important|central|major) role in", 3, ["matters for", "is key to", "is central to", "helps with"], "plays a crucial role in"),
  phrase("play a (?:crucial|vital|pivotal|key|significant|critical|essential|important|central|major) role in", 3, ["matter for", "are key to", "help with", "are central to"], "play a crucial role in"),
  phrase("played a (?:crucial|vital|pivotal|key|significant|critical|essential|important|central|major) role in", 3, ["mattered for", "was key to", "helped with"], "played a crucial role in"),
  phrase("of paramount importance", 3, ["vital", "critical", "essential"]),
  phrase("paramount", 3, ["key", "vital", "essential", "central"]),
  phrase("paradigm shift", 3, ["big change", "sea change", "major shift"]),
  phrase("paradigm", 2, ["model", "approach", "framework"]),
  phrase("underscores the (?:importance|need|significance|value) of", 3, ["shows the value of", "points to the need for", "shows why we need"], "underscores the importance of"),
  phrase("highlights the (?:importance|need|significance|value) of", 2, ["shows the value of", "points to the need for", "shows why we need"], "highlights the importance of"),
  phrase("underscores", 3, ["highlights", "shows", "stresses"], "underscore"),
  phrase("underscore", 3, ["highlight", "show", "stress"]),
  phrase("underscoring", 3, ["highlighting", "showing", "stressing"], "underscore"),
  phrase("underscored", 3, ["highlighted", "showed", "stressed"], "underscore"),
  phrase("showcases", 3, ["features", "shows off", "highlights"], "showcase"),
  phrase("showcase", 3, ["feature", "show off", "highlight"]),
  phrase("showcasing", 3, ["featuring", "showing off", "highlighting"], "showcase"),
  phrase("pave the way for", 3, ["open the door to", "set up", "lead to", "make way for"]),
  phrase("paves the way for", 3, ["opens the door to", "sets up", "leads to"], "pave the way for"),
  phrase("paved the way for", 3, ["opened the door to", "set up", "led to"], "pave the way for"),
  phrase("at the forefront of", 3, ["leading", "ahead in", "at the front of"]),
  phrase("a treasure trove of", 3, ["plenty of", "a wealth of", "a rich source of"]),
  phrase("in the grand scheme of things", 3, ["overall", "in the big picture", "all things considered"]),
  phrase("at the end of the day", 2, ["in the end", "ultimately", "when it comes down to it"]),
  phrase("moving forward", 2, ["from now on", "next", "going ahead", ""]),
  phrase("going forward", 2, ["from now on", "next", "in future", ""]),
  phrase("look no further", 3, [""]),
  phrase("it's no secret that", 3, ["", "everyone knows", "clearly"]),
  phrase("in a world where", 3, ["when", "now that", "since"]),
  phrase("elevate your", 3, ["improve your", "boost your", "upgrade your"]),
  phrase("to the next level", 3, ["further", "up a notch", "much better"]),
  phrase("commitment to excellence", 3, ["high standards", "doing good work", "striving to do well"]),
  phrase("the intersection of", 2, ["the overlap of", "the meeting point of"]),
  phrase("hinges on", 3, ["depends on", "rests on", "comes down to"], "hinge on"),
  phrase("hinge on", 3, ["depend on", "rest on"]),
  phrase("beckons", 3, ["awaits", "calls", "invites"]),
  phrase("quintessential", 3, ["classic", "typical", "textbook"]),
  phrase("epitome of", 3, ["perfect example of", "picture of", "model of"]),
  phrase("labyrinth(?:ine)?", 3, ["maze", "tangle", "complex"], "labyrinth"),

  phrase("I(?: am|'m) writing to express my (?:strong |keen |sincere |genuine )?interest in", 3, ["I'd like to apply for", "I'm applying for"], "I am writing to express my interest in"),
  phrase("(?:thrilled|excited|delighted|proud) to announce", 3, ["happy to share", "pleased to share", "glad to share"], "thrilled to announce"),
  phrase("(?:please )?(?:do not|don't) hesitate to", 2, ["just", "please", ""], "don't hesitate to"),
  phrase("I(?: am|'m) confident that", 2, ["I believe", "I'm sure"], "I am confident that"),
  phrase("I would welcome the (?:opportunity|chance) to", 2, ["I'd be glad to", "I'd love to", "I'd welcome the chance to"], "I would welcome the opportunity to"),
  phrase("heartfelt (?:gratitude|thanks)", 2, ["sincere thanks", "thanks"], "heartfelt gratitude"),
  phrase("meaningful impact", 2, ["real impact", "real change"]),
  phrase("an integral part of", 2, ["a big part of", "a core part of", "part of"]),
  phrase("integral to", 2, ["central to", "key to"]),
  phrase("double-edged sword", 2, ["mixed blessing"]),
  phrase("it(?: is|'s) advisable to", 2, ["it's best to", "you should", "try to"], "it is advisable to"),
  phrase("far-reaching", 1, ["wide", "sweeping", "broad"]),
  phrase("fundamentally", 1, ["deeply", "completely", ""]),
  // --- current-era tells: promotional, corporate, support and "warm advice" registers ---
  phrase("nestled", 3, ["set", "tucked", "sitting"]),
  phrase("something for everyone", 3, ["plenty to do", "a lot to offer"]),
  phrase("rich (?:cultural |maritime |culinary |historical )?(?:heritage|history|tradition)", 2, [], "rich heritage"),
  phrase("time-honored", 2, ["traditional", "old"]),
  phrase("whether you're", 2, []),
  phrase("move the needle", 2, ["matter", "make a difference"]),
  phrase("here's the thing", 2, []),
  phrase("let's break it down", 3, [""]),
  phrase("the real (?:question|shift|issue|problem|work|challenge)", 2, [], "the real question"),
  phrase("the bottom line", 2, []),
  phrase("more important than ever", 2, ["more important now", "important"]),
  phrase("completely normal", 2, ["normal"]),
  phrase("give yourself permission to", 2, ["let yourself"]),
  phrase("be patient with yourself", 1, []),
  phrase("small wins", 1, []),
  phrase("meaningful progress", 2, ["real progress"]),
  phrase("areas for improvement", 2, ["things to fix", "weak spots"]),
  phrase("strategic priorities", 2, ["priorities"]),
  phrase("cross-functional alignment", 2, ["coordination"]),
  phrase("customer journey", 1, []),
  phrase("long-term value", 1, []),
  phrase("resilient", 1, []),
  phrase("scalable", 1, []),
  phrase("attracted growing attention", 2, ["drawn more attention"]),
  phrase("a (?:substantial|growing|large|significant) body of (?:evidence|research|literature|work)", 2, ["a lot of research", "plenty of evidence"], "a body of evidence"),
  phrase("taken together", 2, ["together", "overall"]),
  phrase("well-established", 1, []),
  phrase("sets the tone", 1, []),
  phrase("sense of accomplishment", 1, []),
  phrase("the weight of", 1, []),
  phrase("quiet (?:ache|calculation|confidence|dignity|strength|power|revolution)", 2, [], "quiet ..."),
  phrase("i hope this (?:email|message) finds you well", 3, [""], "I hope this email finds you well"),
  phrase("thank you for reaching out", 2, ["thanks for getting in touch", "thanks for your message"]),
  phrase("I sincerely apologize for the inconvenience", 2, ["I'm sorry for the trouble"]),
  phrase("bringing this (?:issue |matter |problem )?to (?:our|my) attention", 2, ["letting us know"], "bringing this to our attention"),
  phrase("value your business", 2, []),
  phrase("gesture of goodwill", 1, []),
  phrase("onward and upward", 2, []),
  phrase("deepen my understanding of", 2, ["learn more about"]),
  phrase("ideal candidate", 2, ["good fit"]),
  phrase("align with your needs", 2, ["fit what you need"]),
  phrase("continued success", 1, []),
  phrase("immersive", 2, ["rich", "full"]),
  phrase("crystal-clear", 2, ["clear", "sharp"]),
  phrase("what matters most", 2, ["what matters", "the things you care about"]),
  phrase("experience the future of", 3, []),
  phrase("the ultimate", 2, ["the best", "a great"]),
  phrase("fruits of your labor", 2, ["results"]),
  phrase("this essay will (?:explore|examine|discuss|argue|analyze|analyse|consider)", 2, [], "this essay will explore"),
  phrase("stands? as a", 2, [], "stands as a"),
  phrase("lingers in the memory", 2, []),
  phrase("invit(?:es|ing) (?:visitors|readers|you|us) to", 2, [], "inviting visitors to"),
  phrase("savor every moment", 3, ["take their time"]),
  // --- weight 2: strong hints ------------------------------------------------
  phrase("a wide range of", 2, ["many", "all kinds of", "various", "a range of"]),
  phrase("a wide variety of", 2, ["many", "all kinds of", "various"]),
  phrase("a wide array of", 2, ["many", "all kinds of"]),
  phrase("a diverse range of", 2, ["many", "different kinds of", "a range of"]),
  phrase("the vast majority of", 2, ["most", "nearly all", "almost all"]),
  phrase("as previously mentioned", 2, ["as I said", "as mentioned", "again,", ""]),
  phrase("serves as", 2, ["is", "acts as", "works as"], "serve as"),
  phrase("serve as", 2, ["are", "act as", "work as"]),
  phrase("stands as", 2, ["is", "remains", "counts as"], "stand as"),
  phrase("in essence", 2, ["basically", "in short", "at heart", ""]),
  phrase("at its core", 2, ["basically", "at heart", "fundamentally", ""]),
  phrase("when it comes to", 2, ["for", "with", "as for", "regarding"]),
  phrase("on the other hand", 2, ["by contrast", "meanwhile", "in contrast"]),
  phrase("in summary", 2, ["in short", "to sum up", ""]),
  phrase("to sum up", 2, ["in short", "overall", ""]),
  phrase("in conclusion", 2, ["in the end", "all in all", ""]),
  phrase("in light of", 2, ["given", "because of", "considering"]),
  phrase("in an effort to", 2, ["to", "trying to", "hoping to"]),
  phrase("in tandem with", 2, ["with", "alongside", "together with"]),
  phrase("conducive to", 2, ["suited to", "good for", "helpful for"]),
  phrase("the importance of", 2, ["the value of", "the role of", "why we need"]),
  phrase("the advent of", 2, ["the arrival of", "the rise of", "the start of"]),
  phrase("catalyst for", 2, ["spark for", "driver of", "trigger for"]),
  phrase("cornerstone", 2, ["foundation", "basis", "core", "backbone"]),
  phrase("in the face of", 2, ["despite", "against", "faced with"]),
  phrase("in the wake of", 2, ["after", "following", "because of"]),
  phrase("in the pursuit of", 2, ["to reach", "chasing", "seeking"]),
  phrase("resonates with", 2, ["appeals to", "rings true for", "connects with"], "resonate with"),
  phrase("resonate with", 2, ["appeal to", "ring true for", "connect with"]),
  phrase("spearhead", 2, ["lead", "drive", "head up"]),
  phrase("fostering", 2, ["building", "encouraging", "supporting", "developing"], "foster"),
  phrase("fosters", 2, ["builds", "encourages", "supports"], "foster"),
  phrase("foster", 2, ["build", "encourage", "support", "develop"]),
  phrase("fostered", 2, ["built", "encouraged", "supported"], "foster"),
  phrase("pivotal", 2, ["key", "decisive", "important", "defining"]),
  phrase("crucial", 2, ["key", "vital", "important", "big"]),
  phrase("robust", 2, ["strong", "solid", "reliable"]),
  phrase("comprehensive", 2, ["complete", "full", "thorough", "broad"]),
  phrase("meticulous", 2, ["careful", "thorough", "precise"]),
  phrase("meticulously", 2, ["carefully", "thoroughly"]),
  phrase("intricate", 2, ["complex", "detailed", "tangled"]),
  phrase("intricacies", 2, ["details", "complexities", "ins and outs"]),
  phrase("profound", 2, ["deep", "major", "serious"]),
  phrase("profoundly", 2, ["deeply", "greatly"]),
  phrase("nuanced", 2, ["subtle", "layered", "complex", "fine-grained"]),
  phrase("multifaceted", 2, ["complex", "many-sided", "varied"]),
  phrase("transformative", 2, ["big", "major", "powerful", "life-changing"]),
  phrase("holistic", 2, ["whole", "broad", "complete", "all-round"]),
  phrase("synergy", 2, ["teamwork", "cooperation", "combined effort"]),
  phrase("synergies", 2, ["overlaps", "combined gains", "shared benefits"], "synergy"),
  phrase("vibrant", 2, ["lively", "bright", "busy", "colorful"]),
  phrase("bustling", 2, ["busy", "lively", "crowded"]),
  phrase("streamline", 2, ["simplify", "speed up", "trim"]),
  phrase("streamlined", 2, ["simplified", "faster", "leaner"], "streamline"),
  phrase("streamlining", 2, ["simplifying", "speeding up"], "streamline"),
  phrase("streamlines", 2, ["simplifies", "speeds up"], "streamline"),
  phrase("leverage", 2, ["use", "draw on", "make use of", "tap into"]),
  phrase("leverages", 2, ["uses", "draws on", "taps into"], "leverage"),
  phrase("leveraging", 2, ["using", "drawing on", "tapping into"], "leverage"),
  phrase("leveraged", 2, ["used", "drew on", "tapped into"], "leverage"),
  phrase("harness", 2, ["use", "tap into", "make the most of"]),
  phrase("harnessing", 2, ["using", "tapping into", "making the most of"], "harness"),
  phrase("harnesses", 2, ["uses", "taps into", "makes the most of"], "harness"),
  phrase("elevate", 2, ["improve", "lift", "boost"]),
  phrase("elevates", 2, ["improves", "lifts", "boosts"], "elevate"),
  phrase("elevating", 2, ["improving", "lifting", "boosting"], "elevate"),
  phrase("seamless", 2, ["smooth", "easy", "simple"]),
  phrase("seamlessly", 2, ["smoothly", "easily", "without friction"]),
  phrase("empower", 2, ["enable", "help", "let", "equip"]),
  phrase("empowers", 2, ["enables", "helps", "lets", "equips"], "empower"),
  phrase("empowering", 2, ["enabling", "helping", "equipping"], "empower"),
  phrase("empowered", 2, ["enabled", "helped", "equipped"], "empower"),
  phrase("utilize", 2, ["use"]),
  phrase("utilizes", 2, ["uses"], "utilize"),
  phrase("utilized", 2, ["used"], "utilize"),
  phrase("utilizing", 2, ["using"], "utilize"),
  phrase("utilization", 2, ["use"]),
  phrase("optimal", 2, ["ideal"]),
  phrase("optimize", 2, ["improve", "fine-tune"]),
  phrase("optimizing", 2, ["improving", "fine-tuning"], "optimize"),
  phrase("optimized", 2, ["improved", "fine-tuned"], "optimize"),
  phrase("innovative", 2, ["fresh", "clever", "original", "creative"]),
  phrase("dynamic", 2, ["energetic", "lively", "flexible"]),
  phrase("state-of-the-art", 2, ["latest", "modern", "advanced", "top"]),
  phrase("groundbreaking", 2, ["new", "major", "bold", "first-of-its-kind"]),
  phrase("unprecedented", 2, ["record", "extraordinary", "unusual"]),
  phrase("remarkable", 2, ["striking", "notable", "impressive"]),
  phrase("invaluable", 2, ["priceless", "very useful", "essential"]),
  phrase("indispensable", 2, ["essential", "vital", "necessary"]),
  phrase("noteworthy", 2, ["notable", "worth mentioning", "interesting"]),
  phrase("captivating", 2, ["gripping", "fascinating", "engaging", "charming"]),
  phrase("enchanting", 2, ["charming", "delightful", "lovely"]),
  phrase("unwavering", 2, ["steady", "firm", "constant", "solid"]),
  phrase("unparalleled", 2, ["unmatched", "unique", "top", "unrivaled"]),
  phrase("top-notch", 2, ["excellent", "first-rate", "great"]),
  phrase("hassle-free", 2, ["easy", "simple", "painless"]),
  phrase("a must-have", 2, ["essential", "worth having", "something you'll want"]),
  phrase("boasts", 2, ["has", "offers", "features"], "boast"),
  phrase("boast", 2, ["have", "offer"]),
  phrase("bolster", 2, ["boost", "support", "strengthen", "shore up"]),
  phrase("bolsters", 2, ["boosts", "supports", "strengthens"], "bolster"),
  phrase("bolstering", 2, ["boosting", "supporting", "strengthening"], "bolster"),
  phrase("embrace", 2, ["accept", "take up", "welcome", "adopt"]),
  phrase("embraces", 2, ["accepts", "takes up", "welcomes", "adopts"], "embrace"),
  phrase("embracing", 2, ["accepting", "taking up", "welcoming", "adopting"], "embrace"),
  phrase("embraced", 2, ["accepted", "took up", "welcomed", "adopted"], "embrace"),
  phrase("encompasses", 2, ["includes", "covers", "takes in"], "encompass"),
  phrase("encompass", 2, ["include", "cover", "take in"]),
  phrase("encompassing", 2, ["including", "covering"], "encompass"),
  phrase("encapsulates", 2, ["sums up", "captures", "contains"]),
  phrase("solidify", 2, ["confirm", "firm up", "strengthen", "lock in"]),
  phrase("ecosystem", 2, ["system", "network", "world", "community"]),
  phrase("juxtaposition", 2, ["contrast", "pairing", "side-by-side comparison"]),
  phrase("amidst", 2, ["amid", "among", "in the middle of", "during"]),
  phrase("utmost", 2, ["greatest", "highest", "top"]),
  phrase("key takeaways", 2, ["main points", "lessons", "things to remember"], "key takeaway"),
  phrase("key takeaway", 2, ["main point", "lesson", "thing to remember"]),
  phrase("implementation", 2, ["rollout", "setup", "use", "execution"]),
  phrase("enhance", 2, ["improve", "boost", "strengthen"]),
  phrase("enhances", 2, ["improves", "boosts", "strengthens"], "enhance"),
  phrase("enhancing", 2, ["improving", "boosting", "strengthening"], "enhance"),
  phrase("enhanced", 2, ["improved", "boosted", "better"], "enhance"),
  phrase("facilitate", 2, ["help", "ease", "make easier", "enable"]),
  phrase("facilitates", 2, ["helps", "eases", "enables"], "facilitate"),
  phrase("facilitating", 2, ["helping", "easing", "enabling"], "facilitate"),
  phrase("facilitated", 2, ["helped", "eased", "enabled"], "facilitate"),
  phrase("commence", 2, ["start", "begin"]),
  phrase("commenced", 2, ["started", "began"], "commence"),
  phrase("commences", 2, ["starts", "begins"], "commence"),
  phrase("endeavor", 2, ["effort", "try", "attempt"]),
  phrase("endeavors", 2, ["efforts", "attempts"], "endeavor"),
  phrase("endeavour", 2, ["effort", "try", "attempt"], "endeavor"),
  phrase("furthermore", 2, ["also", "plus", "and", "what's more"]),
  phrase("moreover", 2, ["also", "plus", "and", "besides"]),
  phrase("additionally", 2, ["also", "plus", "and", "on top of that"]),
  phrase("consequently", 2, ["so", "as a result", "because of this"]),
  phrase("subsequently", 2, ["then", "later", "after that", "next"]),
  phrase("prior to", 2, ["before", "ahead of"]),
  phrase("whilst", 2, ["while"]),
  phrase("amongst", 2, ["among"]),
  phrase("undoubtedly", 2, ["clearly", "no doubt", "surely", ""]),
  phrase("arguably", 2, ["maybe", "perhaps", "some would say", ""]),

  // --- weight 1: mild / formal ----------------------------------------------
  phrase("demonstrate", 1, ["show", "prove"]),
  phrase("demonstrates", 1, ["shows", "proves"], "demonstrate"),
  phrase("demonstrating", 1, ["showing", "proving"], "demonstrate"),
  phrase("demonstrated", 1, ["showed", "proved"], "demonstrate"),
  phrase("numerous", 1, ["many", "plenty of", "a lot of"]),
  phrase("individuals", 1, ["people"]),
  phrase("nevertheless", 1, ["still", "but", "even so", "yet"]),
  phrase("nonetheless", 1, ["still", "but", "even so"]),
  phrase("ultimately", 1, ["", "eventually"]),
  phrase("significantly", 1, ["greatly", "sharply"]),
  phrase("effectively", 1, ["well", "in practice", ""]),
  phrase("efficiently", 1, ["quickly", "well", "without waste"]),
  phrase("essentially", 1, ["basically", "at heart", ""]),
  phrase("certainly", 1, ["surely", "for sure", "clearly", ""]),
  phrase("indeed", 1, ["in fact", "really", ""]),
  phrase("thus", 1, ["so", "this way", "as a result"]),
  phrase("hence", 1, ["so", "that's why", "which is why"]),
  phrase("therefore", 1, ["so", "that's why", "as a result"]),
  phrase("in order to", 1, ["to"]),
  phrase("in terms of", 1, ["for", "regarding", "about"]),
  phrase("with regard to", 1, ["about", "on", "for"]),
  phrase("with respect to", 1, ["about", "on", "for"]),
  phrase("in the context of", 1, ["in", "for", "within"]),
  phrase("a variety of", 1, ["different", "various", "several", "many"]),
  phrase("as a result of", 1, ["because of", "due to", "from"]),
  phrase("as a result", 1, ["so", "because of this", "that's why", ""]),
  phrase("the ability to", 1, ["being able to"]),
  phrase("aims to", 1, ["tries to", "wants to", "is meant to"]),
  phrase("ensure that", 1, ["make sure that", "make sure"]),
  phrase("ensure", 1, ["make sure", "guarantee"]),
  phrase("ensures", 1, ["makes sure", "guarantees"], "ensure"),
  phrase("ensuring", 1, ["making sure", "guaranteeing"], "ensure"),
  phrase("reach out", 1, ["contact", "get in touch", "ask"]),
  phrase("excellence", 1, ["quality", "high standards", "great work"]),
  phrase("the power of", 1, [], "the power of"),
  phrase("kickstart", 1, ["start", "launch", "jump-start"]),
  phrase("vital", 1, ["key", "important", "essential"]),
  phrase("this highlights", 1, ["this shows", "this points to"]),
  phrase("a key aspect of", 1, ["part of", "a big part of"]),
  phrase("associated with", 1, ["tied to", "linked to", "that come with"]),
];

/** All AI tell-phrases, longest pattern first so multi-word phrases win. */
export const AI_PHRASES: AiPhrase[] = [...RAW_PHRASES].sort(
  (a, b) => b.pattern.source.length - a.pattern.source.length,
);

/** "not only X but also Y" — handled structurally, not via AI_PHRASES. */
export const NOT_ONLY_RE = /\bnot only\b([^.!?;:\n]{2,120}?),?\s+but\s+(?:also\s+)?/gi;

/**
 * The subset of NOT_ONLY_RE the humanizer can flatten to "X and Y". The
 * inverted form ("Not only does it..., but it also...") needs the verb
 * re-conjugated, so it is detected but left alone.
 */
export const NOT_ONLY_REWRITE_RE =
  /\bnot only\b(?![^\S\n]+(?:do|does|did|is|are|was|were|has|have|had|can|could|will|would|should|may|might|must)\b)([^.!?;:\n]{2,120}?),?\s+but\s+(?:also\s+)?/gi;

/**
 * Replacement alternatives that read as chatty. Skipped in formal registers
 * (essays, reports, legal, business, cover letters, doctorate readability).
 * Compared lower-cased with trailing punctuation removed.
 */
export const CASUAL_ALTERNATIVES: ReadonlySet<string> = new Set([
  "plus", "what's more", "on top of that", "folks", "lots of", "a lot of", "basically", "big deal",
  "big time", "here goes", "first off", "say", "like", "oddly enough", "sure", "by the way", "honestly",
  "kind of", "sort of", "pretty much", "up a notch", "no doubt", "at the end of the day", "all sorts of",
  "all kinds of", "a bit", "get into", "dig into", "digs into", "digging into", "dug into", "let's get into",
  "let's get going", "one thing to note:", "the truth is", "in the big picture", "when it comes down to it",
  "then again", "on the flip side", "no way", "put simply", "just", "the thing is",
]);

// ---------------------------------------------------------------------------
// Sentence-initial transitions
// ---------------------------------------------------------------------------

function opener(word: string, tier: PhraseWeight, alternatives: string[]): TransitionOpener {
  return {
    word,
    pattern: new RegExp(`^${toSource(word)}\\b[,:]?[^\\S\\n]*`, "i"),
    alternatives,
    tier,
  };
}

/** Sentence openers that read as machine glue, with plainer alternatives. */
export const TRANSITION_OPENERS: TransitionOpener[] = [
  opener("Furthermore", 3, ["Also,", "And", "Plus,", "What's more,", ""]),
  opener("Moreover", 3, ["Also,", "And", "Plus,", "What's more,", ""]),
  opener("Additionally", 3, ["Also,", "And", "Plus,", "On top of that,", ""]),
  opener("In addition", 2, ["Also,", "And", "Plus,", ""]),
  opener("However", 1, ["But", "Still,", "That said,", "Even so,"]),
  opener("Nevertheless", 2, ["Still,", "But", "Even so,", "That said,"]),
  opener("Nonetheless", 2, ["Still,", "But", "Even so,", "That said,"]),
  opener("Conversely", 2, ["But", "On the flip side,", "By contrast,"]),
  opener("Consequently", 3, ["So", "As a result,", "Because of that,"]),
  opener("Therefore", 2, ["So", "That's why", "As a result,"]),
  opener("Thus", 2, ["So", "This way,", "As a result,"]),
  opener("Hence", 2, ["So", "That's why", ""]),
  opener("As a result", 1, ["So", "Because of that,", ""]),
  opener("As such", 2, ["So", "Because of this,", ""]),
  opener("Accordingly", 2, ["So", "As a result,", ""]),
  opener("Subsequently", 3, ["Then", "After that,", "Later,", "Next,"]),
  opener("In conclusion", 3, ["All in all,", "In the end,", "", "Overall,"]),
  opener("In summary", 3, ["In short,", "All in all,", "", "To recap,"]),
  opener("To summarize", 3, ["In short,", "All in all,", "", "To recap,"]),
  opener("To sum up", 2, ["So", "In short,", ""]),
  opener("Ultimately", 2, ["In the end,", "", "In the long run,", "Long term,"]),
  opener("Overall", 1, ["All in all,", "On the whole,", ""]),
  opener("Firstly", 2, ["First,", "First off,", "To start,"]),
  opener("Secondly", 2, ["Second,", "Next,", "Then,"]),
  opener("Thirdly", 2, ["Third,", "Next,", "Then,"]),
  opener("Finally", 1, ["Lastly,", "And finally,", ""]),
  opener("Lastly", 1, ["Finally,", "And last,", ""]),
  opener("Importantly", 2, ["", "Also,", "And"]),
  opener("Notably", 2, ["", "Also,", "In particular,"]),
  opener("Interestingly", 2, ["", "Oddly enough,", "Also,"]),
  opener("Similarly", 2, ["Also,", "In the same way,", "Likewise,"]),
  opener("Likewise", 1, ["Also,", "In the same way,", ""]),
  opener("Specifically", 1, ["For example,", "In particular,", ""]),
  opener("In particular", 1, ["Especially", "", "Above all,"]),
  opener("For instance", 1, ["For example,", "Say,", "Like,"]),
  opener("In other words", 1, ["Put simply,", "That is,", "Basically,"]),
  opener("On the other hand", 2, ["But", "Then again,", "By contrast,"]),
  opener("In essence", 2, ["Basically,", "", "At heart,"]),
  opener("Essentially", 2, ["Basically,", "", "In short,"]),
  opener("Undoubtedly", 2, ["Clearly,", "No doubt", "", "Surely"]),
  opener("Certainly", 2, ["Sure,", "Of course,", "", "Clearly,"]),
  opener("Indeed", 2, ["In fact,", "", "Really,"]),
  opener("Meanwhile", 1, ["At the same time,", "", "In the meantime,"]),
];

const OPENER_QUICK_RE = new RegExp(
  `^(?:${TRANSITION_OPENERS.map((o) => toSource(o.word)).join("|")})\\b`,
  "i",
);

/** Strips opening quotes/brackets and returns the transition opener a sentence starts with, if any. */
export function findOpener(sentence: string): TransitionOpener | undefined {
  const s = sentence.replace(/^["“'‘(\[]+/, "");
  if (!OPENER_QUICK_RE.test(s)) return undefined;
  return TRANSITION_OPENERS.find((o) => o.pattern.test(s));
}

// ---------------------------------------------------------------------------
// Contractions
// ---------------------------------------------------------------------------

const NEXT_WORD = "(?=[^\\S\\n]+[\\p{L}\\p{N}])";
const PARTICIPLE =
  "(?=[^\\S\\n]+(?:\\w+ed|\\w+en|been|seen|done|gone|had|made|got|gotten|taken|given|known|come|become|found|thought|said|written|read|heard|met|felt|left|lost|kept|held|brought|bought|sent|spent|built|told|put|set|let|run|begun|shown|grown|drawn|thrown|flown|won|worn|chosen|spoken|broken|eaten|fallen|ridden|risen|hidden|driven|never|already|always|also|just|not|only|ever|recently|finally|since|no|yet|actually|really|long|often|barely|hardly|rarely)\\b)";

function contraction(source: string, replacement: string, guard = ""): ContractionRule {
  return [new RegExp(`\\b${source}\\b${guard}`, "giu"), replacement] as const;
}

/**
 * Ordered contraction rules. The replacement copies the case of the match's
 * first letter ("It is" -> "It's"). Guards avoid ugly cases like "what it's."
 */
export const CONTRACTIONS: ContractionRule[] = [
  contraction("cannot", "can't"),
  contraction("can not", "can't"),
  contraction("will not", "won't"),
  contraction("shall not", "shan't"),
  contraction("do not", "don't"),
  contraction("does not", "doesn't"),
  contraction("did not", "didn't"),
  contraction("is not", "isn't"),
  contraction("are not", "aren't"),
  contraction("was not", "wasn't"),
  contraction("were not", "weren't"),
  contraction("would not", "wouldn't"),
  contraction("should not", "shouldn't"),
  contraction("could not", "couldn't"),
  contraction("has not", "hasn't"),
  contraction("have not", "haven't"),
  contraction("had not", "hadn't"),
  contraction("must not", "mustn't"),
  contraction("(?<!\\b(?:what|where|how|who|as|that|which|way)[^\\S\\n]+)it is", "it's", NEXT_WORD),
  contraction("(?<!\\b(?:what|where|how|who|as|which)[^\\S\\n]+)that is", "that's", NEXT_WORD),
  contraction("there is", "there's", NEXT_WORD),
  contraction("here is", "here's", NEXT_WORD),
  contraction("(?<!\\b(?:what|where|how|who|as|which)[^\\S\\n]+)he is", "he's", NEXT_WORD),
  contraction("(?<!\\b(?:what|where|how|who|as|which)[^\\S\\n]+)she is", "she's", NEXT_WORD),
  contraction("who is", "who's", NEXT_WORD),
  contraction("what is", "what's", NEXT_WORD),
  contraction("where is", "where's", NEXT_WORD),
  contraction("how is", "how's", NEXT_WORD),
  contraction("I am", "I'm", NEXT_WORD),
  contraction("(?<!\\b(?:what|where|how|who|as|which)[^\\S\\n]+)we are", "we're", NEXT_WORD),
  contraction("(?<!\\b(?:what|where|how|who|as|which)[^\\S\\n]+)they are", "they're", NEXT_WORD),
  contraction("(?<!\\b(?:what|where|how|who|as|which)[^\\S\\n]+)you are", "you're", NEXT_WORD),
  contraction("I have", "I've", PARTICIPLE),
  contraction("we have", "we've", PARTICIPLE),
  contraction("you have", "you've", PARTICIPLE),
  contraction("they have", "they've", PARTICIPLE),
  contraction("let us(?![^\\S\\n]+know)", "let's", NEXT_WORD),
  contraction("I will", "I'll", NEXT_WORD),
  contraction("we will", "we'll", NEXT_WORD),
  contraction("you will", "you'll", NEXT_WORD),
  contraction("they will", "they'll", NEXT_WORD),
  contraction("it will", "it'll", NEXT_WORD),
  contraction("I would", "I'd", NEXT_WORD),
  contraction("we would", "we'd", NEXT_WORD),
  contraction("you would", "you'd", NEXT_WORD),
  contraction("they would", "they'd", NEXT_WORD),
];

/** Matches existing contractions (n't, pronoun+'s, 're, 've, 'll, 'd, 'm). */
export const CONTRACTION_DETECT =
  /\b(?:\w+n['’]t|(?:it|he|she|that|there|what|who|here|where|how|let|everything|something|nothing|everyone|someone)['’]s|\w+['’](?:re|ve|ll|m)|(?:i|you|he|she|we|they|it|that|there|who)['’]d|y['’]all)\b/gi;

// ---------------------------------------------------------------------------
// Intensifiers, hedges, casual markers, first person
// ---------------------------------------------------------------------------

export const INTENSIFIERS: string[] = [
  "very", "really", "truly", "extremely", "incredibly", "highly", "remarkably",
  "exceptionally", "absolutely", "utterly", "immensely", "exceedingly",
];

/** Matches an intensifier and the whitespace after it (so it can be dropped). */
export const INTENSIFIER_RE = new RegExp(`\\b(?:${INTENSIFIERS.join("|")})[^\\S\\n]+(?=[\\p{L}])`, "giu");

export const HEDGES: string[] = [
  "perhaps", "arguably", "somewhat", "relatively", "generally", "typically",
  "potentially", "possibly", "likely", "largely", "to some extent", "in some cases",
  "it seems", "tend to", "tends to", "may", "might",
];

export const HEDGE_RE = new RegExp(`\\b(?:${HEDGES.map(toSource).join("|")})\\b`, "gi");

/** Informal words and phrases that read as unmistakably human. */
export const CASUAL_MARKERS: string[] = [
  "gonna", "wanna", "gotta", "kinda", "sorta", "lol", "lmao", "omg", "yeah", "yep",
  "nope", "nah", "honestly", "tbh", "stuff", "pretty much", "i guess", "you know",
  "kind of", "sort of", "a bit", "anyway", "anyways", "btw", "okay", "haha", "meh",
  "ugh", "dunno", "whatever", "i mean", "guess what", "no way", "totally", "crazy",
  "weird", "awesome", "cool", "damn", "dude", "folks", "y'all", "for real",
  "the thing is", "thing is", "sucks", "sucked", "freaking", "screwed", "big time",
  "if you're keeping score", "called it a day", "a win", "not gonna lie",
];

export const CASUAL_MARKER_RE = new RegExp(`\\b(?:${CASUAL_MARKERS.map(toSource).join("|")})\\b`, "gi");

/** First-person pronouns (including contractions and lowercase "i"). */
export const FIRST_PERSON_RE =
  /\b(?:i|me|my|mine|myself|we|us|our|ours|ourselves|i['’]m|i['’]ve|i['’]ll|i['’]d|we['’]re|we['’]ve|we['’]ll|we['’]d)\b/gi;

// ---------------------------------------------------------------------------
// Formal -> plain simplifications
// ---------------------------------------------------------------------------

function simplify(from: string, to: string): SimplifyRule {
  const fromList = from.split("|");
  const toList = to.split("|");
  return {
    pattern: new RegExp(`\\b(?:${fromList.map(toSource).join("|")})\\b`, "gi"),
    from: fromList.map((f) => f.toLowerCase()),
    to: toList,
  };
}

const RAW_SIMPLIFY: SimplifyRule[] = [
  // multi-word first
  simplify("in spite of the fact that", "although"),
  simplify("due to the fact that", "because"),
  simplify("in the majority of cases", "usually"),
  simplify("take into consideration", "consider"),
  simplify("give consideration to", "consider"),
  simplify("in close proximity to", "near"),
  simplify("at this point in time", "now"),
  simplify("a significant number of", "many"),
  simplify("with the exception of", "except for"),
  simplify("is in a position to|are in a position to", "can|can"),
  simplify("has the ability to|have the ability to|had the ability to", "can|can|could"),
  simplify("is able to|are able to|was able to|were able to", "can|can|could|could"),
  simplify("the vast majority of|the majority of|majority of", "most|most|most"),
  simplify("in the event that", "if"),
  simplify("in the near future", "soon"),
  simplify("at the present time", "now"),
  simplify("in the absence of", "without"),
  simplify("for the purpose of", "to"),
  simplify("with the intention of", "to"),
  simplify("on the grounds that", "because"),
  simplify("it is necessary to", "you need to"),
  simplify("it is probable that", "probably"),
  simplify("it is possible that", "maybe"),
  simplify("a large number of", "many"),
  simplify("in accordance with", "under"),
  simplify("in conjunction with", "with"),
  simplify("with regard to|with respect to|in relation to|in regard to", "about|about|about|about"),
  simplify("make a decision|made a decision|making a decision", "decide|decided|deciding"),
  simplify("reach a conclusion|reached a conclusion", "conclude|concluded"),
  simplify("on a daily basis|on a regular basis|on a weekly basis", "every day|regularly|every week"),
  simplify("in the vicinity of", "near"),
  simplify("in the case of", "for"),
  simplify("at a later date", "later"),
  simplify("subsequent to", "after"),
  simplify("in excess of", "more than"),
  simplify("in lieu of", "instead of"),
  simplify("a number of", "several"),
  simplify("in order to", "to"),
  simplify("whether or not", "whether"),
  simplify("at all times", "always"),
  simplify("as of yet", "yet"),
  simplify("prior to", "before"),
  simplify("adjacent to", "next to"),
  simplify("pursuant to", "under"),
  // single words with inflections
  simplify("utilize|utilizes|utilized|utilizing|utilization", "use|uses|used|using|use"),
  simplify("assist|assists|assisted|assisting|assistance", "help|helps|helped|helping|help"),
  simplify("purchased|purchasing", "bought|buying"),
  simplify("obtain|obtains|obtained|obtaining", "get|gets|got|getting"),
  simplify("require|requires|required|requiring", "need|needs|needed|needing"),
  simplify("requirement|requirements", "need|needs"),
  simplify("commence|commences|commenced|commencing", "start|starts|started|starting"),
  simplify("terminate|terminates|terminated|terminating", "end|ends|ended|ending"),
  simplify("demonstrate|demonstrates|demonstrated|demonstrating", "show|shows|showed|showing"),
  simplify("indicate|indicates|indicated|indicating", "show|shows|showed|showing"),
  simplify("endeavor|endeavors|endeavored|endeavoring|endeavour|endeavours", "try|tries|tried|trying|try|tries"),
  simplify("attempt|attempts|attempted|attempting", "try|tries|tried|trying"),
  simplify("ascertain|ascertains|ascertained", "find out|finds out|found out"),
  simplify("modify|modifies|modified|modifying", "change|changes|changed|changing"),
  simplify("allocate|allocates|allocated|allocating", "give|gives|gave|giving"),
  simplify("accomplish|accomplishes|accomplishing", "do|does|doing"),
  simplify("anticipate|anticipates|anticipated", "expect|expects|expected"),
  simplify("cease|ceases|ceased", "stop|stops|stopped"),
  simplify("comprise|comprises|comprised", "include|includes|included"),
  simplify("conceal|conceals|concealed", "hide|hides|hid"),
  simplify("constitute|constitutes", "make up|makes up"),
  simplify("depart|departs|departed", "leave|leaves|left"),
  simplify("desire|desires", "want|wants"),
  simplify("determine|determines", "work out|works out"),
  simplify("eliminate|eliminates|eliminated|eliminating", "remove|removes|removed|removing"),
  simplify("expedite|expedites|expedited", "speed up|speeds up|sped up"),
  simplify("facilitate|facilitates|facilitated|facilitating", "help|helps|helped|helping"),
  simplify("finalize|finalizes|finalized", "finish|finishes|finished"),
  simplify("implement|implements|implemented|implementing", "carry out|carries out|carried out|carrying out"),
  simplify("incorporate|incorporates|incorporated|incorporating", "include|includes|included|including"),
  simplify("initiate|initiates|initiated|initiating", "start|starts|started|starting"),
  simplify("maintain|maintains|maintained|maintaining", "keep|keeps|kept|keeping"),
  simplify("minimize|minimizes|minimized|minimizing", "reduce|reduces|reduced|reducing"),
  simplify("maximize|maximizes|maximized|maximizing", "boost|boosts|boosted|boosting"),
  simplify("participate|participates|participated|participating", "take part|takes part|took part|taking part"),
  simplify("possess|possesses|possessed", "have|has|had"),
  simplify("provide|provides", "offer|offers"),
  simplify("reside|resides|resided", "live|lives|lived"),
  simplify("retain|retains|retained|retaining", "keep|keeps|kept|keeping"),
  simplify("transmit|transmits|transmitted", "send|sends|sent"),
  simplify("transpire|transpires|transpired", "happen|happens|happened"),
  simplify("undertake|undertakes|undertook|undertaking", "take on|takes on|took on|taking on"),
  simplify("validate|validates|validated", "confirm|confirms|confirmed"),
  simplify("verify|verifies|verified", "check|checks|checked"),
  simplify("encounter|encounters|encountered", "run into|runs into|ran into"),
  simplify("exemplify|exemplifies|exemplified", "show|shows|showed"),
  simplify("ameliorate|ameliorates|ameliorated", "improve|improves|improved"),
  simplify("prioritize|prioritizes|prioritized", "focus on|focuses on|focused on"),
  simplify("procure|procures|procured", "get|gets|got"),
  simplify("solicit|solicits|solicited", "ask for|asks for|asked for"),
  simplify("notify|notifies|notified", "tell|tells|told"),
  simplify("inform|informs", "tell|tells"),
  simplify("locate|locates", "find|finds"),
  simplify("perceive|perceives|perceived", "see|sees|saw"),
  simplify("strategize|strategizes", "plan|plans"),
  simplify("disseminate|disseminates|disseminated", "spread|spreads|spread"),
  simplify("elucidate|elucidates|elucidated", "explain|explains|explained"),
  simplify("enumerate|enumerates|enumerated", "list|lists|listed"),
  simplify("furnish|furnishes|furnished", "provide|provides|provided"),
  simplify("preclude|precludes|precluded", "prevent|prevents|prevented"),
  simplify("compensate|compensates|compensated", "pay|pays|paid"),
  simplify("alleviate|alleviates|alleviated", "ease|eases|eased"),
  simplify("expend|expends|expended", "spend|spends|spent"),
  // single words
  simplify("accompany|accompanies|accompanied", "come with|comes with|came with"),
  simplify("achieve|achieves|achieved|achieving", "reach|reaches|reached|reaching"),
  simplify("constraints|constraint", "limits|limit"),
  simplify("advancements|advancement", "advances|progress"),
  simplify("geographical", "geographic"),
  simplify("sufficient", "enough"),
  simplify("insufficient", "not enough"),
  simplify("approximately", "about"),
  simplify("individuals", "people"),
  simplify("numerous", "many"),
  simplify("additional", "more"),
  simplify("additionally", "also"),
  simplify("subsequent", "later"),
  simplify("subsequently", "later"),
  simplify("initial", "first"),
  simplify("initially", "at first"),
  simplify("frequently", "often"),
  simplify("commonly", "often"),
  simplify("regarding", "about"),
  simplify("concerning", "about"),
  simplify("component|components", "part|parts"),
  simplify("consequently", "so"),
  simplify("therefore", "so"),
  simplify("thereby", "in turn"),
  simplify("nevertheless|nonetheless", "still|still"),
  simplify("currently", "now"),
  simplify("adequate", "enough"),
  simplify("advantageous", "helpful"),
  simplify("beneficial", "helpful"),
  simplify("apparent", "clear"),
  simplify("cognizant", "aware"),
  simplify("commensurate", "matching"),
  simplify("equitable", "fair"),
  simplify("equivalent", "equal"),
  simplify("fundamental", "basic"),
  simplify("henceforth", "from now on"),
  simplify("hitherto", "until now"),
  simplify("identical", "the same"),
  simplify("inception", "start"),
  simplify("methodology", "method"),
  simplify("objectives", "goals"),
  simplify("optimum|optimal", "best|best"),
  simplify("portion", "part"),
  simplify("predominantly", "mostly"),
  simplify("previously", "before"),
  simplify("previous", "earlier"),
  simplify("prior", "earlier"),
  simplify("proficiency", "skill"),
  simplify("remainder", "rest"),
  simplify("remuneration", "pay"),
  simplify("residence", "home"),
  simplify("selection", "choice"),
  simplify("substantially", "a lot"),
  simplify("considerably", "a lot"),
  simplify("sizeable|sizable", "big|big"),
  simplify("ultimately", "in the end"),
  simplify("viable", "workable"),
  simplify("whilst", "while"),
  simplify("amongst", "among"),
  simplify("wherein", "where"),
  simplify("whereby", "by which"),
  simplify("notwithstanding", "despite"),
  simplify("accordingly", "so"),
  simplify("functionality", "features"),
  simplify("leverage", "use"),
  simplify("state-of-the-art", "latest"),
];

/** Formal -> plain word substitutions, multi-word rules first. */
export const SIMPLIFY: SimplifyRule[] = [...RAW_SIMPLIFY].sort(
  (a, b) => b.from[0].length - a.from[0].length,
);

/** Everything above, grouped for consumers that want a single import. */
export const LEXICON = {
  aiPhrases: AI_PHRASES,
  notOnly: NOT_ONLY_RE,
  notOnlyRewrite: NOT_ONLY_REWRITE_RE,
  casualAlternatives: CASUAL_ALTERNATIVES,
  transitionOpeners: TRANSITION_OPENERS,
  contractions: CONTRACTIONS,
  contractionDetect: CONTRACTION_DETECT,
  intensifiers: INTENSIFIERS,
  intensifierRe: INTENSIFIER_RE,
  hedges: HEDGES,
  hedgeRe: HEDGE_RE,
  simplify: SIMPLIFY,
  casualMarkers: CASUAL_MARKERS,
  casualMarkerRe: CASUAL_MARKER_RE,
  firstPersonRe: FIRST_PERSON_RE,
} as const;
