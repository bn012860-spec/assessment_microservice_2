import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

const formatValue = (val) => {
    if (val === undefined || val === null) return 'null';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
};

const SubmissionOutput = ({ output }) => {
    if (!output) return null;

    let parsed = output;
    if (typeof output === 'string') {
        try {
            parsed = JSON.parse(output);
        } catch (e) {
            return (
                <div className="verdict-banner verdict-error">
                    <XCircle size={20} />
                    <span>Error Parsing Output</span>
                </div>
            );
        }
    }

    const isSuccess = parsed.status === 'Success' || parsed.status === 'Accepted';
    const isError = ['Fail', 'Error', 'Wrong Answer', 'Runtime Error'].includes(parsed.status);
    
    let verdictClass = 'verdict-warning';
    let VerdictIcon = AlertTriangle;

    if (isSuccess) {
        verdictClass = 'verdict-success';
        VerdictIcon = CheckCircle2;
    } else if (isError) {
        verdictClass = 'verdict-error';
        VerdictIcon = XCircle;
    }

    const normalizedDetails = Array.isArray(parsed.details) ? parsed.details : [];
    const passedTests = parsed.passed ?? normalizedDetails.filter(d => d.passed || d.ok).length;
    const totalTests = parsed.total ?? Math.max(normalizedDetails.length, passedTests);
    
    const timeNum = Number(parsed.time);
    const timeStr = !isNaN(timeNum) ? `${timeNum.toFixed(0)} ms` : 'N/A';

    return (
        <div className="submission-result fade-in">
            {parsed.status && (
                <div className={`verdict-banner ${verdictClass}`}>
                    <VerdictIcon size={24} />
                    <span>{parsed.status}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div className="stat-card">
                    <span className="label">Tests Passed</span>
                    <span className="value" style={{ color: passedTests === totalTests && totalTests > 0 ? 'var(--success)' : (passedTests > 0 ? 'var(--warning)' : 'var(--error)') }}>
                        {passedTests} / {totalTests}
                    </span>
                </div>
                <div className="stat-card">
                    <span className="label">Runtime</span>
                    <span className="value flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                        <Clock size={16} className="text-muted" /> {timeStr}
                    </span>
                </div>
            </div>

            {parsed.error && (
                <div className="testcase-box mb-6 border-error" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <div className="testcase-header failed">
                        <div className="flex-center gap-2"><AlertTriangle size={16} /> Global Error</div>
                    </div>
                    <div className="testcase-body">
                        <pre style={{ color: 'var(--error)' }}>{parsed.error}</pre>
                    </div>
                </div>
            )}

            {normalizedDetails.length > 0 && (
                <div className="testcase-explorer">
                    <h4 className="text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Testcases</h4>
                    {normalizedDetails.map((detail, idx) => {
                        const passed = detail.passed ?? detail.ok ?? false;
                        const testNumber = detail.test ?? detail.testIndex ?? idx + 1;
                        
                        return (
                            <div key={idx} className="testcase-box">
                                <div className={`testcase-header ${passed ? 'passed' : 'failed'}`}>
                                    <div className="flex-center gap-2">
                                        {passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                        <span>Test #{testNumber}</span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {detail.time ? `${detail.time} ms` : ''}
                                    </span>
                                </div>
                                <div className="testcase-body">
                                    {detail.error && (
                                        <div className="testcase-field">
                                            <span className="label" style={{ color: 'var(--error)' }}>Error Message</span>
                                            <pre style={{ borderLeft: '3px solid var(--error)' }}>{detail.error}</pre>
                                        </div>
                                    )}

                                    {detail.inputs !== undefined && (
                                        <div className="testcase-field">
                                            <span className="label">Input</span>
                                            <pre>{formatValue(detail.inputs)}</pre>
                                        </div>
                                    )}
                                    
                                    {detail.expected !== undefined && (
                                        <div className="testcase-field">
                                            <span className="label">Expected Output</span>
                                            <pre>{formatValue(detail.expected)}</pre>
                                        </div>
                                    )}
                                    
                                    {detail.output !== undefined && (
                                        <div className="testcase-field">
                                            <span className="label">Your Output</span>
                                            <pre style={{ borderLeft: passed ? '3px solid var(--success)' : '3px solid var(--error)' }}>
                                                {formatValue(detail.output)}
                                            </pre>
                                        </div>
                                    )}

                                    {(detail.stdout || detail.stderr) && (
                                        <div className="testcase-field mt-4">
                                            <span className="label">Console Logs</span>
                                            <pre style={{ color: 'var(--text-secondary)' }}>
                                                {detail.stdout && `${detail.stdout}\n`}
                                                {detail.stderr && <span style={{ color: 'var(--error)' }}>{detail.stderr}</span>}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SubmissionOutput;
