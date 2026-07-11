"use client";

import type { AppSettings } from "@/types/settings";
import { SectionCard, FieldRow, SelectField, SliderField, ToggleField, TextField } from "@/components/settings/fields";

type Props = { data: AppSettings["ai"]; onChange: (p: Partial<AppSettings["ai"]>) => void };

export default function AISection({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionCard title="Model" description="Primary generation backend. Swap providers without code changes.">
        <FieldRow>
          <SelectField label="Provider" value={data.provider} onChange={(v) => onChange({ provider: v })} options={[
            { value: "openrouter", label: "OpenRouter" },
            { value: "openai", label: "OpenAI" },
            { value: "anthropic", label: "Anthropic" },
            { value: "google", label: "Google AI" },
          ]} />
          <SelectField label="Model" value={data.model} onChange={(v) => onChange({ model: v })} options={[
            { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
            { value: "openai/gpt-4o", label: "GPT-4o" },
            { value: "google/gemini-pro", label: "Gemini Pro" },
            { value: "meta/llama-3.1-70b", label: "Llama 3.1 70B" },
          ]} />
          <SelectField label="Fallback Provider" value={data.fallbackProvider} onChange={(v) => onChange({ fallbackProvider: v })} options={[
            { value: "openai", label: "OpenAI" }, { value: "anthropic", label: "Anthropic" }, { value: "google", label: "Google AI" },
          ]} />
          <SelectField label="Brand Voice" value={data.brandVoice} onChange={(v) => onChange({ brandVoice: v })} options={[
            { value: "professional", label: "Professional" },
            { value: "friendly", label: "Friendly" },
            { value: "bold", label: "Bold" },
            { value: "casual", label: "Casual" },
          ]} />
        </FieldRow>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SliderField label="Temperature" value={data.temperature} onChange={(v) => onChange({ temperature: v })} min={0} max={1} step={0.1} />
          <SliderField label="Max Tokens" value={data.maxTokens} onChange={(v) => onChange({ maxTokens: v })} min={256} max={8192} step={256} />
        </div>
      </SectionCard>

      <SectionCard title="Safety & Behavior">
        <div className="space-y-3">
          <ToggleField label="Auto-reply" description="Let AI draft replies without human in the loop" value={data.autoReply} onChange={(v) => onChange({ autoReply: v })} />
          <ToggleField label="Require human review" description="Flag AI output for approval before sending" value={data.humanReview} onChange={(v) => onChange({ humanReview: v })} />
          <ToggleField label="Content moderation" description="Run safety filters on generated content" value={data.contentModeration} onChange={(v) => onChange({ contentModeration: v })} />
          <ToggleField label="API key configured" description="Credentials stored in secret manager" value={data.apiKeySet} onChange={(v) => onChange({ apiKeySet: v })} />
        </div>
      </SectionCard>
    </div>
  );
}
