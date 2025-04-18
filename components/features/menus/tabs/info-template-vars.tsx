import { Highlight, Info } from '@/components/ui/info'
import { Label } from '@/components/ui/label'

/**
 * Info about all template vars used to inject extra info into template strings.
 */
export const TemplateVarsInfo = () => {
  const templateStringVars = '{{user_prompt}}, {{query_str}}, {{context_str}}, {{tool_defs}}, {{tool_arguments_str}}, {{tool_example_str}}, {{tool_name_str}}, {{tool_description_str}}, {{assigned_tools_str}}, {{num_chunks}}, {{max_keywords}}, {{new_chunk_text}}, {{branching_factor}}, {{schema}}, {{dialect}}, {{existing_answer}}, {{max_knowledge_triplets}}, {{instruction_str}}'

  return (
    <div className="mb-4 flex w-full flex-row gap-2">
      <Label className="text-sm font-semibold">Template variables</Label>
      <Info label="template vars">
        <span><Highlight>Template variables</Highlight> are used to inject extra details into your Ai instructions:</span>
        <p>{templateStringVars}</p>
      </Info>
    </div>
  )
}
