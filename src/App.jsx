import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [activeStep, setActiveStep] = useState(0)
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiForm, setAiForm] = useState({ 
    role: '', 
    background: '', 
    pdfBase64: null,
    apiKey: 'AIzaSyBmARJywXgsbj8m0knGd7DXf5D-R56mExY'
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [analysis, setAnalysis] = useState({ atsScore: 0, recruiterRating: 0, recommendations: [] })
  
  // High-End Initial Loader Effect
  useState(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const [resumeData, setResumeData] = useState({
    personal: { fullName: 'Shashank Bajoria', title: 'Senior Software Engineer', email: 'shashank@example.com', phone: '+1 234 567 890', location: 'San Francisco, CA', summary: 'Experienced software engineer with a passion for building scalable web applications and AI-driven solutions.' },
    experience: [
      { id: 1, company: 'Google', role: 'Full Stack Developer', startDate: 'Jan 2021', endDate: 'Present', description: 'Developed core features for the NextGen cloud platform. Optimized database queries reducing latency by 30%.' }
    ],
    education: [
      { id: 1, school: 'Stanford University', degree: 'MS in Computer Science', year: '2020' }
    ],
    skills: ['React', 'Node.js', 'Python', 'AWS', 'System Design']
  })

  const steps = ['Personal Info', 'Experience', 'Education', 'Skills']

  const handleGenerateAi = async () => {
    if (!aiForm.role || (!aiForm.background && !aiForm.pdfBase64)) {
      alert("Please fill in the target role and either provide background notes or upload a PDF resume.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const prompt = `You are a world-class executive resume writer and ATS optimization expert. 
Using the provided information on job description ("${aiForm.role}") and candidate background ("${aiForm.background}"), 
modify the resume based on the top 10 resumes that successfully secured roles at major Fortune 500 companies in this field.

CRITICAL OBJECTIVES:
1. Create a resume that has a High ATS score (above 90) by naturally integrating relevant keywords and using standard industry formatting.
2. Ensure a Recruiter Opinion rating above 90 by focusing on high-impact results, action verbs, and quantified achievements (e.g., "Increased revenue by 20%").
3. Elevate every past resume point provided in the text or attached PDF to perfectly match the target role.

Please generate a professional resume structured strictly as JSON. No markdown backticks, just raw JSON.
Include an 'analysis' object with 'atsScore', 'recruiterRating', and an array of 'recommendations' to further improve the candidate's chances (e.g., specific projects to add or certifications).

JSON Format:
{
  "personal": { "fullName": "...", "title": "...", "email": "...", "phone": "...", "location": "...", "summary": "..." },
  "experience": [ { "id": 1, "company": "...", "role": "...", "startDate": "...", "endDate": "...", "description": "..." } ],
  "education": [ { "id": 1, "school": "...", "degree": "...", "year": "..." } ],
  "skills": ["...", "..."],
  "analysis": {
    "atsScore": 95,
    "recruiterRating": 92,
    "recommendations": ["Add a certification in X", "Highlight project Y that involves Z"]
  }
}

Provide ONLY the raw JSON object.`;

      const parts = [{ text: prompt }];
      if (aiForm.pdfBase64) {
        parts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: aiForm.pdfBase64
          }
        });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${aiForm.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.7 }
        })
      });

      if (!response.ok) {
        throw new Error('API Request failed. Please check your API key.');
      }

      const data = await response.json();
      const textResp = data.candidates[0].content.parts[0].text;
      
      let cleanedJson = textResp;
      if (textResp.includes('```json')) {
        cleanedJson = textResp.split('```json')[1].split('```')[0].trim();
      } else if (textResp.includes('```')) {
        cleanedJson = textResp.split('```')[1].split('```')[0].trim();
      }

      const resumeOb = JSON.parse(cleanedJson);
      
      // Ensure unique IDs
      if (resumeOb.experience) {
        resumeOb.experience = resumeOb.experience.map((e, i) => ({...e, id: Date.now() + i}));
      }
      if (resumeOb.education) {
        resumeOb.education = resumeOb.education.map((e, i) => ({...e, id: Date.now() + i + 100}));
      }

      setResumeData(resumeOb);
      if (resumeOb.analysis) {
        setAnalysis(resumeOb.analysis);
      }
      setShowAiModal(false);
    } catch (e) {
      alert("Error generating resume: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleChange = (section, field, value, index = null) => {
    if (index !== null) {
      const newList = [...resumeData[section]]
      newList[index][field] = value
      setResumeData({ ...resumeData, [section]: newList })
    } else {
      setResumeData({
        ...resumeData,
        [section]: { ...resumeData[section], [field]: value }
      })
    }
  }

  const addItem = (section) => {
    const defaultItems = {
      experience: { id: Date.now(), company: '', role: '', startDate: '', endDate: '', description: '' },
      education: { id: Date.now(), school: '', degree: '', year: '' }
    }
    setResumeData({ ...resumeData, [section]: [...resumeData[section], defaultItems[section]] })
  }

  const removeItem = (section, index) => {
    const newList = [...resumeData[section]]
    newList.splice(index, 1)
    setResumeData({ ...resumeData, [section]: newList })
  }

  const handleSkillChange = (index, value) => {
    const newSkills = [...resumeData.skills]
    newSkills[index] = value
    setResumeData({ ...resumeData, skills: newSkills })
  }

  const addSkill = () => setResumeData({ ...resumeData, skills: [...resumeData.skills, ''] })
  const removeSkill = (index) => {
    const newSkills = [...resumeData.skills]
    newSkills.splice(index, 1)
    setResumeData({ ...resumeData, skills: newSkills })
  }

  if (isAppLoading) {
    return (
      <div className="loader-screen">
        <div className="loader-box">
          <div className="loader-logo">✨</div>
          <h1 className="loader-text">SleekResume</h1>
          <div className="loader-bar"><div className="loader-progress"></div></div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '1rem', letterSpacing: '4px' }}>ELEVATING CAREERS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Editor Pane (Left Sidebar) */}
      <aside className="editor-pane">
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>SleekResume</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Executive Resume Engineering.</p>
          </div>
          <button className="btn-ai-sparkle" onClick={() => setShowAiModal(true)}>
            ✨ AI Builder
          </button>
        </header>

        <div className="section-group" style={{ marginBottom: '1.5rem' }}>
          <label>Select Template Style</label>
          <select 
            value={selectedTemplate} 
            onChange={(e) => setSelectedTemplate(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'white' }}
          >
            <option value="modern">Modern Professional (Default)</option>
            <option value="minimal">Minimalist (Monochrome)</option>
            <option value="ats-v1">ATS Friendly v1 (Standard)</option>
            <option value="ats-v2">ATS Friendly v2 (Clean Text)</option>
            <option value="elegant">Elegant Serif (Executive)</option>
            <option value="creative">Creative (Bold Sidebar)</option>
            <option value="technical">Technical (Monospace)</option>
            <option value="compact">Compact (Detailed)</option>
            <option value="bold">Bold Impact</option>
            <option value="classic">Classic Academic</option>
          </select>
        </div>

        <nav className="step-nav">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className={`step-bullet ${activeStep === idx ? 'active' : ''}`}
              onClick={() => setActiveStep(idx)}
            >
              {idx + 1}. {step}
            </div>
          ))}
        </nav>

        {activeStep === 0 && (
          <div className="section-group">
            <div className="section-header"><h3>Personal Details</h3></div>
            <div className="form-grid">
              <div className="full-width">
                <label>Full Name</label>
                <input type="text" value={resumeData.personal.fullName} onChange={(e) => handleChange('personal', 'fullName', e.target.value)} placeholder="Full Name" />
              </div>
              <div className="full-width">
                <label>Job Title</label>
                <input type="text" value={resumeData.personal.title} onChange={(e) => handleChange('personal', 'title', e.target.value)} placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label>Email</label>
                <input type="email" value={resumeData.personal.email} onChange={(e) => handleChange('personal', 'email', e.target.value)} placeholder="email@example.com" />
              </div>
              <div>
                <label>Phone</label>
                <input type="text" value={resumeData.personal.phone} onChange={(e) => handleChange('personal', 'phone', e.target.value)} placeholder="+1..." />
              </div>
              <div className="full-width">
                <label>Professional Summary</label>
                <textarea rows="4" value={resumeData.personal.summary} onChange={(e) => handleChange('personal', 'summary', e.target.value)} placeholder="Summarize your career..."></textarea>
              </div>
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <div className="section-group">
            <div className="section-header"><h3>Work Experience</h3></div>
            {resumeData.experience.map((exp, idx) => (
              <div key={exp.id} className="item-row">
                <button className="remove-btn" onClick={() => removeItem('experience', idx)}>×</button>
                <div className="form-grid">
                  <div className="full-width">
                    <label>Company</label>
                    <input type="text" value={exp.company} onChange={(e) => handleChange('experience', 'company', e.target.value, idx)} />
                  </div>
                  <div>
                    <label>Role</label>
                    <input type="text" value={exp.role} onChange={(e) => handleChange('experience', 'role', e.target.value, idx)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label>Dates</label>
                      <input type="text" placeholder="Jan 2020 - Present" value={`${exp.startDate} - ${exp.endDate}`} onChange={(e) => {
                        const [s, eVal] = e.target.value.split('-').map(v => v.trim())
                        handleChange('experience', 'startDate', s || '', idx)
                        handleChange('experience', 'endDate', eVal || '', idx)
                      }} />
                    </div>
                  </div>
                  <div className="full-width">
                    <label>Description</label>
                    <textarea rows="3" value={exp.description} onChange={(e) => handleChange('experience', 'description', e.target.value, idx)} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-outline add-item-btn" onClick={() => addItem('experience')}>+ Add Experience</button>
          </div>
        )}

        {activeStep === 2 && (
          <div className="section-group">
            <div className="section-header"><h3>Education</h3></div>
            {resumeData.education.map((edu, idx) => (
              <div key={edu.id} className="item-row">
                <button className="remove-btn" onClick={() => removeItem('education', idx)}>×</button>
                <div className="form-grid">
                  <div className="full-width">
                    <label>School/University</label>
                    <input type="text" value={edu.school} onChange={(e) => handleChange('education', 'school', e.target.value, idx)} />
                  </div>
                  <div>
                    <label>Degree</label>
                    <input type="text" value={edu.degree} onChange={(e) => handleChange('education', 'degree', e.target.value, idx)} />
                  </div>
                  <div>
                    <label>Year</label>
                    <input type="text" value={edu.year} onChange={(e) => handleChange('education', 'year', e.target.value, idx)} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-outline add-item-btn" onClick={() => addItem('education')}>+ Add Education</button>
          </div>
        )}

        {activeStep === 3 && (
          <div className="section-group">
            <div className="section-header"><h3>Skills</h3></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {resumeData.skills.map((skill, idx) => (
                <div key={idx} style={{ position: 'relative', width: 'calc(50% - 0.5rem)' }}>
                   <input 
                    type="text" 
                    value={skill} 
                    onChange={(e) => handleSkillChange(idx, e.target.value)}
                    style={{ paddingRight: '2rem' }}
                  />
                  <span onClick={() => removeSkill(idx)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#ef4444' }}>×</span>
                </div>
              ))}
            </div>
            <button className="btn-outline add-item-btn" onClick={addSkill}>+ Add Skill</button>
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
           {activeStep > 0 && <button className="btn-outline" style={{ flex: 1 }} onClick={() => setActiveStep(v => v - 1)}>Back</button>}
           {activeStep < 3 ? (
             <button className="btn-primary" style={{ flex: 1 }} onClick={() => setActiveStep(v => v + 1)}>Next Step</button>
           ) : (
             <button className="btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>Download PDF</button>
           )}
        </div>
      </aside>

      {/* Preview Pane (Right Sidebar) */}
      <main className="preview-pane">
        <div style={{ marginBottom: '3rem', width: '210mm', transform: 'scale(0.95)' }}>
          {analysis.atsScore > 0 && (
            <div className="analysis-dashboard-premium">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Resume Intelligence Report</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Benchmarked against Fortune 500 standards</p>
                 </div>
                 <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="score-badge-premium">
                      <span className="score-label">ATS</span>
                      <span className="score-value">{analysis.atsScore}</span>
                    </div>
                    <div className="score-badge-premium">
                      <span className="score-label">RECRUITER</span>
                      <span className="score-value">{analysis.recruiterRating}</span>
                    </div>
                 </div>
              </div>

              {analysis.recommendations.length > 0 && (
                <div className="recommendations-box">
                  <header>💡 STRATEGIC RECOMMENDATIONS</header>
                  <ul className="rec-list">
                    {analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`resume-preview-container-premium template-${selectedTemplate}`} id="resume-document">
          <header style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h1 style={{ margin: '0', fontSize: '2.5rem', color: 'var(--text-main)', textAlign: 'left' }}>{resumeData.personal.fullName || 'YOUR NAME'}</h1>
            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--primary)', marginTop: '0.25rem' }}>{resumeData.personal.title || 'Professional Title'}</p>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {resumeData.personal.email && <span>📧 {resumeData.personal.email}</span>}
              {resumeData.personal.phone && <span>📞 {resumeData.personal.phone}</span>}
              {resumeData.personal.location && <span>📍 {resumeData.personal.location}</span>}
            </div>
          </header>

          <section style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-main)', fontStyle: 'italic' }}>{resumeData.personal.summary}</p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div>
              <h4 style={{ textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.2rem' }}>Experience</h4>
              {resumeData.experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                     <h5 style={{ fontSize: '1.1rem', margin: '0' }}>{exp.role || 'Role'}</h5>
                     <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{exp.company}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>{exp.description}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.2rem' }}>Education</h4>
              {resumeData.education.map(edu => (
                <div key={edu.id} style={{ marginBottom: '1rem' }}>
                   <h5 style={{ fontSize: '1rem', margin: '0' }}>{edu.school || 'School'}</h5>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>{edu.degree}</p>
                   <p style={{ fontSize: '0.8rem', fontWeight: '500' }}>{edu.year}</p>
                </div>
              ))}

              <h4 style={{ textTransform: 'uppercase', color: 'var(--primary)', margin: '1.5rem 0 1rem', borderBottom: '1px solid #eee', paddingBottom: '0.2rem' }}>Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {resumeData.skills.map((skill, idx) => (
                  <span key={idx} style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px solid #e2e8f0' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Modal Overlay */}
      {showAiModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>✨ AI Resume Magician</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Answer a few questions and let our AI craft your perfect resume in seconds.
            </p>
            
            <div className="form-grid">
              <div className="full-width">
                <label>Target Job / Role</label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Frontend Engineer at TechCorp" 
                  value={aiForm.role}
                  onChange={e => setAiForm({...aiForm, role: e.target.value})}
                />
              </div>
              <div className="full-width">
                <label>Upload Past Resume (PDF) - Evaluates & Elevates for the new Role!</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => {
                        const base64Data = reader.result.split(',')[1];
                        setAiForm(prev => ({...prev, pdfBase64: base64Data}));
                      };
                    } else {
                      setAiForm(prev => ({...prev, pdfBase64: null}));
                    }
                  }}
                  style={{ padding: '0.65rem', border: '2px dashed var(--primary)', background: '#f8fafc', cursor: 'pointer' }}
                />
              </div>
              <div className="full-width">
                <label style={{ textAlign: 'center', opacity: 0.5, letterSpacing: '2px', fontSize: '0.75rem' }}>OR / AND</label>
              </div>
              <div className="full-width">
                <label>Add Extra Notes (Optional)</label>
                <textarea 
                  rows="3" 
                  placeholder="Briefly describe extra roles or raw notes you want the AI to include, if any."
                  value={aiForm.background}
                  onChange={e => setAiForm({...aiForm, background: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-outline" onClick={() => setShowAiModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={handleGenerateAi} 
                disabled={isGenerating} 
                style={{ flex: 2, justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', border: 'none' }}
              >
                {isGenerating ? '✨ Generating Magically...' : '✨ Create Resume Magic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const getCssVar = (name) => {
   if (typeof window !== 'undefined') {
     return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
   }
   return '';
}

export default App
