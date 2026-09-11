'use client';

import { useState } from 'react';

type Prompt = {
  id: 'zh' | 'en' | 'negative';
  label: string;
  content: string;
};

export default function PromptCopyBlocks({
  promptZh,
  promptEn,
  negativePrompt,
}: {
  promptZh?: string;
  promptEn?: string;
  negativePrompt?: string;
}) {
  const prompts: Prompt[] = [
    promptZh && { id: 'zh', label: '中文提示词', content: promptZh },
    promptEn && { id: 'en', label: 'English prompt', content: promptEn },
    negativePrompt && { id: 'negative', label: '负面提示词', content: negativePrompt },
  ].filter((prompt): prompt is Prompt => Boolean(prompt));
  const [copiedId, setCopiedId] = useState<Prompt['id'] | null>(null);

  const copy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopiedId(prompt.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <section className="prompt-copy-blocks" aria-label="AI 生成提示词">
      {prompts.map((prompt) => (
        <article key={prompt.id} className="prompt-copy-block">
          <div className="prompt-copy-block__header">
            <h3>{prompt.label}</h3>
          </div>
          <p>{prompt.content}</p>
          <button className="prompt-copy-block__copy" type="button" onClick={() => void copy(prompt)}>
            {copiedId === prompt.id ? '已复制' : '复制'}
          </button>
        </article>
      ))}
    </section>
  );
}
