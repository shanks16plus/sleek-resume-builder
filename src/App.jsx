import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [activeStep, setActiveStep] = useState(0)
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

  return (
    <div className="app-layout">
      {/* Editor Pane (Left Sidebar) */}
      <aside className="editor-pane">
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>SleekResume</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Build your story, one step at a time.</p>
        </header>

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
        <div className="resume-preview-container" id="resume-document">
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
