//@ts-nocheck
import { Descendant } from "slate";

const defaultText: Descendant[] = [
    {
        type: "paragraph",
        children: [
            {
                text: "This document reflects the strategy we’ve refined over the past two years, including feedback from many people internal and external to OpenAI. The timeline to AGI remains uncertain, but our Charter will guide us in acting in the best interests of humanity throughout its development. OpenAI’s mission is to ensure that artificial general intelligence (AGI)—by which we mean highly autonomous systems that outperform humans at most economically valuable work—benefits all of humanity. We will attempt to directly build safe and beneficial AGI, but will also consider our mission fulfilled if our work aids others to achieve this outcome. To that end, we commit to the following principles:",
            },
        ],
    },
    {
        type: "heading-two",
        children: [{ text: "Broadly distributed benefits" }],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "We commit to use any influence we obtain over AGI’s deployment to ensure it is used for the benefit of all, and to avoid enabling uses of AI or AGI that harm humanity or unduly concentrate power. Our primary fiduciary duty is to humanity. We anticipate needing to marshal substantial resources to fulfill our mission, but will always diligently act to minimize conflicts of interest among our employees and stakeholders that could compromise broad benefit.",
            },
        ],
    },
    {
        type: "heading-two",
        children: [{ text: "Long-term safety" }],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "We are committed to doing the research required to make AGI safe, and to driving the broad adoption of such research across the AI community. We are concerned about late-stage AGI development becoming a competitive race without time for adequate safety precautions. Therefore, if a value-aligned, safety-conscious project comes close to building AGI before we do, we commit to stop competing with and start assisting this project. We will work out specifics in case-by-case agreements, but a typical triggering condition might be “a better-than-even chance of success in the next two years.",
            },
        ],
    },
    {
        type: "heading-two",
        children: [{ text: "Technical Leadership" }],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "To be effective at addressing AGI’s impact on society, OpenAI must be on the cutting edge of AI capabilities—policy and safety advocacy alone would be insufficient. We believe that AI will have broad societal impact before AGI, and we’ll strive to lead in those areas that are directly aligned with our mission and expertise.",
            },
        ],
    },
    {
        type: "heading-two",
        children: [{ text: "Cooperative Coordination" }],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "We will actively cooperate with other research and policy institutions; we seek to create a global community working together to address AGI’s global challenges. We are committed to providing public goods that help society navigate the path to AGI. Today this includes publishing most of our AI research, but we expect that safety and security concerns will reduce our traditional publishing in the future, while increasing the importance of sharing safety, policy, and standards research.",
            },
        ],
    },
];

export default defaultText;
