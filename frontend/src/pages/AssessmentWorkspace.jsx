import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { assessments } from '../api';
import SubmissionOutput from '../components/SubmissionOutput';

const supportedLanguages = ['python', 'javascript', 'java', 'c', 'csharp'];

function buildTemplate(language, functionName, parameters) {
  const paramNames = (parameters || []).map(p => p.name);
  const params = paramNames.join(', ');

  if (language === 'python') return `def ${functionName}(${params}):\n    # your code here\n    pass`;
  if (language === 'javascript') return `function ${functionName}(${params}) {\n  // your code here\n}`;
  if (language === 'java') return `import java.util.*;\n\nclass Solution {\n    public Object ${functionName}(${(parameters || []).map(p => `Object ${p.name}`).join(', ')}) {\n        // your code here\n        return null;\n    }\n}`;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attemptRes = await assessments.getAttempt(attemptId);
        const attemptData = attemptRes.data;
        setAttempt(attemptData);

        const assessmentRes = await assessments.get(attemptData.assessmentId._id || attemptData.assessmentId);
        const assessmentData = assessmentRes.data;
        setAssessment(assessmentData);

        // Fetch full problem details for all problems in assessment
        const problemPromises = assessmentData.problems.map(p => api.get(`/api/problems/${p.problemId._id || p.problemId}`));
        const problemResponses = await Promise.all(problemPromises);
        const fullProblems = problemResponses.map(r => r.data);
        setProblems(fullProblems);

        // Initialize code templates
        const initialCodeMap = {};
        const initialLangMap = {};
        fullProblems.forEach(p => {
          const lang = assessmentData.allowedLanguages?.[0] || 'python';
          initialLangMap[p._id] = lang;
          initialCodeMap[p._id] = buildTemplate(lang, p.functionName, p.parameters);
        });
        setCodeMap(initialCodeMap);
        setLangMap(initialLangMap);

        // Calculate initial time left
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

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit logic or redirect to results
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
      [problemId]: buildTemplate(lang, currentProblem.functionName, currentProblem.parameters) 
    }));
  };

  const handleCodeChange = (problemId, code) => {
    setCodeMap(prev => ({ ...prev, [problemId]: code }));
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

  const handleSubmit = async () => {
    const problemId = currentProblem._id;
    if (intervalRefs.current[problemId]) return;

    const payload = {
      problemId,
      code: codeMap[problemId],
      language: langMap[problemId],
      assessmentId: assessment._id,
      attemptId: attempt._id
    };

    try {
      setSubmissionMap(prev => ({ ...prev, [problemId]: { status: 'Submitting...' } }));
      const res = await api.post('/api/submissions', payload);
      const newSubmission = res.data;
      setSubmissionMap(prev => ({ ...prev, [problemId]: newSubmission }));

      intervalRefs.current[problemId] = setInterval(() => {
        checkStatus(newSubmission._id, problemId);
      }, 2000);
    } catch (err) {
      setSubmissionMap(prev => ({ ...prev, [problemId]: { status: 'Error', output: 'Submission failed' } }));
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

  if (loading) return <div className="container">Loading workspace...</div>;
  if (error) return <div className="container error">{error}</div>;
  if (!currentProblem) return <div className="container">No problems found.</div>;

  const currentSubmission = submissionMap[currentProblem._id];
  const isJudging = currentSubmission && ['Submitting...', 'Pending', 'Running'].includes(currentSubmission.status);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', gap: '20px', padding: '20px' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', borderRight: '1px solid #ddd', paddingRight: '20px' }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: 0 }}>Time Remaining</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: timeLeft < 300 ? '#e74c3c' : '#2c3e50' }}>
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <h4>Problems</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {problems.map((p, idx) => (
            <button
              key={p._id}
              onClick={() => setCurrentProblemIndex(idx)}
              className={`button ${currentProblemIndex === idx ? '' : 'button-outline'}`}
              style={{ textAlign: 'left', background: currentProblemIndex === idx ? '#3498db' : 'transparent', color: currentProblemIndex === idx ? 'white' : '#3498db' }}
            >
              {idx + 1}. {p.title}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button 
            className="button" 
            style={{ width: '100%', background: '#2ecc71' }}
            onClick={finishAssessment}
          >
            Finish Assessment
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
          {/* Problem Description */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
            <h2>{currentProblem.title}</h2>
            <div className="flex-gap mb-20">
              <span className={`tag difficulty-${currentProblem.difficulty.toLowerCase()}`}>{currentProblem.difficulty}</span>
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{currentProblem.description}</p>
            
            <hr />
            <p><strong>Function:</strong> <code>{currentProblem.functionName}</code></p>
            <p><strong>Parameters:</strong> {(currentProblem.parameters || []).map(p => `${p.name} (${p.type})`).join(', ')}</p>
            <p><strong>Return Type:</strong> <code>{currentProblem.returnType}</code></p>
          </div>

          {/* Editor Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Language:</label>
              <select
                value={langMap[currentProblem._id]}
                onChange={(e) => handleLanguageChange(currentProblem._id, e.target.value)}
                disabled={isJudging}
                style={{ padding: '5px' }}
              >
                {(assessment.allowedLanguages?.length > 0 ? assessment.allowedLanguages : supportedLanguages).map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <textarea
              style={{ 
                flex: 1, 
                fontFamily: 'monospace', 
                padding: '10px', 
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'none'
              }}
              value={codeMap[currentProblem._id]}
              onChange={(e) => handleCodeChange(currentProblem._id, e.target.value)}
              disabled={isJudging}
            />

            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="button" 
                onClick={handleSubmit}
                disabled={isJudging}
              >
                {isJudging ? 'Judging...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        </div>

        {/* Output Area */}
        <div style={{ height: '200px', marginTop: '20px', borderTop: '2px solid #ddd', paddingTop: '10px', overflowY: 'auto' }}>
          <h4>Submission Result: {currentSubmission ? currentSubmission.status : 'Not submitted'}</h4>
          {currentSubmission && currentSubmission.output && (
            <SubmissionOutput output={currentSubmission.output} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentWorkspace;
