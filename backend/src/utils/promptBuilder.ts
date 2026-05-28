export interface QuestionTypeInput {
  id?: string
  label: string
  questions: number
  marks: number
}

export interface DifficultyDistribution {
  easy: number
  medium: number
  hard: number
}

export interface GenerateAssignmentPaperPayload {
  title: string
  subject: string
  className: string
  questionTypes: QuestionTypeInput[]
  totalQuestions: number
  totalMarks: number
  difficultyDistribution: DifficultyDistribution
  additionalInstructions: string
  uploadedMaterialText: string
}

interface PromptMessage {
  role: 'system' | 'user'
  content: string
}

interface PromptEnvelope {
  systemPrompt: string
  userPrompt: string
  messages: PromptMessage[]
}

function escapeSectionTitle(title: string) {
  return title.replace(/\s+/g, ' ').trim()
}

function formatDifficultyDistribution(
  distribution: DifficultyDistribution
) {
  return [
    `easy: ${distribution.easy}`,
    `medium: ${distribution.medium}`,
    `hard: ${distribution.hard}`,
  ].join(', ')
}

function buildQuestionDistribution(
  questionTypes: QuestionTypeInput[]
) {
  return questionTypes
    .map((questionType, index) => {
      return [
        `Section ${String.fromCharCode(65 + index)}: ${escapeSectionTitle(
          questionType.label
        )}`,
        `- Questions: ${questionType.questions}`,
        `- Marks per question: ${questionType.marks}`,
      ].join('\n')
    })
    .join('\n\n')
}

export function buildAssignmentPrompt(
  payload: GenerateAssignmentPaperPayload
): PromptEnvelope {
  const {
    title,
    subject,
    className,
    totalQuestions,
    totalMarks,
    questionTypes,
    difficultyDistribution,
    additionalInstructions,
    uploadedMaterialText,
  } = payload

  const formattedQuestionDistribution =
    buildQuestionDistribution(questionTypes)

  const formattedDifficultyDistribution =
    formatDifficultyDistribution(difficultyDistribution)

  const sourceMaterial =
    uploadedMaterialText?.trim()
      ? uploadedMaterialText.trim()
      : 'No uploaded material provided.'

  const systemPrompt = `
You are an expert academic assessment generator.

You generate highly structured examination papers for schools, colleges, universities, and academic institutions.

You generate:
* educationally accurate questions
* realistic exam-quality papers
* conceptually strong assessments
* balanced question diversity
* analytical and application-oriented questions

You MUST strictly follow:
* requested section structure
* question count
* mark distribution
* difficulty distribution
* JSON schema

You NEVER:
* generate markdown
* generate explanations outside JSON
* add commentary
* change requested question counts
* change marks
* omit sections

You MUST:
* maintain strong academic quality
* avoid repetitive questions
* avoid shallow definition-only questions
* ensure conceptual diversity
* ensure proper curriculum coverage

If constraints cannot be satisfied:
return a valid JSON error object.
`.trim()

  const userPrompt = `
Generate a question paper using the following requirements.

TITLE:
${title}

SUBJECT:
${subject}

CLASS:
${className}

TOTAL QUESTIONS:
${totalQuestions}

TOTAL MARKS:
${totalMarks}

QUESTION DISTRIBUTION:
${formattedQuestionDistribution}

DIFFICULTY DISTRIBUTION:
${formattedDifficultyDistribution}

ADDITIONAL INSTRUCTIONS:
${additionalInstructions?.trim() || 'None'}

SOURCE MATERIAL:
${sourceMaterial}

---

IMPORTANT RULES:

1. Each section MUST contain EXACTLY the requested number of questions.

2. Each question MUST contain EXACTLY the requested marks.

3. Questions MUST be educationally accurate.

4. Difficulty MUST be one of:
* easy
* medium
* hard

5. Return ONLY valid JSON.

6. DO NOT wrap JSON in markdown.

7. DO NOT include explanations.

8. DO NOT include text outside JSON.

9. Questions should feel professionally designed for a real educational assessment.

10. Avoid repetitive or low-quality questions.

11. Include conceptual, analytical, reasoning-based, and application-oriented questions wherever appropriate.

12. MCQ questions MUST:
* include exactly 4 options
* include plausible distractors
* have only one correct answer
* avoid obviously wrong options
* test conceptual understanding instead of direct memorization
* be slightly tricky and academically meaningful
* include scenario-based or application-based questions whenever appropriate

13. Numerical questions MUST:
* involve calculations, derivations, formulas, or quantitative reasoning
* require proper multi-step solving where appropriate
* include realistic numerical values
* avoid trivial substitutions
* test conceptual understanding behind the calculation
* include word problems or real-world applications whenever appropriate
* provide concise but correct final answers

14. Short answer questions MUST:
* test conceptual clarity and understanding
* avoid one-word or definition-only responses
* encourage explanation, comparison, reasoning, or interpretation
* include analytical and application-oriented prompts where possible
* require answers that can typically be written within 4 to 5 lines
* keep answers concise, text-based, and academically relevant
* avoid excessively lengthy descriptive answers

15. Diagram or graph-based questions MUST:
* ask students to analyze, interpret, label, explain, or infer information
* reference diagrams, charts, graphs, circuits, flowcharts, or visual structures when relevant
* encourage observational and analytical thinking
* include practical or real-world interpretation where appropriate
* clearly describe the required diagram or graph in text form if an actual image cannot be generated
* include a visual object for any question that needs a chart, graph, or diagram, using renderer: "recharts" for plotted data and renderer: "desmos" for signal/function graphs
* for recharts, provide chartType, points, and axis labels when possible
* for desmos, provide a Desmos-compatible expression and a numeric domain
* require concise text-only answers that can typically be written within 4 to 5 lines
* avoid requiring large paragraph-style explanations
* For graph or visual metadata:
* All numeric arrays MUST contain only valid numbers.
* Do NOT generate mathematical expressions inside arrays.
* Evaluate constants before returning JSON.
* Example:
   CORRECT: "domain": [0, 6.28318]
   WRONG: "domain": [0, 2, "* 3.14159"]
* visual.expression must always be a valid mathematical expression string.
* visual.domain must always be:
   [number, number]

7. Never include symbols, operators, or textual math inside numeric arrays.

16. Questions should maximize topic coverage breadth before repeating similar conceptual areas.

17. Hard and medium questions should increasingly focus on:
* applied reasoning
* tradeoffs
* architecture understanding
* comparative analysis
* scenario-based thinking
* problem-solving

18. If uploaded material is limited or absent, use academically standard curriculum knowledge relevant to the assignment topic.

<topic_expansion_rules>

When the assignment topic is broad, high-level, or domain-wide
(for example: Artificial Intelligence, Operating Systems,
DBMS, Computer Networks, Physics, Biology, Economics, etc.),

you MUST intelligently infer the major academic subtopics
commonly taught within that subject.

Questions should then be distributed across:
* core concepts
* important subtopics
* practical applications
* analytical areas
* real-world scenarios

Do NOT generate all questions from only introductory concepts.

For broad topics:
* diversify question coverage
* avoid repetitive foundational definitions
* cover both theoretical and applied understanding
* include modern and industry-relevant concepts where appropriate

Example:
Topic: Artificial Intelligence

Questions should naturally span areas such as:
* machine learning
* neural networks
* NLP
* expert systems
* search algorithms
* computer vision
* ethics in AI
* intelligent agents

instead of generating only:
* "What is AI?"
* "Define AI."
* "Applications of AI."

</topic_expansion_rules>

---

REQUIRED JSON SCHEMA:

{
  "title": "string",
  "subject": "string",
  "className": "string",
  "instructions": "string",
  "totalMarks": number,
  "totalQuestions": number,
  "sections": [
    {
      "title": "string",
      "instruction": "string",
      "questions": [
        {
          "question": "string",
          "difficulty": "easy | medium | hard",
          "marks": number,
          "answer": "string",
          "visual": {
            "renderer": "recharts | desmos",
            "chartType": "line | bar | scatter",
            "title": "string",
            "xAxisLabel": "string",
            "yAxisLabel": "string",
            "points": [{ "x": "string | number", "y": number }],
            "expression": "string",
            "domain": [number, number]
          },
          "options": ["string"]
        }
      ]
    }
  ]
}

---

VALIDATION REQUIREMENTS:

* totalQuestions MUST equal ${totalQuestions}
* totalMarks MUST equal ${totalMarks}
* section count MUST equal ${questionTypes.length}

---

EXAMPLE QUESTION OBJECT:

{
  "question": "What is the time complexity of binary search?",
  "difficulty": "medium",
  "marks": 2,
  "answer": "O(log n)",
  "options": [
    "O(n)",
    "O(log n)",
    "O(n log n)",
    "O(1)"
  ]
}

---

NOW GENERATE THE COMPLETE JSON RESPONSE.
`.trim()

  return {
    systemPrompt,
    userPrompt,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  }
}