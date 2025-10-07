import React, { useState, useEffect } from 'react';
import { useCreateSubmissionMutation, useGetSubmissionsQuery, useDeleteSubmissionMutation } from '../store/api/dataApi';
import { Upload, Trash2 } from 'lucide-react';

export default function DashboardHome() {
  const [rowCount, setRowCount] = useState(1);
  const [textInputs, setTextInputs] = useState<string[]>(['']);
  const [textareaValue, setTextareaValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [createSubmission] = useCreateSubmissionMutation();
  const { data: submissions, refetch } = useGetSubmissionsQuery();
  const [deleteSubmissionMutation] = useDeleteSubmissionMutation();

  useEffect(() => {
    if (rowCount <= 5) {
      setTextInputs(Array(1).fill(''));
      setTextareaValue('');
      setFile(null);
    } else if (rowCount <= 10) {
      setTextInputs([]);
      setTextareaValue('');
      setFile(null);
    } else {
      setTextInputs([]);
      setTextareaValue('');
    }
  }, [rowCount]);

  const addTextInput = () => {
    if (textInputs.length < 5) {
      setTextInputs([...textInputs, '']);
    }
  };

  const updateTextInput = (index: number, value: string) => {
    const newInputs = [...textInputs];
    newInputs[index] = value;
    setTextInputs(newInputs);
  };

  const removeTextInput = (index: number) => {
    if (textInputs.length > 1) {
      setTextInputs(textInputs.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      let submissionData: any = {};
      let submissionType: 'text' | 'textarea' | 'file' = 'text';

      if (rowCount <= 5) {
        submissionType = 'text';
        submissionData = { inputs: textInputs.filter(input => input.trim()) };
      } else if (rowCount <= 10) {
        submissionType = 'textarea';
        submissionData = { content: textareaValue };
      } else {
        submissionType = 'file';
        if (file) {
          submissionData = {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          };
        }
      }

      await createSubmission({
        row_count: rowCount,
        submission_type: submissionType,
        data: submissionData,
      }).unwrap();

      setMessage('Data submitted successfully!');
      setTextInputs(['']);
      setTextareaValue('');
      setFile(null);
      refetch();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to submit data');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      await deleteSubmissionMutation(id).unwrap();
    } catch (error) {
      console.error('Failed to delete submission:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transition-colors">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Data Entry</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Number of Rows: <span className="text-blue-600 dark:text-cyan-400 font-bold">{rowCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={rowCount}
                onChange={(e) => setRowCount(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>1</span>
                <span>20</span>
              </div>
            </div>

            {rowCount <= 5 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Text Inputs</label>
                {textInputs.map((input, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => updateTextInput(index, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                      placeholder={`Row ${index + 1}`}
                      required
                    />
                    {textInputs.length > 1 && (
                      <button type="button" onClick={() => removeTextInput(index)} className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                {textInputs.length < 5 && (
                  <button type="button" onClick={addTextInput} className="w-full px-4 py-3 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">+ Add Input</button>
                )}
              </div>
            )}

            {rowCount > 5 && rowCount <= 10 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Textarea Input</label>
                <textarea value={textareaValue} onChange={(e) => setTextareaValue(e.target.value)} rows={6} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent outline-none transition-all" placeholder="Enter your data here..." required />
              </div>
            )}

            {rowCount > 10 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">File Upload</label>
                <div className="relative">
                  <input type="file" id="file-upload" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" required />
                  <label htmlFor="file-upload" className="block border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-12 text-center hover:border-blue-500 dark:hover:border-cyan-500 transition-all cursor-pointer bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 group">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{file ? 'Change File' : 'Choose a file'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">or drag and drop it here</p>
                      </div>
                      {file && (
                        <div className="mt-4 px-6 py-3 bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div className="text-left flex-1">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">{file.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-xl text-sm ${message.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                {message}
              </div>
            )}

            <button type="submit" disabled={submitting} className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{submitting ? 'Submitting...' : 'Submit Data'}</button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transition-colors">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Recent Submissions</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {submissions && submissions.length > 0 ? (
              submissions.map((submission) => (
                <div key={submission.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{submission.submission_type}</span>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Rows: {submission.row_count}</p>
                    </div>
                    <button onClick={() => deleteSubmission(submission.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{new Date(submission.created_at).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">No submissions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
