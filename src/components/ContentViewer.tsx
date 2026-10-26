import { useState } from 'react';
import type { ContentBlock, Mode } from '../domain';
import { Button } from './UI';
import { mutateLearning, openCoach, useLearning } from '../services/platform';
export function ContentViewer({ blocks, resourceId = 'lesson', title, mode = 'learn' }: { blocks: ContentBlock[]; resourceId?: string; title: string; mode?: Mode }) {
  const [selection, setSelection] = useState(''); const state = useLearning(); const highlights = state.highlights[resourceId] || []; const allowed = mode === 'learn' || mode === 'practice'; const suggestedWord = ['maintenance', 'substantial', 'community', 'neglected'].find(word => JSON.stringify(blocks).toLowerCase().includes(word));
  const marked = (text: string) => { const match = highlights.find(h => text.includes(h)); if (!match) return text; const index = text.indexOf(match); return <>{text.slice(0, index)}<mark>{match}</mark>{text.slice(index + match.length)}</>; };
  return <article className="content-viewer" aria-label={title} onMouseUp={() => { const text = window.getSelection()?.toString().trim().slice(0, 300); if (allowed && text) setSelection(text); }} onTouchEnd={() => { const text = window.getSelection()?.toString().trim().slice(0, 300); if (allowed && text) setSelection(text); }}>
    {allowed && <div className="content-tools"><span>Select a word or sentence to explore it.</span><Button kind="ghost" onClick={() => openCoach({ selectedText: selection || suggestedWord || title, resource: title, mode })}>Ask about {selection ? 'selection' : 'a word'}</Button>{selection && <Button kind="secondary" onClick={() => mutateLearning(s => { s.highlights[resourceId] = [...new Set([...(s.highlights[resourceId] || []), selection])]; })}>Highlight</Button>}<Button kind="ghost" onClick={() => mutateLearning(s => { s.highlights[resourceId] = []; })}>Clear highlights</Button></div>}
    {blocks.map((block, i) => {
      if (block.type === 'heading') return <h2 key={i}>{block.text}</h2>;
      if (block.type === 'paragraph' || block.type === 'transcript') return <p key={i}>{marked(block.text)}</p>;
      if (block.type === 'instruction') return <aside className="notice" key={i}>{block.text}</aside>;
      if (block.type === 'prompt') return <blockquote className="task-prompt" key={i}>{block.text}</blockquote>;
      if (block.type === 'rich_text') return <p key={i}>{block.parts.map((p, j) => p.emphasis ? <strong key={j}>{p.text}</strong> : <span key={j}>{marked(p.text)}</span>)}</p>;
      if (block.type === 'list') return <ul key={i}>{block.items.map(x => <li key={x}>{x}</li>)}</ul>;
      if (block.type === 'table') return <div className="table-scroll" key={i}><table><caption>{block.caption}</caption><thead><tr>{block.headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{block.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody></table></div>;
      if (block.type === 'chart') return <figure className="bar-chart" key={i}><figcaption>{block.caption}</figcaption>{block.values.map(v => <div key={v.label}><span>{v.label}</span><div><i style={{ width: `${v.value}%` }}/></div><strong>{v.value}%</strong></div>)}</figure>;
      if (block.type === 'image' || block.type === 'diagram') return <figure key={i}><img src={block.src} alt={block.alt}/><figcaption>{block.caption}</figcaption></figure>;
      return null;
    })}
  </article>;
}

