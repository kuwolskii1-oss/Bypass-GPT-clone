import type { Verdict } from "./types";

export interface Sample {
  id: string;
  label: string;
  description: string;
  text: string;
  expected: Verdict;
}

export const SAMPLE_AI = `In today's fast-paced world, remote work has emerged as a transformative force that is reshaping the modern professional landscape. It is important to note that organizations across a wide range of industries are embracing this paradigm shift in order to enhance productivity and foster a more dynamic workforce. Furthermore, the ability to work from any location serves as a testament to the remarkable advancements in digital communication technologies.

Moreover, remote work offers numerous benefits for both employers and employees alike. Employees can leverage flexible schedules to achieve an optimal work-life balance, which ultimately leads to increased job satisfaction and reduced burnout. Additionally, employers can utilize a global talent pool, thereby facilitating access to highly skilled individuals regardless of geographical constraints. Consequently, companies are able to streamline operations and significantly reduce overhead costs associated with maintaining physical office spaces.

However, it is crucial to acknowledge the challenges that accompany this shift. Remote work can lead to feelings of isolation, blurred boundaries between personal and professional life, and difficulties in maintaining effective collaboration. Therefore, organizations must implement robust strategies to navigate these complexities and ensure that employees remain engaged, connected, and supported throughout their remote work journey.

In conclusion, remote work represents a pivotal evolution in the realm of professional employment. By embracing innovative solutions and fostering a culture of trust and accountability, organizations can unlock the full potential of their workforce. Ultimately, the future of work is not only flexible but also more inclusive, resilient, and human-centered than ever before.`;

export const SAMPLE_HUMAN = `So I finally gave in and tried working from the kitchen table for a month. Honestly? Mixed results. The first week was great. I didn't have to commute (that's 40 minutes each way on the 7:15 train, if you're counting), and I got more done before lunch than I usually manage all day.

Then week two hit. My cat decided my keyboard was a bed. My neighbour started renovating. And I realised I hadn't spoken to an actual human, out loud, since Tuesday. Not ideal.

Here's what I've landed on: two days at home, three in the office. It's not a grand philosophy, it's just what stopped me feeling weird. The office days are for meetings and the messy stuff you can't do over Slack. Home days are for writing, which I'm bad at when someone's chewing loudly nearby.

Would I recommend it? Depends on your flat, your job, and whether you've got a door that closes. I've got the door. I don't have the discipline. We're working on it.`;

export const SAMPLE_MIXED = `I've been running a small design studio for six years, and the question I get asked most is whether we'll ever go fully remote. Short answer: no. Longer answer below.

Remote work offers numerous advantages that organizations should carefully consider. It enables employees to achieve a better work-life balance while allowing companies to access a diverse and global talent pool. Furthermore, it significantly reduces overhead costs associated with physical office spaces. Additionally, studies indicate that remote employees often demonstrate higher levels of productivity due to fewer workplace distractions. However, it is essential to implement robust communication strategies to ensure seamless collaboration across distributed teams.

That's the tidy version, anyway. In practice, our best ideas still come from someone drawing a terrible sketch on the whiteboard at 4pm and three people arguing about it. We tried to replicate that on a video call. It didn't take. So we keep a small studio, we let people work from wherever on Mondays and Fridays, and we've stopped pretending there's a perfect answer.`;

export const SAMPLES: Sample[] = [
  {
    id: "ai-essay",
    label: "ChatGPT-style essay",
    description: "A polished, formulaic essay about remote work",
    text: SAMPLE_AI,
    expected: "ai",
  },
  {
    id: "human-blog",
    label: "Human blog post",
    description: "A casual first-person post with uneven rhythm",
    text: SAMPLE_HUMAN,
    expected: "human",
  },
  {
    id: "mixed",
    label: "Mixed draft",
    description: "A human intro and outro around an AI-written middle",
    text: SAMPLE_MIXED,
    expected: "mixed",
  },
];
