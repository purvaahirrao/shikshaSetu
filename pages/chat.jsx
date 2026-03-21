// pages/chat.jsx
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Send, Volume2, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { sendChat } from '../services/api';
import AppShell from '../components/layout/AppShell';
import Avatar from '../components/ui/Avatar';
import Toast from '../components/ui/Toast';
import { getProgressUserId, recordChatTurn } from '../services/userProgress';

const CHAT_SUG_KEYS = ['chat_sug1', 'chat_sug2', 'chat_sug3', 'chat_sug4'];

function speak(text, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u  = new SpeechSynthesisUtterance(text);
  u.lang   = lang === 'hindi' ? 'hi-IN' : lang === 'marathi' ? 'mr-IN' : 'en-IN';
  u.rate   = 0.88;
  window.speechSynthesis.speak(u);
}

// Formats bot reply: answer + steps bullet list
function formatBotText(data, t) {
  let out = data.answer || '';
  if (data.steps?.length) {
    out += '\n\n' + data.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  }
  if (data.tip) out += `\n\n${t('chat_tipPrefix')} ${data.tip}`;
  return out.trim();
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const { t, locale } = useI18n();
  const router = useRouter();

  const [messages, setMessages] = useState(() => [
    { role: 'bot', text: t('chat_welcome') },
  ]);
  const [input,   setInput]   = useState('');
  const [sending, setSending] = useState(false);
  const [toast,   setToast]   = useState(null);
  const endRef   = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading]);

  useEffect(() => {
    setMessages((m) =>
      m.length === 1 && m[0].role === 'bot'
        ? [{ role: 'bot', text: t('chat_welcome') }]
        : m,
    );
  }, [locale, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setSending(true);
    try {
      const data = await sendChat(msg, user?.language || 'english');
      setMessages(m => [...m, { role: 'bot', text: formatBotText(data, t) }]);
      const pid = getProgressUserId(user);
      if (pid) recordChatTurn(pid, user);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: t('chat_serverError') }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <AppShell title={t('page_askDoubt')}>
      <div className="flex flex-col h-full">

        {/* ── Messages ──────────────────────────────────── */}
        <div className="flex-1 px-4 pt-4 pb-2 overflow-y-auto space-y-4">

          {/* Suggestion chips — shown only at start */}
          {messages.length === 1 && (
            <div className="animate-fade-up">
              <p className="text-xs font-700 text-slate-400 uppercase tracking-wide mb-2">{t('chat_tryAsking')}</p>
              <div className="flex flex-wrap gap-2">
                {CHAT_SUG_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => send(t(key))}
                    className="text-sm bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl shadow-card hover:border-brand-300 hover:text-brand-600 transition-colors font-500"
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2.5 animate-fade-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 mb-0.5">
                  <Sparkles size={16} className="text-white" />
                </div>
              )}

              <div className={`group relative max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-bot'}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Listen button on bot messages */}
                {msg.role === 'bot' && msg.text.length > 10 && (
                  <button
                    onClick={() => speak(msg.text, user?.language)}
                    className="mt-1.5 ml-1 flex items-center gap-1 text-xs text-slate-400 hover:text-brand-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Volume2 size={11} /> {t('chat_listen')}
                  </button>
                )}
              </div>

              {msg.role === 'user' && (
                <Avatar src={user?.photo} name={user?.name} size="sm" />
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex items-end gap-2.5 animate-fade-in">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="bubble-bot">
                <div className="flex items-center gap-1.5 py-1">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={endRef} className="h-1" />
        </div>

        {/* ── Input bar ──────────────────────────────────── */}
        <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-end gap-3">
          <textarea
            ref={inputRef}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-400 transition-all resize-none outline-none min-h-[46px] max-h-32 leading-relaxed"
            placeholder={t('chat_placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || sending}
            className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all shrink-0
              ${input.trim() && !sending
                ? 'bg-brand-500 text-white shadow-glow hover:bg-brand-600 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
          >
            {sending
              ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={17} />
            }
          </button>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppShell>
  );
}
