const fs = require('fs');

const data = JSON.parse(fs.readFileSync('portfolio.json', 'utf8'));
const { meta, social, experience, education, projects } = data;

function esc(str) {
  if (!str) return '';
  if (/<[^>]+>/.test(str)) return str; // already contains HTML, pass through
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseJobDate(str) {
  if (!str || str === 'Present') return Infinity;
  const d = new Date(str);
  return isNaN(d) ? 0 : d.getTime();
}

function renderExperience(jobs) {
  const sorted = [...jobs].sort((a, b) => parseJobDate(b.start) - parseJobDate(a.start));
  return sorted.map((job, i) => {
    const isLast = i === sorted.length - 1;
    const borderClass = isLast ? 'border-t border-b border-border' : 'border-t border-border';

    const bullets = job.bullets.map(b => `
  <li class="flex gap-2">
    <span class="text-accent2 mt-1.5 shrink-0">▸</span>
    <span>${b}</span>
  </li>`).join('');

    const tags = job.tags.map(t =>
      `<span class="font-mono text-[0.58rem] px-2 py-1 bg-panel border border-border2 text-dim rounded-sm">${esc(t)}</span>`
    ).join('');

    const currentBadge = job.current
      ? `\n          <span class="font-mono text-[0.55rem] text-accent2 border border-accent2 px-1.5 py-0.5 rounded-sm tracking-wider whitespace-nowrap">CURRENT</span>`
      : '';

    const locationLine = job.location
      ? `\n          <p class="font-mono text-[0.55rem] text-dim mb-4">${esc(job.location)}</p>`
      : '';

    const roleMarginBottom = job.location ? 'mb-1' : 'mb-4';

    return `    <div class="${borderClass} hover:bg-white/[0.01] transition-colors fi">
      <!-- Mobile: stacked | Desktop: side-by-side -->
      <div class="flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 py-8 px-0">
        <!-- Left: date + badge -->
        <div class="flex sm:flex-col gap-3 sm:gap-0 sm:pt-0.5 items-center sm:items-start">
          <p class="font-mono text-[0.65rem] text-dim leading-relaxed">${esc(job.start)} → ${esc(job.end)}</p>${currentBadge}
          <p class="font-mono text-[0.55rem] text-dim hidden sm:block mt-1">${esc(job.duration)}</p>
        </div>
        <!-- Right: content -->
        <div>
          <p class="font-bold text-bright tracking-tight mb-0.5 text-lg">${esc(job.company)}</p>
          <p class="font-mono text-[0.65rem] text-accent tracking-wider ${roleMarginBottom}">// ${esc(job.role.toUpperCase())}</p>${locationLine}
          <ul class="text-dim text-sm leading-loose max-w-xl mb-4 space-y-2 list-none">
            ${bullets}
          </ul>
          <div class="flex flex-wrap gap-1.5">
            ${tags}
          </div>
        </div>
      </div>
    </div>`;
  }).join('\n');
}

function renderProjects(items) {
  return items.map((p, i) => {
    const num = String(i + 1).padStart(3, '0');
    return `
  <div class="proj-card relative bg-bg hover:bg-panel transition-colors p-6 overflow-hidden">
    <p class="font-mono text-[0.58rem] text-border2 tracking-widest mb-4">PROJECT_${num}</p>
    <p class="font-bold text-bright tracking-tight mb-2">${esc(p.name)}</p>
    <p class="text-dim text-xs leading-relaxed mb-5">${esc(p.description)}</p>
    <p class="font-mono text-[0.6rem] text-accent tracking-wide">${esc(p.stack.trim())}</p>
  </div>`;
  }).join('');
}

function renderEducation(items) {
  const visible = items.filter(e => !e.hidden);
  return visible.map((e, i) => {
    const isLast = i === visible.length - 1;
    const borderClass = isLast ? 'border-t border-b border-border' : 'border-t border-border';

    const dateText = e.end ? e.end : null;

    let metaLine = '';
    if (e.grade && e.honors) {
      metaLine = `\n          <p class="font-mono text-[0.55rem] text-dim mb-4">GPA: ${esc(e.grade)} &nbsp;·&nbsp; <span class="text-accent2">${esc(e.honors)}</span></p>`;
    } else if (e.grade && e.field) {
      metaLine = `\n          <p class="font-mono text-[0.55rem] text-dim mb-4">${esc(e.field)} &nbsp;·&nbsp; GPA: ${esc(e.grade)}</p>`;
    }

    const highlights = e.highlights && e.highlights.length > 0
      ? `\n          <ul class="text-dim text-sm leading-loose max-w-xl space-y-2 list-none">
            ${e.highlights.map(h => `<li class="flex gap-2">
              <span class="text-accent2 mt-1.5 shrink-0">▸</span>
              <span>${esc(h)}</span>
            </li>`).join('\n            ')}
          </ul>`
      : '';

    return `    <div class="${borderClass} hover:bg-white/[0.01] transition-colors fi">
      <div class="flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 py-8 px-0">
        <div class="flex sm:flex-col gap-3 sm:gap-0 sm:pt-0.5 items-center sm:items-start">
          ${dateText ? `<p class="font-mono text-[0.65rem] text-dim leading-relaxed">${esc(dateText)}</p>` : ''}
        </div>
        <div>
          <p class="font-bold text-bright tracking-tight mb-0.5 text-lg">${esc(e.school)}</p>
          <p class="font-mono text-[0.65rem] text-accent tracking-wider mb-1">// ${esc(e.degree.toUpperCase())}</p>${metaLine}${highlights}
        </div>
      </div>
    </div>`;
  }).join('\n');
}

function renderSocial(items) {
  return items.map(s => `
  <a href="${esc(s.url)}" target="_blank" class="flex items-center justify-between py-4 border-t border-border text-dim hover:text-bright transition-colors group">
    <span class="font-mono text-xs tracking-wider">${esc(s.label)}</span>
    <span class="font-mono text-[0.62rem] text-border2">${esc(s.handle)}</span>
    <span class="text-sm group-hover:text-accent transition-colors">↗</span>
  </a>`).join('');
}

const earliestStart = experience
  .map(j => new Date(j.start))
  .filter(d => !isNaN(d))
  .reduce((min, d) => d < min ? d : min, new Date());
const yearsExperience = Math.floor((Date.now() - earliestStart) / (1000 * 60 * 60 * 24 * 365.25));
meta.description = meta.description.replace('{{years}}', yearsExperience);

const [firstName, ...rest] = meta.name.split(' ');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(meta.name)} · ${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.tagline)}" />
  <meta property="og:title" content="${esc(meta.name)} · ${esc(meta.title)}" />
  <meta property="og:description" content="${esc(meta.tagline)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://${esc(meta.website)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${esc(meta.name)} · ${esc(meta.title)}" />
  <meta name="twitter:description" content="${esc(meta.tagline)}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            mono: ['"Space Mono"', 'monospace'],
            display: ['Syne', 'sans-serif'],
          },
          colors: {
            bg:      '#080b0f',
            panel:   '#0f1419',
            border:  '#1c2330',
            border2: '#3a4a60',
            accent:  '#00d4ff',
            accent2: '#00ff88',
            dim:     '#8b95a5',
            bright:  '#e6edf3',
          },
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Syne', sans-serif; scroll-behavior: smooth; }
    body::before {
      content: ''; position: fixed; inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px);
      pointer-events: none; z-index: 50;
    }
    .grid-bg {
      position: fixed; inset: 0;
      background-image: linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
      background-size: 44px 44px; pointer-events: none;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
    .pulse { animation: blink 1.8s ease-in-out infinite; }
    .proj-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, #00d4ff, #00ff88);
      transform: scaleX(0); transform-origin: left; transition: transform 0.3s;
    }
    .proj-card:hover::before { transform: scaleX(1); }
    .fi { opacity: 0; transform: translateY(14px); transition: opacity 0.5s ease, transform 0.5s ease; }
    .fi.v { opacity: 1; transform: none; }
  </style>
</head>
<body class="bg-bg text-gray-300 overflow-x-hidden">
  <div class="grid-bg"></div>

  <!-- NAV -->
  <nav class="fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 sm:px-10 bg-bg/90 backdrop-blur-md border-b border-border">
    <span class="font-mono text-[0.65rem] sm:text-xs text-accent tracking-wide before:content-['>'] before:text-accent2 before:mr-2 truncate mr-4">
      ${esc(meta.handle)} <span class="hidden sm:inline">&nbsp;/&nbsp; ${esc(meta.title.toUpperCase())}</span>
    </span>
    <ul class="flex font-mono text-[0.58rem] list-none shrink-0">
      <li><a href="#experience" class="block px-2 sm:px-4 h-14 leading-[3.5rem] text-dim hover:text-accent hover:bg-accent/5 border-l border-border transition-all tracking-widest">EXPERIENCE</a></li>
      <li><a href="#projects"   class="block px-2 sm:px-4 h-14 leading-[3.5rem] text-dim hover:text-accent hover:bg-accent/5 border-l border-border transition-all tracking-widest">PROJECTS</a></li>
      <li><a href="#education"  class="block px-2 sm:px-4 h-14 leading-[3.5rem] text-dim hover:text-accent hover:bg-accent/5 border-l border-border transition-all tracking-widest">EDUCATION</a></li>
      <li><a href="#contact"    class="block px-2 sm:px-4 h-14 leading-[3.5rem] text-dim hover:text-accent hover:bg-accent/5 border-l border-r border-border transition-all tracking-widest">CONTACT</a></li>
    </ul>
    <div class="hidden sm:flex items-center gap-2 font-mono text-[0.58rem] text-accent2 tracking-widest ml-4">
      <span class="pulse w-1.5 h-1.5 rounded-full bg-accent2 inline-block"></span>
      ${esc(meta.status)}
    </div>
  </nav>

  <!-- HERO -->
  <section class="min-h-screen flex flex-col justify-center px-5 sm:px-10 pt-24 sm:pt-28 pb-16 max-w-6xl mx-auto relative">
    <p class="font-mono text-[0.65rem] text-dim tracking-[0.12em] mb-6 flex items-center gap-4">
      // ${esc(meta.location.toUpperCase())} · ${esc(meta.title.toUpperCase())}
      <span class="block h-px w-16 bg-border2"></span>
    </p>
    <h1 class="font-display font-extrabold leading-[0.92] tracking-tight text-bright mb-4" style="font-size: clamp(2.8rem, 10vw, 6rem)">
      <span class="text-dim">Hello, I'm</span><br>
      <span class="text-accent">${esc(firstName)}</span><br>
      ${esc(rest.join(' '))}.
    </h1>
    <p class="font-mono text-accent2 tracking-wider mb-6 text-[0.75rem] sm:text-[0.9rem]">
      ${esc(meta.cmd)} <span class="text-dim">${esc(meta.cmd_comment)}</span>
    </p>
    <p class="text-dim max-w-lg mb-10 leading-loose text-sm">${meta.description}</p>
    <div class="flex gap-3 flex-wrap">
      <a href="#experience" class="font-mono text-[0.68rem] tracking-widest px-4 sm:px-5 py-3 rounded-sm bg-accent text-black border border-accent hover:bg-transparent hover:text-accent hover:shadow-[0_0_20px_rgba(0,212,255,0.25)] transition-all">VIEW_EXPERIENCE</a>
      <a href="#contact"    class="font-mono text-[0.68rem] tracking-widest px-4 sm:px-5 py-3 rounded-sm bg-transparent text-dim border border-border2 hover:border-accent hover:text-accent transition-all">GET_IN_TOUCH</a>
    </div>
    <div class="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 flex-col gap-8" style="writing-mode:vertical-rl">
      ${meta.side_labels.map(l => `<span class="font-mono text-[0.55rem] text-border2 tracking-[0.2em]">${esc(l)}</span>`).join('\n      ')}
    </div>
  </section>

  <!-- EXPERIENCE -->
  <section id="experience" class="max-w-6xl mx-auto px-5 sm:px-10 py-16 sm:py-24 border-t border-border">
    <div class="flex items-baseline gap-5 mb-10 sm:mb-14 fi">
      <span class="font-mono text-[0.65rem] text-accent">01</span>
      <h2 class="text-2xl font-bold tracking-tight text-bright">Experience</h2>
      <div class="flex-1 h-px bg-border"></div>
    </div>

${renderExperience(experience)}
  </section>

  <!-- PROJECTS -->
  <section id="projects" class="max-w-6xl mx-auto px-5 sm:px-10 py-16 sm:py-24 border-t border-border">
    <div class="flex items-baseline gap-5 mb-10 sm:mb-14 fi">
      <span class="font-mono text-[0.65rem] text-accent">02</span>
      <h2 class="text-2xl font-bold tracking-tight text-bright">Projects</h2>
      <div class="flex-1 h-px bg-border"></div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border fi">
      ${renderProjects(projects)}
    </div>
  </section>

  <!-- EDUCATION -->
  <section id="education" class="max-w-6xl mx-auto px-5 sm:px-10 py-16 sm:py-24 border-t border-border">
    <div class="flex items-baseline gap-5 mb-10 sm:mb-14 fi">
      <span class="font-mono text-[0.65rem] text-accent">03</span>
      <h2 class="text-2xl font-bold tracking-tight text-bright">Education</h2>
      <div class="flex-1 h-px bg-border"></div>
    </div>

${renderEducation(education)}
  </section>

  <!-- CONTACT -->
  <section id="contact" class="max-w-6xl mx-auto px-5 sm:px-10 py-16 sm:py-24 border-t border-border">
    <div class="flex items-baseline gap-5 mb-10 sm:mb-14 fi">
      <span class="font-mono text-[0.65rem] text-accent">04</span>
      <h2 class="text-2xl font-bold tracking-tight text-bright">Contact</h2>
      <div class="flex-1 h-px bg-border"></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border fi">
      <div class="bg-bg p-7 sm:p-11">
        <h3 class="text-xl font-bold text-bright tracking-tight mb-3">Let's build something.</h3>
        <p class="text-dim text-sm leading-loose mb-8 max-w-sm">${esc(meta.contact_blurb || 'Open to senior engineering and leadership roles. Memphis-based, but happy to connect anywhere.')}</p>
        <a href="mailto:${esc(meta.email)}" class="font-mono text-sm text-accent border-b border-accent/30 hover:border-accent pb-0.5 transition-all break-all">${esc(meta.email)}</a>
      </div>
      <div class="bg-bg px-7 sm:px-11 py-7 sm:py-0 sm:flex sm:flex-col sm:justify-center">
        ${renderSocial(social)}
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="max-w-6xl mx-auto px-5 sm:px-10 py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
    <span class="font-mono text-[0.58rem] text-dim tracking-wider">// ${esc(meta.name.toUpperCase())} · ${esc(meta.title.toUpperCase())}</span>
    <span class="font-mono text-[0.58rem] text-dim tracking-wider">${esc(meta.location.toUpperCase())} · BUILT WITH TAILWIND CSS</span>
  </footer>

  <script>
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) setTimeout(() => e.target.classList.add('v'), i * 80);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fi').forEach(el => obs.observe(el));
  </script>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('index.html generated successfully');
