// Build only from published collection metadata; never consume operational logs.
export function buildPublicActivity(collections, now = new Date()) {
  const asOf = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const labels = {worklog:'작업일지',newsletter:'뉴스레터',insights:'인사이트'};
  const records = [];
  for (const [kind, entries] of Object.entries(collections)) {
    if (!(kind in labels)) continue;
    const eligible = entries.filter(entry => /^\d{4}-\d{2}(?:-\d{2})?$/.test(entry.data.date) && entry.data.date <= asOf)
      .sort((a,b) => b.data.date.localeCompare(a.data.date) || String(b.data.version ?? '').localeCompare(String(a.data.version ?? '')));
    const dates = new Set();
    for (const entry of eligible) {
      if (kind === 'worklog' && dates.has(entry.data.date)) continue;
      dates.add(entry.data.date);
      records.push({kind,label:labels[kind],date:entry.data.date,title:entry.data.title,href:`/${kind}/${entry.id}/`});
    }
  }
  records.sort((a,b) => b.date.localeCompare(a.date) || a.href.localeCompare(b.href));
  const day = Date.parse(`${asOf}T00:00:00+09:00`);
  const within = days => records.filter(item => {
    if (item.date.length !== 10) return false;
    const age = day - Date.parse(`${item.date}T00:00:00+09:00`);
    return age >= 0 && age < days * 86400000;
  }).length;
  return {as_of:asOf,totals:{last_7_days:within(7),last_30_days:within(30),
    worklog:records.filter(x=>x.kind==='worklog').length,
    newsletter:records.filter(x=>x.kind==='newsletter').length,
    insights:records.filter(x=>x.kind==='insights').length},recent:records.slice(0,4)};
}
