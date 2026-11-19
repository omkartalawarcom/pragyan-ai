import React, { useState } from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  Copy, 
  Check, 
  Upload, 
  BookOpen, 
  ListChecks, 
  HelpCircle, 
  Zap, 
  Save, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { summarizeNotes } from '../services/api';
import { saveSummary } from '../services/storage';

interface NotesSummarizerViewProps {
  theme: 'dark' | 'light';
  onSummarySaved?: () => void;
}

export const NotesSummarizerView: React.FC<NotesSummarizerViewProps> = ({
  theme,
  onSummarySaved,
}) => {
  const isDark = theme === 'dark';

  const [notesText, setNotesText] = useState('');
  const [mode, setMode] = useState<'comprehensive' | 'quick' | 'exam_prep'>('comprehensive');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'summary' | 'keypoints' | 'definitions' | 'questions' | 'cheatsheet'>('all');

  // Sample notes for 1-click student testing
  const sampleNotes = [
    {
      title: 'Machine Learning & Neural Networks',
      content: `Topic: Introduction to Machine Learning and Deep Neural Networks
Lecture Notes - Computer Science 401

Supervised Learning: The algorithm is trained on labeled data consisting of input features (x) and target labels (y). Common tasks: Classification (discrete categories like spam vs ham) and Regression (continuous values like house prices).
Unsupervised Learning: Finds latent patterns, groupings, or representations in unlabeled data. Examples: K-Means Clustering, Principal Component Analysis (PCA) for dimensionality reduction.

Deep Learning Architecture:
1. Artificial Neurons / Perceptrons: Compute a weighted sum of inputs plus a bias term, followed by an activation function: z = w*x + b, a = σ(z).
2. Activation Functions:
   - ReLU (Rectified Linear Unit): f(x) = max(0, x). Solves vanishing gradient in positive domain, computationally very fast.
   - Sigmoid: f(x) = 1 / (1 + e^-x). Squashes output between 0 and 1, used for binary classification output layers.
   - Softmax: Converts unnormalized logits into normalized probability distribution over K classes.
3. Loss Functions:
   - Mean Squared Error (MSE): for regression tasks.
   - Categorical Cross-Entropy: for multiclass classification.
4. Backpropagation & Optimization:
   - Calculates gradient of loss function with respect to weights using the calculus Chain Rule.
   - Gradient Descent: Updates weights in opposite direction of gradient: w = w - α * ∇L, where α is learning rate.
   - Overfitting vs Underfitting: Overfitting occurs when model memorizes training noise and fails to generalize. Countermeasures: Dropout (randomly deactivating nodes), L1/L2 Weight Regularization, Early Stopping, and Data Augmentation.`,
    },
    {
      title: 'Macroeconomics: Fiscal & Monetary Policy',
      content: `Topic: Macroeconomic Stabilization Policies: Fiscal vs Monetary Policy
Economics 202 - Macroeconomic Theory

Gross Domestic Product (GDP): Total market value of all final goods and services produced within a country in a year. Expenditure approach: Y = C + I + G + (X - M), where C = Consumption, I = Investment, G = Government Purchases, X = Exports, M = Imports.

1. Fiscal Policy:
Conducted by the government (legislative and executive branches) through taxation and government expenditure.
- Expansionary Fiscal Policy: Increasing government spending (G) or cutting taxes (T) to stimulate aggregate demand during recessions. Risk: Budget deficits and national debt.
- Contractionary Fiscal Policy: Decreasing spending or raising taxes to cool down an overheating economy and curb inflation.
- Keynesian Multiplier Effect: An initial increase in government spending leads to a more than proportional increase in national income. Multiplier = 1 / (1 - MPC), where MPC is Marginal Propensity to Consume.

2. Monetary Policy:
Conducted by the Central Bank (e.g., Federal Reserve, RBI, ECB) by managing the money supply and interest rates.
- Central Bank Tools:
  a. Policy Interest Rate (Repo / Federal Funds Rate)
  b. Reserve Requirements (cash reserves commercial banks must hold)
  c. Open Market Operations (buying or selling government securities)
- Expansionary (Dovish): Lowering interest rates encourages commercial borrowing, investment, and consumer credit.
- Contractionary (Hawkish): Raising rates slows inflation by increasing the cost of borrowing.
- The Phillips Curve: Short-run trade-off between inflation and unemployment. In the long run, the Phillips curve is vertical at the Natural Rate of Unemployment.`,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setNotesText(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsText(file);
  };

  const handleSummarize = async () => {
    if (!notesText.trim()) {
      setErrorMessage('Please enter or paste your notes before summarizing.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await summarizeNotes({
        notesText: notesText.trim(),
        mode,
      });

      setSummaryResult(response.summary);

      // Save summary
      saveSummary({
        id: `summary_${Date.now()}`,
        title: notesText.slice(0, 32).split('\n')[0] || 'Lecture Summary',
        createdAt: Date.now(),
        originalNotes: notesText.slice(0, 500),
        summaryText: response.summary,
        mode,
      });
      if (onSummarySaved) onSummarySaved();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to summarize notes.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-6">
      {/* Header Info */}
      <div className={`p-5 rounded-3xl border ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Notes Summarizer & Exam Prep</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Turn messy lecture notes into key points, definitions, formulas, and flashcard Q&As.
            </p>
          </div>
        </div>

        {/* Input Textarea & Tools */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Paste Notes or Lecture Transcript:</span>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .txt / .md</span>
                <input
                  type="file"
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={7}
            placeholder="Paste your raw notes, chapter text, or lecture transcripts here..."
            className={`w-full p-3.5 text-xs sm:text-sm rounded-2xl border resize-y focus:outline-hidden ${
              isDark 
                ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500' 
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />

          {/* Sample Notes Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[11px] font-medium mr-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Load sample notes:
            </span>
            {sampleNotes.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setNotesText(sample.content)}
                className={`text-[11px] px-3 py-1 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* Mode Selector & Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
              {(['comprehensive', 'quick', 'exam_prep'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                    mode === m ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'comprehensive' ? 'Full Study Guide' : m === 'quick' ? 'Quick Bullet Points' : 'Exam Flashcards'}
                </button>
              ))}
            </div>

            <button
              onClick={handleSummarize}
              disabled={isLoading || !notesText.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Summarizing & Structuring...' : 'Summarize Notes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* AI Summary Output Card */}
      {summaryResult && (
        <div className={`p-5 rounded-3xl border space-y-4 shadow-md ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-500/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-sm">High-Yield Revision Guide</span>
            </div>

            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>
          </div>

          {/* Formatted Markdown Content */}
          <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap space-y-3">
            {summaryResult.split('\n\n').map((paragraph, idx) => {
              // Highlight headers
              if (paragraph.startsWith('1.') || paragraph.startsWith('2.') || paragraph.startsWith('3.') || paragraph.startsWith('4.') || paragraph.startsWith('5.') || paragraph.startsWith('📌') || paragraph.startsWith('🎯') || paragraph.startsWith('📖') || paragraph.startsWith('❓') || paragraph.startsWith('⚡')) {
                return (
                  <div key={idx} className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 font-bold text-indigo-400">
                    {paragraph}
                  </div>
                );
              }
              return (
                <p key={idx}>
                  {paragraph.split('**').map((chunk, cIdx) => 
                    cIdx % 2 === 1 ? <strong key={cIdx} className="font-bold text-inherit">{chunk}</strong> : chunk
                  )}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
