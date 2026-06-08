import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Clock, CheckCircle2, ChevronRight, Terminal, Play, Send, Info, Code2, AlertCircle, ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';
import api, { assessments } from '../api';
import SubmissionOutput from '../components/SubmissionOutput';
import { mapType } from '../utils/typeValidator';

const supportedLanguages = ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'csharp', 'go'];

function buildTemplate(language, functionName, parameters, returnType) {
  const paramNames = (parameters || []).map(p => p.name);
  const params = paramNames.join(', ');

  const usesTree = (parameters || []).some(p => p.type && p.type.includes('tree')) || (returnType && returnType.includes('tree'));
  const usesList = (parameters || []).some(p => p.type && p.type.includes('linkedlist')) || (returnType && returnType.includes('linkedlist'));
  const usesGraph = (parameters || []).some(p => p.type && p.type.includes('graph')) || (returnType && returnType.includes('graph'));

  if (language === 'python') {
    let defs = '';
    if (usesList) defs += `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n`;
    if (usesTree) defs += `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n`;
    if (usesGraph) defs += `class Node:\n    def __init__(self, val=0, neighbors=None):\n        self.val = val\n        self.neighbors = neighbors if neighbors is not None else []\n\n`;
    defs += `def ${functionName}(${params}):\n    # your code here\n    pass`;
    return defs;
  }
  if (language === 'javascript') {
    let defs = '';
    if (usesList) defs += `class ListNode {\n  constructor(val=0, next=null) { this.val = val; this.next = next; }\n}\n\n`;
    if (usesTree) defs += `class TreeNode {\n  constructor(val=0, left=null, right=null) { this.val = val; this.left = left; this.right = right; }\n}\n\n`;
    if (usesGraph) defs += `class Node {\n  constructor(val=0, neighbors=[]) { this.val = val; this.neighbors = neighbors; }\n}\n\n`;
    defs += `function ${functionName}(${params}) {\n  // your code here\n}`;
    return defs;
  }
  if (language === 'typescript') {
    let defs = '';
    if (usesList) defs += `class ListNode {\n  val: number;\n  next: ListNode | null;\n  constructor(val=0, next=null) { this.val = val; this.next = next; }\n}\n\n`;
    if (usesTree) defs += `class TreeNode {\n  val: number;\n  left: TreeNode | null;\n  right: TreeNode | null;\n  constructor(val=0, left=null, right=null) { this.val = val; this.left = left; this.right = right; }\n}\n\n`;
    if (usesGraph) defs += `class Node {\n  val: number;\n  neighbors: Node[];\n  constructor(val=0, neighbors: Node[] = []) { this.val = val; this.neighbors = neighbors; }\n}\n\n`;
    defs += `function ${functionName}(${params}): any {\n  // your code here\n}`;
    return defs;
  }
  
  if (language === 'java') {
    const javaReturnType = mapType('java', returnType);
    const javaParams = (parameters || []).map(p => `${mapType('java', p.type)} ${p.name}`).join(', ');

    const usesTree = (parameters || []).some(p => p.type && p.type.includes('tree')) || (returnType && returnType.includes('tree'));
    const usesList = (parameters || []).some(p => p.type && p.type.includes('linkedlist')) || (returnType && returnType.includes('linkedlist'));
    const usesGraph = (parameters || []).some(p => p.type && p.type.includes('graph')) || (returnType && returnType.includes('graph'));

    let defs = 'import java.util.*;\n\n';
    // Show structure definitions as comments to avoid class name conflicts with wrapper
    if (usesList) {
      defs += `/*\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode() { val = 0; next = null; }\n    ListNode(int val) { this.val = val; next = null; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n*/\n\n`;
    }
    if (usesTree) {
      defs += `/*\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() { val = 0; left = right = null; }\n    TreeNode(int val) { this.val = val; left = right = null; }\n    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }\n}\n*/\n\n`;
    }
    if (usesGraph) {
      defs += `/*\nclass Node {\n    public int val;\n    public List<Node> neighbors;\n    public Node() { val = 0; neighbors = new ArrayList<>(); }\n    public Node(int val) { this.val = val; neighbors = new ArrayList<>(); }\n    public Node(int val, List<Node> neighbors) { this.val = val; this.neighbors = neighbors; }\n}\n*/\n\n`;
    }

    defs += `class Solution {\n    public ${javaReturnType} ${functionName}(${javaParams}) {\n        // your code here\n    }\n}`;
    return defs;
  }

  if (language === 'cpp') {
    const cppReturnType = mapType('cpp', returnType);
    const cppParams = (parameters || []).map(p => {
      const type = mapType('cpp', p.type);
      const isComplex = type.startsWith('vector') || type === 'string';
      return `${type}${isComplex ? '&' : ''} ${p.name}`;
    }).join(', ');
    
    let template = `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n\nusing namespace std;\n\n`;
    
    const usesTree = (parameters || []).some(p => p.type.includes('tree')) || returnType.includes('tree');
    const usesList = (parameters || []).some(p => p.type.includes('linkedlist')) || returnType.includes('linkedlist');
    
    if (usesList) {
      template += `/**\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode(int x) : val(x), next(nullptr) {}\n * };\n */\n\n`;
    }
    if (usesTree) {
      template += `/**\n * struct TreeNode {\n *     int val;\n *     TreeNode *left;\n *     TreeNode *right;\n *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n * };\n */\n\n`;
    }
    
    template += `class Solution {\npublic:\n    ${cppReturnType} ${functionName}(${cppParams}) {\n        // your code here\n    }\n};`;
    return template;
  }

  if (language === 'csharp') {
    const csReturnType = mapType('csharp', returnType);
    const csParams = (parameters || []).map(p => `${mapType('csharp', p.type)} ${p.name}`).join(', ');
    const usesTreeCS = (parameters || []).some(p => p.type && p.type.includes('tree')) || (returnType && returnType.includes('tree'));
    const usesListCS = (parameters || []).some(p => p.type && p.type.includes('linkedlist')) || (returnType && returnType.includes('linkedlist'));
    const usesGraphCS = (parameters || []).some(p => p.type && p.type.includes('graph')) || (returnType && returnType.includes('graph'));
    let defsCS = `using System;\nusing System.Collections.Generic;\n\n`;
    // Show as comments to avoid duplicate type definitions at compile time
    if (usesListCS) defsCS += `/*\npublic class ListNode { public int val; public ListNode next; public ListNode(int x=0) { val = x; next = null; } }\n*/\n\n`;
    if (usesTreeCS) defsCS += `/*\npublic class TreeNode { public int val; public TreeNode left; public TreeNode right; public TreeNode(int x=0) { val = x; left = right = null; } }\n*/\n\n`;
    if (usesGraphCS) defsCS += `/*\npublic class Node { public int val; public List<Node> neighbors; public Node() { neighbors = new List<Node>(); } public Node(int v) { val = v; neighbors = new List<Node>(); } }\n*/\n\n`;
    defsCS += `public class Solution {\n    public ${csReturnType} ${functionName}(${csParams}) {\n        // your code here\n    }\n}`;
    return defsCS;
  }

  if (language === 'go') {
    const goReturnType = mapType('go', returnType);
    const goParams = (parameters || []).map(p => `${p.name} ${mapType('go', p.type)}`).join(', ');
    let defsGo = `package main\n\n`;
    // Show type definitions as comments to avoid duplicate type names when wrapper also defines helpers
    if (usesList) defsGo += `/*\ntype ListNode struct { Val int; Next *ListNode }\n*/\n\n`;
    if (usesTree) defsGo += `/*\ntype TreeNode struct { Val int; Left *TreeNode; Right *TreeNode }\n*/\n\n`;
    if (usesGraph) defsGo += `/*\ntype Node struct { Val int; Neighbors []*Node }\n*/\n\n`;
    defsGo += `func ${functionName}(${goParams}) ${goReturnType} {\n    // your code here\n    return ${goReturnType === 'string' ? '\"\"' : goReturnType === 'bool' ? 'false' : goReturnType.includes('[]') ? 'nil' : '0'}\n}`;
    return defsGo;
  }

  if (language === 'c') return `long ${functionName}(long *args, int argc) {\n    // your code here\n    return 0;\n}`;
  return `public class UserSolution {\n    public object ${functionName}(${paramNames.map((p) => `object ${p}`).join(', ')}) {\n        // your code here\n        return null;\n    }\n}`;
}

const AssessmentWorkspace = ({ user }) => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [attempt, setAttempt] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [codeMap, setCodeMap] = useState({}); // problemId -> code
  const [langMap, setLangMap] = useState({}); // problemId -> language
  const [submissionMap, setSubmissionMap] = useState({}); // problemId -> submission object
  const intervalRefs = useRef({}); // problemId -> intervalId

  const [timeLeft, setTimeLeft] = useState(null);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleTab, setConsoleTab] = useState('testcases');

  const [testCasesMap, setTestCasesMap] = useState({});
  const [activeTestCaseIdxMap, setActiveTestCaseIdxMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attemptRes = await assessments.getAttempt(attemptId);
        const attemptData = attemptRes.data;
        setAttempt(attemptData);

        const assessmentRes = await assessments.get(attemptData.assessmentId._id || attemptData.assessmentId);
        const assessmentData = assessmentRes.data;
        setAssessment(assessmentData);

        const problemPromises = assessmentData.problems.map(p => api.get(`/api/problems/${p.problemId._id || p.problemId}`));
        const problemResponses = await Promise.all(problemPromises);
        const fullProblems = problemResponses.map(r => r.data);
        setProblems(fullProblems);

        const initialCodeMap = {};
        const initialLangMap = {};
        const initialTestCasesMap = {};
        const initialActiveIdxMap = {};

        fullProblems.forEach(p => {
          const lang = assessmentData.allowedLanguages?.[0] || 'python';
          initialLangMap[p._id] = lang;
          initialCodeMap[p._id] = buildTemplate(lang, p.functionName, p.parameters, p.returnType);

          const samples = (p.testCases || []).filter(tc => tc.isSample);
          initialTestCasesMap[p._id] = samples.length > 0 
            ? samples.map(tc => typeof tc.inputs === 'string' ? tc.inputs : JSON.stringify(tc.inputs)) 
            : ['[]'];
          initialActiveIdxMap[p._id] = 0;
        });
        
        setCodeMap(initialCodeMap);
        setLangMap(initialLangMap);
        setTestCasesMap(initialTestCasesMap);
        setActiveTestCaseIdxMap(initialActiveIdxMap);

        const startTime = new Date(attemptData.startedAt).getTime();
        const durationMs = assessmentData.durationMinutes * 60 * 1000;
        const endTime = startTime + durationMs;
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeLeft(remaining);

      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load assessment workspace');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attemptId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    // Anti-cheating: Tab Switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        assessments.logEvent(attemptId, 'TAB_SWITCH').catch(() => {});
      }
    };

    // Anti-cheating: Copy/Paste
    const handleCopy = () => {
      assessments.logEvent(attemptId, 'COPY').catch(() => {});
    };

    const handlePaste = () => {
      assessments.logEvent(attemptId, 'PASTE').catch(() => {});
    };

    // Anti-cheating: Fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        assessments.logEvent(attemptId, 'FULLSCREEN_EXIT').catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Try to enter fullscreen (user must have interacted first, so we do it on a slight delay or wait for interaction)
    // Actually, browser usually blocks automatic fullscreen. We can prompt the user.
    const enterFS = () => {
       if (document.documentElement.requestFullscreen) {
         document.documentElement.requestFullscreen().catch(() => {});
       }
       document.removeEventListener('click', enterFS);
    };
    document.addEventListener('click', enterFS);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('click', enterFS);
    };
  }, [attemptId, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/assessment-attempt/${attemptId}/result`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, attemptId, navigate]);

  const currentProblem = problems[currentProblemIndex];

  const handleLanguageChange = (problemId, lang) => {
    setLangMap(prev => ({ ...prev, [problemId]: lang }));
    setCodeMap(prev => ({ 
      ...prev, 
      [problemId]: buildTemplate(lang, currentProblem.functionName, currentProblem.parameters, currentProblem.returnType) 
    }));
  };

  const handleCodeChange = (problemId, code) => {
    setCodeMap(prev => ({ ...prev, [problemId]: code }));
  };

  const handleTestCaseChange = (problemId, idx, value) => {
    setTestCasesMap(prev => {
      const next = [...(prev[problemId] || [])];
      next[idx] = value;
      return { ...prev, [problemId]: next };
    });
  };

  const handleAddTestCase = (problemId) => {
    setTestCasesMap(prev => ({ ...prev, [problemId]: [...(prev[problemId] || []), '[]'] }));
    setActiveTestCaseIdxMap(prev => ({ ...prev, [problemId]: (testCasesMap[problemId] || []).length }));
  };

  const handleRemoveTestCase = (problemId, idx) => {
    setTestCasesMap(prev => {
      const next = [...(prev[problemId] || [])];
      if (next.length <= 1) return prev;
      next.splice(idx, 1);
      return { ...prev, [problemId]: next };
    });
    setActiveTestCaseIdxMap(prev => {
      const currentIdx = prev[problemId] || 0;
      return { ...prev, [problemId]: currentIdx >= idx ? Math.max(0, currentIdx - 1) : currentIdx };
    });
  };

  const checkStatus = async (submissionId, problemId) => {
    try {
      const res = await api.get(`/api/submissions/${submissionId}`);
      const submission = res.data;
      setSubmissionMap(prev => ({ ...prev, [problemId]: submission }));

      if (['Success', 'Fail', 'Error'].includes(submission.status)) {
        clearInterval(intervalRefs.current[problemId]);
        delete intervalRefs.current[problemId];
      }
    } catch (err) {
      clearInterval(intervalRefs.current[problemId]);
      delete intervalRefs.current[problemId];
    }
  };

  const [isRunning, setIsRunning] = useState(false);
  const [runResultMap, setRunResultMap] = useState({});

  const handleRun = async () => {
    const currentProblem = problems[currentProblemIndex];
    if (!currentProblem) return;

    setIsRunning(true);
    setShowConsole(true);
    setConsoleTab('result');
    setRunResultMap(prev => ({ ...prev, [currentProblem._id]: null }));
    setSubmissionMap(prev => ({ ...prev, [currentProblem._id]: null }));

    let tests = [];
    const tcs = testCasesMap[currentProblem._id] || ['[]'];
    try {
      tests = tcs.map(tcStr => {
        const parsed = JSON.parse(tcStr || '[]');
        const inputArr = Array.isArray(parsed) ? parsed : [parsed];
        return { inputs: inputArr, expected: null, isSample: true };
      });
    } catch (err) {
      setRunResultMap(prev => ({ 
        ...prev, 
        [currentProblem._id]: { status: 'Error', error: 'Invalid JSON in one of the test cases.' }
      }));
      setIsRunning(false);
      return;
    }

    try {
      const res = await api.post(`/api/problems/${currentProblem._id}/run`, {
        code: codeMap[currentProblem._id],
        language: langMap[currentProblem._id],
        customTests: tests
      });
      setRunResultMap(prev => ({ ...prev, [currentProblem._id]: res.data }));
    } catch (err) {
      setRunResultMap(prev => ({ ...prev, [currentProblem._id]: { status: 'Error', error: 'Failed to run code' } }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    const problemId = currentProblem._id;
    if (intervalRefs.current[problemId]) return;

    setShowConsole(true);
    setConsoleTab('result');
    setRunResultMap(prev => ({ ...prev, [problemId]: null }));
    
    try {
      setSubmissionMap(prev => ({ ...prev, [problemId]: { status: 'Submitting...' } }));
      const res = await api.post('/api/submissions', {
        problemId,
        code: codeMap[problemId],
        language: langMap[problemId],
        assessmentId: assessment._id,
        attemptId: attempt._id
      });
      const newSubmission = res.data;
      setSubmissionMap(prev => ({ ...prev, [problemId]: newSubmission }));
      intervalRefs.current[problemId] = setInterval(() => checkStatus(newSubmission._id, problemId), 2000);
    } catch (err) {
      setSubmissionMap(prev => ({ ...prev, [problemId]: { status: 'Error', error: 'Submission failed' } }));
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const finishAssessment = async () => {
    if (window.confirm('Are you sure you want to finish the assessment?')) {
      try {
        await assessments.submitAttempt(attemptId);
        navigate(`/assessment-attempt/${attemptId}/result`);
      } catch (err) {
        alert('Failed to finish assessment. Please try again.');
      }
    }
  };

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('modern-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0d1117',
        'editor.lineHighlightBackground': '#161b22',
        'editorLineNumber.foreground': '#484f58',
        'editorIndentGuide.background': '#21262d',
      }
    });
  };

  if (loading) return <div className="container flex-center" style={{ height: '100vh' }}><Loader2 className="spin" size={48} color="var(--primary)" /></div>;
  if (error) return <div className="container error-box">{error}</div>;
  if (!currentProblem) return <div className="container">No problems found.</div>;

  const currentSubmission = submissionMap[currentProblem._id];
  const isJudging = currentSubmission && ['Submitting...', 'Pending', 'Running'].includes(currentSubmission.status);
  const currentRunResult = runResultMap[currentProblem._id];
  
  const currentTestCases = testCasesMap[currentProblem._id] || ['[]'];
  const currentActiveIdx = activeTestCaseIdxMap[currentProblem._id] || 0;

  return (
    <div className="ide-layout fade-in">
      {/* Sidebar: Navigation & Timer */}
      <div className="workspace-sidebar" style={{ width: '320px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', textAlign: 'center', background: 'var(--surface)' }}>
          <div className="flex-center gap-2 mb-2" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.1em' }}>
            <Clock size={14} /> Time Remaining
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: timeLeft < 300 ? 'var(--error)' : 'var(--primary)', fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Problems</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {problems.map((p, idx) => (
              <button
                key={p._id}
                onClick={() => setCurrentProblemIndex(idx)}
                className={`button ${currentProblemIndex === idx ? '' : 'button-outline'}`}
                style={{ 
                  textAlign: 'left', 
                  justifyContent: 'flex-start',
                  padding: '12px 16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  border: currentProblemIndex === idx ? 'none' : '1px solid var(--border)'
                }}
              >
                <span style={{ marginRight: '10px', opacity: 0.6 }}>{idx + 1}.</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                {submissionMap[p._id]?.status === 'Success' && <CheckCircle2 size={16} color="var(--success)" style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <button 
            className="button" 
            style={{ width: '100%', background: 'var(--success)', padding: '14px', fontSize: '1rem', border: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
            onClick={finishAssessment}
          >
            <CheckCircle2 size={20} />
            Finish Assessment
          </button>
        </div>
      </div>

      {/* Main IDE Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="workspace-main" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Problem Description */}
          <div className="workspace-description" style={{ width: '420px', minWidth: '320px', overflowY: 'auto', padding: '32px', borderRight: '1px solid var(--border)', background: 'var(--bg)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>{currentProblem.title}</h2>
            <div className="flex-gap mb-6">
              <span className={`tag difficulty-${currentProblem.difficulty.toLowerCase()}`}>{currentProblem.difficulty}</span>
              <span className="tag">Score: {assessment.problems[currentProblemIndex]?.maxScore || 100}</span>
            </div>
            
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
              {currentProblem.description}
            </div>
            
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Specs</h4>
              <div style={{ display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
                <p><strong>Function:</strong> <code style={{ color: 'var(--primary)', background: 'transparent' }}>{currentProblem.functionName}</code></p>
                <p><strong>Return:</strong> <code style={{ color: 'var(--success)', background: 'transparent' }}>{currentProblem.returnType}</code></p>
                <p><strong>Params:</strong> {(currentProblem.parameters || []).map(p => `${p.name} (${p.type})`).join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="workspace-editor" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--editor-bg)', boxShadow: 'inset 1px 1px 4px rgba(0,0,0,0.2)' }}>
            <div className="ide-toolbar">
              <div className="flex-center gap-4">
                <div className="flex-center gap-2">
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Language</span>
                  <select
                    value={langMap[currentProblem._id]}
                    onChange={(e) => handleLanguageChange(currentProblem._id, e.target.value)}
                    disabled={isJudging}
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem', background: 'var(--bg)' }}
                  >
                    {(assessment.allowedLanguages?.length > 0 ? assessment.allowedLanguages : supportedLanguages).map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-center gap-2">
                <button onClick={handleRun} disabled={isRunning || isJudging} className="button button-outline" style={{ height: '36px', padding: '0 16px', fontSize: '0.85rem', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Play size={14} /> Run
                </button>
                <button onClick={handleSubmit} disabled={isRunning || isJudging} className="button button-primary" style={{ height: '36px', padding: '0 20px', fontSize: '0.85rem' }}>
                  <Send size={14} /> Submit
                </button>
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
              <Editor
                height="100%"
                language={langMap[currentProblem._id] === 'python' ? 'python' : langMap[currentProblem._id] === 'javascript' ? 'javascript' : langMap[currentProblem._id]}
                theme="modern-dark"
                value={codeMap[currentProblem._id]}
                onChange={(val) => handleCodeChange(currentProblem._id, val)}
                beforeMount={handleEditorWillMount}
                options={{
                  fontSize: 15,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 20, bottom: 20 },
                  renderLineHighlight: 'all'
                }}
              />
            </div>

            {/* Developer Console Drawer */}
            <div className="console-drawer" style={{ height: showConsole ? '35%' : '44px' }}>
              <div className="console-header">
                <div className="console-tabs">
                  <button 
                    className={`console-tab ${consoleTab === 'testcases' ? 'active' : ''}`} 
                    onClick={() => { setConsoleTab('testcases'); setShowConsole(true); }}
                  >
                    Testcases
                  </button>
                  <button 
                    className={`console-tab ${consoleTab === 'console' ? 'active' : ''}`} 
                    onClick={() => { setConsoleTab('console'); setShowConsole(true); }}
                  >
                    Console
                  </button>
                  <button 
                    className={`console-tab ${consoleTab === 'result' ? 'active' : ''}`} 
                    onClick={() => { setConsoleTab('result'); setShowConsole(true); }}
                  >
                    Result
                  </button>
                </div>
                <div className="flex-center gap-2">
                  <button className="text-muted flex-center" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} onClick={() => setShowConsole(!showConsole)}>
                    {showConsole ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                </div>
              </div>

              {showConsole && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                  {(isRunning || isJudging) ? (
                    <div className="flex-center fade-in" style={{ height: '100%', flexDirection: 'column', gap: '16px' }}>
                      <Loader2 className="spin" size={32} color="var(--primary)" />
                      <p className="text-muted" style={{ fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        {isRunning ? 'Executing Code...' : 'Judging Submission...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {consoleTab === 'testcases' && (
                        <div className="fade-in">
                          <div className="flex-between mb-4">
                            <div className="flex-center gap-2" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
                              {currentTestCases.map((tc, idx) => (
                                <button 
                                  key={idx} 
                                  onClick={() => setActiveTestCaseIdxMap(prev => ({ ...prev, [currentProblem._id]: idx }))} 
                                  className="button"
                                  style={{ 
                                    padding: '4px 12px', 
                                    fontSize: '0.8rem',
                                    borderRadius: '100px',
                                    background: currentActiveIdx === idx ? 'var(--primary-glow)' : 'var(--bg)',
                                    color: currentActiveIdx === idx ? 'var(--primary)' : 'var(--text-secondary)',
                                    border: `1px solid ${currentActiveIdx === idx ? 'var(--primary)' : 'var(--border)'}` 
                                  }}
                                >
                                  Case {idx + 1}
                                </button>
                              ))}
                              <button 
                                onClick={() => handleAddTestCase(currentProblem._id)} 
                                className="button"
                                style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '100px', background: 'var(--bg)', border: '1px dashed var(--border)', color: 'var(--text-secondary)' }}
                              >
                                + Add Case
                              </button>
                            </div>
                            {currentTestCases.length > 1 && (
                              <button onClick={() => handleRemoveTestCase(currentProblem._id, currentActiveIdx)} className="text-muted" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>JSON Input Array</label>
                            <textarea
                              value={currentTestCases[currentActiveIdx] || ''}
                              onChange={(e) => handleTestCaseChange(currentProblem._id, currentActiveIdx, e.target.value)}
                              placeholder='e.g., [[2,7,11,15], 9]'
                              style={{ height: '120px', fontSize: '0.9rem', fontFamily: "'JetBrains Mono', monospace", background: 'var(--bg)', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text)' }}
                            />
                          </div>
                        </div>
                      )}

                      {consoleTab === 'result' && (
                        <div className="fade-in">
                          {currentRunResult && <SubmissionOutput output={currentRunResult} />}
                          {currentSubmission && !currentRunResult && <SubmissionOutput output={currentSubmission.output || { status: currentSubmission.status }} />}
                          {!currentRunResult && !currentSubmission && (
                            <div className="flex-center" style={{ height: '100px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              Run your code to see results here.
                            </div>
                          )}
                        </div>
                      )}

                      {consoleTab === 'console' && (
                        <div className="fade-in">
                          <div className="flex-center" style={{ height: '100px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Raw stdout logs will appear here during execution.
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentWorkspace;
