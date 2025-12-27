import React from "react";
import { FileQuestion } from "@/lib/icons";

interface AskUserQuestionWidgetProps {
  questions: Array<{
    question: string;
    header: string;
    multiSelect: boolean;
    options: Array<{ label: string; description: string }>;
  }>;
  answers?: Record<string, string | string[]>;
  result?: any;
}

export const AskUserQuestionWidget: React.FC<AskUserQuestionWidgetProps> = ({
  questions,
  answers,
  result
}) => {
  // Debug: Log what we receive
  console.log('[AskUserQuestionWidget] Received:', { questions, answers, result });

  // Extract answers from result.content
  let userAnswers: Record<string, string | string[]> = {};

  if (answers) {
    userAnswers = answers;
  } else if (result?.content) {
    // toolResult.content can be a string (JSON) or object
    if (typeof result.content === 'string') {
      try {
        const parsed = JSON.parse(result.content);
        userAnswers = parsed.answers || parsed || {};
      } catch {
        console.warn('[AskUserQuestionWidget] Failed to parse result.content:', result.content);
      }
    } else if (typeof result.content === 'object') {
      userAnswers = result.content.answers || result.content || {};
    }
  }

  console.log('[AskUserQuestionWidget] User answers:', userAnswers);

  return (
    <div className="space-y-3">
      {questions.map((q, idx) => {
        const questionId = `q${idx}`;
        const answer = userAnswers[q.question] || userAnswers[questionId];

        return (
          <div key={idx} className="rounded-lg border border-muted bg-muted/20 p-3">
            {/* Question header */}
            <div className="flex items-start gap-2 mb-3">
              <FileQuestion className="h-4 w-4 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium">{q.question}</div>
                <div className="text-xs text-muted-foreground mt-1">{q.header}</div>
              </div>
            </div>

            {/* Options */}
            {q.options && q.options.length > 0 && (
              <div className="space-y-2 mb-3 pl-6">
                {q.options.map((option, optIdx) => {
                  const isSelected = Array.isArray(answer)
                    ? answer.includes(option.label)
                    : answer === option.label;

                  return (
                    <div
                      key={optIdx}
                      className={`rounded-md border p-2 ${
                        isSelected
                          ? 'bg-primary/10 border-primary/40'
                          : 'bg-background/50 border-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30 text-muted-foreground'
                        }`}>
                          {optIdx + 1}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                            {option.label}
                          </div>
                          {option.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Answer summary */}
            {answer && (
              <div className="mt-2 pl-6">
                <div className="text-xs font-medium text-muted-foreground mb-1">선택된 답변:</div>
                <div className="text-sm bg-primary/10 border border-primary/20 rounded px-2 py-1 font-medium">
                  {Array.isArray(answer) ? answer.join(", ") : answer}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
