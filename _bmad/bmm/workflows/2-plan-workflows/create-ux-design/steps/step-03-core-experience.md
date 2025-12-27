# Step 3: Core Experience Definition

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER generate content without user input **OR explicit delegation**
- 🔄 **DELEGATION DETECTION**: When user uses delegation expressions, immediately switch to auto-generation flow

- 📖 CRITICAL: ALWAYS read the complete step file before taking any action - partial understanding leads to incomplete decisions
- 🔄 CRITICAL: When loading next step with 'C', ensure the entire file is read and understood before proceeding
- ✅ ALWAYS treat this as collaborative discovery between UX facilitator and stakeholder
- 📋 YOU ARE A UX FACILITATOR, not a content generator
- 💬 FOCUS on defining the core user experience and platform
- 🎯 COLLABORATIVE discovery, not assumption-based design

## EXECUTION PROTOCOLS:

- 🎯 Show your analysis before taking any action
- ⚠️ Present A/P/C menu after generating core experience content
- 💾 ONLY save when user chooses C (Continue)
- 📖 Update frontmatter `stepsCompleted: [1, 2, 3]` before loading next step
- 🚫 FORBIDDEN to load next step until C is selected

## COLLABORATION MENUS (A/P/C):

This step will generate content and present choices:

- **A (Advanced Elicitation)**: Use discovery protocols to develop deeper experience insights
- **P (Party Mode)**: Bring multiple perspectives to define optimal user experience
- **C (Continue)**: Save the content to the document and proceed to next step

## PROTOCOL INTEGRATION:

- When 'A' selected: Execute {project-root}/\_bmad/core/tasks/advanced-elicitation.xml
- When 'P' selected: Execute {project-root}/\_bmad/core/workflows/party-mode/workflow.md
- PROTOCOLS always return to this step's A/P/C menu
- User accepts/rejects protocol changes before proceeding

## CONTEXT BOUNDARIES:

- Current document and frontmatter from previous steps are available
- Project understanding from step 2 informs this step
- No additional data files needed for this step
- Focus on core experience and platform decisions

## YOUR TASK:

Define the core user experience, platform requirements, and what makes the interaction effortless.

## CORE EXPERIENCE DISCOVERY SEQUENCE:

### 1. Define Core User Action

Start by identifying the most important user interaction:
"Now let's dig into the heart of the user experience for {{project_name}}.

**Core Experience Questions:**

- What's the ONE thing users will do most frequently?
- What user action is absolutely critical to get right?
- What should be completely effortless for users?
- If we nail one interaction, everything else follows - what is it?

Think about the core loop or primary action that defines your product's value."

---

## USER RESPONSE PATTERN DETECTION

**CRITICAL: After EACH question set, immediately analyze user response for these patterns:**

### Delegation Keywords

**Korean:**
- 핵심: "알아서", "니가", "네가", "만들어", "작성해", "제작해"
- 보조: "결정해", "마음대로", "편한대로", "적당히", "그냥 해"

**English:**
- "you decide", "your call", "up to you", "just do it", "you create"

### Pattern A: Specific Answer
- User provides detailed information or answers questions
- → **Continue normal discovery flow** (proceed to next section)

### Pattern B: Uncertainty ("모르겠어요", "없어요", blank/minimal response)
- User indicates uncertainty or lack of preference
- → **Switch to AUTO-GENERATION FLOW below**

### Pattern C: Delegation (keywords detected)
- User explicitly delegates decision-making to AI
- → **IMMEDIATELY switch to AUTO-GENERATION FLOW below**

---

## AUTO-GENERATION FLOW

**When Pattern B or C is detected, execute this flow instead of continuing questions:**

### Step AG-1: Announce Document Analysis

"위임 요청을 받았습니다. 이전 단계와 로드된 문서를 분석하여 Core Experience 초안을 작성하겠습니다.

**분석 중인 자료:**
- Step 2에서 생성된 Project Understanding
- PRD의 기능 요구사항
- Product Brief의 핵심 가치 제안

**잠시만 기다려 주세요...**"

### Step AG-2: Extract and Generate Content

From available sources, extract:
- **From Step 2 output**: Project vision, target users, design challenges
- **From PRD**: Functional requirements, user flows, core actions
- **From Product Brief**: Core value proposition, success metrics
- **Infer**: Platform requirements, effortless interactions, critical success moments

Generate complete Core Experience content using the structure from Section 6.

### Step AG-3: Present Draft for Confirmation

"이전 단계와 PRD를 기반으로 Core Experience 초안을 작성했습니다.

**[Generated Content]**

[Show complete markdown content]

**확인해 주세요:**
- 이 내용이 적절한가요?
- 수정이 필요한 부분이 있나요?

[A] 더 깊이 탐구 (Advanced Elicitation)
[P] 다양한 관점 검토 (Party Mode)
[C] 확인하고 다음 단계로 진행"

**After user selects from A/P/C menu, follow Section 8 (Handle Menu Selection).**

---

### 2. Explore Platform Requirements

Determine where and how users will interact:
"Let's define the platform context for {{project_name}}:

**Platform Questions:**

- Web, mobile app, desktop, or multiple platforms?
- Will this be primarily touch-based or mouse/keyboard?
- Any specific platform requirements or constraints?
- Do we need to consider offline functionality?
- Any device-specific capabilities we should leverage?"

### 3. Identify Effortless Interactions

Surface what should feel magical or completely seamless:
"**Effortless Experience Design:**

- What user actions should feel completely natural and require zero thought?
- Where do users currently struggle with similar products?
- What interaction, if made effortless, would create delight?
- What should happen automatically without user intervention?
- Where can we eliminate steps that competitors require?"

### 4. Define Critical Success Moments

Identify the moments that determine success or failure:
"**Critical Success Moments:**

- What's the moment where users realize 'this is better'?
- When does the user feel successful or accomplished?
- What interaction, if failed, would ruin the experience?
- What are the make-or-break user flows?
- Where does first-time user success happen?"

### 5. Synthesize Experience Principles

Extract guiding principles from the conversation:
"Based on our discussion, I'm hearing these core experience principles for {{project_name}}:

**Experience Principles:**

- [Principle 1 based on core action focus]
- [Principle 2 based on effortless interactions]
- [Principle 3 based on platform considerations]
- [Principle 4 based on critical success moments]

These principles will guide all our UX decisions. Do these capture what's most important?"

### 6. Generate Core Experience Content

Prepare the content to append to the document:

#### Content Structure:

When saving to document, append these Level 2 and Level 3 sections:

```markdown
## Core User Experience

### Defining Experience

[Core experience definition based on conversation]

### Platform Strategy

[Platform requirements and decisions based on conversation]

### Effortless Interactions

[Effortless interaction areas identified based on conversation]

### Critical Success Moments

[Critical success moments defined based on conversation]

### Experience Principles

[Guiding principles for UX decisions based on conversation]
```

### 7. Present Content and Menu

Show the generated core experience content and present choices:
"I've defined the core user experience for {{project_name}} based on our conversation. This establishes the foundation for all our UX design decisions.

**Here's what I'll add to the document:**

[Show the complete markdown content from step 6]

**What would you like to do?**
[A] Advanced Elicitation - Let's refine the core experience definition
[P] Party Mode - Bring different perspectives on the user experience
[C] Continue - Save this to the document and move to emotional response definition"

### 8. Handle Menu Selection

#### If 'A' (Advanced Elicitation):

- Execute {project-root}/\_bmad/core/tasks/advanced-elicitation.xml with the current core experience content
- Process the enhanced experience insights that come back
- Ask user: "Accept these improvements to the core experience definition? (y/n)"
- If yes: Update content with improvements, then return to A/P/C menu
- If no: Keep original content, then return to A/P/C menu

#### If 'P' (Party Mode):

- Execute {project-root}/\_bmad/core/workflows/party-mode/workflow.md with the current core experience definition
- Process the collaborative experience improvements that come back
- Ask user: "Accept these changes to the core experience definition? (y/n)"
- If yes: Update content with improvements, then return to A/P/C menu
- If no: Keep original content, then return to A/P/C menu

#### If 'C' (Continue):

- Append the final content to `{output_folder}/ux-design-specification.md`
- Update frontmatter: `stepsCompleted: [1, 2, 3]`
- Load `./step-04-emotional-response.md`

## APPEND TO DOCUMENT:

When user selects 'C', append the content directly to the document using the structure from step 6.

## SUCCESS METRICS:

✅ Core user action clearly identified and defined
✅ Platform requirements thoroughly explored
✅ Effortless interaction areas identified
✅ Critical success moments mapped out
✅ Experience principles established as guiding framework
✅ A/P/C menu presented and handled correctly
✅ Content properly appended to document when C selected
✅ **Delegation patterns correctly detected and handled**
✅ **Auto-generation flow executed when user delegates**

## FAILURE MODES:

❌ Missing the core user action that defines the product
❌ Not properly considering platform requirements
❌ Overlooking what should be effortless for users
❌ Not identifying critical make-or-break interactions
❌ Experience principles too generic or not actionable
❌ Not presenting A/P/C menu after content generation
❌ Appending content without user selecting 'C'
❌ **Ignoring delegation expressions and continuing to ask questions**
❌ **Not switching to auto-generation flow when user delegates**

❌ **CRITICAL**: Reading only partial step file - leads to incomplete understanding and poor decisions
❌ **CRITICAL**: Proceeding with 'C' without fully reading and understanding the next step file
❌ **CRITICAL**: Making decisions without complete understanding of step requirements and protocols

## NEXT STEP:

After user selects 'C' and content is saved to document, load `./step-04-emotional-response.md` to define desired emotional responses.

Remember: Do NOT proceed to step-04 until user explicitly selects 'C' from the A/P/C menu and content is saved!
