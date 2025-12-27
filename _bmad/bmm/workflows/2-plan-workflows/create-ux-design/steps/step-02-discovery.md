# Step 2: Project Understanding

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER generate content without user input **OR explicit delegation**
- 🔄 **DELEGATION DETECTION**: When user uses delegation expressions, immediately switch to auto-generation flow

- 📖 CRITICAL: ALWAYS read the complete step file before taking any action - partial understanding leads to incomplete decisions
- 🔄 CRITICAL: When loading next step with 'C', ensure the entire file is read and understood before proceeding
- ✅ ALWAYS treat this as collaborative discovery between UX facilitator and stakeholder
- 📋 YOU ARE A UX FACILITATOR, not a content generator
- 💬 FOCUS on understanding project context and user needs
- 🎯 COLLABORATIVE discovery, not assumption-based design

## EXECUTION PROTOCOLS:

- 🎯 Show your analysis before taking any action
- ⚠️ Present A/P/C menu after generating project understanding content
- 💾 ONLY save when user chooses C (Continue)
- 📖 Update frontmatter `stepsCompleted: [1, 2]` before loading next step
- 🚫 FORBIDDEN to load next step until C is selected

## COLLABORATION MENUS (A/P/C):

This step will generate content and present choices:

- **A (Advanced Elicitation)**: Use discovery protocols to develop deeper project insights
- **P (Party Mode)**: Bring multiple perspectives to understand project context
- **C (Continue)**: Save the content to the document and proceed to next step

## PROTOCOL INTEGRATION:

- When 'A' selected: Execute {project-root}/\_bmad/core/tasks/advanced-elicitation.xml
- When 'P' selected: Execute {project-root}/\_bmad/core/workflows/party-mode/workflow.md
- PROTOCOLS always return to this step's A/P/C menu
- User accepts/rejects protocol changes before proceeding

## CONTEXT BOUNDARIES:

- Current document and frontmatter from step 1 are available
- Input documents (PRD, briefs, epics) already loaded are in memory
- No additional data files needed for this step
- Focus on project and user understanding

## YOUR TASK:

Understand the project context, target users, and what makes this product special from a UX perspective.

## PROJECT DISCOVERY SEQUENCE:

### 1. Review Loaded Context

Start by analyzing what we know from the loaded documents:
"Based on the project documentation we have loaded, let me confirm what I'm understanding about {{project_name}}.

**From the documents:**
{summary of key insights from loaded PRD, briefs, and other context documents}

**Target Users:**
{summary of user information from loaded documents}

**Key Features/Goals:**
{summary of main features and goals from loaded documents}

Does this match your understanding? Are there any corrections or additions you'd like to make?"

### 2. Fill Context Gaps (If no documents or gaps exist)

If no documents were loaded or key information is missing:
"Since we don't have complete documentation, let's start with the essentials:

**What are you building?** (Describe your product in 1-2 sentences)

**Who is this for?** (Describe your ideal user or target audience)

**What makes this special or different?** (What's the unique value proposition?)

**What's the main thing users will do with this?** (Core user action or goal)"

### 3. Explore User Context Deeper

Dive into user understanding:
"Let me understand your users better to inform the UX design:

**User Context Questions:**

- What problem are users trying to solve?
- What frustrates them with current solutions?
- What would make them say 'this is exactly what I needed'?
- How tech-savvy are your target users?
- What devices will they use most?
- When/where will they use this product?"

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

"위임 요청을 받았습니다. 로드된 문서를 분석하여 프로젝트 이해 초안을 작성하겠습니다.

**분석 중인 문서:**
{list all loaded documents from step 1: PRD, briefs, research, etc.}

**잠시만 기다려 주세요...**"

### Step AG-2: Extract and Generate Content

From loaded documents, extract:
- **From PRD**: Product vision, target users, core features, domain context
- **From Product Brief**: Vision statement, differentiators, success criteria
- **From Research**: Market insights, user pain points, competitive landscape
- **From Brainstorming**: Creative ideas, feature concepts

Generate complete Project Understanding content using the structure from Section 5.

### Step AG-3: Present Draft for Confirmation

"PRD와 관련 문서를 기반으로 초안을 작성했습니다.

**[Generated Content]**

[Show complete markdown content]

**확인해 주세요:**
- 이 내용이 적절한가요?
- 수정이 필요한 부분이 있나요?

[A] 더 깊이 탐구 (Advanced Elicitation)
[P] 다양한 관점 검토 (Party Mode)
[C] 확인하고 다음 단계로 진행"

**After user selects from A/P/C menu, follow Section 7 (Handle Menu Selection).**

---

### 4. Identify UX Design Challenges

Surface the key UX challenges to address:
"From what we've discussed, I'm seeing some key UX design considerations:

**Design Challenges:**

- [Identify 2-3 key UX challenges based on project type and user needs]
- [Note any platform-specific considerations]
- [Highlight any complex user flows or interactions]

**Design Opportunities:**

- [Identify 2-3 areas where great UX could create competitive advantage]
- [Note any opportunities for innovative UX patterns]

Does this capture the key UX considerations we need to address?"

### 5. Generate Project Understanding Content

Prepare the content to append to the document:

#### Content Structure:

When saving to document, append these Level 2 and Level 3 sections:

```markdown
## Executive Summary

### Project Vision

[Project vision summary based on conversation]

### Target Users

[Target user descriptions based on conversation]

### Key Design Challenges

[Key UX challenges identified based on conversation]

### Design Opportunities

[Design opportunities identified based on conversation]
```

### 6. Present Content and Menu

Show the generated project understanding content and present choices:
"I've documented our understanding of {{project_name}} from a UX perspective. This will guide all our design decisions moving forward.

**Here's what I'll add to the document:**

[Show the complete markdown content from step 5]

**What would you like to do?**
[A] Advanced Elicitation - Let's dive deeper into project understanding
[P] Party Mode - Bring different perspectives on user needs and challenges
[C] Continue - Save this to the document and move to core experience definition"

### 7. Handle Menu Selection

#### If 'A' (Advanced Elicitation):

- Execute {project-root}/\_bmad/core/tasks/advanced-elicitation.xml with the current project understanding content
- Process the enhanced project insights that come back
- Ask user: "Accept these improvements to the project understanding? (y/n)"
- If yes: Update content with improvements, then return to A/P/C menu
- If no: Keep original content, then return to A/P/C menu

#### If 'P' (Party Mode):

- Execute {project-root}/\_bmad/core/workflows/party-mode/workflow.md with the current project understanding
- Process the collaborative insights and different perspectives that come back
- Ask user: "Accept these changes to the project understanding? (y/n)"
- If yes: Update content with improvements, then return to A/P/C menu
- If no: Keep original content, then return to A/P/C menu

#### If 'C' (Continue):

- Append the final content to `{output_folder}/ux-design-specification.md`
- Update frontmatter: `stepsCompleted: [1, 2]`
- Load `./step-03-core-experience.md`

## APPEND TO DOCUMENT:

When user selects 'C', append the content directly to the document using the structure from step 5.

## SUCCESS METRICS:

✅ All available context documents reviewed and synthesized
✅ Project vision clearly articulated
✅ Target users well understood
✅ Key UX challenges identified
✅ Design opportunities surfaced
✅ A/P/C menu presented and handled correctly
✅ Content properly appended to document when C selected
✅ **Delegation patterns correctly detected and handled**
✅ **Auto-generation flow executed when user delegates**

## FAILURE MODES:

❌ Not reviewing loaded context documents thoroughly
❌ Making assumptions about users without asking
❌ Missing key UX challenges that will impact design
❌ Not identifying design opportunities
❌ Generating generic content without real project insight
❌ Not presenting A/P/C menu after content generation
❌ Appending content without user selecting 'C'
❌ **Ignoring delegation expressions and continuing to ask questions**
❌ **Not switching to auto-generation flow when user delegates**

❌ **CRITICAL**: Reading only partial step file - leads to incomplete understanding and poor decisions
❌ **CRITICAL**: Proceeding with 'C' without fully reading and understanding the next step file
❌ **CRITICAL**: Making decisions without complete understanding of step requirements and protocols

## NEXT STEP:

After user selects 'C' and content is saved to document, load `./step-03-core-experience.md` to define the core user experience.

Remember: Do NOT proceed to step-03 until user explicitly selects 'C' from the A/P/C menu and content is saved!
