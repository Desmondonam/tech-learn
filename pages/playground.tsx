import { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../lib/AppContext';

const PYTHON_STARTER = `# Welcome to the Python Playground! 🐍
# Try running this example or write your own code

def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to TechLearn."

# Data structures example
students = [
    {"name": "Alex", "score": 95},
    {"name": "Maria", "score": 88},
    {"name": "James", "score": 72},
]

# Sort by score descending
top_students = sorted(students, key=lambda x: x["score"], reverse=True)

for i, student in enumerate(top_students, 1):
    grade = "A" if student["score"] >= 90 else "B" if student["score"] >= 80 else "C"
    print(f"{i}. {student['name']}: {student['score']} ({grade})")

print()
print(greet("Future Developer"))
`;

const SQL_STARTER = `-- Welcome to the SQL Playground! 🗄️
-- Try this example query or write your own

-- Create a sample query
SELECT 
    s.name,
    s.course,
    s.score,
    CASE 
        WHEN s.score >= 90 THEN 'A'
        WHEN s.score >= 80 THEN 'B'
        WHEN s.score >= 70 THEN 'C'
        ELSE 'F'
    END AS grade,
    RANK() OVER (PARTITION BY s.course ORDER BY s.score DESC) AS rank_in_course
FROM students s
WHERE s.score IS NOT NULL
ORDER BY s.course, s.score DESC;
`;

const SNIPPETS = {
  python: [
    { label: 'List Comprehension', code: `# List comprehension examples\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n\n# Squares of even numbers\neven_squares = [x**2 for x in numbers if x % 2 == 0]\nprint("Even squares:", even_squares)\n\n# Flatten a 2D list\nmatrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nflat = [item for row in matrix for item in row]\nprint("Flattened:", flat)` },
    { label: 'Dictionary Operations', code: `# Dictionary operations\ninventory = {"apple": 50, "banana": 30, "cherry": 20}\n\n# Filter items with count > 25\navailable = {k: v for k, v in inventory.items() if v > 25}\nprint("Available:", available)\n\n# Total inventory\ntotal = sum(inventory.values())\nprint(f"Total items: {total}")` },
    { label: 'Pandas Example', code: `import pandas as pd\n\n# Create a sample DataFrame\ndata = {\n    'name': ['Alex', 'Maria', 'James', 'Priya'],\n    'score': [95, 88, 72, 91],\n    'course': ['Python', 'SQL', 'Python', 'SQL']\n}\ndf = pd.DataFrame(data)\n\n# Group by course and calculate stats\nstats = df.groupby('course')['score'].agg(['mean', 'max', 'min'])\nprint(stats)` },
  ],
  sql: [
    { label: 'GROUP BY + HAVING', code: `SELECT \n    course,\n    COUNT(*) as student_count,\n    AVG(score) as avg_score,\n    MAX(score) as top_score\nFROM students\nGROUP BY course\nHAVING AVG(score) > 75\nORDER BY avg_score DESC;` },
    { label: 'Window Functions', code: `SELECT\n    name,\n    score,\n    course,\n    AVG(score) OVER (PARTITION BY course) as course_avg,\n    score - AVG(score) OVER (PARTITION BY course) as diff_from_avg,\n    NTILE(4) OVER (ORDER BY score DESC) as quartile\nFROM students\nORDER BY course, score DESC;` },
    { label: 'CTE Example', code: `WITH ranked_students AS (\n    SELECT\n        name,\n        course,\n        score,\n        ROW_NUMBER() OVER (\n            PARTITION BY course \n            ORDER BY score DESC\n        ) as rn\n    FROM students\n)\nSELECT name, course, score\nFROM ranked_students\nWHERE rn = 1;  -- Top student per course` },
  ],
};

export default function PlaygroundPage() {
  const { codeOutput, runCode, isRunningCode } = useApp();
  const [language, setLanguage] = useState<'python' | 'sql'>('python');
  const [code, setCode] = useState(PYTHON_STARTER);
  const [fontSize, setFontSize] = useState(14);

  const switchLanguage = (lang: 'python' | 'sql') => {
    setLanguage(lang);
    setCode(lang === 'python' ? PYTHON_STARTER : SQL_STARTER);
  };

  const loadSnippet = (snippetCode: string) => {
    setCode(snippetCode);
  };

  return (
    <Layout title="Code Playground">
      <div style={{ padding: '20px', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: '#f0f6ff', marginBottom: '2px' }}>Code Playground</h1>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Practice Python and SQL directly in the browser</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Font size */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '3px' }}>
              <button onClick={() => setFontSize(s => Math.max(11, s - 1))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px', fontSize: '14px' }}>A-</button>
              <span style={{ fontSize: '12px', color: '#64748b', padding: '4px 6px' }}>{fontSize}px</span>
              <button onClick={() => setFontSize(s => Math.min(20, s + 1))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px', fontSize: '14px' }}>A+</button>
            </div>

            {/* Language toggle */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '3px' }}>
              {(['python', 'sql'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => switchLanguage(lang)}
                  style={{
                    background: language === lang ? 'rgba(56,189,248,0.15)' : 'none',
                    border: language === lang ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
                    borderRadius: '6px', color: language === lang ? '#38bdf8' : '#64748b',
                    cursor: 'pointer', padding: '6px 14px', fontSize: '13px', fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {lang === 'python' ? '🐍 Python' : '🗄️ SQL'}
                </button>
              ))}
            </div>

            <button
              className="btn-primary"
              onClick={() => runCode(code, language)}
              disabled={isRunningCode}
              style={{ opacity: isRunningCode ? 0.7 : 1, minWidth: '110px', justifyContent: 'center' }}
            >
              {isRunningCode ? <><span className="spinner" /> Running</> : '▶ Run Code'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', flex: 1, minHeight: 0 }}>
          {/* Snippets panel */}
          <div style={{
            width: '200px', flexShrink: 0,
            background: '#0f1623', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', padding: '14px', overflowY: 'auto',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Snippets
            </div>
            {SNIPPETS[language].map((s, i) => (
              <button
                key={i}
                onClick={() => loadSnippet(s.code)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px', padding: '8px 10px', marginBottom: '6px',
                  color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.3)'; (e.currentTarget as HTMLElement).style.color = '#38bdf8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Editor + Output */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
            {/* Editor */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#0d1117', borderRadius: '12px 12px 0 0',
                padding: '8px 16px', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none',
              }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {['#f87171', '#fbbf24', '#34d399'].map(c => (
                    <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginLeft: '4px' }}>
                  {language === 'python' ? 'main.py' : 'query.sql'}
                </span>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className="code-editor"
                style={{
                  flex: 1, padding: '16px', fontSize: `${fontSize}px`,
                  borderRadius: '0 0 12px 12px', minHeight: '0',
                  height: '100%', resize: 'none',
                }}
                spellCheck={false}
              />
            </div>

            {/* Output */}
            <div style={{ height: '180px', flexShrink: 0 }}>
              <div style={{
                background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', height: '100%', overflow: 'auto',
              }}>
                <div style={{
                  padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                    {isRunningCode ? '● running...' : codeOutput ? '● output' : '● console'}
                  </span>
                  {isRunningCode && <span className="spinner" />}
                </div>
                <pre style={{
                  padding: '12px 16px', margin: 0,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '13px',
                  color: codeOutput ? '#e6edf3' : '#475569',
                  whiteSpace: 'pre-wrap', lineHeight: 1.6,
                }}>
                  {isRunningCode
                    ? 'Running code...'
                    : codeOutput || `Click "▶ Run Code" to execute your ${language === 'python' ? 'Python' : 'SQL'} code`
                  }
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
