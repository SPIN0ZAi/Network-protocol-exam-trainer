import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'

type Scenario = any

export default function ExercisePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [studentAnswers, setStudentAnswers] = useState<any[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [currentLearning, setCurrentLearning] = useState<'learn'|'quiz'|'exercise'>('exercise')
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [quizResult, setQuizResult] = useState<boolean | null>(null)
  const [bestScore, setBestScore] = useState<number>(0)

  useEffect(() => {
    fetch('/api/scenarios')
      .then(r => r.json())
      .then(data => setScenarios(data))
      .catch(() => setScenarios([]))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const prev = JSON.parse(localStorage.getItem('networkingExerciseProgressV1') || '{}') || {}
      setBestScore(prev.bestScore || 0)
    } catch (e) {
      setBestScore(0)
    }
  }, [])

  useEffect(() => {
    if (currentIndex === null) return
    const s = scenarios[currentIndex]
    setCurrentScenario(s || null)
    if (s && s.correctAnswers) {
      setStudentAnswers(Array(16).fill({ macOrigen: '', macDestino: '', tipoPaquete: '', ipOrigen: '', ipDestino: '' }))
      setFeedback([])
    }
  }, [currentIndex, scenarios])

  const macs = useMemo(() => {
    if (!currentScenario) return []
    const set = new Set([currentScenario.pc1Mac, currentScenario.gatewayMac, currentScenario.dnsServerMac, currentScenario.webServerMac, 'FF:FF:FF:FF:FF:FF', '---------------'])
    return Array.from(set)
  }, [currentScenario])

  const ips = useMemo(() => {
    if (!currentScenario) return []
    const set = new Set([currentScenario.pc1Ip, currentScenario.gatewayIp, currentScenario.dnsServerIp, currentScenario.webServerIp, '0.0.0.0', '255.255.255.255', '---------------'])
    return Array.from(set)
  }, [currentScenario])

  const packetTypes = useMemo(() => {
    if (!currentScenario) return ['---------------']
    const set = new Set((currentScenario.correctAnswers || []).map((a: any) => a.tipoPaquete))
    set.add('---------------')
    return Array.from(set)
  }, [currentScenario])

  function isIPLocal(ip: string, pc1Ip: string, mask: string) {
    const ipParts = ip.split('.').map(Number)
    const pc1Parts = pc1Ip.split('.').map(Number)
    const maskParts = mask.split('.').map(Number)
    for (let i = 0; i < 4; i++) {
      if ((ipParts[i] & maskParts[i]) !== (pc1Parts[i] & maskParts[i])) return false
    }
    return true
  }

  function handleSelectChange(row: number, field: string, value: string) {
    setStudentAnswers(prev => {
      const copy = prev.slice()
      copy[row] = { ...(copy[row] || {}), [field]: value }
      return copy
    })
  }

  function checkAnswers() {
    if (!currentScenario) return
    const correct = currentScenario.correctAnswers || []
    const fb: any[] = []
    let correctCount = 0
    let total = 0
    for (let i = 0; i < 16; i++) {
      const s = studentAnswers[i] || { macOrigen: '', macDestino: '', tipoPaquete: '', ipOrigen: '', ipDestino: '' }
      const c = correct[i] || { tipoPaquete: '---------------' }
      if (c.tipoPaquete !== '---------------') {
        total++
        const isCorrect = JSON.stringify(s) === JSON.stringify(c)
        if (isCorrect) correctCount++
        fb.push({ row: i + 1, correct: isCorrect, expected: c, actual: s })
      } else {
        fb.push({ row: i + 1, correct: true, expected: c, actual: s })
      }
    }
    setFeedback(fb)
    // store best score locally
    const score = total ? Math.round((correctCount / total) * 100) : 0
    const prev = JSON.parse(localStorage.getItem('networkingExerciseProgressV1') || '{}')
    localStorage.setItem('networkingExerciseProgressV1', JSON.stringify({ ...(prev || {}), bestScore: Math.max(prev?.bestScore || 0, score) }))
  }

  function checkArp() {
    const isCorrect = quizAnswer === 1
    setQuizResult(isCorrect)
    const prev = JSON.parse(localStorage.getItem('networkingExerciseProgressV1') || '{}') || {}
    const next = { ...(prev || {}), quizzesSolved: (prev.quizzesSolved || 0) + 1, bestScore: isCorrect ? Math.max(prev.bestScore || 0, 100) : (prev.bestScore || 0) }
    localStorage.setItem('networkingExerciseProgressV1', JSON.stringify(next))
    setBestScore(next.bestScore || 0)
    // try server sync
    fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) }).catch(()=>{})
  }

  return (
    <div className="exercise-root">
      <aside className="sidebar">
        <div className="brand">Network<span>Lab</span></div>
        <nav>
          <a className="active">Dashboard</a>
          <a href="/exercise">Practice</a>
          <a href="/arp">ARP lane</a>
          <a href="/arp-dns">ARP + DNS</a>
          <a href="/full">Full flow</a>
        </nav>
        <div className="profile">
          <div className="avatar">SS</div>
          <div className="who">
            <div className="name">Student</div>
            <div className="role">Learner</div>
          </div>
        </div>
      </aside>
      <Head>
        <title>Networking Exercise — Interactive</title>
      </Head>
      <div className="header">
        <h1>Networking Flow Trainer</h1>
        <p className="lead">Modern interactive practice for ARP / DNS / DHCP / HTTP flows</p>
      </div>

      <div className="controls">
        <label>Elige escenario</label>
        <select value={currentIndex ?? ''} onChange={e => setCurrentIndex(e.target.value === '' ? null : Number(e.target.value))}>
          <option value="">-- Elige un escenario --</option>
          {scenarios.map((s, i) => (
            <option key={i} value={i}>{i + 1}. {s.name}</option>
          ))}
        </select>
      </div>

      <main className="content">
        <div className="top-row">
          <div className="tabs">
            <button className={currentLearning === 'learn' ? 'active' : ''} onClick={() => setCurrentLearning('learn')}>Learning</button>
            <button className={currentLearning === 'quiz' ? 'active' : ''} onClick={() => setCurrentLearning('quiz')}>ARP Quiz</button>
            <button className={currentLearning === 'exercise' ? 'active' : ''} onClick={() => setCurrentLearning('exercise')}>Exercise</button>
          </div>
          <div className="summary-card">
            <div>Escenarios: <strong>{scenarios.length}</strong></div>
            <div>Mejor nota: <strong>{bestScore || 0}%</strong></div>
          </div>
        </div>

        {currentScenario ? (
        currentLearning === 'quiz' ? (
          <div className="grid">
            <div className="left">
              <section className="card">
                <h3>ARP Mini-Quiz</h3>
                <p>Selecciona la dirección MAC de la puerta de enlace (Gateway) en este escenario.</p>
                <div className="quiz-opts">
                  {(() => {
                    const opts = [currentScenario.pc1Mac, currentScenario.gatewayMac, currentScenario.webServerMac]
                    return opts.map((o, idx) => (
                      <label key={o} style={{display:'block', margin:'8px 0'}}>
                        <input type="radio" name="arpQuiz" checked={quizAnswer===idx} onChange={() => setQuizAnswer(idx)} /> {o}
                      </label>
                    ))
                  })()}
                </div>
                <div style={{marginTop:12}}>
                  <button className="btn primary" onClick={checkArp}>Comprobar</button>
                  <button className="btn" style={{marginLeft:8}} onClick={() => { setQuizAnswer(null); setQuizResult(null) }}>Reintentar</button>
                </div>
                {quizResult !== null && (
                  <div style={{marginTop:12}} className={quizResult ? 'fb-item ok' : 'fb-item bad'}>
                    {quizResult ? '✓ ¡Correcto! Se ha guardado tu progreso.' : '✗ Incorrecto — repasa la topología y vuelve a intentarlo.'}
                  </div>
                )}
              </section>
            </div>
            <div className="right">
              <section className="card">
                <h3>Información</h3>
                <p>PC1: {currentScenario.pc1Ip} — {currentScenario.pc1Mac}</p>
                <p>Gateway: {currentScenario.gatewayIp} — {currentScenario.gatewayMac}</p>
              </section>
            </div>
          </div>
        ) : (
        <div className="grid">
          <div className="left">
            <section className="card">
              <h3>Escenario</h3>
              <p>{currentScenario.description}</p>
              <table className="ref">
                <tbody>
                  <tr><td>PC1</td><td>{currentScenario.pc1Ip}</td><td>{currentScenario.pc1Mac}</td></tr>
                  <tr><td>Gateway</td><td>{currentScenario.gatewayIp}</td><td>{currentScenario.gatewayMac}</td></tr>
                  <tr><td>DNS</td><td>{currentScenario.dnsServerIp}</td><td>{currentScenario.dnsServerMac}</td></tr>
                  <tr><td>Web</td><td>{currentScenario.webServerIp}</td><td>{currentScenario.webServerMac}</td></tr>
                </tbody>
              </table>
            </section>

            <section className="card">
              <h3>Topología</h3>
              <div className="topology">
                <svg width="100%" height="260" viewBox="0 0 860 420" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="localGrad"><stop offset="0" stopColor="#e8f4f8"/><stop offset="1" stopColor="#d0e8f2"/></linearGradient>
                    <linearGradient id="remoteGrad"><stop offset="0" stopColor="#fff0e6"/><stop offset="1" stopColor="#ffe6cc"/></linearGradient>
                    <marker id="arrow" markerWidth="8" markerHeight="8" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#333"/></marker>
                  </defs>
                  <rect x="20" y="30" width="360" height="360" fill="url(#localGrad)" stroke="#667eea" strokeWidth="2" rx="8"/>
                  <text x="35" y="55" fontSize="14" fontWeight="bold" fill="#667eea">Red local</text>

                  <rect x="35" y="115" width="90" height="62" fill="#90EE90" stroke="#228B22" rx="4"/>
                  <text x="45" y="135" fontSize="11" fontWeight="bold">PC1</text>
                  <text x="40" y="150" fontSize="9">{currentScenario.pc1Ip}</text>

                  <rect x="165" y="115" width="90" height="62" fill="#FFD700" stroke="#FF8C00" rx="4"/>
                  <text x="172" y="135" fontSize="11" fontWeight="bold">Gateway</text>

                  {isIPLocal(currentScenario.dnsServerIp, currentScenario.pc1Ip, currentScenario.subnetMask) ? (
                    <>
                      <rect x="295" y="115" width="70" height="62" fill="#87CEEB" stroke="#4682B4" rx="4"/>
                      <text x="303" y="135" fontSize="11" fontWeight="bold">DNS</text>
                    </>
                  ) : (
                    <>
                      <rect x="500" y="50" width="85" height="62" fill="#FFB6C1" stroke="#DC143C" rx="4"/>
                      <text x="512" y="70" fontSize="11" fontWeight="bold">DNS</text>
                    </>
                  )}

                </svg>
              </div>
            </section>
          </div>

          <div className="right">
            <section className="card">
              <h3>Tabla de tramas</h3>
              <div className="table-wrap">
                <table className="exercise-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>MAC origen</th>
                      <th>MAC destino</th>
                      <th>Tipo</th>
                      <th>IP origen</th>
                      <th>IP destino</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>
                          <select value={(studentAnswers[i] && studentAnswers[i].macOrigen) || ''} onChange={e => handleSelectChange(i, 'macOrigen', e.target.value)}>
                            <option value="">-</option>
                            {macs.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </td>
                        <td>
                          <select value={(studentAnswers[i] && studentAnswers[i].macDestino) || ''} onChange={e => handleSelectChange(i, 'macDestino', e.target.value)}>
                            <option value="">-</option>
                            {macs.map(m => <option key={m + '_d'} value={m}>{m}</option>)}
                          </select>
                        </td>
                        <td>
                          <select value={(studentAnswers[i] && studentAnswers[i].tipoPaquete) || ''} onChange={e => handleSelectChange(i, 'tipoPaquete', e.target.value)}>
                            <option value="">-</option>
                            {packetTypes.map(p => <option key={String(p)} value={String(p)}>{String(p)}</option>)}
                          </select>
                        </td>
                        <td>
                          <select value={(studentAnswers[i] && studentAnswers[i].ipOrigen) || ''} onChange={e => handleSelectChange(i, 'ipOrigen', e.target.value)}>
                            <option value="">-</option>
                            {ips.map(ip => <option key={ip + '_o'} value={ip}>{ip}</option>)}
                          </select>
                        </td>
                        <td>
                          <select value={(studentAnswers[i] && studentAnswers[i].ipDestino) || ''} onChange={e => handleSelectChange(i, 'ipDestino', e.target.value)}>
                            <option value="">-</option>
                            {ips.map(ip => <option key={ip + '_d'} value={ip}>{ip}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="actions">
                <button onClick={checkAnswers} className="btn primary">Corregir</button>
                <button onClick={() => { setStudentAnswers(Array(16).fill({ macOrigen: '', macDestino: '', tipoPaquete: '', ipOrigen: '', ipDestino: '' })); setFeedback([]) }} className="btn">Reiniciar</button>
              </div>
            </section>

            <section className="card">
              <h3>Retroalimentación</h3>
              <div className="feedback">
                {feedback.length === 0 ? <div className="meta">No hay feedback — corrige la tabla para ver resultados.</div> : (
                  feedback.map(f => (
                    <div key={f.row} className={"fb-item " + (f.correct ? 'ok' : 'bad')}>
                      <strong>Fila {f.row}:</strong> {f.correct ? '✓ Correcta' : '✗ Incorrecta'}
                      {!f.correct && <div className="ex">Esperado: {JSON.stringify(f.expected)} — Tu respuesta: {JSON.stringify(f.actual)}</div>}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )) : (
        <div className="empty">Selecciona un escenario para comenzar.</div>
      )}

      </main>

      <style jsx>{`
        .exercise-root { padding: 32px; max-width: 1200px; margin: 0 auto; }
        .header { display:flex; align-items:baseline; justify-content:space-between; gap:12px }
        .header h1 { margin: 0; font-size:20px }
        .lead { margin-top: 6px; color: var(--muted) }
        .controls { margin: 18px 0; display:flex; gap:12px; align-items:center }
        select { padding: 8px; border-radius: 8px; border: 1px solid #e6edf3 }
        .grid { display: grid; grid-template-columns: 1fr 520px; gap: 18px }
        .card { background: white; padding: 14px; border-radius: 10px; box-shadow: 0 8px 20px rgba(16,24,40,0.04) }
        .ref td { padding: 6px 8px }
        .table-wrap { overflow: auto; max-height: 420px }
        table.exercise-table { width: 100%; border-collapse: collapse }
        table.exercise-table th { text-align: left; padding: 10px; background: #f8fafc }
        table.exercise-table td { padding: 8px; border-bottom: 1px solid #f3f4f6 }
        .actions { display: flex; gap: 10px; margin-top: 12px }
        .btn { padding: 10px 12px; border-radius: 8px; border: 1px solid #e6edf3; background: white; cursor: pointer }
        .btn.primary { background: var(--accent); color: #fff; border: none }
        .feedback .fb-item { padding: 8px; border-radius: 8px; margin-bottom: 8px }
        .feedback .fb-item.ok { background: #ebf9f0; border: 1px solid #c7f0d0 }
        .feedback .fb-item.bad { background: #fff5f5; border: 1px solid #ffd6d6 }
        .ex { margin-top: 6px; color: #444; font-size: 0.95em }
        .empty { padding: 40px; text-align: center; color: var(--muted) }

        /* Sidebar specifics */
        .sidebar{ display:flex; flex-direction:column; justify-content:space-between }
        .profile{ display:flex; gap:10px; align-items:center }
        .avatar{ width:40px; height:40px; border-radius:10px; background:linear-gradient(90deg,#3559c7,#2f6fdb); color:#fff; display:flex; align-items:center; justify-content:center }
        .summary-card{ background:linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6)); padding:10px 12px; border-radius:10px; box-shadow:var(--shadow-1); display:flex; gap:12px; align-items:center }

        @media (max-width: 980px) { .grid { grid-template-columns: 1fr; } .summary-card{ flex-direction:column; align-items:flex-start } }
      `}</style>
    </div>
  )
}
