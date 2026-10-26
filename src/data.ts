export interface Question {
  id: string; q: string; options: string[]; answer: number; skill: string;
}
export interface Section { id: string; name: string; kind: "objective" | "reading" | "listening" | "writing" | "speaking"; questions?: Question[]; }

export const diagnosticSections: Section[] = [
  {id:"grammar",name:"Grammar",kind:"objective",questions:[
    {id:"G1",q:"Choose the correct sentence:",options:["She go to university every day.","She goes to university every day.","She going to university every day.","She gone to university every day."],answer:1,skill:"Grammar basics"},
    {id:"G2",q:"I ______ English for three years.",options:["study","studied","have studied","am studied"],answer:2,skill:"Present perfect"},
    {id:"G3",q:"If I ______ more time, I would learn another language.",options:["have","had","will have","would have"],answer:1,skill:"Conditionals"},
    {id:"G4",q:"By the time we arrived, the lecture ______.",options:["starts","has started","had started","starting"],answer:2,skill:"Past perfect"},
    {id:"G5",q:"Choose the correct sentence:",options:["The information are useful.","The informations are useful.","The information is useful.","The informations is useful."],answer:2,skill:"Uncountable nouns"},
    {id:"G6",q:"If the government had invested more in education, literacy rates ______ higher today.",options:["are","would be","would have been","were"],answer:1,skill:"Mixed conditionals"}
  ]},
  {id:"vocabulary",name:"Vocabulary",kind:"objective",questions:[
    {id:"V1",q:'The word "rapid" is closest in meaning to:',options:["slow","sudden and fast","uncertain","complicated"],answer:1,skill:"Meaning recognition"},
    {id:"V2",q:"The new policy had a ______ effect on employment.",options:["significant","significance","signify","significantly"],answer:0,skill:"Word form"},
    {id:"V3",q:"The study provides ______ evidence that air pollution affects health.",options:["convincing","convinced","convince","conviction"],answer:0,skill:"Academic word choice"},
    {id:"V4",q:'Which word is closest in meaning to "decline" in: "Birth rates have declined significantly."',options:["increased","remained stable","decreased","disappeared"],answer:2,skill:"Meaning in context"},
    {id:"V5",q:"Which collocation is correct?",options:["make research","do research","create research","perform researchings"],answer:1,skill:"Collocations"},
    {id:"V6",q:'Which sentence uses "substantial" correctly?',options:["I substantial my homework yesterday.","The project requires a substantial amount of funding.","She was substantial to the university.","He substantially person."],answer:1,skill:"Contextual use"}
  ]},
  {id:"reading",name:"Reading",kind:"reading",questions:[
    {id:"R1",q:"What is the main idea of the passage?",options:["Urban green spaces are expensive and rarely useful.","Green spaces can improve environmental and social aspects of city life when communities maintain them.","Cities should replace all roads with parks.","Community gardens are only useful for growing food."],answer:1,skill:"Main idea"},
    {id:"R2",q:"According to the passage, why can community gardens help residents meet?",options:["They require people to buy vegetables together.","They create a reason for residents to interact and share knowledge.","They are managed only by local councils.","They eliminate the need for public parks."],answer:1,skill:"Specific information"},
    {id:"R3",q:'In the passage, "less severe" is closest in meaning to:',options:["less difficult or unpleasant","more crowded and busy","less green and natural","more expensive to maintain"],answer:0,skill:"Vocabulary in context"},
    {id:"R4",q:"What can be inferred about gardens that have no regular maintenance?",options:["They become more productive.","They usually become less attractive and useful over time.","They need fewer volunteers.","They are automatically protected by councils."],answer:1,skill:"Inference"},
    {id:"R5",q:"Which statement best paraphrases the final paragraph?",options:["The best gardens are mainly collections of decorative plants.","Successful gardens depend on shared community involvement and can strengthen local relationships.","Successful gardens should be managed only by experts.","Gardens are useful only when they generate income."],answer:1,skill:"Paraphrase / equivalent meaning"}
  ]},
  {id:"listening",name:"Listening",kind:"listening",questions:[
    {id:"L1",q:"What is the talk mainly about?",options:["How to design private balconies","How community gardens can improve city life","How to run a commercial farm","Why insects are harmful in cities"],answer:1,skill:"Main idea"},
    {id:"L2",q:"What may older residents share with younger volunteers?",options:["University applications","Gardening knowledge","Transport advice","Financial investments"],answer:1,skill:"Specific information"},
    {id:"L3",q:"What can plants help provide during hot weather?",options:["More traffic","Shade","Indoor heating","Higher rents"],answer:1,skill:"Detail recognition"},
    {id:"L4",q:"What can be inferred about neglected gardens?",options:["They require little attention.","They can stop providing their intended benefits.","They always attract more visitors.","They become private property automatically."],answer:1,skill:"Inference"},
    {id:"L5",q:"According to the speaker, the most successful gardens become:",options:["private businesses","shared spaces for relationships, learning and local responsibility","replacement schools","large industrial farms"],answer:1,skill:"Overall understanding"}
  ]},
  {id:"writing",name:"Writing",kind:"writing"},
  {id:"speaking",name:"Speaking",kind:"speaking"},
  {id:"familiarity",name:"IELTS Familiarity",kind:"objective",questions:[
    {id:"I1",q:"How many parts does IELTS Speaking have?",options:["2","3","4","5"],answer:1,skill:"Speaking format"},
    {id:"I2",q:"Which IELTS Writing task generally requires a minimum of 250 words?",options:["Task 1","Task 2","Both","Neither"],answer:1,skill:"Writing format"},
    {id:"I3",q:"Which of these is an IELTS Speaking assessment criterion?",options:["Creativity","Pronunciation","Handwriting","Memorization"],answer:1,skill:"Scoring criteria"},
    {id:"I4",q:"Which IELTS module is completed through an audio recording?",options:["Reading","Writing","Listening","Speaking"],answer:2,skill:"Module knowledge"},
    {id:"I5",q:"What is the main purpose of IELTS band scores?",options:["To rank universities","To represent English-language proficiency","To measure intelligence","To determine nationality"],answer:1,skill:"Band score purpose"}
  ]}
];

export const readingPassage = [
"Urban green spaces are often described as places for plants, but their value can extend far beyond appearance. In crowded cities, even a small park, community garden, or tree-lined street can change how people experience their neighbourhood. These spaces can offer a break from traffic, concrete and noise, while also creating opportunities for social interaction.",
"Community gardens are a particularly interesting example. Residents who share a garden may begin by caring for separate plots, yet the work often creates small opportunities to talk and cooperate. Someone who has gardened for decades may teach a new volunteer how to prepare soil, while a younger resident may help an older neighbour with a phone-based booking system. Over time, a space that began as a collection of plants can become a place where relationships grow as well.",
"Green spaces can also provide practical environmental benefits. Trees and other plants can offer shade, support insects such as bees and butterflies, and make streets feel less severe during very hot periods. Vegetation cannot solve every urban environmental problem, however. A garden still needs water, planning and people who are willing to maintain it. Without regular care, a once-useful area can quickly become neglected.",
"For this reason, the strongest projects usually involve residents in both planning and maintenance. Community participation can make people more likely to notice problems, share responsibility and protect the space over time. This does not mean that every city needs a large garden on every street. Rather, even modest green areas can have meaningful effects when they are designed around local needs and treated as shared community resources."
];

export const listeningScript = "Community gardens are more than places to grow plants. In many cities, they give neighbours a reason to meet, share knowledge and take responsibility for a common place. Older residents may pass along gardening knowledge to younger volunteers, while younger people often bring digital skills that help organize schedules or events. Plants can also provide shade during hot weather and create habitats for insects. But these benefits are not automatic. Without regular care, a neglected garden can become less attractive and may stop providing the same social and environmental benefits. The most successful projects therefore treat the garden as a shared community space rather than a decoration. People plan it together, maintain it together, and gradually build stronger local relationships.";

export const writingPrompt = "Some people believe that students should be required to study subjects that are useful for their future careers. Others believe students should be free to choose what they study. Discuss both views and give your own opinion.";

export const speakingPrompt = {
  title:"Describe a skill you would like to learn in the future.",
  bullets:["what the skill is","why you want to learn it","how you would learn it","and explain how it could help you"]
};

export const lessonCatalog = [
  {id:"grammar-conditionals", title:"Mixed Conditionals: Cause & Result", skill:"Grammar", level:"B1", duration:"12 min", reason:"Strengthen complex sentence control for writing and speaking."},
  {id:"vocab-academic", title:"Academic Word Families", skill:"Vocabulary", level:"B1–B2", duration:"10 min", reason:"Improve precision and word-form control in IELTS contexts."},
  {id:"reading-inference", title:"Reading: Make Better Inferences", skill:"Reading", level:"B1", duration:"15 min", reason:"Build the inference skill that often separates literal reading from IELTS-level reasoning."},
  {id:"listening-detail", title:"Listening: Catch Key Details", skill:"Listening", level:"B1", duration:"12 min", reason:"Practise detail recognition without relying on transcripts."},
  {id:"speaking-fluency", title:"Speaking: Build a 2-Minute Answer", skill:"Speaking", level:"B1", duration:"14 min", reason:"Increase fluency and idea development under time pressure."}
];

export const coursePath = ["Foundation","General English","Pre-IELTS","IELTS Preparation","IELTS Practice","Exam Ready"];

