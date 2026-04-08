'use client';

import { useState, useEffect, useCallback } from 'react';

const WEEKS = [
  { dates: ['4月6日', '4月7日', '4月8日', '4月9日', '4月10日'] },
  { dates: ['4月13日', '4月14日', '4月15日', '4月16日', '4月17日'] },
  { dates: ['4月20日', '4月21日', '4月22日', '4月23日', '4月24日'] },
  { dates: ['4月27日', '4月28日', '4月29日', '4月30日', '5月1日'] },
];

const COURSE_NUMBERS = Array.from({ length: 10 }, (_, i) => 301 + i);

const ROWS = [
  { label: '拡大', color: '#1a56a0', lightColor: '#e8f0fe', tab1Label: '戸別', tab2Label: '件数', tab1Placeholder: '戸別内容を入力（例：○○町△丁目）' },
  { label: '共済', color: '#c0392b', lightColor: '#fdecea', tab1Label: '現地声掛け', tab2Label: '件数', tab1Placeholder: '声掛け内容を入力（例：○○駅前）' },
  { label: 'でんき', color: '#27ae60', lightColor: '#e8f8ef', tab1Label: '現地声掛け', tab2Label: '件数', tab1Placeholder: '声掛け内容を入力（例：○○イベント会場）' },
];

const STORE_KEY = 'keikaku-app-v1';

function ck(wi, rowLabel, di, field) { return `w${wi}_${rowLabel}_d${di}_${field}`; }
function rk(wi, rowLabel, field) { return `w${wi}_${rowLabel}_result_${field}`; }

export default function KeikakuApp() {
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cellData, setCellData] = useState({});
  const [annualTargets, setAnnualTargets] = useState({ kakudai: '', kyosai: '', denki: '' });
  const [courseNumber, setCourseNumber] = useState('');
  const [modal, setModal] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [tab1Val, setTab1Val] = useState('');
  const [tab2Val, setTab2Val] = useState('');
  const [resultTab, setResultTab] = useState(0);
  const [resVal1, setResVal1] = useState('');
  const [resVal2, setResVal2] = useState('');
  const [showCourseSelector, setShowCourseSelector] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.cellData) setCellData(saved.cellData);
        if (saved.annualTargets) setAnnualTargets(saved.annualTargets);
        if (saved.courseNumber) setCourseNumber(saved.courseNumber);
      }
    } catch (e) {}
    setReady(true);
  }, []);

  const persist = useCallback((newCellData, newTargets, newCourse) => {
    setSaving(true);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ cellData: newCellData, annualTargets: newTargets, courseNumber: newCourse }));
    } catch (e) {}
    setTimeout(() => setSaving(false), 600);
  }, []);

  const get = (key) => cellData[key] || '';

  function openCell(wi, rowIdx, di) {
    const row = ROWS[rowIdx];
    setTab1Val(get(ck(wi, row.label, di, 'tab1')));
    setTab2Val(get(ck(wi, row.label, di, 'tab2')));
    setActiveTab(0);
    setModal({ type: 'cell', wi, rowIdx, di });
  }

  function openResult(wi, rowIdx) {
    const row = ROWS[rowIdx];
    setResVal1(get(rk(wi, row.label, 'tab1')));
    setResVal2(get(rk(wi, row.label, 'tab2')));
    setResultTab(0);
    setModal({ type: 'result', wi, rowIdx });
  }

  function saveCell() {
    const row = ROWS[modal.rowIdx];
    const next = { ...cellData, [ck(modal.wi, row.label, modal.di, 'tab1')]: tab1Val, [ck(modal.wi, row.label, modal.di, 'tab2')]: tab2Val };
    setCellData(next);
    persist(next, annualTargets, courseNumber);
    setModal(null);
  }

  function saveResult() {
    const row = ROWS[modal.rowIdx];
    const next = { ...cellData, [rk(modal.wi, row.label, 'tab1')]: resVal1, [rk(modal.wi, row.label, 'tab2')]: resVal2 };
    setCellData(next);
    persist(next, annualTargets, courseNumber);
    setModal(null);
  }

  function updateTargets(newTargets) { setAnnualTargets(newTargets); persist(cellData, newTargets, courseNumber); }
  function updateCourse(num) { setCourseNumber(num); persist(cellData, annualTargets, num); setShowCourseSelector(false); }

  function weekTotal(wi, rowLabel) {
    return WEEKS[wi].dates.reduce((sum, _, di) => sum + (parseFloat(get(ck(wi, rowLabel, di, 'tab2'))) || 0), 0);
  }
  function monthTotal(rowLabel) { return WEEKS.reduce((sum, _, wi) => sum + weekTotal(wi, rowLabel), 0); }

  function resetAll() {
    if (!window.confirm('全データをリセットしますか？')) return;
    setCellData({}); setAnnualTargets({ kakudai: '', kyosai: '', denki: '' }); setCourseNumber('');
    localStorage.removeItem(STORE_KEY);
  }

  const mRow = modal ? ROWS[modal.rowIdx] : null;

  if (!ready) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a3a6b,#2563a8)', color: 'white', fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif" }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>📋</div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>データを読み込み中...</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif", background: '#eef2f7', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg,#1a3a6b 0%,#2563a8 100%)', color: 'white', padding: '16px 16px 14px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 14px rgba(0,0,0,0.22)' }}>
        <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 1 }}>共済・拡大・でんき</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 700, flex: 1 }}>計画表アプリ</div>
          {saving && <span style={{ fontSize: 11, opacity: 0.8 }}>✓ 保存済み</span>}
          <button onClick={() => setShowCourseSelector(true)} style={{ background: courseNumber ? '#f5c518' : 'rgba(255,255,255,0.2)', color: courseNumber ? '#1a1a1a' : 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {courseNumber ? `コース ${courseNumber}` : 'コース番号 ▾'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[{ key: 'kakudai', label: '拡大', color: '#f39c12' }, { key: 'kyosai', label: '共済', color: '#e74c3c' }, { key: 'denki', label: 'でんき', color: '#2ecc71' }].map(({ key, label, color }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ background: color, color: 'white', borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>{label}</span>
              <input type="number" value={annualTargets[key]} onChange={e => updateTargets({ ...annualTargets, [key]: e.target.value })} placeholder="年間目標" style={{ width: 68, padding: '3px 6px', borderRadius: 5, border: 'none', background: 'rgba(255,255,255,0.18)', color: 'white', fontSize: 12, outline: 'none' }} />
              <span style={{ fontSize: 11, opacity: 0.7 }}>件</span>
            </div>
          ))}
        </div>
      </div>

      {showCourseSelector && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 340, boxShadow: '0 16px 56px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,#1a3a6b,#2563a8)', padding: '16px 20px', color: 'white' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>コース番号を選択</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 3 }}>301〜310から選択してください</div>
            </div>
            <div style={{ padding: '16px 20px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                {COURSE_NUMBERS.map(num => (
                  <button key={num} onClick={() => updateCourse(num)} style={{ padding: '14px 0', borderRadius: 10, border: '2px solid', borderColor: courseNumber === num ? '#2563a8' : '#e0e0e0', background: courseNumber === num ? '#e8f0fe' : 'white', color: courseNumber === num ? '#2563a8' : '#333', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>{num}</button>
                ))}
              </div>
              <button onClick={() => setShowCourseSelector(false)} style={{ display: 'block', width: '100%', marginTop: 14, padding: '12px', borderRadius: 10, border: '2px solid #e0e0e0', background: 'white', fontSize: 14, color: '#888', cursor: 'pointer' }}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {modal && mRow && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.62)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 22, width: '100%', maxWidth: 360, boxShadow: '0 16px 56px rgba(0,0,0,0.32)', overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg,${mRow.color}dd,${mRow.color})`, padding: '16px 20px 12px', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {courseNumber && <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>コース {courseNumber}</span>}
                <span style={{ fontWeight: 700, fontSize: 15 }}>{mRow.label}</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>
                {modal.type === 'cell' ? `第${modal.wi + 1}週 ／ ${WEEKS[modal.wi].dates[modal.di]}` : `第${modal.wi + 1}週 — 週間実績入力`}
              </div>
            </div>
            <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0' }}>
              {(modal.type === 'cell' ? [mRow.tab1Label, mRow.tab2Label] : ['声掛け実績', '件数実績']).map((tl, i) => (
                <button key={i} onClick={() => modal.type === 'cell' ? setActiveTab(i) : setResultTab(i)} style={{ flex: 1, padding: '13px 0', border: 'none', cursor: 'pointer', background: (modal.type === 'cell' ? activeTab : resultTab) === i ? 'white' : '#fafafa', color: (modal.type === 'cell' ? activeTab : resultTab) === i ? mRow.color : '#aaa', fontWeight: (modal.type === 'cell' ? activeTab : resultTab) === i ? 700 : 500, fontSize: 14, borderBottom: (modal.type === 'cell' ? activeTab : resultTab) === i ? `3px solid ${mRow.color}` : '3px solid transparent' }}>{tl}</button>
              ))}
            </div>
            <div style={{ padding: '20px 20px 18px' }}>
              {modal.type === 'cell' ? (
                activeTab === 0
                  ? <textarea autoFocus value={tab1Val} onChange={e => setTab1Val(e.target.value)} placeholder={mRow.tab1Placeholder} rows={4} style={{ width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: 10, border: `2px solid ${mRow.color}44`, outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box', background: mRow.lightColor }} />
                  : <div style={{ textAlign: 'center', padding: '10px 0' }}><input autoFocus type="number" value={tab2Val} onChange={e => setTab2Val(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveCell()} placeholder="0" style={{ width: 140, padding: '14px 0', fontSize: 38, textAlign: 'center', borderRadius: 14, border: `2px solid ${mRow.color}`, outline: 'none', fontWeight: 800, color: mRow.color, background: mRow.lightColor }} /><div style={{ marginTop: 8, color: '#999', fontSize: 13 }}>件</div></div>
              ) : (
                resultTab === 0
                  ? <textarea autoFocus value={resVal1} onChange={e => setResVal1(e.target.value)} placeholder="声掛け実績を入力" rows={4} style={{ width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: 10, border: `2px solid ${mRow.color}44`, outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.7, boxSizing: 'border-box', background: mRow.lightColor }} />
                  : <div style={{ textAlign: 'center', padding: '10px 0' }}><input autoFocus type="number" value={resVal2} onChange={e => setResVal2(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveResult()} placeholder="0" style={{ width: 140, padding: '14px 0', fontSize: 38, textAlign: 'center', borderRadius: 14, border: `2px solid ${mRow.color}`, outline: 'none', fontWeight: 800, color: mRow.color, background: mRow.lightColor }} /><div style={{ marginTop: 8, color: '#999', fontSize: 13 }}>件（実績）</div></div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setModal(null)} style={{ flex: 1, padding: '13px', borderRadius: 10, border: '2px solid #e0e0e0', background: 'white', fontSize: 14, color: '#888', cursor: 'pointer', fontWeight: 600 }}>キャンセル</button>
                <button onClick={modal.type === 'cell' ? saveCell : saveResult} style={{ flex: 2, padding: '13px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${mRow.color}cc,${mRow.color})`, fontSize: 14, color: 'white', cursor: 'pointer', fontWeight: 700 }}>✓ 保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '16px 12px 80px' }}>
        {WEEKS.map((week, wi) => (
          <div key={wi} style={{ background: 'white', borderRadius: 18, marginBottom: 18, overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
            <div style={{ background: 'linear-gradient(90deg,#f5c518,#f0b400)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>第{wi + 1}週</span>
                {courseNumber && <span style={{ background: '#1a3a6b', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>コース {courseNumber}</span>}
              </div>
              <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>{week.dates[0]} 〜 {week.dates[4]}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '62px repeat(5,1fr) 68px', background: '#f7f8fa', borderBottom: '1px solid #e8e8e8' }}>
              <div style={{ padding: '6px 5px', fontSize: 9, color: '#bbb', fontWeight: 700 }}>コース</div>
              {week.dates.map((d, di) => <div key={di} style={{ padding: '6px 3px', fontSize: 9, color: '#666', fontWeight: 700, textAlign: 'center', borderLeft: '1px solid #eee' }}>{d}</div>)}
              <div style={{ padding: '6px 4px', fontSize: 9, color: '#2563a8', fontWeight: 700, textAlign: 'center', borderLeft: '1px solid #b8ccf0', background: '#dceafe' }}>週間実績</div>
            </div>
            {ROWS.map((rowDef, rowIdx) => {
              const wt = weekTotal(wi, rowDef.label);
              const res1 = get(rk(wi, rowDef.label, 'tab1'));
              const res2 = get(rk(wi, rowDef.label, 'tab2'));
              const hasResult = res1 || res2;
              return (
                <div key={rowDef.label} style={{ display: 'grid', gridTemplateColumns: '62px repeat(5,1fr) 68px', borderBottom: '1px solid #f0f0f0', minHeight: 64 }}>
                  <div style={{ padding: '6px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, borderRight: '1px solid #eee' }}>
                    {courseNumber && <span style={{ fontSize: 9, color: '#888', fontWeight: 700 }}>{courseNumber}</span>}
                    <span style={{ background: rowDef.color, color: 'white', borderRadius: 5, padding: '3px 5px', fontSize: 9, fontWeight: 700, lineHeight: 1.5, textAlign: 'center' }}>{rowDef.label}</span>
                  </div>
                  {week.dates.map((_, di) => {
                    const t1 = get(ck(wi, rowDef.label, di, 'tab1'));
                    const t2 = get(ck(wi, rowDef.label, di, 'tab2'));
                    const hasData = t1 || t2;
                    return (
                      <button key={di} onClick={() => openCell(wi, rowIdx, di)} style={{ border: 'none', borderLeft: '1px solid #eee', background: hasData ? rowDef.lightColor : 'white', cursor: 'pointer', padding: '5px 3px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        {hasData ? (<>
                          {t1 && <span style={{ fontSize: 8, color: rowDef.color, fontWeight: 600, maxWidth: 46, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t1}</span>}
                          {t2 && <span style={{ fontSize: 17, fontWeight: 800, color: rowDef.color }}>{t2}</span>}
                          {t2 && <span style={{ fontSize: 8, color: '#aaa' }}>件</span>}
                          <div style={{ display: 'flex', gap: 2, marginTop: 1 }}>
                            {t1 && <span style={{ fontSize: 7, background: rowDef.color + '22', color: rowDef.color, borderRadius: 3, padding: '0 3px' }}>{rowDef.tab1Label}</span>}
                            {t2 && <span style={{ fontSize: 7, background: rowDef.color + '22', color: rowDef.color, borderRadius: 3, padding: '0 3px' }}>{rowDef.tab2Label}</span>}
                          </div>
                        </>) : <span style={{ fontSize: 18, color: '#d0d0d0', fontWeight: 300 }}>+</span>}
                      </button>
                    );
                  })}
                  <button onClick={() => openResult(wi, rowIdx)} style={{ border: 'none', borderLeft: '1px solid #b8ccf0', background: hasResult ? rowDef.lightColor : '#e8f2ff44', cursor: 'pointer', padding: '6px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    {hasResult ? (<>
                      {res1 && <span style={{ fontSize: 8, color: rowDef.color, fontWeight: 600, maxWidth: 62, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res1}</span>}
                      {res2 && <><span style={{ fontSize: 17, fontWeight: 800, color: rowDef.color }}>{res2}</span><span style={{ fontSize: 8, color: '#999' }}>件実績</span></>}
                      {!res2 && wt > 0 && <span style={{ fontSize: 10, color: '#888' }}>計 {wt}件</span>}
                    </>) : (<>
                      {wt > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: '#2563a8' }}>{wt}件</span>}
                      <span style={{ fontSize: 8, color: '#aaa', textAlign: 'center', lineHeight: 1.5 }}>実績{'\n'}入力</span>
                    </>)}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ background: 'linear-gradient(135deg,#1a3a6b,#2563a8)', borderRadius: 18, padding: '18px 16px', color: 'white', boxShadow: '0 6px 28px rgba(26,58,107,0.32)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 14, opacity: 0.9 }}>📊 4月合計（月間）</span>
            {courseNumber && <span style={{ background: '#f5c518', color: '#1a1a1a', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>コース {courseNumber}</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {ROWS.map((rowDef, ri) => {
              const total = monthTotal(rowDef.label);
              const targetKey = ri === 0 ? 'kakudai' : ri === 1 ? 'kyosai' : 'denki';
              const target = parseFloat(annualTargets[targetKey]) || 0;
              const pct = target > 0 ? Math.round((total / target) * 100) : null;
              return (
                <div key={rowDef.label} style={{ flex: 1, minWidth: 85, background: 'rgba(255,255,255,0.13)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 5 }}>{rowDef.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{total}</div>
                  <div style={{ fontSize: 10, opacity: 0.65 }}>件</div>
                  {pct !== null && <div style={{ marginTop: 7, fontSize: 11, fontWeight: 700, background: pct >= 100 ? '#27ae60' : 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '2px 8px' }}>目標比 {pct}%</div>}
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={resetAll} style={{ display: 'block', margin: '20px auto 0', padding: '10px 28px', borderRadius: 8, border: '2px solid #ddd', background: 'white', color: '#bbb', fontSize: 13, cursor: 'pointer' }}>🗑 データをリセット</button>
      </div>
    </div>
  );
}
