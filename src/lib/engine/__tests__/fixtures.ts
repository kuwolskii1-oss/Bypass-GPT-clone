/**
 * Realistic ChatGPT-style outputs across genres. Used to guard the humanizer
 * against awkward rewrites and to check that formulaic text still drops in score.
 */

export interface Fixture {
  id: string;
  label: string;
  text: string;
}

export const CHATGPT_FIXTURES: Fixture[] = [
  {
    id: "essay-social",
    label: "Five-paragraph essay (social media)",
    text: `Social media has become an integral part of modern life, shaping the way individuals communicate, share information, and perceive the world around them. While it offers numerous benefits, it also presents significant challenges that cannot be ignored. This essay will explore both the positive and negative impacts of social media on society.

One of the most notable advantages of social media is its ability to connect people across vast distances. Platforms such as Facebook, Instagram, and Twitter enable users to maintain relationships with friends and family regardless of geographical location. Additionally, social media serves as a powerful tool for raising awareness about important social issues, allowing movements to gain momentum and reach a global audience.

However, the drawbacks of social media are equally significant. Excessive use has been linked to increased levels of anxiety, depression, and feelings of inadequacy, particularly among young people. Furthermore, the spread of misinformation on these platforms poses a serious threat to informed public discourse. It is essential for users to develop critical thinking skills in order to navigate this complex digital landscape.

In conclusion, social media is a double-edged sword that offers both remarkable opportunities and considerable risks. By fostering digital literacy and promoting responsible usage, society can harness the benefits of social media while mitigating its potential harms. Ultimately, the impact of social media depends on how individuals choose to engage with it.`,
  },
  {
    id: "blog-headers",
    label: "Blog post with headers and bullets",
    text: `# 5 Reasons Why Morning Routines Boost Productivity

In today's fast-paced world, finding ways to maximize productivity is more important than ever. One of the most effective strategies is establishing a consistent morning routine. Here's why:

## 1. It Sets the Tone for the Day

Starting your day with intention allows you to approach tasks with clarity and focus. Rather than reacting to whatever comes your way, you take control of your schedule from the outset.

## 2. It Reduces Decision Fatigue

By automating your morning decisions, you conserve mental energy for more important choices later in the day. This is why many successful leaders wear similar outfits or eat the same breakfast every day.

## 3. It Builds Momentum

Small wins early in the morning create a sense of accomplishment that carries through the rest of your day. Whether it's making your bed or completing a short workout, these achievements build confidence.

Key benefits include:
- Improved mental clarity
- Enhanced emotional well-being
- Greater consistency in achieving long-term goals

## Final Thoughts

Ultimately, the best morning routine is one that works for you. Start small, be consistent, and don't be afraid to adjust as needed. Remember, the goal is progress, not perfection.`,
  },
  {
    id: "cover-letter",
    label: "Cover letter",
    text: `Dear Hiring Manager,

I am writing to express my strong interest in the Marketing Coordinator position at Brightline Media. With a Bachelor's degree in Communications and over three years of experience in digital marketing, I am confident that my skills and passion make me an ideal candidate for this role.

In my current position at Northgate Solutions, I have successfully managed social media campaigns that increased engagement by 45% over six months. Additionally, I have developed strong analytical skills through my work with Google Analytics and HubSpot, allowing me to make data-driven decisions that optimize campaign performance. I am particularly drawn to Brightline Media because of its commitment to innovative storytelling and its reputation for fostering a collaborative work environment.

I am eager to bring my creativity, attention to detail, and dedication to your team. I would welcome the opportunity to discuss how my background and skills align with your needs. Thank you for considering my application. I look forward to the possibility of contributing to Brightline Media's continued success.

Sincerely,
Jordan Lee`,
  },
  {
    id: "product-copy",
    label: "Product description",
    text: `Introducing the AeroLite Pro, the ultimate wireless earbuds designed for the modern lifestyle. Engineered with cutting-edge noise cancellation technology, these earbuds deliver an immersive audio experience that lets you focus on what matters most.

Whether you're commuting, working out, or simply relaxing at home, the AeroLite Pro adapts seamlessly to your environment. With up to 30 hours of battery life and a sleek, ergonomic design, you can enjoy uninterrupted listening all day long. The intuitive touch controls make it effortless to manage calls, adjust volume, and switch between tracks.

Elevate your listening experience with crystal-clear sound quality and deep, rich bass. The AeroLite Pro is not only a pair of earbuds but also a statement of style and sophistication. Experience the future of audio today and discover why thousands of customers have made the switch.`,
  },
  {
    id: "tech-explainer",
    label: "Technical explainer",
    text: `Machine learning is a subset of artificial intelligence that enables computers to learn from data without being explicitly programmed. At its core, machine learning involves training algorithms on large datasets so that they can identify patterns and make predictions or decisions.

There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning. In supervised learning, the algorithm is trained on labeled data, meaning that each input is paired with the correct output. This approach is commonly used for tasks such as image classification and spam detection. Unsupervised learning, on the other hand, deals with unlabeled data and aims to discover hidden structures within it. Clustering and dimensionality reduction are typical examples. Reinforcement learning involves an agent that learns to make decisions by interacting with an environment and receiving feedback in the form of rewards or penalties.

It is important to note that the quality of a machine learning model depends heavily on the quality and quantity of the training data. Poor data can lead to biased or inaccurate results. Therefore, data preprocessing and feature engineering play a crucial role in the development of effective models. As the field continues to evolve, machine learning is expected to have a profound impact on industries ranging from healthcare to finance.`,
  },
  {
    id: "linkedin",
    label: "LinkedIn post",
    text: `I'm thrilled to announce that I've officially completed my certification in Project Management! 🎉

This journey has been both challenging and incredibly rewarding. Over the past six months, I've had the opportunity to deepen my understanding of agile methodologies, stakeholder management, and risk mitigation strategies.

Here are three key takeaways from this experience:

1. Communication is everything. Clear, consistent communication is the foundation of every successful project.
2. Adaptability matters more than perfection. Plans change, and the ability to pivot is essential.
3. Never stop learning. The best project managers are those who continuously seek to grow.

I want to extend my heartfelt gratitude to my mentors, colleagues, and family for their unwavering support throughout this journey. I'm excited to leverage these new skills to drive meaningful impact in my role.

Onward and upward! 🚀`,
  },
  {
    id: "email-reply",
    label: "Customer email reply",
    text: `Hi Sarah,

Thank you for reaching out and for bringing this issue to our attention. I sincerely apologize for the inconvenience you have experienced with your recent order.

I have reviewed your account and can confirm that the replacement item has been shipped and should arrive within three to five business days. Additionally, I have applied a 15% discount to your next purchase as a gesture of goodwill.

If you have any further questions or concerns, please do not hesitate to contact me directly. We truly value your business and appreciate your patience while we resolve this matter.

Best regards,
Michael Chen
Customer Support Specialist`,
  },
  {
    id: "history-essay",
    label: "School essay (Industrial Revolution)",
    text: `The Industrial Revolution, which began in Britain in the late eighteenth century, was a period of profound transformation that fundamentally altered the course of human history. It marked the transition from agrarian economies based on manual labor to industrial economies driven by machinery and mass production.

Several factors contributed to the emergence of the Industrial Revolution in Britain. First, the country possessed abundant natural resources, particularly coal and iron, which were essential for powering machines and constructing infrastructure. Second, the Agricultural Revolution had increased food production, leading to population growth and a surplus of labor. Third, Britain's political stability and strong legal protections for property rights created an environment conducive to investment and innovation.

The consequences of the Industrial Revolution were far-reaching. On one hand, it led to unprecedented economic growth, technological advancement, and improved standards of living for many. On the other hand, it also resulted in harsh working conditions, child labor, and significant environmental degradation. Cities grew rapidly, often without adequate planning, resulting in overcrowded and unsanitary living conditions for the working class.

In conclusion, the Industrial Revolution was a pivotal moment in history that laid the foundation for the modern world. While its benefits were substantial, it is important to recognize the human and environmental costs that accompanied this transformation.`,
  },
  {
    id: "howto",
    label: "How-to listicle",
    text: `How to Start a Vegetable Garden: A Beginner's Guide

Starting a vegetable garden can be a rewarding and fulfilling experience. Not only does it provide fresh, healthy produce, but it also offers a great way to connect with nature. Follow these simple steps to get started.

Step 1: Choose the Right Location
Select a spot that receives at least six hours of sunlight per day. Ensure that the area has good drainage and is easily accessible for watering and maintenance.

Step 2: Prepare the Soil
Healthy soil is the foundation of a successful garden. Remove any weeds and debris, then loosen the soil with a garden fork. Incorporate compost or well-rotted manure to enrich the soil with essential nutrients.

Step 3: Select Your Vegetables
As a beginner, it is advisable to start with easy-to-grow vegetables such as tomatoes, lettuce, radishes, and zucchini. Consider your local climate and growing season when making your selection.

Step 4: Plant and Water
Follow the spacing guidelines on seed packets to avoid overcrowding. Water your plants consistently, aiming for about one inch of water per week. Mulching around the plants helps retain moisture and suppress weeds.

With patience and care, you will soon be enjoying the fruits of your labor. Happy gardening!`,
  },
  {
    id: "narrative",
    label: "Narrative paragraph",
    text: `The old lighthouse stood at the edge of the cliff, its weathered walls bearing witness to countless storms. Every evening, as the sun dipped below the horizon, Eleanor would climb the spiral staircase to light the lamp, just as her father and grandfather had done before her. The rhythmic crash of waves against the rocks below was a constant companion, a reminder of the sea's relentless power.

One stormy night, as the wind howled and rain lashed against the windows, Eleanor noticed a faint light flickering in the distance. Her heart raced as she realized it was a ship in distress. Without hesitation, she grabbed her lantern and rushed down to the shore, determined to guide the vessel safely to harbor. In that moment, she understood that the lighthouse was not merely a building; it was a beacon of hope for those lost at sea.`,
  },
];
