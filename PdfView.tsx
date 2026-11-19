import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  FileSearch, 
  BookOpen, 
  Copy, 
  Check, 
  AlertCircle,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { analyzePdfDocument } from '../services/api';
import { savePdfSession } from '../services/storage';

interface PdfViewProps {
  theme: 'dark' | 'light';
}

export const PdfView: React.FC<PdfViewProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfTextContent, setPdfTextContent] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qas, setQas] = useState<{ question: string; answer: string; timestamp: number }[]>([]);

  // Sample Documents for immediate 1-click testing
  const sampleDocuments = [
    {
      title: 'Quantum Physics & Double Slit Experiment',
      fileName: 'Quantum_Mechanics_Introduction.pdf',
      text: `Title: Introduction to Quantum Mechanics and Wave-Particle Duality
Author: Department of Modern Physics
Abstract: This academic document introduces the foundational principles of quantum physics, including Planck's constant, the photoelectric effect, Heisenberg's uncertainty principle, and wave-particle duality.

Section 1: The Quantum Revolution
In 1900, Max Planck proposed that energy is emitted or absorbed in discrete packets called 'quanta'. E = h * f, where h is Planck's constant (6.626 x 10^-34 J*s) and f is frequency. This resolved the Ultraviolet Catastrophe of classical blackbody radiation.

Section 2: The Double-Slit Experiment
When monochromatic light or electron beams pass through two parallel slits onto a detector screen, an interference pattern of bright and dark fringes emerges. This demonstrates wave nature. Crucially, when individual particles (like single electrons) are fired one at a time, the interference pattern still forms over time. However, if detectors are placed at the slits to observe which slit the particle passes through, the wave function collapses and the interference pattern disappears, demonstrating particle-like trajectories.

Section 3: Heisenberg Uncertainty Principle
Formulated by Werner Heisenberg in 1927, it states that the position (x) and momentum (p) of a particle cannot simultaneously be measured with arbitrary precision:
Δx * Δp >= ħ / 2
This is not an imperfection of measurement instruments, but an intrinsic mathematical property of quantum wave packets.

Section 4: Quantum Superposition & Entanglement
A quantum system remains in a linear combination of states until observed. When two particles interact such that their quantum states cannot be described independently, they are entangled (Einstein's 'spooky action at a distance'). Modern applications include Quantum Computing (qubits) and Quantum Key Distribution (QKD).`,
    },
    {
      title: 'Cellular Respiration & ATP Synthesis',
      fileName: 'Biology_Cellular_Respiration.pdf',
      text: `Title: Cellular Respiration, Glycolysis, and Oxidative Phosphorylation
Author: Department of Molecular & Cellular Biology
Overview: Cellular respiration is the biochemical process through which eukaryotic cells break down glucose to generate adenosine triphosphate (ATP), the universal chemical energy currency of life.

Phase 1: Glycolysis (Cytoplasm)
Glucose (C6H12O6) is broken down through a 10-step enzymatic pathway into two 3-carbon molecules of Pyruvate.
Net Energy Yield: 2 ATP (substrate-level phosphorylation) and 2 NADH. Does not require oxygen (anaerobic).

Phase 2: The Krebs / Citric Acid Cycle (Mitochondrial Matrix)
Pyruvate enters the mitochondrion, converted to Acetyl-CoA. Acetyl-CoA enters the Citric Acid Cycle.
Yield per glucose molecule: 6 NADH, 2 FADH2, 2 ATP, and 4 CO2 released as waste.

Phase 3: Oxidative Phosphorylation & Electron Transport Chain (Inner Mitochondrial Membrane)
High-energy electrons from NADH and FADH2 are transferred through protein complexes (I, II, III, IV).
This electron transfer pumps protons (H+) across the inner membrane, establishing a steep electrochemical proton gradient in the intermembrane space.
Chemiosmosis: Protons flow down this gradient through ATP Synthase (a molecular turbine rotor), phosphorylating ADP + Pi into ATP.
Oxygen acts as the terminal electron acceptor, binding protons to produce water (H2O).
Net total theoretical yield: 30 to 32 ATP per glucose molecule.`,
    },
    {
      title: 'Data Structures: Tree & Graph Algorithms',
      fileName: 'CS_Trees_and_Graphs.pdf',
      text: `Title: Comprehensive Guide to Tree & Graph Search Algorithms
Course: Advanced Computer Science & Algorithmic Analysis

1. Binary Search Trees (BST)
A binary tree where for each node N, all keys in the left subtree are smaller than N's key, and all keys in the right subtree are greater.
Average Time Complexity: Search, Insert, Delete = O(log N).
Worst Case (unbalanced/skewed): O(N).
Self-balancing variants: AVL Trees and Red-Black Trees guarantee O(log N) worst-case time by enforcing height invariants.

2. Graph Representation
- Adjacency Matrix: V x V 2D matrix. O(1) edge lookup, but O(V^2) space complexity. Suitable for dense graphs.
- Adjacency List: Array or map of linked lists/vectors. O(V + E) space complexity. Optimal for sparse graphs.

3. Breadth-First Search (BFS)
Traverses level-by-level using a Queue (FIFO).
Time Complexity: O(V + E).
Key Application: Finding the shortest path in unweighted graphs, peer-to-peer networks, web crawlers.

4. Depth-First Search (DFS)
Explores as deep as possible along each branch before backtracking using a Stack (or recursion).
Time Complexity: O(V + E).
Key Applications: Topological sorting in DAGs, cycle detection, connected components analysis.

5. Dijkstra's Algorithm
Finds shortest paths from a single source node to all other nodes in a weighted graph with non-negative weights using a min-priority queue.
Time Complexity: O((V + E) log V).`,
    },
  ];

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);
    setErrorMessage(null);
    setActiveAnalysis(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPdfBase64(result);
      setPdfTextContent(null);
    };
    reader.onerror = () => {
      setErrorMessage('Could not read the uploaded PDF file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Load Sample Doc
  const loadSampleDoc = (sample: typeof sampleDocuments[0]) => {
    setPdfFileName(sample.fileName);
    setPdfTextContent(sample.text);
    setPdfBase64(null);
    setActiveAnalysis(null);
    setErrorMessage(null);
  };

  const handleRunAnalysis = async (action: 'summarize' | 'ask' | 'explain_simple' | 'key_takeaways') => {
    if (!pdfBase64 && !pdfTextContent) {
      setErrorMessage('Please upload a PDF document or select a sample document first.');
      return;
    }

    if (action === 'ask' && !question.trim()) {
      setErrorMessage('Please enter a specific question to ask about the PDF document.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await analyzePdfDocument({
        pdfBase64: pdfBase64 || undefined,
        textContent: pdfTextContent || undefined,
        fileName: pdfFileName,
        action,
        question: action === 'ask' ? question.trim() : undefined,
      });

      setActiveAnalysis(res.analysis);

      if (action === 'ask') {
        const newQa = {
          question: question.trim(),
          answer: res.analysis,
          timestamp: Date.now(),
        };
        const updatedQas = [newQa, ...qas];
        setQas(updatedQas);

        savePdfSession({
          id: `pdf_${Date.now()}`,
          fileName: pdfFileName,
          uploadedAt: Date.now(),
          qas: updatedQas,
        });
      } else {
        savePdfSession({
          id: `pdf_${Date.now()}`,
          fileName: pdfFileName,
          uploadedAt: Date.now(),
          summary: res.analysis,
          qas,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze document.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAnalysis = () => {
    if (!activeAnalysis) return;
    navigator.clipboard.writeText(activeAnalysis);
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
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI PDF Reader & Document QA</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Extract insights, ask pinpoint questions, and simplify complex academic chapters.
            </p>
          </div>
        </div>

        {/* Upload Box */}
        <div className="mt-5">
          <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            pdfFileName 
              ? 'border-blue-500 bg-blue-500/5' 
              : isDark 
              ? 'border-slate-700 hover:border-slate-600 bg-slate-950/60' 
              : 'border-slate-300 hover:border-blue-400 bg-slate-50'
          }`}>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            {pdfFileName ? (
              <div className="flex items-center gap-3 text-sm">
                <FileCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <span className="font-bold block text-blue-500">{pdfFileName}</span>
                  <span className="text-xs text-slate-400">PDF loaded & ready for AI analysis. Click to change file.</span>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-semibold block">Click to upload PDF document</span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Supports lecture slides, research papers, study guides (Max 25MB)
                  </span>
                </div>
              </div>
            )}
          </label>
        </div>

        {/* Quick Sample Academic Documents */}
        <div className="mt-4 pt-3 border-t border-slate-500/10">
          <span className={`text-xs font-semibold block mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Or click a sample academic PDF to test instantly:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleDocuments.map((doc, idx) => (
              <button
                key={idx}
                onClick={() => loadSampleDoc(doc)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                  pdfFileName === doc.fileName
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{doc.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons for Document */}
      {(pdfFileName || pdfTextContent) && (
        <div className={`p-5 rounded-3xl border space-y-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
              1-Tap AI Actions
            </span>
            <span className="text-xs text-slate-400">Target: {pdfFileName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleRunAnalysis('summarize')}
              disabled={isLoading}
              className="p-3 rounded-2xl border text-left transition-all hover:border-blue-500 group flex items-start gap-2.5 bg-blue-500/5"
            >
              <FileSearch className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block group-hover:text-blue-500">Executive Summary</span>
                <span className="text-[11px] text-slate-400">Core overview & findings</span>
              </div>
            </button>

            <button
              onClick={() => handleRunAnalysis('explain_simple')}
              disabled={isLoading}
              className="p-3 rounded-2xl border text-left transition-all hover:border-indigo-500 group flex items-start gap-2.5 bg-indigo-500/5"
            >
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block group-hover:text-indigo-500">Explain Like I'm 5</span>
                <span className="text-[11px] text-slate-400">Beginner simple language</span>
              </div>
            </button>

            <button
              onClick={() => handleRunAnalysis('key_takeaways')}
              disabled={isLoading}
              className="p-3 rounded-2xl border text-left transition-all hover:border-purple-500 group flex items-start gap-2.5 bg-purple-500/5"
            >
              <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block group-hover:text-purple-500">Key Study Q&As</span>
                <span className="text-[11px] text-slate-400">Terms & practice questions</span>
              </div>
            </button>
          </div>

          {/* Ask Specific Question About the Document */}
          <div className="pt-2">
            <label className="text-xs font-semibold block mb-1.5">
              Ask a specific question about this document:
            </label>
            <div className={`flex items-center rounded-2xl border p-1.5 ${
              isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
            }`}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAnalysis('ask')}
                placeholder="e.g. What is the net ATP yield? What causes wave function collapse?"
                className="w-full py-2 px-3 text-xs sm:text-sm bg-transparent focus:outline-hidden"
              />
              <button
                onClick={() => handleRunAnalysis('ask')}
                disabled={!question.trim() || isLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold disabled:opacity-40 hover:bg-blue-500 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className={`p-6 rounded-2xl border flex items-center gap-3 text-xs font-medium ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
          <span>Pragyan AI is analyzing the PDF document with Gemini...</span>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* AI Analysis Result */}
      {activeAnalysis && (
        <div className={`p-5 rounded-3xl border space-y-3.5 shadow-md ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-500/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-sm">Document Analysis & Insights</span>
            </div>
            <button
              onClick={copyAnalysis}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap space-y-2">
            {activeAnalysis.split('\n\n').map((para, i) => (
              <p key={i}>
                {para.split('**').map((chunk, cIdx) => 
                  cIdx % 2 === 1 ? <strong key={cIdx} className="font-bold text-inherit">{chunk}</strong> : chunk
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Past Q&A for this session */}
      {qas.length > 0 && (
        <div className={`p-5 rounded-3xl border space-y-3 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-xs font-bold block text-slate-400 uppercase tracking-wider">
            Document Q&A History
          </span>
          <div className="space-y-3">
            {qas.map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl border text-xs space-y-1.5">
                <span className="font-bold text-blue-400 block">Q: {item.question}</span>
                <p className="opacity-90 whitespace-pre-wrap">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
